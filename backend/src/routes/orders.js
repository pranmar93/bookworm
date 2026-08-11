const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /orders/create — Create an order from the cart
 */
router.post('/create', authenticate, [
  body('address_id').isUUID(),
  body('gift_points_to_redeem').optional().isInt({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify address belongs to user
    const addrResult = await client.query(
      'SELECT address_id FROM addresses WHERE address_id = $1 AND user_id = $2',
      [req.body.address_id, req.user.user_id]
    );
    if (addrResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid address' });
    }

    // Get cart items
    const cartResult = await client.query(
      'SELECT cart_id FROM cart WHERE user_id = $1',
      [req.user.user_id]
    );
    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const cartId = cartResult.rows[0].cart_id;

    const itemsResult = await client.query(
      `SELECT ci.cart_item_id, ci.quantity, b.book_id, b.price, b.stock_quantity, b.title
       FROM cart_items ci JOIN books b ON ci.book_id = b.book_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    if (itemsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock and calculate totals
    let subtotal = 0;
    for (const item of itemsResult.rows) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for: ${item.title}` });
      }
      subtotal += parseFloat(item.price) * item.quantity;
    }

    const tax_amount = parseFloat((subtotal * 0.18).toFixed(2));
    const delivery_charges = subtotal > 500 ? 0 : 50;

    // Redeem gift points (1 point = ₹1, max 10% of subtotal)
    let discount_amount = 0;
    const pointsToRedeem = parseInt(req.body.gift_points_to_redeem) || 0;
    if (pointsToRedeem > 0) {
      const userResult = await client.query('SELECT gift_points FROM users WHERE user_id = $1', [req.user.user_id]);
      const available = userResult.rows[0].gift_points;
      const maxDiscount = Math.floor(subtotal * 0.1);
      discount_amount = Math.min(pointsToRedeem, available, maxDiscount);
    }

    const grand_total = parseFloat((subtotal + tax_amount + delivery_charges - discount_amount).toFixed(2));

    // Estimated delivery: 5-7 business days
    const estimated_delivery_date = new Date();
    estimated_delivery_date.setDate(estimated_delivery_date.getDate() + 7);

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, address_id, subtotal, tax_amount, discount_amount,
         delivery_charges, grand_total, order_status, payment_status, estimated_delivery_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending','pending',$8)
       RETURNING *`,
      [req.user.user_id, req.body.address_id, subtotal.toFixed(2), tax_amount, discount_amount,
       delivery_charges, grand_total, estimated_delivery_date.toISOString().split('T')[0]]
    );
    const order = orderResult.rows[0];

    // Create order items and decrement stock
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.order_id, item.book_id, item.quantity, item.price,
         (parseFloat(item.price) * item.quantity).toFixed(2)]
      );
      await client.query(
        'UPDATE books SET stock_quantity = stock_quantity - $1 WHERE book_id = $2',
        [item.quantity, item.book_id]
      );
    }

    // Deduct gift points
    if (discount_amount > 0) {
      await client.query(
        'UPDATE users SET gift_points = gift_points - $1 WHERE user_id = $2',
        [discount_amount, req.user.user_id]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// GET /orders/:orderId
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const orderResult = await query(
      `SELECT o.*, a.first_name AS addr_first_name, a.last_name AS addr_last_name,
              a.address_line, a.city, a.state, a.pin_code, a.country, a.phone_number AS addr_phone
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.address_id
       WHERE o.order_id = $1 AND o.user_id = $2`,
      [req.params.orderId, req.user.user_id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];
    const itemsResult = await query(
      `SELECT oi.*, b.title, b.cover_image_url, b.format, a.author_name
       FROM order_items oi
       JOIN books b ON oi.book_id = b.book_id
       LEFT JOIN authors a ON b.author_id = a.author_id
       WHERE oi.order_id = $1`,
      [req.params.orderId]
    );

    // Check if still within 48h cancellation window
    const hoursSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / 3600000;
    if (order.can_cancel && hoursSinceOrder > 48) {
      await query('UPDATE orders SET can_cancel = false WHERE order_id = $1', [req.params.orderId]);
      order.can_cancel = false;
    }

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /orders/:orderId/cancel
router.put('/:orderId/cancel', authenticate, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
      [req.params.orderId, req.user.user_id]
    );
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const hoursSinceOrder = (Date.now() - new Date(order.created_at).getTime()) / 3600000;

    if (!order.can_cancel || hoursSinceOrder > 48) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order cannot be cancelled after 48 hours' });
    }
    if (order.order_status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    // Restore stock
    const items = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.order_id]);
    for (const item of items.rows) {
      await client.query(
        'UPDATE books SET stock_quantity = stock_quantity + $1 WHERE book_id = $2',
        [item.quantity, item.book_id]
      );
    }

    // Refund gift points used
    if (parseFloat(order.discount_amount) > 0) {
      await client.query(
        'UPDATE users SET gift_points = gift_points + $1 WHERE user_id = $2',
        [order.discount_amount, req.user.user_id]
      );
    }

    await client.query(
      `UPDATE orders SET order_status = 'cancelled', can_cancel = false, updated_at = NOW() WHERE order_id = $1`,
      [order.order_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
});

// POST /orders/:orderId/buy-again — Add items from old order back to cart
router.post('/:orderId/buy-again', authenticate, async (req, res) => {
  try {
    const orderResult = await query(
      'SELECT order_id FROM orders WHERE order_id = $1 AND user_id = $2',
      [req.params.orderId, req.user.user_id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    // Get or create cart
    let cartResult = await query('SELECT cart_id FROM cart WHERE user_id = $1', [req.user.user_id]);
    if (cartResult.rows.length === 0) {
      cartResult = await query('INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id', [req.user.user_id]);
    }
    const cartId = cartResult.rows[0].cart_id;

    const items = await query('SELECT book_id, quantity FROM order_items WHERE order_id = $1', [req.params.orderId]);
    for (const item of items.rows) {
      await query(
        `INSERT INTO cart_items (cart_id, book_id, quantity)
         VALUES ($1,$2,$3)
         ON CONFLICT (cart_id, book_id) DO UPDATE SET quantity = $3`,
        [cartId, item.book_id, item.quantity]
      );
    }

    res.json({ message: 'Items added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process buy again' });
  }
});

// GET /orders/:orderId/shipping-estimate
router.get('/:orderId/shipping-estimate', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT estimated_delivery_date FROM orders WHERE order_id = $1 AND user_id = $2',
      [req.params.orderId, req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ estimated_delivery_date: result.rows[0].estimated_delivery_date });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shipping estimate' });
  }
});

module.exports = router;

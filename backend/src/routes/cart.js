const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/** Helper: get or create cart for user */
const getOrCreateCart = async (userId) => {
  let result = await query('SELECT cart_id FROM cart WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await query(
      'INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id',
      [userId]
    );
  }
  return result.rows[0].cart_id;
};

// GET /cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    const items = await query(
      `SELECT ci.cart_item_id, ci.quantity, ci.added_at,
              b.book_id, b.title, b.price, b.cover_image_url, b.format, b.stock_quantity,
              a.author_name
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.book_id
       LEFT JOIN authors a ON b.author_id = a.author_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const subtotal = items.rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const delivery = subtotal > 500 ? 0 : 50;
    const grand_total = parseFloat((subtotal + tax + delivery).toFixed(2));

    res.json({
      cart_id: cartId,
      items: items.rows,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: tax,
        delivery_charges: delivery,
        discount_amount: 0,
        grand_total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /cart/items
router.post('/items', authenticate, [
  body('book_id').isUUID(),
  body('quantity').isInt({ min: 1, max: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { book_id, quantity } = req.body;
  try {
    // Check stock
    const bookResult = await query('SELECT stock_quantity FROM books WHERE book_id = $1', [book_id]);
    if (bookResult.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    if (bookResult.rows[0].stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const cartId = await getOrCreateCart(req.user.user_id);
    await query(
      `INSERT INTO cart_items (cart_id, book_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, book_id) DO UPDATE SET quantity = cart_items.quantity + $3`,
      [cartId, book_id, quantity]
    );

    await query('UPDATE cart SET updated_at = NOW() WHERE cart_id = $1', [cartId]);
    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /cart/items/:cartItemId
router.put('/items/:cartItemId', authenticate, [
  body('quantity').isInt({ min: 1, max: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    const result = await query(
      `UPDATE cart_items SET quantity = $1
       WHERE cart_item_id = $2 AND cart_id = $3
       RETURNING cart_item_id`,
      [req.body.quantity, req.params.cartItemId, cartId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
    await query('UPDATE cart SET updated_at = NOW() WHERE cart_id = $1', [cartId]);
    res.json({ message: 'Cart item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /cart/items/:cartItemId
router.delete('/items/:cartItemId', authenticate, async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    await query(
      'DELETE FROM cart_items WHERE cart_item_id = $1 AND cart_id = $2',
      [req.params.cartItemId, cartId]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /cart
router.delete('/', authenticate, async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

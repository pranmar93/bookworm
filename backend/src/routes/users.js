const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /users/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT user_id, email, first_name, last_name, phone_number, is_guest, gift_points, created_at, updated_at FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /users/profile
router.put('/profile', authenticate, [
  body('email').optional().isEmail().normalizeEmail(),
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, phone_number, email } = req.body;
  try {
    const result = await query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone_number = COALESCE($3, phone_number),
        email = COALESCE($4, email),
        updated_at = NOW()
       WHERE user_id = $5
       RETURNING user_id, email, first_name, last_name, phone_number, gift_points, updated_at`,
      [first_name || null, last_name || null, phone_number || null, email || null, req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /users/order-history
router.get('/order-history', authenticate, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const ordersResult = await query(
      `SELECT o.*, a.address_line, a.city, a.state, a.country
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.address_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.user_id, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [req.user.user_id]);

    // Fetch items for each order
    const orders = await Promise.all(ordersResult.rows.map(async (order) => {
      const items = await query(
        `SELECT oi.*, b.title, b.cover_image_url, b.format,
                a.author_name
         FROM order_items oi
         JOIN books b ON oi.book_id = b.book_id
         LEFT JOIN authors a ON b.author_id = a.author_id
         WHERE oi.order_id = $1`,
        [order.order_id]
      );
      return { ...order, items: items.rows };
    }));

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        total_pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// GET /users/wishlist
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT w.wishlist_id, w.added_at, b.book_id, b.title, b.price, b.cover_image_url,
              b.format, b.is_bestseller, a.author_name
       FROM wishlist w
       JOIN books b ON w.book_id = b.book_id
       LEFT JOIN authors a ON b.author_id = a.author_id
       WHERE w.user_id = $1
       ORDER BY w.added_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /users/wishlist
router.post('/wishlist', authenticate, [
  body('book_id').isUUID(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    await query(
      `INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.user_id, req.body.book_id]
    );
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// DELETE /users/wishlist/:bookId
router.delete('/wishlist/:bookId', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2', [
      req.user.user_id, req.params.bookId,
    ]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// GET /users/gift-points
router.get('/gift-points', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT gift_points FROM users WHERE user_id = $1', [req.user.user_id]);
    res.json({ gift_points: result.rows[0]?.gift_points || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gift points' });
  }
});

module.exports = router;

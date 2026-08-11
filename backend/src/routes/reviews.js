const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /reviews
router.post('/', authenticate, [
  body('book_id').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review_text').optional().isLength({ max: 2000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { book_id, rating, review_text } = req.body;
  try {
    // Check user has purchased the book
    const purchased = await query(
      `SELECT 1 FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.user_id = $1 AND oi.book_id = $2 AND o.payment_status = 'completed'
       LIMIT 1`,
      [req.user.user_id, book_id]
    );
    if (purchased.rows.length === 0) {
      return res.status(403).json({ error: 'You can only review books you have purchased' });
    }

    const result = await query(
      `INSERT INTO reviews (book_id, user_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (book_id, user_id) DO UPDATE SET rating = $3, review_text = $4
       RETURNING *`,
      [book_id, req.user.user_id, rating, review_text || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PUT /reviews/:reviewId
router.put('/:reviewId', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('review_text').optional().isLength({ max: 2000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await query(
      `UPDATE reviews SET
        rating = COALESCE($1, rating),
        review_text = COALESCE($2, review_text)
       WHERE review_id = $3 AND user_id = $4
       RETURNING *`,
      [req.body.rating || null, req.body.review_text || null, req.params.reviewId, req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /reviews/:reviewId
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE review_id = $1 AND user_id = $2', [
      req.params.reviewId, req.user.user_id,
    ]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;

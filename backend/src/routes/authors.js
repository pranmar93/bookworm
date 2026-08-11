const express = require('express');
const { query } = require('../database/db');

const router = express.Router();

// GET /authors/:authorId
router.get('/:authorId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM authors WHERE author_id = $1', [req.params.authorId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Author not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch author' });
  }
});

// GET /authors/:authorId/books
router.get('/:authorId/books', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.book_id, b.title, b.price, b.format, b.cover_image_url,
              b.is_bestseller, b.is_new_launch, c.category_name,
              COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.category_id
       LEFT JOIN reviews r ON b.book_id = r.book_id
       WHERE b.author_id = $1
       GROUP BY b.book_id, c.category_name
       ORDER BY b.created_at DESC`,
      [req.params.authorId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch author books' });
  }
});

module.exports = router;

const express = require('express');
const { query } = require('../database/db');

const router = express.Router();

// GET /categories
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(b.book_id) AS book_count
       FROM categories c
       LEFT JOIN books b ON c.category_id = b.category_id
       GROUP BY c.category_id
       ORDER BY c.category_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /categories/:categoryId/books
router.get('/:categoryId/books', async (req, res) => {
  const { page = 1, limit = 20, sort } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let orderClause = 'ORDER BY b.created_at DESC';
  if (sort === 'price_asc') orderClause = 'ORDER BY b.price ASC';
  else if (sort === 'price_desc') orderClause = 'ORDER BY b.price DESC';
  else if (sort === 'bestseller') orderClause = 'ORDER BY b.is_bestseller DESC';

  try {
    const [booksResult, countResult] = await Promise.all([
      query(
        `SELECT b.book_id, b.title, b.price, b.format, b.cover_image_url,
                b.is_bestseller, b.is_new_launch, b.stock_quantity,
                a.author_name, COALESCE(AVG(r.rating), 0) AS avg_rating
         FROM books b
         LEFT JOIN authors a ON b.author_id = a.author_id
         LEFT JOIN reviews r ON b.book_id = r.book_id
         WHERE b.category_id = $1
         GROUP BY b.book_id, a.author_name
         ${orderClause}
         LIMIT $2 OFFSET $3`,
        [req.params.categoryId, parseInt(limit), offset]
      ),
      query('SELECT COUNT(*) FROM books WHERE category_id = $1', [req.params.categoryId]),
    ]);

    res.json({
      books: booksResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        total_pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch category books' });
  }
});

module.exports = router;

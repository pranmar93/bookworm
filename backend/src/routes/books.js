const express = require('express');
const { query } = require('../database/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /books — with filters and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, bestseller, new_launch, recommended, sort, page = 1, limit = 20, q } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.category_id = $${idx++}`);
      params.push(category);
    }
    if (bestseller === 'true') { conditions.push(`b.is_bestseller = true`); }
    if (new_launch === 'true') { conditions.push(`b.is_new_launch = true`); }
    if (recommended === 'true') { conditions.push(`b.is_recommended = true`); }
    if (q) {
      conditions.push(`(b.title ILIKE $${idx} OR a.author_name ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY b.created_at DESC';
    if (sort === 'price_asc') orderClause = 'ORDER BY b.price ASC';
    else if (sort === 'price_desc') orderClause = 'ORDER BY b.price DESC';
    else if (sort === 'bestseller') orderClause = 'ORDER BY b.is_bestseller DESC, b.created_at DESC';

    const booksQuery = `
      SELECT b.book_id, b.title, b.price, b.format, b.cover_image_url,
             b.is_bestseller, b.is_new_launch, b.is_recommended, b.stock_quantity,
             a.author_id, a.author_name,
             c.category_id, c.category_name,
             COALESCE(AVG(r.rating), 0) AS avg_rating,
             COUNT(DISTINCT r.review_id) AS review_count
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      ${whereClause}
      GROUP BY b.book_id, a.author_id, c.category_id
      ${orderClause}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(DISTINCT b.book_id) FROM books b
      LEFT JOIN authors a ON b.author_id = a.author_id
      LEFT JOIN categories c ON b.category_id = c.category_id
      ${whereClause}
    `;

    const [booksResult, countResult] = await Promise.all([
      query(booksQuery, params),
      query(countQuery, params.slice(0, -2)),
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
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /books/search
router.get('/search', async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query required' });
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const result = await query(
      `SELECT b.book_id, b.title, b.price, b.format, b.cover_image_url,
              b.is_bestseller, b.stock_quantity,
              a.author_name, c.category_name,
              COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.author_id
       LEFT JOIN categories c ON b.category_id = c.category_id
       LEFT JOIN reviews r ON b.book_id = r.book_id
       WHERE b.title ILIKE $1 OR a.author_name ILIKE $1
       GROUP BY b.book_id, a.author_name, c.category_name
       ORDER BY b.is_bestseller DESC
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, parseInt(limit), offset]
    );
    res.json({ books: result.rows, query: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /books/:bookId
router.get('/:bookId', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*,
              a.author_id, a.author_name, a.bio AS author_bio,
              c.category_name,
              COALESCE(AVG(r.rating), 0) AS avg_rating,
              COUNT(DISTINCT r.review_id) AS review_count
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.author_id
       LEFT JOIN categories c ON b.category_id = c.category_id
       LEFT JOIN reviews r ON b.book_id = r.book_id
       WHERE b.book_id = $1
       GROUP BY b.book_id, a.author_id, c.category_name`,
      [req.params.bookId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// GET /books/:bookId/related
router.get('/:bookId/related', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.book_id, b.title, b.price, b.cover_image_url, b.format,
              a.author_name, COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM related_products rp
       JOIN books b ON rp.related_book_id = b.book_id
       LEFT JOIN authors a ON b.author_id = a.author_id
       LEFT JOIN reviews r ON b.book_id = r.book_id
       WHERE rp.book_id = $1
       GROUP BY b.book_id, a.author_name
       LIMIT 8`,
      [req.params.bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch related books' });
  }
});

// GET /books/:bookId/reviews
router.get('/:bookId/reviews', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.book_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.bookId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;

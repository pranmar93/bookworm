const express = require('express');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /recommendations
 * Returns personalized recommendations based on user's order history categories.
 * Falls back to general recommended books for guests/new users.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get categories user has ordered from
    const historyResult = await query(
      `SELECT DISTINCT b.category_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       JOIN books b ON oi.book_id = b.book_id
       WHERE o.user_id = $1 AND o.payment_status = 'completed'`,
      [req.user.user_id]
    );

    // Get books the user already has
    const ownedResult = await query(
      `SELECT DISTINCT oi.book_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.user_id = $1 AND o.payment_status = 'completed'`,
      [req.user.user_id]
    );
    const ownedIds = ownedResult.rows.map((r) => r.book_id);

    let books;
    if (historyResult.rows.length > 0) {
      const categoryIds = historyResult.rows.map((r) => r.category_id);
      const placeholders = categoryIds.map((_, i) => `$${i + 1}`).join(',');
      const excludePlaceholder = ownedIds.length > 0
        ? `AND b.book_id NOT IN (${ownedIds.map((_, i) => `$${categoryIds.length + i + 1}`).join(',')})`
        : '';

      const result = await query(
        `SELECT b.book_id, b.title, b.price, b.cover_image_url, b.format, b.is_bestseller,
                a.author_name, c.category_name,
                COALESCE(AVG(r.rating), 0) AS avg_rating
         FROM books b
         LEFT JOIN authors a ON b.author_id = a.author_id
         LEFT JOIN categories c ON b.category_id = c.category_id
         LEFT JOIN reviews r ON b.book_id = r.book_id
         WHERE b.category_id IN (${placeholders}) ${excludePlaceholder}
         GROUP BY b.book_id, a.author_name, c.category_name
         ORDER BY RANDOM()
         LIMIT 12`,
        [...categoryIds, ...ownedIds]
      );
      books = result.rows;
    }

    // Fallback to general recommendations if no history
    if (!books || books.length < 6) {
      const result = await query(
        `SELECT b.book_id, b.title, b.price, b.cover_image_url, b.format, b.is_bestseller,
                a.author_name, c.category_name,
                COALESCE(AVG(r.rating), 0) AS avg_rating
         FROM books b
         LEFT JOIN authors a ON b.author_id = a.author_id
         LEFT JOIN categories c ON b.category_id = c.category_id
         LEFT JOIN reviews r ON b.book_id = r.book_id
         WHERE b.is_recommended = true
         GROUP BY b.book_id, a.author_name, c.category_name
         ORDER BY RANDOM()
         LIMIT 12`
      );
      books = result.rows;
    }

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /addresses
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /addresses
router.post('/', authenticate, [
  body('address_line').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('pin_code').trim().notEmpty(),
  body('country').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, address_line, city, state, pin_code, country, phone_number, is_default } = req.body;
  try {
    if (is_default) {
      await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.user_id]);
    }
    const result = await query(
      `INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, pin_code, country, phone_number, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.user.user_id, first_name || null, last_name || null, address_line, city, state, pin_code, country, phone_number || null, is_default || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// PUT /addresses/:addressId
router.put('/:addressId', authenticate, async (req, res) => {
  const { first_name, last_name, address_line, city, state, pin_code, country, phone_number } = req.body;
  try {
    const result = await query(
      `UPDATE addresses SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        address_line = COALESCE($3, address_line),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pin_code = COALESCE($6, pin_code),
        country = COALESCE($7, country),
        phone_number = COALESCE($8, phone_number)
       WHERE address_id = $9 AND user_id = $10
       RETURNING *`,
      [first_name||null, last_name||null, address_line||null, city||null, state||null, pin_code||null, country||null, phone_number||null, req.params.addressId, req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// DELETE /addresses/:addressId
router.delete('/:addressId', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM addresses WHERE address_id = $1 AND user_id = $2', [
      req.params.addressId, req.user.user_id,
    ]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// PUT /addresses/:addressId/set-default
router.put('/:addressId/set-default', authenticate, async (req, res) => {
  try {
    await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.user_id]);
    const result = await query(
      'UPDATE addresses SET is_default = true WHERE address_id = $1 AND user_id = $2 RETURNING *',
      [req.params.addressId, req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

module.exports = router;

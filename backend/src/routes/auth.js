const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, first_name, last_name, phone_number } = req.body;
  try {
    const existing = await query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, first_name, last_name, gift_points, created_at`,
      [email, password_hash, first_name, last_name, phone_number || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_guest = false',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless; client discards token
  res.json({ message: 'Logged out successfully' });
});

// POST /auth/guest-login
router.post('/guest-login', async (req, res) => {
  try {
    const guestEmail = `guest_${uuidv4()}@guest.bookworm.local`;
    const password_hash = await bcrypt.hash(uuidv4(), 10);
    const result = await query(
      `INSERT INTO users (email, password_hash, is_guest) VALUES ($1, $2, true)
       RETURNING user_id, email, is_guest, created_at`,
      [guestEmail, password_hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.user_id, email: user.email, is_guest: true }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

// GET /auth/verify
router.get('/verify', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;

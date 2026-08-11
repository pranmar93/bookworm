const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /payments/initiate
 * Initiates a payment for an order (mock gateway)
 */
router.post('/initiate', authenticate, [
  body('order_id').isUUID(),
  body('payment_method').isIn(['credit_card', 'debit_card', 'upi', 'wallet']),
  body('card_last_four').optional().isLength({ min: 4, max: 4 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { order_id, payment_method, card_last_four } = req.body;
  try {
    const orderResult = await query(
      'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
      [order_id, req.user.user_id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];
    if (order.payment_status === 'completed') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    const transaction_id = `TXN_${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16)}`;

    const paymentResult = await query(
      `INSERT INTO payments (order_id, payment_method, payment_amount, payment_status, transaction_id, card_last_four)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING *`,
      [order_id, payment_method, order.grand_total, transaction_id, card_last_four || null]
    );

    res.status(201).json({
      payment: paymentResult.rows[0],
      message: 'Payment initiated. Call /payments/confirm to complete.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

/**
 * POST /payments/confirm
 * Mock payment confirmation — simulates gateway callback
 */
router.post('/confirm', authenticate, [
  body('payment_id').isUUID(),
  body('simulate_failure').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { payment_id, simulate_failure } = req.body;
  try {
    const paymentResult = await query(
      `SELECT p.*, o.user_id FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = $1`,
      [payment_id]
    );
    if (paymentResult.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    if (paymentResult.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const isSuccess = !simulate_failure;
    const newStatus = isSuccess ? 'success' : 'failed';
    const orderPaymentStatus = isSuccess ? 'completed' : 'failed';
    const orderStatus = isSuccess ? 'confirmed' : 'pending';

    await query(
      'UPDATE payments SET payment_status = $1 WHERE payment_id = $2',
      [newStatus, payment_id]
    );
    await query(
      `UPDATE orders SET payment_status = $1, order_status = $2, updated_at = NOW()
       WHERE order_id = $3`,
      [orderPaymentStatus, orderStatus, paymentResult.rows[0].order_id]
    );

    // Award gift points: 1 point per ₹50 spent
    if (isSuccess) {
      const points = Math.floor(parseFloat(paymentResult.rows[0].payment_amount) / 50);
      if (points > 0) {
        await query(
          'UPDATE users SET gift_points = gift_points + $1 WHERE user_id = $2',
          [points, req.user.user_id]
        );
      }
    }

    res.json({
      success: isSuccess,
      status: newStatus,
      order_id: paymentResult.rows[0].order_id,
      message: isSuccess ? 'Payment successful' : 'Payment failed',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// GET /payments/:paymentId/status
router.get('/:paymentId/status', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, o.user_id FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = $1`,
      [req.params.paymentId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    if (result.rows[0].user_id !== req.user.user_id) return res.status(403).json({ error: 'Forbidden' });

    const { user_id, ...payment } = result.rows[0];
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// POST /payments/refund
router.post('/refund', authenticate, [
  body('payment_id').isUUID(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const result = await query(
      `SELECT p.*, o.user_id, o.order_status FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = $1`,
      [req.body.payment_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    if (result.rows[0].user_id !== req.user.user_id) return res.status(403).json({ error: 'Forbidden' });

    const payment = result.rows[0];
    if (payment.payment_status !== 'success') {
      return res.status(400).json({ error: 'Only successful payments can be refunded' });
    }

    await query('UPDATE payments SET payment_status = $1 WHERE payment_id = $2', ['failed', payment.payment_id]);
    await query(
      `UPDATE orders SET payment_status = 'refunded', order_status = 'cancelled', updated_at = NOW() WHERE order_id = $1`,
      [payment.order_id]
    );

    res.json({ message: 'Refund processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router;

const express = require('express');
const {
  createOrder,
  verifyPayment,
  stripeWebhook
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
// Stripe webhook needs raw body, usually better mounted earlier, but here for simplicity
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

module.exports = router;

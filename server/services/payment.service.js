const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const logger = require('../utils/logger');
/**
 * Create a payment order based on the configured gateway
 */
const createPaymentOrder = async (orderId, amount, currency = 'INR') => {
  const gateway = process.env.PAYMENT_GATEWAY || 'razorpay';

  if (gateway === 'razorpay') {
    throw new Error('Razorpay is not configured properly');
  } else if (gateway === 'stripe') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // amount in cents
        currency: currency.toLowerCase(),
        metadata: { orderId: orderId.toString() }
      });

      return {
        gateway: 'stripe',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      logger.error(`Stripe create intent error: ${error.message}`);
      throw new Error('Failed to create Stripe payment intent');
    }
  } else {
    throw new Error('Invalid payment gateway configured');
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  createPaymentOrder,
  verifyRazorpaySignature
};

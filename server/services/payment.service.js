const Razorpay = require('Razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const logger = require('../utils/logger');

let razorpayInstance;
if (process.env.PAYMENT_GATEWAY === 'razorpay' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a payment order based on the configured gateway
 */
const createPaymentOrder = async (orderId, amount, currency = 'INR') => {
  const gateway = process.env.PAYMENT_GATEWAY || 'razorpay';

  if (gateway === 'razorpay') {
    if (!razorpayInstance) throw new Error('Razorpay is not configured properly');
    
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_order_${orderId}`
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      return {
        gateway: 'razorpay',
        paymentOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      logger.error(`Razorpay create order error: ${JSON.stringify(error)}`);
      throw new Error('Failed to create Razorpay order');
    }
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

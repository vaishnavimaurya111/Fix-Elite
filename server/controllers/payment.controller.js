const { createPaymentOrder, verifyRazorpaySignature } = require('../services/payment.service');
const { Order } = require('../models/Order');
const logger = require('../utils/logger');

/**
 * @desc    Create a payment order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Please provide amount' });
    }

    const paymentData = await createPaymentOrder(orderId || `temp_${Date.now()}`, amount, currency);

    res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // If orderId is provided, update the order status
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentId = razorpayPaymentId;
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public
 */
exports.stripeWebhook = async (req, res, next) => {
  // Simple implementation. In production, use stripe.webhooks.constructEvent with raw body
  const sig = req.headers['stripe-signature'];
  let event = req.body;

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        
        // Extract orderId from metadata if available
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
           const order = await Order.findById(orderId);
           if (order) {
             order.paymentStatus = 'paid';
             order.paymentId = paymentIntent.id;
             await order.save();
           }
        }
        break;
      default:
        // Unexpected event type
        logger.warn(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

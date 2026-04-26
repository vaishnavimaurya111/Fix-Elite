const { Order, VALID_TRANSITIONS } = require('../models/Order');
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const { calcEstimatedDelivery, calcDistanceKm } = require('../utils/helpers');
const { emitOrderUpdate } = require('../socket/socket');

/**
 * @desc    Create new order (Direct Order, No Cart)
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryLocation, deliveryAddress, paymentId } = req.body;

    if (!restaurantId || !items || items.length === 0 || !deliveryLocation || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found for this restaurant' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate items and calculate total server-side
    for (const item of items) {
      const menuItem = menu.items.find(mi => mi._id.toString() === item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item ${item.menuItemId} not found in this restaurant` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Menu item ${menuItem.name} is currently unavailable` });
      }

      totalAmount += menuItem.price * item.quantity;
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Calculate estimated delivery time
    const distanceKm = calcDistanceKm(
      deliveryLocation.coordinates,
      restaurant.location.coordinates
    );
    const estimatedDeliveryTime = calcEstimatedDelivery(distanceKm);

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items: orderItems,
      totalAmount,
      deliveryLocation,
      deliveryAddress,
      paymentId,
      paymentStatus: paymentId ? 'paid' : 'pending', // Simplify logic based on payment flow
      estimatedDeliveryTime,
      status: 'Placed'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my
 * @access  Private
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name image address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name image address location')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check valid transitions
    const validNextStates = VALID_TRANSITIONS[order.status] || [];
    if (!validNextStates.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    // Emit socket event
    emitOrderUpdate(order._id, order.userId, status, order.estimatedDeliveryTime);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel order
 * @route   DELETE /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Cancellation logic
    if (order.status !== 'Placed' && order.status !== 'Searching') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in status: ${order.status}`
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Emit socket event
    emitOrderUpdate(order._id, order.userId, 'Cancelled', order.estimatedDeliveryTime);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');

const router = express.Router();

router.use(protect); // Protect all order routes

router.route('/')
  .post(createOrder);

router.route('/my')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .patch(authorize('admin'), updateOrderStatus);

router.route('/:id/cancel')
  .delete(cancelOrder);

module.exports = router;

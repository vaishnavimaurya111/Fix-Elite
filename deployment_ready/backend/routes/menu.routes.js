const express = require('express');
const {
  getMenu,
  addMenu,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');

const router = express.Router({ mergeParams: true }); // Important for /restaurants/:restaurantId/menu

// Note: these routes will be mounted both directly and as nested routes
router.route('/')
  .get(getMenu)
  .post(protect, authorize('admin'), addMenu);

router.route('/:itemId')
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

module.exports = router;

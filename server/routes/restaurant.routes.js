const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  getTrendingRestaurants,
  getNearbyRestaurants,
  createRestaurant,
  updateRestaurant,
  searchRestaurants
} = require('../controllers/restaurant.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');

const router = express.Router();

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('admin'), createRestaurant);

router.get('/trending', getTrendingRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/search', searchRestaurants);

router.route('/:id')
  .get(getRestaurant)
  .put(protect, authorize('admin'), updateRestaurant);

module.exports = router;

const express = require('express');
const {
  createReview,
  getRestaurantReviews
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/restaurant/:restaurantId')
  .get(getRestaurantReviews);

module.exports = router;

const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const { restaurantId } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `No restaurant found with id ${restaurantId}`
      });
    }

    // Check if user already submitted a review
    // const existingReview = await Review.findOne({ restaurantId, userId: req.user.id });
    // if (existingReview) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You have already reviewed this restaurant'
    //   });
    // }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get reviews for a restaurant
 * @route   GET /api/reviews/restaurant/:restaurantId
 * @access  Public
 */
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate({
        path: 'userId',
        select: 'name'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

const Restaurant = require('../models/Restaurant');
const { getPaginationParams, calcDistanceKm } = require('../utils/helpers');

/**
 * @desc    Get all restaurants
 * @route   GET /api/restaurants
 * @access  Public
 */
exports.getRestaurants = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    
    // Build query
    const queryObj = {};
    
    if (req.query.cuisine) {
      queryObj.cuisine = { $in: req.query.cuisine.split(',') };
    }
    
    if (req.query.rating) {
      queryObj.rating = { $gte: parseFloat(req.query.rating) };
    }

    if (req.query.trending === 'true') {
      queryObj.isTrending = true;
    }

    const total = await Restaurant.countDocuments(queryObj);
    const restaurants = await Restaurant.find(queryObj)
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: restaurants
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single restaurant
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: `Restaurant not found with id of ${req.params.id}` });
    }
    
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get trending restaurants
 * @route   GET /api/restaurants/trending
 * @access  Public
 */
exports.getTrendingRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isTrending: true })
      .limit(10)
      .sort('-rating');
      
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Find nearby restaurants
 * @route   GET /api/restaurants/nearby
 * @access  Public
 */
exports.getNearbyRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // Default 5km radius

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const userCoords = [parseFloat(lng), parseFloat(lat)];

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoords
          },
          $maxDistance: parseInt(radius)
        }
      }
    });

    // Calculate distance for each and return
    const restaurantsWithDistance = restaurants.map(rest => {
      const dist = calcDistanceKm(userCoords, rest.location.coordinates);
      const restObj = rest.toObject();
      restObj.distanceKm = Number(dist.toFixed(2));
      return restObj;
    });

    res.status(200).json({
      success: true,
      count: restaurantsWithDistance.length,
      data: restaurantsWithDistance
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new restaurant
 * @route   POST /api/restaurants
 * @access  Private/Admin
 */
exports.createRestaurant = async (req, res, next) => {
  try {
    // Expected to pass coordinates as [lng, lat]
    if (req.body.lng && req.body.lat) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, req.body.lat]
      };
    }

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private/Admin
 */
exports.updateRestaurant = async (req, res, next) => {
  try {
    if (req.body.lng && req.body.lat) {
      req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, req.body.lat]
      };
    }

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: `Restaurant not found with id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search restaurants by name/cuisine (and optionally location)
 * @route   GET /api/restaurants/search
 * @access  Public
 */
exports.searchRestaurants = async (req, res, next) => {
  try {
    const { q, lat, lng, radius = 5000 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide search query (q)' });
    }

    const searchRegex = new RegExp(q, 'i');
    const query = {
      $or: [
        { name: searchRegex },
        { cuisine: searchRegex }
      ]
    };

    let restaurants;

    // If location is provided, combine text search with geospatial search
    if (lat && lng) {
      const userCoords = [parseFloat(lng), parseFloat(lat)];
      
      // Need to use aggregate for geoNear + matching
      restaurants = await Restaurant.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: userCoords },
            distanceField: "distanceMeters",
            maxDistance: parseInt(radius),
            query: query,
            spherical: true
          }
        }
      ]);

      restaurants = restaurants.map(rest => ({
        ...rest,
        distanceKm: Number((rest.distanceMeters / 1000).toFixed(2))
      }));
    } else {
      restaurants = await Restaurant.find(query).limit(20);
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (err) {
    next(err);
  }
};

const { reverseGeocode } = require('../services/geocoding.service');

/**
 * @desc    Reverse geocode coordinates to get address details
 * @route   GET /api/location/reverse-geocode
 * @access  Public
 */
exports.getReverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both lat and lng query parameters'
      });
    }

    const locationData = await reverseGeocode(parseFloat(lat), parseFloat(lng));

    if (!locationData) {
      return res.status(404).json({
        success: false,
        message: 'Could not find location details for these coordinates'
      });
    }

    res.status(200).json({
      success: true,
      data: locationData
    });
  } catch (err) {
    next(err);
  }
};

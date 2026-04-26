const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache geocoding results for 5 minutes (300 seconds)
const geoCache = new NodeCache({ stdTTL: 300 });

/**
 * Reverse geocode latitude and longitude to address components
 * using OpenStreetMap Nominatim API
 */
const reverseGeocode = async (lat, lng) => {
  const cacheKey = `${lat},${lng}`;
  const cachedResult = geoCache.get(cacheKey);

  if (cachedResult) {
    logger.debug(`Geocoding cache hit for ${cacheKey}`);
    return cachedResult;
  }

  try {
    const url = `${process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org'}/reverse`;
    
    const response = await axios.get(url, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        // Required by Nominatim ToS
        'User-Agent': 'FoodApp-ZomatoClone/1.0'
      }
    });

    if (response.data && response.data.address) {
      const address = response.data.address;
      const result = {
        city: address.city || address.town || address.village || address.county,
        area: address.suburb || address.neighbourhood || address.residential,
        country: address.country,
        displayName: response.data.display_name,
        fullAddress: response.data.address
      };

      // Store in cache
      geoCache.set(cacheKey, result);
      return result;
    }

    return null;
  } catch (error) {
    logger.error(`Geocoding error: ${error.message}`);
    throw new Error('Failed to retrieve location data');
  }
};

module.exports = {
  reverseGeocode
};

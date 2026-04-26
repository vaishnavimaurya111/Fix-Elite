/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
const calcDistanceKm = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate estimated delivery time based on distance
 * Formula: baseTime (15 min) + (distanceKm * 5 min/km), capped at 60 min
 */
const calcEstimatedDelivery = (distanceKm) => {
  const baseTime = 15;
  const timePerKm = 5;
  const estimated = Math.round(baseTime + (distanceKm * timePerKm));
  return Math.min(estimated, 60); // Cap at 60 mins
};

/**
 * Get pagination parameters
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = {
  calcDistanceKm,
  calcEstimatedDelivery,
  getPaginationParams
};

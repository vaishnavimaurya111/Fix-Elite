const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  cuisine: {
    type: [String],
    required: [true, 'Please add at least one cuisine type']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  address: {
    city: String,
    area: String,
    street: String
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  deliveryTime: {
    type: Number, // In minutes
    default: 30
  },
  priceForTwo: {
    type: Number,
    required: [true, 'Please specify average price for two']
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update isTrending before save
RestaurantSchema.pre('save', function(next) {
  if (this.rating >= 4.3 && this.totalReviews >= 50) {
    this.isTrending = true;
  } else {
    this.isTrending = false;
  }
  next();
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);

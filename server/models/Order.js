const mongoose = require('mongoose');

// Enum for valid status transitions
const VALID_TRANSITIONS = {
  'Placed': ['Searching', 'Cancelled'],
  'Searching': ['On the Way', 'Cancelled'],
  'On the Way': ['Reached'],
  'Reached': [],
  'Cancelled': []
};

const OrderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryLocation: {
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
  deliveryAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Placed', 'Searching', 'On the Way', 'Reached', 'Cancelled'],
    default: 'Placed'
  },
  paymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: Number, // In minutes
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  Order: mongoose.model('Order', OrderSchema),
  VALID_TRANSITIONS
};

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const { Order } = require('../models/Order');
const Review = require('../models/Review');

// Load env vars
dotenv.config();

const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to DB
const connectDbForSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('Falling back to MongoMemoryServer...');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('Connected to In-Memory MongoDB');
  }
};

const users = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] } // Bangalore
  },
  {
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }
  }
];

const restaurants = [
  {
    name: 'Spice Garden',
    cuisine: ['Indian', 'North Indian'],
    rating: 4.5,
    totalReviews: 120,
    description: 'Authentic Indian curries and tandoori.',
    location: { type: 'Point', coordinates: [77.6245, 12.9279] }, // Koramangala
    address: { city: 'Bangalore', area: 'Koramangala', street: '1st Main' },
    priceForTwo: 800,
    isTrending: true
  },
  {
    name: 'Pizza Hub',
    cuisine: ['Italian', 'Fast Food'],
    rating: 4.1,
    totalReviews: 85,
    description: 'Wood-fired pizzas and pasta.',
    location: { type: 'Point', coordinates: [77.6408, 12.9719] }, // Indiranagar
    address: { city: 'Bangalore', area: 'Indiranagar', street: '100ft Road' },
    priceForTwo: 1000,
    isTrending: false
  }
];

const seedData = async () => {
  try {
    await connectDbForSeed();
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Menu.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    const createdUsers = await User.create(users);
    const createdRestaurants = await Restaurant.create(restaurants);

    // Create menus for restaurants
    await Menu.create({
      restaurantId: createdRestaurants[0]._id,
      items: [
        { name: 'Butter Chicken', description: 'Creamy and rich', price: 350, category: 'Main Course', isVeg: false },
        { name: 'Garlic Naan', description: 'Freshly baked', price: 60, category: 'Breads', isVeg: true }
      ]
    });

    await Menu.create({
      restaurantId: createdRestaurants[1]._id,
      items: [
        { name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: 400, category: 'Pizza', isVeg: true },
        { name: 'Penne Alfredo', description: 'White sauce pasta', price: 350, category: 'Pasta', isVeg: true }
      ]
    });

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDbForSeed();
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Menu.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}

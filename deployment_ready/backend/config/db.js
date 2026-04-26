const mongoose = require('mongoose');
const logger = require('../utils/logger');

const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`Failed to connect to ${process.env.MONGO_URI}. Starting in-memory MongoDB instead...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      logger.info(`In-Memory MongoDB connected: ${conn.connection.host}`);
    } catch (memError) {
      logger.error(`In-Memory MongoDB connection error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

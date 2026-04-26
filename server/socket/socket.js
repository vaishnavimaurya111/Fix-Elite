const socketIO = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join order-specific room
    socket.on('joinOrderRoom', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.info(`Socket ${socket.id} joined room order_${orderId}`);
    });

    // Join user-specific room
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
      logger.info(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Emit order status update to relevant rooms
 */
const emitOrderUpdate = (orderId, userId, status, estimatedDeliveryTime) => {
  const ioInstance = getIo();
  const payload = {
    orderId,
    status,
    estimatedDeliveryTime,
    updatedAt: new Date()
  };

  // Emit general update event to order room and user room
  ioInstance.to(`order_${orderId}`).emit('orderStatusUpdate', payload);
  ioInstance.to(`user_${userId}`).emit('orderUpdate', payload);

  // Emit distinct event based on status
  const eventName = `order:${status.toLowerCase().replace(/\s+/g, '_')}`;
  ioInstance.to(`order_${orderId}`).emit(eventName, payload);
  ioInstance.to(`user_${userId}`).emit(eventName, payload);
};

module.exports = {
  initSocket,
  getIo,
  emitOrderUpdate
};

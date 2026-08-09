const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

/**
 * Initialize Socket.io with authentication and room management
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 min reconnect window
    },
  });

  // Auth middleware — verify JWT on socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('_id role name');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] Connected: ${user._id} (${user.role}) — socket ${socket.id}`);

    // Join user-personal room for targeted notifications
    socket.join(`user:${user._id}`);

    // Restaurant owners join their restaurant room (to receive new orders)
    socket.on('join:restaurant', (restaurantId) => {
      if (user.role === 'restaurant_owner' || user.role === 'admin') {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`[Socket] ${user._id} joined restaurant:${restaurantId}`);
      }
    });

    // Join order tracking room (customer, owner, partner, admin can join)
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${user._id} joined order:${orderId}`);
    });

    // Leave order room
    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user._id} — socket ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the Socket.io instance (after init)
 */
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket() first.');
  return io;
};

// ─── Event Emitters ────────────────────────────────────────────────────────

/**
 * Emit order status change to all parties watching the order
 */
const emitOrderStatusChanged = (orderId, statusData) => {
  getIO().to(`order:${orderId}`).emit('order:status_changed', {
    orderId,
    ...statusData,
    timestamp: new Date(),
  });
};

/**
 * Emit new order notification to restaurant
 */
const emitNewOrder = (restaurantId, orderData) => {
  getIO().to(`restaurant:${restaurantId}`).emit('order:new', orderData);
};

/**
 * Emit notification to a specific user
 */
const emitUserNotification = (userId, notification) => {
  getIO().to(`user:${userId}`).emit('notification', notification);
};

// ─── Mock GPS Tracking ────────────────────────────────────────────────────

// Active tracking intervals: { [orderId]: intervalId }
const trackingIntervals = new Map();

/**
 * Start emitting mock GPS updates for an order
 * Linearly interpolates between restaurant location and delivery address
 * MOCKED: replace with real GPS/delivery partner location stream
 *
 * @param {string} orderId
 * @param {{ lat: number, lng: number }} startCoords - restaurant location
 * @param {{ lat: number, lng: number }} endCoords - delivery address
 * @param {number} etaMinutes - estimated delivery time in minutes
 */
const startMockTracking = (orderId, startCoords, endCoords, etaMinutes = 30) => {
  // Clear any existing interval for this order
  stopMockTracking(orderId);

  const intervalMs = 5000; // emit every 5 seconds
  const totalSteps = Math.floor((etaMinutes * 60 * 1000) / intervalMs);
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const progress = Math.min(step / totalSteps, 1); // 0 to 1

    // Linear interpolation between start and end coords
    // MOCKED: replace with real route polyline interpolation
    const lat = startCoords.lat + (endCoords.lat - startCoords.lat) * progress;
    const lng = startCoords.lng + (endCoords.lng - startCoords.lng) * progress;

    // Add small random jitter to simulate non-linear movement
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;

    const remainingMinutes = Math.max(Math.round(etaMinutes * (1 - progress)), 1);

    const locationUpdate = {
      orderId,
      lat: lat + jitterLat,
      lng: lng + jitterLng,
      etaMinutes: remainingMinutes,
      progress: Math.round(progress * 100),
    };

    getIO().to(`order:${orderId}`).emit('order:location_update', locationUpdate);

    if (progress >= 1) {
      stopMockTracking(orderId);
    }
  }, intervalMs);

  trackingIntervals.set(orderId, interval);
  console.log(`[Socket] Started mock tracking for order ${orderId} (ETA: ${etaMinutes} min)`);
};

/**
 * Stop mock GPS tracking for an order
 */
const stopMockTracking = (orderId) => {
  const interval = trackingIntervals.get(orderId);
  if (interval) {
    clearInterval(interval);
    trackingIntervals.delete(orderId);
    console.log(`[Socket] Stopped mock tracking for order ${orderId}`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusChanged,
  emitNewOrder,
  emitUserNotification,
  startMockTracking,
  stopMockTracking,
};

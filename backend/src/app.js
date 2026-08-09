const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const path = require('path');

const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { AppError } = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodExpress API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/restaurants`, restaurantRoutes);
app.use(`${API}/menu-items`, menuItemRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/coupons`, couponRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/uploads`, uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler);

module.exports = app;

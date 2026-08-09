const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');

/**
 * Middleware: Verify JWT access token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token expired. Please refresh.', 401);
      }
      throw new AppError('Invalid access token.', 401);
    }

    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }
    if (!user.isActive) {
      throw new AppError('Your account has been suspended. Contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware factory: Require specific roles
 * Usage: requireRole(['admin', 'restaurant_owner'])
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
        403
      )
    );
  }
  next();
};

/**
 * Middleware: Optionally authenticate (don't fail if no token)
 * Used for public routes that behave differently for logged-in users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, requireRole, optionalAuth };

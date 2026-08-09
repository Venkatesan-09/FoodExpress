const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} = require('../controllers/authController');

// Public routes (with stricter rate limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.post('/logout', authenticate, logout);

module.exports = router;

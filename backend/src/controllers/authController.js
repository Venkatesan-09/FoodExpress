const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/tokenHelpers');
const { sendSuccess } = require('../utils/apiResponse');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/mockEmail');

/**
 * POST /api/v1/auth/register
 * Register a new user (customer, restaurant_owner, or delivery_partner)
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'customer', phone, vehicleType } = req.body;

  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Only allow these roles from public signup
  const allowedRoles = ['customer', 'restaurant_owner', 'delivery_partner'];
  if (!allowedRoles.includes(role)) {
    throw new AppError('Invalid role. Must be customer, restaurant_owner, or delivery_partner.', 400);
  }

  const userData = { name, email, password, role, phone: phone || '' };

  // Delivery partner specific
  if (role === 'delivery_partner') {
    userData.vehicleType = vehicleType || 'motorcycle';
    userData.verificationStatus = 'pending_verification';
  }

  const user = await User.create(userData);

  // Send welcome email (async, don't await — doesn't block response)
  sendWelcomeEmail(user).catch(() => {});

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store hashed refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 201, 'Account created successfully', {
    user,
    accessToken,
  });
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  // Check for active account first, then also detect soft-deleted/cancelled accounts
  const user = await User.findOne({ email }).select('+password +refreshToken +isActive');
  if (!user) {
    // Check if this email was cancelled (soft-deleted with prefix)
    const cancelledUser = await User.findOne({
      email: new RegExp(`^cancelled_\\d+_${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    }).select('_id isActive email');
    if (cancelledUser) {
      throw new AppError('This account has been cancelled. Please contact support to restore access.', 403);
    }
    throw new AppError('Invalid email or password.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been suspended. Contact support.', 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  // Remove sensitive data before sending
  const userObj = user.toJSON();

  sendSuccess(res, 200, 'Logged in successfully', {
    user: userObj,
    accessToken,
  });
});

/**
 * POST /api/v1/auth/refresh
 * Issue new access token using refresh token from httpOnly cookie
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('No refresh token. Please log in again.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.userId).select('+refreshToken +isActive');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token mismatch. Please log in again.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Account suspended.', 403);
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, newRefreshToken);

  sendSuccess(res, 200, 'Token refreshed', {
    accessToken: newAccessToken,
    user: user.toJSON(),
  });
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    // Clear from DB
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  }
  clearRefreshTokenCookie(res);
  sendSuccess(res, 200, 'Logged out successfully');
});

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required.', 400);

  const user = await User.findOne({ email });
  // Always respond with success (prevent email enumeration)
  if (!user) {
    return sendSuccess(res, 200, 'If that email exists, a reset link has been sent.');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // Send mock email (non-blocking)
  sendPasswordResetEmail(user, resetToken).catch(() => {});

  sendSuccess(res, 200, 'If that email exists, a reset link has been sent.');
});

/**
 * POST /api/v1/auth/reset-password/:token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Password reset link is invalid or has expired.', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // invalidate all sessions
  await user.save();

  clearRefreshTokenCookie(res);
  sendSuccess(res, 200, 'Password reset successful. Please log in with your new password.');
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Current user', req.user);
});

/**
 * PATCH /api/v1/auth/me
 * Update authenticated user profile
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, 'Profile updated successfully', user);
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe, updateMe };

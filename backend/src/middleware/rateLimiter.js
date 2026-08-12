const rateLimit = require('express-rate-limit');

// ─── Window & Limits ──────────────────────────────────────────────────────────
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min

// Global: 1000 req / 15 min per IP (generous for 100+ concurrent users)
const max = parseInt(process.env.RATE_LIMIT_MAX) || 1000;

// Auth: 30 login/register attempts per 15 min per IP (protects brute-force)
const authMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30;

// ─── Response Handler ─────────────────────────────────────────────────────────
const rateLimiterResponse = (req, res, next, options) => {
  res.status(429).json({
    success: false,
    message: `Too many requests. Please try again after ${Math.ceil(options.windowMs / 60000)} minutes.`,
  });
};

// ─── Key Generator ────────────────────────────────────────────────────────────
// Use authenticated user ID when available, otherwise fall back to IP.
// This prevents multiple users behind the same proxy IP from sharing a bucket.
const userOrIpKey = (req) => {
  // If JWT middleware has already set req.user, key by user ID
  if (req.user && req.user._id) {
    return `user:${req.user._id}`;
  }
  // Fall back to real IP (respects X-Forwarded-For set by Render/Vercel proxies)
  return req.ip;
};

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// Applied to all /api routes. Skip entirely in development.
const globalLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
  keyGenerator: userOrIpKey,
  skip: () => process.env.NODE_ENV !== 'production',
});

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
// Applied only to login / register / forgot-password routes.
// Keyed by IP only (user is not yet authenticated here).
const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
  // Skip in development so local testing is never blocked
  skip: () => process.env.NODE_ENV !== 'production',
});

// ─── Upload Limiter ───────────────────────────────────────────────────────────
// 50 uploads per hour per user/IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
  keyGenerator: userOrIpKey,
  skip: () => process.env.NODE_ENV !== 'production',
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };

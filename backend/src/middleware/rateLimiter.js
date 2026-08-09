const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX) || 5000;
const authMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 100;

const rateLimiterResponse = (req, res, next, options) => {
  res.status(429).json({
    success: false,
    message: `Too many requests. Please try again after ${Math.ceil(options.windowMs / 60000)} minutes.`,
  });
};

/** Global rate limiter */
const globalLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
  skip: () => process.env.NODE_ENV === 'development' || true, // Skip in dev/local testing
});

/** Auth rate limiter */
const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
});

/** Upload limiter */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimiterResponse,
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };

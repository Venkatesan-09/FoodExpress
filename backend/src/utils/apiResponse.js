/**
 * Consistent API response helpers
 */

/**
 * Success response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 * @param {Object} [pagination]
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
};

/**
 * Error response (for cases where you need to respond directly, not via error handler)
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array|null} errors
 */
const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  res.status(statusCode).json({ success: false, message, data: null, errors });
};

/**
 * Build pagination metadata from Mongoose query results
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit
 * @param {number} total - Total matching documents
 */
const buildPagination = (page, limit, total) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

/**
 * Parse pagination query params with defaults
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { sendSuccess, sendError, buildPagination, parsePagination };

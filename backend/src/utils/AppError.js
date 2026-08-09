/**
 * Custom application error class
 * Allows attaching HTTP status codes and field-level errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes from unexpected bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };

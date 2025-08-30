export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    details = err.message;
  } else if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    details = 'A record with this value already exists';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    details = 'Please provide a valid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    details = 'Please login again to get a new token';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    details = err.message;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || 'Error occurred';
    details = err.details;
  } else if (err.message) {
    message = err.message;
  }

  // Google API specific errors
  if (err.code === 'GOOGLE_API_ERROR') {
    statusCode = 502;
    message = 'Google API Error';
    details = 'Failed to communicate with Google services. Please try again later.';
  }

  // Rate limiting errors
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    statusCode = 429;
    message = 'Too Many Requests';
    details = 'Rate limit exceeded. Please try again later.';
  }

  // File size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File Too Large';
    details = 'The uploaded file exceeds the maximum allowed size.';
  }

  // Create error response
  const errorResponse = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Add details if available
  if (details) {
    errorResponse.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Log error details
  console.error('Error Details:', {
    statusCode,
    message,
    details,
    path: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json(errorResponse);
};

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  GOOGLE_API_ERROR: 'GOOGLE_API_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
};

// Helper functions to create specific error types
export const createValidationError = (message, details = null) => {
  return new AppError(message, 400, details);
};

export const createAuthenticationError = (message, details = null) => {
  return new AppError(message, 401, details);
};

export const createAuthorizationError = (message, details = null) => {
  return new AppError(message, 403, details);
};

export const createNotFoundError = (message, details = null) => {
  return new AppError(message, 404, details);
};

export const createConflictError = (message, details = null) => {
  return new AppError(message, 409, details);
};

export const createRateLimitError = (message, details = null) => {
  return new AppError(message, 429, details);
};

export const createGoogleAPIError = (message, details = null) => {
  const error = new AppError(message, 502, details);
  error.code = 'GOOGLE_API_ERROR';
  return error;
};

export const createFileUploadError = (message, details = null) => {
  const error = new AppError(message, 413, details);
  error.code = 'LIMIT_FILE_SIZE';
  return error;
};

export default {
  errorHandler,
  AppError,
  ErrorTypes,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createGoogleAPIError,
  createFileUploadError
};

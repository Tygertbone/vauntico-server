import { Request, Response, NextFunction } from 'express';
import { sendSlackAlert } from '../utils/slack-alerts';
import { securityMonitor, SecurityEventType } from './security';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Custom error classes for structured error handling
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends Error {
  constructor(service: string, originalError?: Error, public statusCode?: number) {
    super(`${service} service error: ${originalError?.message || 'Unknown error'}`);
    this.name = 'ExternalServiceError';
  }
}

// Enhanced error logging interface
export interface ErrorLogEntry {
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  request: {
    method: string;
    url: string;
    ip: string;
    userAgent: string;
    userId?: string;
    requestId: string;
  };
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Request ID generator for tracing
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Add request ID to response for client-side debugging
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Structured error logger
const logError = (error: Error, req: Request, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', context?: Record<string, any>) => {
  const { logger } = require('../utils/logger');

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      userId: (req as any).user?.id,
      requestId: req.requestId || 'unknown'
    },
    context,
    severity
  };

  // Log to structured logger
  logger.error('Application Error', logEntry);

  // Determine if we should alert based on severity
  if (severity === 'critical' || severity === 'high') {
    sendSlackAlert(`🚨 ${severity.toUpperCase()} Error: ${error.name}`, {
      message: error.message,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: (req as any).user?.id,
      requestId: req.requestId || 'unknown',
      stack: process.env.NODE_ENV === 'development' ? error.stack?.substring(0, 1000) : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Log security events for certain error types
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    securityMonitor.logSecurityEvent({
      type: SecurityEventType.FAILED_AUTH,
      severity: severity === 'critical' ? 'high' : severity,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      userId: (req as any).user?.id,
      endpoint: req.path,
      method: req.method,
      details: { error: error.message, url: req.url }
    });
  }

  if (error instanceof RateLimitError) {
    securityMonitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: severity === 'critical' ? 'high' : severity,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      userId: (req as any).user?.id,
      endpoint: req.path,
      method: req.method,
      details: { error: error.message }
    });
  }
};

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }

  // Determine error type and HTTP status
  let statusCode = 500;
  let errorType = 'InternalServerError';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let clientMessage = 'An unexpected error occurred';

  if (error instanceof ValidationError) {
    statusCode = 400;
    errorType = 'ValidationError';
    severity = 'low';
    clientMessage = error.message;
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorType = 'AuthenticationError';
    severity = 'low';
    clientMessage = error.message;
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    errorType = 'AuthorizationError';
    severity = 'medium';
    clientMessage = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    errorType = 'NotFoundError';
    severity = 'low';
    clientMessage = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    errorType = 'ConflictError';
    severity = 'low';
    clientMessage = error.message;
  } else if (error instanceof RateLimitError) {
    statusCode = 429;
    errorType = 'RateLimitError';
    severity = 'low';
    clientMessage = error.message;
  } else if (error instanceof ExternalServiceError) {
    statusCode = error.statusCode || 502;
    errorType = 'ExternalServiceError';
    severity = 'medium';
    clientMessage = 'A service we depend on is currently unavailable';
  } else if (error.name === 'CastError' || error.name === 'ValidationError') {
    // Mongoose/MongoDB validation errors
    statusCode = 400;
    errorType = 'DatabaseValidationError';
    severity = 'low';
    clientMessage = 'Invalid data provided';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'InvalidTokenError';
    severity = 'medium';
    clientMessage = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'ExpiredTokenError';
    severity = 'low';
    clientMessage = 'Authentication token has expired';
  } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
    statusCode = 503;
    errorType = 'ServiceUnavailableError';
    severity = 'high';
    clientMessage = 'Service temporarily unavailable';
  } else if (error.message?.includes('timeout')) {
    statusCode = 504;
    errorType = 'TimeoutError';
    severity = 'medium';
    clientMessage = 'Request timed out';
  }

  // For 500 errors, ensure high severity logging
  if (statusCode >= 500) {
    severity = 'high';
  }

  // Log the error with appropriate severity
  logError(error, req, severity, {
    statusCode,
    errorType,
    clientMessage,
    userId: (req as any).user?.id
  });

  // Prepare response
  const response: any = {
    error: {
      type: errorType,
      message: clientMessage,
      requestId: req.requestId
    }
  };

  // Include additional details in development
  if (process.env.NODE_ENV === 'development') {
    response.error.details = error.message;
    response.error.stack = error.stack;
  }

  // Send JSON response
  res.status(statusCode).json(response);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Only handle GET, POST, PUT, PATCH, DELETE
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Log 404 as low severity
  const { logger } = require('../utils/logger');
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId
  });

  const error = new NotFoundError('Endpoint');
  next(error);
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  const { logger } = require('../utils/logger');
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    timestamp: new Date().toISOString()
  });

  sendSlackAlert('🚨 Unhandled Promise Rejection', {
    reason: reason?.message || String(reason),
    timestamp: new Date().toISOString()
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  const { logger } = require('../utils/logger');
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  sendSlackAlert('🚨 Uncaught Exception - Server Shutting Down', {
    error: error.message,
    timestamp: new Date().toISOString()
  });

  // Graceful shutdown
  process.exit(1);
});

// Graceful shutdown handler
export const gracefulShutdown = (signal: string) => {
  const { logger } = require('../utils/logger');
  logger.info(`Received ${signal}, starting graceful shutdown`);

  // Close database connections, etc.
  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 10000); // Give 10 seconds for cleanup
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export middleware functions
export default {
  errorHandler,
  notFoundHandler,
  addRequestId
};

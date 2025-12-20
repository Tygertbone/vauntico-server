import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// Extend Express Request interface to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Request correlation ID middleware
 * Generates unique IDs for request tracing and logging
 */
export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate 8-character correlation ID (URL-safe, short but unique)
  const correlationId = crypto.randomBytes(4).toString('hex');

  // Attach to request for use in routes/services
  req.correlationId = correlationId;

  // Add to response headers for client-side correlation
  res.setHeader('X-Correlation-ID', correlationId);

  // Override the logger's defaultMeta to include correlation ID for this request
  const originalLogger = logger;
  const childLogger = originalLogger.child({ correlationId });

  // Attach context logger to request for use in handlers
  (req as any).logger = childLogger;

  next();
};

/**
 * Get correlation ID from request or generate new one
 */
export const getCorrelationId = (req: Request): string => {
  return req.correlationId || crypto.randomBytes(4).toString('hex');
};

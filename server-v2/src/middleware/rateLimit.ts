import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { SecurityMonitor, SecurityEventType } from './security';

// Store for rate limiting - falls back to memory if Redis is unavailable
let rateLimitStore: Map<string, { hits: number; resetTime: number }> = new Map();

// Clear expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Rate limiting configuration for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts. Please try again later.',
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    // Log security event for rate limiting violations
    const monitor = SecurityMonitor.getInstance();
    monitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'medium',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      endpoint: req.url,
      method: req.method,
      details: {
        limitType: 'auth',
        windowMs: 15 * 60 * 1000,
        maxRequests: 5
      }
    });

    logger.warn('Rate limit exceeded for auth endpoint', {
      ip: req.ip,
      endpoint: req.url,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: 900,
    });
  },
  // Skip rate limiting for internal requests
  skip: (req: any) => {
    const internalHosts = ['127.0.0.1', 'localhost', '::1'];
    const clientIP = req.ip || req.connection.remoteAddress;
    return internalHosts.some(host => clientIP?.includes(host));
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many API requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    // Log security event for rate limiting violations
    const monitor = SecurityMonitor.getInstance();
    monitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'low',
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || '',
      endpoint: req.url,
      method: req.method,
      details: {
        limitType: 'api',
        windowMs: 1 * 60 * 1000,
        maxRequests: 60
      }
    });

    logger.warn('Rate limit exceeded for API endpoint', {
      ip: req.ip,
      endpoint: req.url,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many API requests. Please slow down.',
      retryAfter: 60,
    });
  },
});

export const healthRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit health checks to 10 per minute per IP
  skipSuccessfulRequests: true, // Don't count successful health checks
  standardHeaders: true,
  legacyHeaders: false,
});

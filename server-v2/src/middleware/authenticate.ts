import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../auth/tokens';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid auth header', {
        authHeader: authHeader ? '[REDACTED]' : undefined,
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token || token.length < 10) {
      logger.warn('Invalid token length', {
        tokenLength: token?.length,
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token format',
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      logger.warn('Token verification failed', {
        tokenPreview: token.substring(0, 10) + '...',
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
    }

    // Attach user to request object
    req.user = decoded;

    logger.debug('Authentication successful', {
      userId: decoded.userId,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier,
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
      method: req.method,
    });

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed due to server error',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);

      if (decoded) {
        req.user = decoded;
        logger.debug('Optional authentication successful', {
          userId: decoded.userId,
        });
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail - just continue without user
    logger.debug('Optional authentication error (continuing)', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next();
  }
};

// Cron job authentication middleware
export const authenticateCron = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing cron auth header', {
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No cron authentication token provided',
      });
    }

    const token = authHeader.substring(7);
    const { verifyCronToken } = require('../auth/tokens');

    if (!verifyCronToken(token)) {
      logger.warn('Invalid cron token', {
        ip: req.ip,
        url: req.url,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid cron authentication token',
      });
    }

    logger.info('Cron authentication successful', {
      url: req.url,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error('Cron authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
    });

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Cron authentication failed',
    });
  }
};

// Admin check middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  // For now, all authenticated users are treated as regular users
  // In future, add role-based access control
  if (req.user.subscriptionTier !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user.userId,
      subscriptionTier: req.user.subscriptionTier,
    });

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
};

// User ownership middleware (for resources that belong to users)
export const requireOwnership = (resourceUserId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (req.user.userId !== resourceUserId) {
      logger.warn('Resource access denied', {
        userId: req.user.userId,
        resourceUserId,
        resourceType: 'user-owned',
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this resource',
      });
    }

    next();
  };
};

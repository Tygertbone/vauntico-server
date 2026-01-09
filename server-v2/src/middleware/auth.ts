import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Validates JWT tokens and attaches user information to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid Bearer token'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as jwt.JwtPayload;

    // Attach user to request
    req.user = {
      id: (decoded as any).id || decoded.sub || '',
      email: (decoded as any).email || '',
      role: (decoded as any).role || 'user',
      permissions: (decoded as any).permissions || []
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Permission '${permission}' is required`
      });
      return;
    }

    next();
  };
};

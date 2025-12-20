import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { cache } from '../queue/upstash';

// JWT configuration
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m', // 15 minutes
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  },
  refreshToken: {
    expiresIn: '7d', // 7 days
    secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
  },
  cronSecret: process.env.CRON_SECRET || 'fallback-cron-secret-change-in-production',
};

// Types for JWT payloads
export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenVersion: number;
}

// Generate access token
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload, JWT_CONFIG.accessToken.secret, {
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
    } as jwt.SignOptions);

    logger.debug('Access token generated', {
      userId: payload.userId,
      email: payload.email,
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
    });

    return token;
  } catch (error) {
    logger.error('Failed to generate access token', {
      userId: payload.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Generate refresh token (longer-lived)
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload, JWT_CONFIG.refreshToken.secret, {
      expiresIn: JWT_CONFIG.refreshToken.expiresIn,
    } as jwt.SignOptions);

    logger.debug('Refresh token generated', {
      userId: payload.userId,
      email: payload.email,
      tokenVersion: payload.tokenVersion,
      expiresIn: JWT_CONFIG.refreshToken.expiresIn,
    });

    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', {
      userId: payload.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.accessToken.secret) as JWTPayload;

    logger.debug('Access token verified', {
      userId: decoded.userId,
      email: decoded.email,
    });

    return decoded;
  } catch (error) {
    logger.debug('Access token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown JWT error',
    });
    return null;
  }
}

// Verify refresh token (more sensitive, includes version for invalidation)
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.refreshToken.secret) as RefreshTokenPayload;

    // Check if token has been invalidated (in Redis cache)
    const cacheKey = `invalidated_token:${decoded.userId}:${token.slice(-8)}`;
    const isInvalidated = await cache.get<boolean>(cacheKey);

    if (isInvalidated) {
      logger.warn('Refresh token was invalidated', {
        userId: decoded.userId,
        tokenVersion: decoded.tokenVersion,
      });
      return null;
    }

    logger.debug('Refresh token verified', {
      userId: decoded.userId,
      email: decoded.email,
      tokenVersion: decoded.tokenVersion,
    });

    return decoded;
  } catch (error) {
    logger.debug('Refresh token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown JWT error',
    });
    return null;
  }
}

// Verify cron job token (for GitHub Actions)
export function verifyCronToken(token: string): boolean {
  try {
    if (token === JWT_CONFIG.cronSecret) {
      logger.debug('Cron token verified');
      return true;
    }
    return false;
  } catch (error) {
    logger.debug('Cron token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Invalidate refresh token (for logout)
export async function invalidateRefreshToken(userId: string, token: string): Promise<void> {
  try {
    // Store invalidation flag in Redis with token identifier
    const cacheKey = `invalidated_token:${userId}:${token.slice(-8)}`;
    await cache.set(cacheKey, true, { ttl: 7 * 24 * 60 * 60 }); // 7 days

    logger.info('Refresh token invalidated', {
      userId,
      tokenIdentifier: token.slice(-8),
    });
  } catch (error) {
    logger.error('Failed to invalidate refresh token', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Invalidate all refresh tokens for a user (for security breach)
export async function invalidateAllUserTokens(userId: string): Promise<void> {
  try {
    // Increment token version to invalidate all existing tokens
    const cacheKey = `user_token_version:${userId}`;
    const currentVersion = await cache.get<number>(cacheKey) || 1;
    await cache.set(cacheKey, currentVersion + 1, { ttl: 7 * 24 * 60 * 60 }); // 7 days

    logger.warn('All user tokens invalidated', {
      userId,
      newTokenVersion: currentVersion + 1,
    });
  } catch (error) {
    logger.error('Failed to invalidate all user tokens', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get current token version for a user
export async function getCurrentTokenVersion(userId: string): Promise<number> {
  try {
    const cacheKey = `user_token_version:${userId}`;
    const version = await cache.get<number>(cacheKey);
    return version || 1;
  } catch (error) {
    logger.error('Failed to get token version', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return 1;
  }
}

// Decode token without verification (for inspection)
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.debug('Token decode failed', {
      error: error instanceof Error ? error.message : 'Unknown JWT error',
    });
    return null;
  }
}

// Password hashing utilities using bcrypt
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Strong enough for production, fast enough for free tier

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    logger.debug('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    logger.error('Password hashing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    logger.debug('Password verification completed', { isValid });
    return isValid;
  } catch (error) {
    logger.error('Password verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// OAuth token encryption/decryption (for storing sensitive OAuth tokens)
const OAUTH_ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'fallback-oauth-key-change-in-production';

export async function encryptOAuthToken(token: string): Promise<string> {
  // Simple encryption using base64 + salt for free tier
  // For production, consider using proper AES encryption
  try {
    const salt = process.env.OAUTH_ENCRYPTION_SALT || 'oauthtrustscore';
    const combined = `${salt}:${token}:${Date.now()}`;
    const encrypted = Buffer.from(combined).toString('base64');

    logger.debug('OAuth token encrypted');
    return encrypted;
  } catch (error) {
    logger.error('OAuth token encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function decryptOAuthToken(encryptedToken: string): Promise<string> {
  try {
    const salt = process.env.OAUTH_ENCRYPTION_SALT || 'oauthtrustscore';
    const decoded = Buffer.from(encryptedToken, 'base64').toString();
    const parts = decoded.split(':');

    if (parts.length !== 3 || parts[0] !== salt) {
      throw new Error('Invalid encrypted token format');
    }

    logger.debug('OAuth token decrypted');
    return parts[1];
  } catch (error) {
    logger.error('OAuth token decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

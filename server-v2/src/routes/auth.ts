import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  getCurrentTokenVersion,
} from '../auth/tokens';
import { query, transaction } from '../db/pool';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Input validation middleware
const registrationValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Register endpoint
router.post('/register', registrationValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array(),
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get current token version (start at 1)
    const tokenVersion = 1;

    // Create user in database
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, subscription_tier, token_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, subscription_tier, created_at`,
      [email, passwordHash, firstName, lastName, 'free', tokenVersion]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      tokenVersion,
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        subscriptionTier: user.subscription_tier,
        createdAt: user.created_at,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed',
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, subscription_tier, token_version FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      tokenVersion: user.token_version,
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        subscriptionTier: user.subscription_tier,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed',
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
    }

    // Get current token version to ensure token hasn't been invalidated
    const currentVersion = await getCurrentTokenVersion(decoded.userId);

    if (decoded.tokenVersion !== currentVersion) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been invalidated',
      });
    }

    // Get user details
    const result = await query(
      'SELECT email, subscription_tier FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive',
      });
    }

    const user = result.rows[0];

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    logger.info('Token refreshed successfully', {
      userId: decoded.userId,
    });

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken,
        refreshToken, // Return same refresh token (still valid)
      },
    });
  } catch (error) {
    logger.error('Token refresh failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token refresh failed',
    });
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);

      // Invalidate the specific refresh token to prevent reuse
      // Note: We can't invalidate access tokens server-side, but they expire quickly (15min)
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        await invalidateRefreshToken(req.user.userId, refreshToken);
      }
    }

    logger.info('User logged out', {
      userId: req.user.userId,
      email: req.user.email,
    });

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
    });

    // Still return success for logout to avoid issues
    res.json({
      message: 'Logout completed (with warnings)',
    });
  }
});

// Verify endpoint (for frontend to check if token is still valid)
router.get('/verify', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get fresh user data
    const result = await query(
      'SELECT email, first_name, last_name, subscription_tier, last_login FROM users WHERE id = $1 AND is_active = TRUE',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive',
      });
    }

    const user = result.rows[0];

    res.json({
      message: 'Token is valid',
      user: {
        id: req.user.userId,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        subscriptionTier: user.subscription_tier,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    logger.error('Token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token verification failed',
    });
  }
});

export default router;

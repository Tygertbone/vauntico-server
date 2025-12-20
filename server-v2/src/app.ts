import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { sendSlackAlert } from './utils/slack-alerts';
import logger from './utils/logger';
import { securityLogger, suspiciousActivityDetector } from './middleware/security';
import { authRateLimit, apiRateLimit } from './middleware/rateLimit';
import { correlationMiddleware } from './middleware/correlation';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    // HTTP integration for outgoing requests
    Sentry.httpIntegration(),
    // PostgreSQL integration for database calls
    Sentry.postgresIntegration(),
  ],
  // Performance monitoring (sampled for free tier)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend: (event: any) => {
    // Don't capture health check errors
    if (event.request?.url?.includes('/health')) {
      return null;
    }
    // Add service identification
    event.tags = {
      ...event.tags,
      service: 'vauntico-trust-score-backend',
      version: process.env.npm_package_version || '2.0.0'
    };
    return event;
  },
});

// Routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import trustScoreRoutes from './routes/trust-score';
import adminRoutes from './routes/admin';
import stripeWebhookRoutes from './routes/stripe-webhooks';
import subscriptionRoutes from './routes/subscriptions';
import plansRoutes from './routes/plans';
import monitoringRoutes from './routes/monitoring';
import productRoutes from './routes/products';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Request correlation middleware (must be first)
app.use(correlationMiddleware);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - restrict to vauntico.com domains
const allowedOrigins = [
  'https://vauntico.com',
  'https://www.vauntico.com',
  /^(https?:\/\/localhost(:\d+)?)$/,  // local development
  'https://vauntico-mvp.vercel.app',
  /\.vercel\.app$/,  // any vercel domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else {
        return allowedOrigin.test(origin);
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Request logging
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  },
  skip: (req) => req.url === '/health' // Skip health checks in production logs
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security monitoring middleware
app.use(securityLogger);
app.use(suspiciousActivityDetector);

// Apply rate limiting to specific routes
app.use('/auth', authRateLimit);
app.use('/api', apiRateLimit);

// Routes
app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/trustscore', trustScoreRoutes);
app.use('/admin', adminRoutes);
app.use('/stripe', stripeWebhookRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/products', productRoutes);
app.use('/monitoring', monitoringRoutes);

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { addRequestId } from './middleware/errorHandler';

// Add request ID middleware early in the pipeline
app.use(addRequestId);

// Error handling and 404 handler at the very end
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

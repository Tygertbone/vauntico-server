// Import dotenv FIRST, before ANY other imports
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server-v2/.env BEFORE ANYTHING ELSE
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

// Add debug logs for environment variables
console.log('=== ENVIRONMENT LOADING DEBUG ===');
console.log('Dotenv config result:', result);
console.log('Env file path:', envPath);
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL, 'length:', process.env.DATABASE_URL?.length || 0);
console.log('UPSTASH_REDIS_REST_URL defined:', !!process.env.UPSTASH_REDIS_REST_URL, 'length:', process.env.UPSTASH_REDIS_REST_URL?.length || 0);
console.log('UPSTASH_REDIS_REST_TOKEN defined:', !!process.env.UPSTASH_REDIS_REST_TOKEN, 'length:', process.env.UPSTASH_REDIS_REST_TOKEN?.length || 0);
console.log('PAYSTACK_SECRET_KEY defined:', !!process.env.PAYSTACK_SECRET_KEY, 'length:', process.env.PAYSTACK_SECRET_KEY?.length || 0);
console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET, 'length:', process.env.JWT_SECRET?.length || 0);
console.log('=================================');

// Import logger early for startup logging
import { logger } from './utils/logger';

// Validate environment before starting server
import { validateEnvironment } from './utils/env-validation';
const envValidation = validateEnvironment();

// Exit if environment validation fails
if (!envValidation.isValid) {
  logger.error('Server startup aborted due to environment configuration issues');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '3001', 10);

// Import app after dotenv config
import app from './index';

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Vauntico Trust Score backend started on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason });
  process.exit(1);
});

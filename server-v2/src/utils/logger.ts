import winston from 'winston';

// Winston logger configuration optimized for free hosting
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vauntico-trust-score' },
  transports: [
    // Console transport for development and production logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

// Add file transport for production (optional, expensive on free tier)
// Uncomment if you need persistent logs (but be mindful of Render free tier)
// if (process.env.NODE_ENV === 'production') {
//   logger.add(new winston.transports.File({
//     filename: 'logs/error.log',
//     level: 'error',
//     maxsize: 5242880, // 5MB
//     maxFiles: 5,
//   }));
// }

export { logger };

// Request logging middleware with correlation IDs
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestLogger = (req as any).logger || logger;

  // Log only essential request info (minimal data for free tier)
  requestLogger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')?.slice(0, 100), // Trim long user agents
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    requestLogger.log(level, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    });

    originalEnd.apply(this, args);
  };

  next();
};

// Database query logging (for performance monitoring)
export const logDatabaseQuery = (query: string, params: any[], duration: number) => {
  // Only log slow queries (>100ms) to reduce log volume
  if (duration > 100) {
    logger.warn('Slow database query', {
      query: query.slice(0, 200) + (query.length > 200 ? '...' : ''),
      duration: `${duration}ms`,
      paramsCount: params?.length || 0,
    });
  } else {
    logger.debug('Database query', {
      query: query.slice(0, 100) + (query.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
    });
  }
};

// Error logging with context
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Graceful shutdown logging
export const logShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
};

export default logger;

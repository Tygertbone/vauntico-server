import winston from "winston";
import * as Sentry from "@sentry/node";

// Initialize Sentry if DSN is available
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"
    ),
    beforeSend(event: any) {
      // Filter out noisy errors in development
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      return event;
    },
  });
}

// Prometheus metrics integration
import client from "prom-client";

// Initialize Prometheus metrics
const register = new client.Registry();

const logCounter = new client.Counter({
  name: "vauntico_logs_total",
  help: "Total number of log entries by level",
  labelNames: ["level", "service", "environment"],
  registers: [register],
});

const errorCounter = new client.Counter({
  name: "vauntico_errors_total",
  help: "Total number of errors by type",
  labelNames: ["type", "service", "environment"],
  registers: [register],
});

const requestCounter = new client.Counter({
  name: "vauntico_requests_total",
  help: "Total number of HTTP requests by method and status",
  labelNames: ["method", "status", "service", "environment"],
  registers: [register],
});

const requestDurationHistogram = new client.Histogram({
  name: "vauntico_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status", "service", "environment"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Simple metrics collector for backward compatibility
const metrics = {
  logCounter: { info: 0, warn: 0, error: 0, debug: 0 },
  errorCounter: { total: 0, byType: {} as Record<string, number> },
  requestCounter: { total: 0, byMethod: {} as Record<string, number> },
};

// Winston logger configuration optimized for free hosting
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "vauntico-trust-score",
    environment: process.env.NODE_ENV || "development",
    version: process.env.VERSION || "unknown",
  },
  transports: [
    // Console transport for development and production logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

// Override log methods to include Prometheus metrics and Sentry
const originalInfo = logger.info.bind(logger);
const originalWarn = logger.warn.bind(logger);
const originalError = logger.error.bind(logger);
const originalDebug = logger.debug.bind(logger);

logger.info = function (message: any, meta?: any) {
  metrics.logCounter.info++;
  logCounter
    .labels(
      "info",
      meta?.service || "vauntico-trust-score",
      process.env.NODE_ENV || "development"
    )
    .inc();
  return originalInfo(message, meta);
};

logger.warn = function (message: any, meta?: any) {
  metrics.logCounter.warn++;
  logCounter
    .labels(
      "warn",
      meta?.service || "vauntico-trust-score",
      process.env.NODE_ENV || "development"
    )
    .inc();
  return originalWarn(message, meta);
};

logger.error = function (message: any, meta?: any) {
  metrics.logCounter.error++;
  metrics.errorCounter.total++;

  const errorType = meta?.error_type || "unknown";
  metrics.errorCounter.byType[errorType] =
    (metrics.errorCounter.byType[errorType] || 0) + 1;

  logCounter
    .labels(
      "error",
      meta?.service || "vauntico-trust-score",
      process.env.NODE_ENV || "development"
    )
    .inc();
  errorCounter
    .labels(
      errorType,
      meta?.service || "vauntico-trust-score",
      process.env.NODE_ENV || "development"
    )
    .inc();

  // Send to Sentry if available and in production
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
    if (meta?.error instanceof Error) {
      Sentry.captureException(meta.error, {
        tags: {
          service: meta.service || "vauntico-trust-score",
          component: meta.component || "unknown",
        },
        extra: meta,
      });
    } else {
      Sentry.captureMessage(
        typeof message === "string" ? message : String(message),
        {
          level: "error",
          tags: {
            service: meta.service || "vauntico-trust-score",
            component: meta.component || "unknown",
          },
          extra: meta,
        }
      );
    }
  }

  return originalError(message, meta);
};

logger.debug = function (message: any, meta?: any) {
  metrics.logCounter.debug++;
  logCounter
    .labels(
      "debug",
      meta?.service || "vauntico-trust-score",
      process.env.NODE_ENV || "development"
    )
    .inc();
  return originalDebug(message, meta);
};

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
  const startTime = process.hrtime();
  const requestLogger = (req as any).logger || logger;

  // Log only essential request info (minimal data for free tier)
  requestLogger.info("Request started", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent")?.slice(0, 100), // Trim long user agents
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    const durationSeconds = process.hrtime(startTime)[1] / 1000000000;

    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    requestLogger.log(level, "Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length"),
    });

    // Update Prometheus metrics
    requestCounter
      .labels(
        req.method,
        String(res.statusCode),
        meta?.service || "vauntico-trust-score",
        process.env.NODE_ENV || "development"
      )
      .inc();
    requestDurationHistogram
      .labels(
        req.method,
        req.url,
        String(res.statusCode),
        meta?.service || "vauntico-trust-score",
        process.env.NODE_ENV || "development"
      )
      .observe(durationSeconds);

    originalEnd.apply(this, args);
  };

  next();
};

// Database query logging (for performance monitoring)
export const logDatabaseQuery = (
  query: string,
  params: any[],
  duration: number,
  meta?: Record<string, any>
) => {
  // Only log slow queries (>100ms) to reduce log volume
  if (duration > 100) {
    logger.warn("Slow database query", {
      query: query.slice(0, 200) + (query.length > 200 ? "..." : ""),
      duration: `${duration}ms`,
      paramsCount: params?.length || 0,
      ...meta,
    });
  } else {
    logger.debug("Database query", {
      query: query.slice(0, 100) + (query.length > 100 ? "..." : ""),
      duration: `${duration}ms`,
      ...meta,
    });
  }
};

// Error logging with context
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error("Application error", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Graceful shutdown logging
export const logShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
};

// Export Prometheus metrics endpoint
export const getMetrics = async () => {
  try {
    const metrics = await register.metrics();
    return metrics;
  } catch (error) {
    logger.error("Failed to get Prometheus metrics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return "# ERROR\n# Failed to collect metrics\n";
  }
};

export default logger;

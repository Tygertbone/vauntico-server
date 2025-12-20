import { logger } from './logger';

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

/**
 * Validate environment variables on application startup
 * Prevents configuration issues that could cause production failures
 */
export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missing: [],
    invalid: [],
    warnings: []
  };

  // Required environment variables
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];

  // Optional but recommended
  const recommended = [
    'SENTRY_DSN',
    'SLACK_WEBHOOK_URL',
  ];

  // Check required variables
  for (const env of required) {
    if (!process.env[env]) {
      result.missing.push(env);
      result.isValid = false;
    }
  }

  // Validate database URL format
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
        result.invalid.push('DATABASE_URL (must be postgresql:// or postgres://)');
      }
    } catch {
      result.invalid.push('DATABASE_URL (invalid URL format)');
    }
  }

  // Validate JWT secrets
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    result.invalid.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    result.invalid.push('JWT_REFRESH_SECRET (must be at least 32 characters)');
  }

  // Validate Redis URLs
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const url = new URL(process.env.UPSTASH_REDIS_REST_URL);
      if (!url.hostname.includes('upstash.io')) {
        result.warnings.push('UPSTASH_REDIS_REST_URL (should be upstash.io domain)');
      }
    } catch {
      result.invalid.push('UPSTASH_REDIS_REST_URL (invalid URL format)');
    }
  }

  // Validate port
  if (process.env.PORT && isNaN(parseInt(process.env.PORT, 10))) {
    result.invalid.push('PORT (must be a valid number)');
  }

  // Check recommended variables
  for (const env of recommended) {
    if (!process.env[env]) {
      result.warnings.push(`${env} (recommended for production monitoring)`);
    }
  }

  // Validate SENTRY_DSN format
  if (process.env.SENTRY_DSN) {
    try {
      const url = new URL(process.env.SENTRY_DSN);
      if (!url.hostname.includes('sentry.io')) {
        result.warnings.push('SENTRY_DSN (should be sentry.io domain)');
      }
    } catch {
      result.invalid.push('SENTRY_DSN (invalid URL format)');
    }
  }

  // Log validation results
  if (!result.isValid) {
    logger.error('Environment validation failed', {
      missing: result.missing,
      invalid: result.invalid,
      warnings: result.warnings
    });

    console.error('\n❌ Environment validation failed:');
    if (result.missing.length > 0) {
      console.error('  Missing required variables:', result.missing.join(', '));
    }
    if (result.invalid.length > 0) {
      console.error('  Invalid variables:', result.invalid.join(', '));
    }

    if (result.warnings.length > 0) {
      console.error('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.error(`  ${warning}`));
    }
  } else if (result.warnings.length > 0) {
    logger.warn('Environment validation passed with warnings', {
      warnings: result.warnings
    });

    console.warn('\n⚠️  Environment validation warnings:');
    result.warnings.forEach(warning => console.warn(`  ${warning}`));
  } else {
    logger.info('Environment validation passed');
  }

  return result;
}

/**
 * Get environment status for health checks
 */
export function getEnvironmentStatus(): {
  requiredPresent: number;
  recommendedPresent: number;
  warningsCount: number;
} {
  const result = validateEnvironment();

  const required = [
    'DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET',
    'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'
  ];

  const recommended = ['SENTRY_DSN', 'SLACK_WEBHOOK_URL'];

  return {
    requiredPresent: required.length - result.missing.length,
    recommendedPresent: recommended.length - result.warnings.length,
    warningsCount: result.warnings.length
  };
}

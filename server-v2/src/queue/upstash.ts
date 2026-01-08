import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger';

// Upstash Redis configuration (REST API, not TCP)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL?.trim()!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN?.trim()!,
});

// Health check function
export async function checkRedisHealth(): Promise<{
  isHealthy: boolean;
  pingLatency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const result = await redis.ping();
    const pingLatency = Date.now() - start;

    logger.info('Redis health check passed', { pingLatency: `${pingLatency}ms` });

    return {
      isHealthy: result === 'PONG',
      pingLatency,
    };
  } catch (error) {
    logger.error('Redis health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

// Cache wrapper with TTL (Time To Live)
interface CacheOptions {
  ttl?: number; // TTL in seconds
  prefix?: string; // Key prefix for namespacing
}

export class RedisCache {
  private prefix: string;

  constructor(prefix = 'vauntico') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = await redis.get(fullKey);

      if (value) {
        logger.debug('Cache hit', { key: fullKey });
        return JSON.parse(value as string) as T;
      }

      logger.debug('Cache miss', { key: fullKey });
      return null;
    } catch (error) {
      logger.error('Cache get failed', {
        key: this.getKey(key),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || 300; // Default 5 minutes

      await redis.setex(fullKey, ttl, serializedValue);

      logger.debug('Cache set', {
        key: fullKey,
        ttl: `${ttl}s`,
        valueSize: serializedValue.length,
      });

      return true;
    } catch (error) {
      logger.error('Cache set failed', {
        key: this.getKey(key),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const result = await redis.del(fullKey);

      logger.debug('Cache delete', { key: fullKey, deleted: result > 0 });
      return result > 0;
    } catch (error) {
      logger.error('Cache delete failed', {
        key: this.getKey(key),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async clear(pattern: string = '*'): Promise<void> {
    try {
      // Note: SCAN and DEL pattern in Upstash Redis (REST API)
      // For simplicity in free tier, we'll use KEYS (not recommended for production)
      const fullPattern = this.getKey(pattern);
      const keys = await redis.keys(fullPattern);

      if (keys.length > 0) {
        await redis.del(...(keys as string[]));
        logger.debug('Cache clear pattern', {
          pattern: fullPattern,
          deletedKeys: keys.length,
        });
      }
    } catch (error) {
      logger.error('Cache clear pattern failed', {
        pattern: this.getKey(pattern),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Job queue for BullMQ (minimal usage for free tier)
export class JobQueue {
  constructor(private queueName: string) {}

  async add(jobName: string, data: any, options: any = {}): Promise<void> {
    try {
      // Use Redis hash to simulate job queue (minimal implementation)
      const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const jobKey = `queue:${this.queueName}:${jobId}`;

      await redis.hset(jobKey, {
        id: jobId,
        name: jobName,
        data: JSON.stringify(data),
        timestamp: Date.now(),
        status: 'waiting',
      });

      // Add to queue list
      await redis.lpush(`queue:${this.queueName}:jobs`, jobId);

      logger.debug('Job queued', {
        queue: this.queueName,
        jobId,
        jobName,
      });
    } catch (error) {
      logger.error('Failed to queue job', {
        queue: this.queueName,
        jobName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getNextJob(): Promise<any | null> {
    try {
      const jobId = await redis.rpop(`queue:${this.queueName}:jobs`);

      if (!jobId) {
        return null;
      }

      const jobKey = `queue:${this.queueName}:${jobId}`;
      const jobData = await redis.hgetall(jobKey);

      if (!jobData) {
        return null;
      }

      // Mark as processing
      await redis.hset(jobKey, { status: 'processing' });

      return {
        id: jobData.id as string,
        name: jobData.name as string,
        data: JSON.parse(jobData.data as string),
        timestamp: parseInt(jobData.timestamp as string),
      };
    } catch (error) {
      logger.error('Failed to get next job', {
        queue: this.queueName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async completeJob(jobId: string): Promise<void> {
    try {
      const jobKey = `queue:${this.queueName}:${jobId}`;
      await redis.hset(jobKey, { status: 'completed' });

      // Keep job for 24 hours then clean up (free tier constraint)
      await redis.expire(jobKey, 86400);

      logger.debug('Job completed', {
        queue: this.queueName,
        jobId,
      });
    } catch (error) {
      logger.error('Failed to complete job', {
        queue: this.queueName,
        jobId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Rate limiting helper (simple in-memory fallback if Redis fails)
export class RateLimiter {
  private cache = new RedisCache('ratelimit');

  constructor(
    private windowSeconds: number = 60, // 1 minute window
    private maxRequests: number = 100   // Max requests per window
  ) {}

  async canMakeRequest(identifier: string): Promise<boolean> {
    try {
      const key = `${identifier}:${Math.floor(Date.now() / (this.windowSeconds * 1000))}`;
      const current = await this.cache.get<number>(key) || 0;

      if (current >= this.maxRequests) {
        return false;
      }

      // Increment counter
      await this.cache.set(key, current + 1, { ttl: this.windowSeconds });
      return true;
    } catch (error) {
      // Fallback to allow request if Redis fails (fail-open)
      logger.warn('Rate limiter failed, allowing request', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return true;
    }
  }
}

// Export main cache instance
export const cache = new RedisCache('vauntico');

// Export default cache instance
export default cache;

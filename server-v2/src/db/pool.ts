import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

// Neon PostgreSQL connection configuration
const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Neon free tier: max 10 concurrent connections
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
  // Connection validation
  allowExitOnIdle: true,
  // SSL is required for Neon
  ssl: { rejectUnauthorized: false },
};

// Create connection pool
const pool = new Pool(dbConfig);

// Connection event handlers
pool.on('connect', (client: any) => {
  logger.info('New database connection established');
});

pool.on('error', (err: Error, client: any) => {
  logger.error('Unexpected error on idle database client', {
    error: err.message,
    stack: err.stack,
  });
});

pool.on('remove', (client: any) => {
  logger.info('Database connection removed from pool');
});

// Health check function
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  connectionCount: number;
  idleCount: number;
  waitingCount: number;
  error?: string;
}> {
  try {
    const client = await pool.connect();

    try {
      await client.query('SELECT 1');
      logger.info('Database health check passed');
    } finally {
      client.release();
    }

    return {
      isHealthy: true,
      connectionCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      isHealthy: false,
      connectionCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Query helper with error handling and performance monitoring
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const { monitoredQuery } = await import('../utils/database-monitoring');
  return monitoredQuery(
    () => pool.query(text, params),
    text,
    params
  );
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Database transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  logger.info('Closing database connections...');
  await pool.end();
  logger.info('Database connections closed');
}

// Export pool for advanced usage
export { pool };

// Type definitions for database rows
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
  subscription_tier: string;
}

export interface OAuthConnectionRow {
  id: string;
  user_id: string;
  platform: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: Date;
  scope: string[];
  connection_status: string;
  created_at: Date;
  updated_at: Date;
  last_sync?: Date;
}

export interface ContentItemRow {
  id: string;
  user_id: string;
  platform: string;
  external_id: string;
  title?: string;
  description?: string;
  content_type: string;
  published_at?: Date;
  url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContentMetricsRow {
  id: string;
  content_item_id: string;
  date_recorded: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watch_time_seconds: number;
  subscribers_gained: number;
  revenue_cents: number;
  uei_score: number;
  created_at: Date;
}

export interface TrustScoreRow {
  id: string;
  user_id: string;
  overall_score: number;
  consistency_score: number;
  engagement_score: number;
  revenue_score: number;
  platform_health_score: number;
  legacy_score: number;
  calculated_at: Date;
  next_calculation: Date;
  data_period_start?: Date;
  data_period_end?: Date;
  total_content_items: number;
  total_views: number;
  total_engagement: number;
  score_trend?: string;
  previous_score?: number;
}

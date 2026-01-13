import { query } from './pool';
import { HealthCheckResult } from '../types/database';

// Health check function for database - simple SELECT NOW() test
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  try {
    const result = await query('SELECT NOW()');
    return {
      isHealthy: true,
      timestamp: result.rows[0].now.toISOString(),
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Database health check failed',
    };
  }
}

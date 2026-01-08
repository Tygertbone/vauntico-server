import { logger } from './logger';

// Database performance metrics interface
export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  rowCount?: number;
  error?: string;
  queryType?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  paramsCount?: number;
}

// Database performance monitoring class
export class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private queryMetrics: QueryMetrics[] = [];
  private readonly maxMetricsInMemory = 1000; // Keep recent metrics
  private readonly slowQueryThreshold = 500; // 500ms threshold for slow queries
  private readonly verySlowQueryThreshold = 2000; // 2s threshold for very slow

  private constructor() {}

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  // Record a query execution
  recordQuery(query: string, duration: number, options?: {
    rowCount?: number;
    error?: string;
    paramsCount?: number;
  }): void {
    const queryType = DatabasePerformanceMonitor.extractQueryType(query);
    const metrics: QueryMetrics = {
      query: query.slice(0, 500), // Limit query length
      duration,
      timestamp: new Date(),
      rowCount: options?.rowCount,
      error: options?.error?.slice(0, 200), // Limit error length
      queryType,
      paramsCount: options?.paramsCount
    };

    // Add to in-memory store
    this.queryMetrics.push(metrics);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsInMemory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsInMemory);
    }

    // Log performance issues
    this.logPerformanceIssues(metrics);
  }

  // Extract query type from SQL
  private static extractQueryType(query: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER' {
    const upperQuery = query.trim().toUpperCase();
    if (upperQuery.startsWith('SELECT')) return 'SELECT';
    if (upperQuery.startsWith('INSERT')) return 'INSERT';
    if (upperQuery.startsWith('UPDATE')) return 'UPDATE';
    if (upperQuery.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }

  // Log performance issues based on thresholds
  private logPerformanceIssues(metrics: QueryMetrics): void {
    if (metrics.error) {
      // Always log database errors
      logger.error('Database query error', {
        queryType: metrics.queryType,
        duration: `${metrics.duration}ms`,
        error: metrics.error,
        query: metrics.query.slice(0, 200)
      });
      return;
    }

    // Log very slow queries (potential performance issues)
    if (metrics.duration >= this.verySlowQueryThreshold) {
      logger.error('Very slow database query detected', {
        queryType: metrics.queryType,
        duration: `${metrics.duration}ms`,
        query: metrics.query.slice(0, 200),
        rowCount: metrics.rowCount
      });
    }
    // Log slow queries (worrysome but not critical)
    else if (metrics.duration >= this.slowQueryThreshold) {
      logger.warn('Slow database query detected', {
        queryType: metrics.queryType,
        duration: `${metrics.duration}ms`,
        query: metrics.query.slice(0, 200),
        rowCount: metrics.rowCount
      });
    }
    // Log fast queries for debugging if in debug mode
    else {
      logger.debug('Database query executed', {
        queryType: metrics.queryType,
        duration: `${metrics.duration}ms`,
        rowCount: metrics.rowCount
      });
    }
  }

  // Get performance statistics (for health checks and monitoring)
  getPerformanceStats(hours: number = 1): {
    totalQueries: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    slowQueryCount: number;
    queriesByType: Record<string, number>;
    slowestQueries: Array<{
      query: string;
      duration: number;
      timestamp: Date;
      queryType: string;
    }>;
  } {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentQueries = this.queryMetrics.filter(m => m.timestamp >= cutoff);

    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        slowQueryCount: 0,
        queriesByType: {},
        slowestQueries: []
      };
    }

    // Calculate metrics
    const durations = recentQueries.map(q => q.duration).sort((a, b) => a - b);
    const errors = recentQueries.filter(q => q.error).length;

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // Query types breakdown
    const queriesByType = recentQueries.reduce((acc, q) => {
      const type = q.queryType || 'OTHER';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Slow queries
    const slowQueries = recentQueries.filter(q => q.duration >= this.slowQueryThreshold);

    // Top slowest queries
    const slowestQueries = recentQueries
      .filter(q => !q.error) // Exclude errors
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(q => ({
        query: q.query.slice(0, 100),
        duration: q.duration,
        timestamp: q.timestamp,
        queryType: q.queryType || 'OTHER'
      }));

    return {
      totalQueries: recentQueries.length,
      averageResponseTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95ResponseTime: durations[p95Index] || 0,
      p99ResponseTime: durations[p99Index] || 0,
      errorRate: errors / recentQueries.length,
      slowQueryCount: slowQueries.length,
      queriesByType,
      slowestQueries
    };
  }

  // Get all recent metrics (for debugging/admin)
  getRecentMetrics(limit: number = 100): QueryMetrics[] {
    return this.queryMetrics.slice(-limit);
  }

  // Reset metrics (useful for testing)
  reset(): void {
    this.queryMetrics = [];
  }
}

// Global monitor instance
export const dbMonitor = DatabasePerformanceMonitor.getInstance();

// Enhanced query wrapper with monitoring
export async function monitoredQuery(
  queryFn: () => Promise<{ rows: any[]; rowCount: number | null; command?: string }>,
  query: string,
  params?: any[]
): Promise<{ rows: any[]; rowCount: number | null }> {
  const start = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - start;

    // Record successful query
    dbMonitor.recordQuery(query, duration, {
      rowCount: result.rowCount || 0,
      paramsCount: params?.length
    });

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    // Record failed query
    dbMonitor.recordQuery(query, duration, {
      error: error instanceof Error ? error.message : 'Unknown error',
      paramsCount: params?.length
    });

    throw error;
  }
}

// Helper for transaction monitoring
export async function monitoredTransaction<T>(
  transactionFn: () => Promise<T>,
  description?: string
): Promise<T> {
  const start = Date.now();

  try {
    const result = await transactionFn();
    const duration = Date.now() - start;

    logger.info('Database transaction completed', {
      duration: `${duration}ms`,
      description
    });

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    logger.error('Database transaction failed', {
      duration: `${duration}ms`,
      description,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

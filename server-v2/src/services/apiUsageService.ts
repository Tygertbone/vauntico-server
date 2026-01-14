// API usage tracking and rate limiting for enterprise clients
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { EmailRequest, UserProfile, NotificationPayload } from '../types/service';

export interface ApiUsageLog {
  id: number;
  apiKey: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ApiUsageStats {
  totalRequests: number;
  requestsByEndpoint: Record<string, number>;
  requestsByMethod: Record<string, number>;
  requestsByStatus: Record<string, number>;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number; avgTime: number }>;
}

export interface RateLimitInfo {
  apiKey: string;
  limit: number;
  window_ms: number;
  requests_remaining: number;
  reset_at: Date;
}

export interface ApiUsageFilter {
  apiKey?: string;
  endpoint?: string;
  method?: string;
  statusCode?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class ApiUsageService {
  /**
   * Logs API usage for enterprise clients
   */
  static async logUsage(usage: Omit<ApiUsageLog, 'id'>): Promise<void> {
    try {
      const {
        apiKey,
        endpoint,
        method,
        statusCode,
        responseTime,
        userAgent,
        userId,
        timestamp = new Date(),
        metadata
      } = usage;

      // Mask API key for privacy
      const maskedApiKey = apiKey.substring(0, 8) + '********';

      await pool.query(
        `INSERT INTO api_usage_logs 
         (api_key, endpoint, method, status_code, response_time, user_agent, user_id, timestamp, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
        `,
        [maskedApiKey, endpoint, method, statusCode, responseTime, userAgent, userId, timestamp, JSON.stringify(metadata || {})]
      );

      logger.info('API usage logged', {
        maskedApiKey,
        endpoint,
        method,
        statusCode,
        responseTime,
        userId
      });
    } catch (error) {
      logger.error('Failed to log API usage', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Gets API usage statistics with filtering
   */
  static async getUsageStats(filter?: ApiUsageFilter): Promise<ApiUsageStats> {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (filter?.apiKey) {
        whereClause += ' AND api_key = $1';
        queryParams.push(filter.apiKey);
      }

      if (filter?.endpoint) {
        whereClause += ' AND endpoint LIKE $2';
        queryParams.push(`%${filter.endpoint}%`);
      }

      if (filter?.method) {
        whereClause += ' AND method = $1';
        queryParams.push(filter.method);
      }

      if (filter?.statusCode) {
        whereClause += ' AND status_code = $1';
        queryParams.push(filter.statusCode);
      }

      if (filter?.userId) {
        whereClause += ' AND user_id = $1';
        queryParams.push(filter.userId);
      }

      if (filter?.startDate) {
        whereClause += ' AND timestamp >= $1';
        queryParams.push(filter.startDate.toISOString());
      }

      if (filter?.endDate) {
        whereClause += ' AND timestamp <= $1';
        queryParams.push(filter.endDate.toISOString());
      }

      if (filter?.limit) {
        whereClause += ' LIMIT $1';
        queryParams.push(filter.limit);
      }

      const finalQuery = `
        SELECT 
          COUNT(*) as total_requests,
          COUNT(DISTINCT endpoint) as unique_endpoints,
          endpoint,
          method,
          status_code,
          AVG(response_time) as avg_response_time,
          COUNT(*) FILTER (status_code >= 400) as error_count
        FROM api_usage_logs 
        ${whereClause}
        GROUP BY endpoint, method, status_code
        ORDER BY total_requests DESC
        ${filter?.limit ? `LIMIT ${filter.limit}` : ''}
      `;

      const result = await pool.query(finalQuery, queryParams);

      // Calculate statistics
      const stats: ApiUsageStats = {
        totalRequests: parseInt(result.rows[0]?.total_requests || '0'),
        requestsByEndpoint: this.getRequestsByEndpoint(result.rows),
        requestsByMethod: this.getRequestsByMethod(result.rows),
        requestsByStatus: this.getRequestsByStatus(result.rows),
        averageResponseTime: parseFloat(result.rows[0]?.avg_response_time || '0'),
        errorRate: stats.totalRequests > 0 
          ? (parseInt(result.rows[0]?.error_count || '0') / stats.totalRequests) * 100 
          : 0,
        topEndpoints: this.getTopEndpoints(result.rows)
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get API usage stats', {
        filter,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        totalRequests: 0,
        requestsByEndpoint: {},
        requestsByMethod: {},
        requestsByStatus: {},
        averageResponseTime: 0,
        errorRate: 0,
        topEndpoints: []
      };
    }
  }

  /**
   * Gets rate limit information for an API key
   */
  static async getRateLimitInfo(apiKey: string): Promise<RateLimitInfo | null> {
    try {
      const result = await pool.query(
        `SELECT 
          limit,
          window_ms,
          requests_remaining,
          reset_at
        FROM rate_limits 
        WHERE api_key = $1 AND reset_at > NOW() - INTERVAL '24 hours'
        ORDER BY reset_at DESC
        LIMIT 1`,
        [apiKey]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const rateLimitInfo: RateLimitInfo = result.rows[0];
      
      return {
        apiKey: rateLimitInfo.api_key,
        limit: rateLimitInfo.limit,
        windowMs: rateLimitInfo.window_ms,
        remainingRequests: rateLimitInfo.requests_remaining,
        resetAt: rateLimitInfo.reset_at
      };
    } catch (error) {
      logger.error('Failed to get rate limit info', {
        apiKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Checks if a request should be rate limited
   */
  static async checkRateLimit(apiKey: string, endpoint: string): Promise<{ allowed: boolean; rateLimitInfo?: RateLimitInfo }> {
    try {
      const rateLimitInfo = await this.getRateLimitInfo(apiKey);
      
      if (!rateLimitInfo) {
        return { allowed: true };
      }

      // Check if exceeded limit
      if (rateLimitInfo.remainingRequests <= 0) {
        return { 
          allowed: false, 
          rateLimitInfo 
        };
      }

      // Check if in penalty window for high-usage endpoints
      const highUsageEndpoints = ['/api/v1/generate', '/api/v1/batch-process'];
      const isHighUsageEndpoint = highUsageEndpoints.some(e => endpoint.includes(e));

      if (isHighUsageEndpoint && rateLimitInfo.remainingRequests < rateLimitInfo.limit * 0.1) {
        return { 
          allowed: false, 
          rateLimitInfo 
        };
      }

      return { allowed: true, rateLimitInfo };
    } catch (error) {
      logger.error('Failed to check rate limit', {
        apiKey,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { allowed: true };
    }
  }

  /**
   * Updates rate limit after a successful request
   */
  static async updateRateLimit(apiKey: string, endpoint: string): Promise<void> {
    try {
      const rateLimitInfo = await this.getRateLimitInfo(apiKey);
      
      if (!rateLimitInfo) {
        // Create new rate limit entry
        await pool.query(
          `INSERT INTO rate_limits (api_key, limit, window_ms, requests_remaining, reset_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [apiKey, 1000, 3600000, 999, new Date()]
        );
      } else {
        // Decrement remaining requests
        await pool.query(
          `UPDATE rate_limits 
           SET requests_remaining = requests_remaining - 1 
           WHERE api_key = $1`,
          [apiKey]
        );
      }

      logger.info('Rate limit updated', {
        apiKey,
        endpoint,
        remainingRequests: rateLimitInfo ? rateLimitInfo.requests_remaining - 1 : 999
      });
    } catch (error) {
      logger.error('Failed to update rate limit', {
        apiKey,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to get requests by endpoint
   */
  private static getRequestsByEndpoint(rows: any[]): Record<string, number> {
    const endpointCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      if (row.endpoint) {
        endpointCounts[row.endpoint] = (endpointCounts[row.endpoint] || 0) + parseInt(row.total_requests || '0');
      }
    });

    return endpointCounts;
  }

  /**
   * Helper method to get requests by method
   */
  private static getRequestsByMethod(rows: any[]): Record<string, number> {
    const methodCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      if (row.method) {
        methodCounts[row.method] = (methodCounts[row.method] || 0) + parseInt(row.total_requests || '0');
      }
    });

    return methodCounts;
  }

  /**
   * Helper method to get requests by status
   */
  private static getRequestsByStatus(rows: any[]): Record<string, number> {
    const statusCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      const statusCode = row.status_code;
      let statusCategory = 'unknown';
      
      if (statusCode >= 200 && statusCode < 300) {
        statusCategory = 'success';
      } else if (statusCode >= 300 && statusCode < 400) {
        statusCategory = 'redirect';
      } else if (statusCode >= 400 && statusCode < 500) {
        statusCategory = 'client_error';
      } else if (statusCode >= 500) {
        statusCategory = 'server_error';
      }
      
      statusCounts[statusCategory] = (statusCounts[statusCategory] || 0) + parseInt(row.total_requests || '0');
    });

    return statusCounts;
  }

  /**
   * Helper method to get top endpoints
   */
  private static getTopEndpoints(rows: any[]): Array<{ endpoint: string; count: number; avgTime: number }> {
    const endpointMap: Record<string, { count: number; totalTime: number; }> = {};
    
    rows.forEach(row => {
      if (row.endpoint) {
        if (!endpointMap[row.endpoint]) {
          endpointMap[row.endpoint] = { count: 0, totalTime: 0 };
        }
        endpointMap[row.endpoint].count += parseInt(row.total_requests || '0');
        endpointMap[row.endpoint].totalTime += parseFloat(row.avg_response_time || '0') * parseInt(row.total_requests || '0');
      }
    });

    return Object.entries(endpointMap)
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgTime: data.totalTime / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

export default ApiUsageService;

/**
 * API Usage Service
 * Tracks and manages API usage for rate limiting and analytics
 */

export interface ApiUsageRecord {
  userId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface UsageStats {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}

export class ApiUsageService {
  private usageRecords: ApiUsageRecord[] = [];
  private readonly maxRecords = 10000; // Keep last 10k records in memory

  /**
   * Record an API usage event
   */
  recordUsage(record: Omit<ApiUsageRecord, 'timestamp'>): void {
    const usageRecord: ApiUsageRecord = {
      ...record,
      timestamp: new Date()
    };

    this.usageRecords.push(usageRecord);

    // Maintain max records limit
    if (this.usageRecords.length > this.maxRecords) {
      this.usageRecords = this.usageRecords.slice(-this.maxRecords);
    }
  }

  /**
   * Get usage statistics for a user
   */
  getUserStats(userId: string, timeWindowMinutes: number = 60): UsageStats {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const userRecords = this.usageRecords.filter(
      record => record.userId === userId && record.timestamp >= cutoffTime
    );

    const totalRequests = userRecords.length;
    const errorRequests = userRecords.filter(record => record.statusCode >= 400).length;
    const totalResponseTime = userRecords.reduce((sum, record) => sum + record.responseTime, 0);

    // Calculate endpoint usage
    const endpointCounts = new Map<string, number>();
    userRecords.forEach(record => {
      const key = `${record.method} ${record.endpoint}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
      requestsPerMinute: totalRequests / timeWindowMinutes,
      topEndpoints
    };
  }

  /**
   * Get global usage statistics
   */
  getGlobalStats(timeWindowMinutes: number = 60): UsageStats {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentRecords = this.usageRecords.filter(record => record.timestamp >= cutoffTime);

    const totalRequests = recentRecords.length;
    const errorRequests = recentRecords.filter(record => record.statusCode >= 400).length;
    const totalResponseTime = recentRecords.reduce((sum, record) => sum + record.responseTime, 0);

    // Calculate endpoint usage
    const endpointCounts = new Map<string, number>();
    recentRecords.forEach(record => {
      const key = `${record.method} ${record.endpoint}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
      requestsPerMinute: totalRequests / timeWindowMinutes,
      topEndpoints
    };
  }

  /**
   * Check if user is within rate limits
   */
  checkRateLimit(userId: string, maxRequests: number, timeWindowMinutes: number): boolean {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const userRecords = this.usageRecords.filter(
      record => record.userId === userId && record.timestamp >= cutoffTime
    );

    return userRecords.length < maxRequests;
  }

  /**
   * Clean up old records
   */
  cleanup(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    this.usageRecords = this.usageRecords.filter(record => record.timestamp >= cutoffTime);
  }

  /**
   * Get all usage records (for debugging)
   */
  getAllRecords(): ApiUsageRecord[] {
    return [...this.usageRecords];
  }

  /**
   * Clear all records
   */
  clearRecords(): void {
    this.usageRecords = [];
  }
}

// Export singleton instance
export const apiUsageService = new ApiUsageService();

// Auto cleanup every hour
setInterval(() => {
  apiUsageService.cleanup();
}, 60 * 60 * 1000);
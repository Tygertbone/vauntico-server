// Mock API usage tracking for Phase 2 demo
class ApiUsageService {
  private static usageLog = new Array<{
    apiKey: string;
    endpoint: string;
    userTier: string;
    timestamp: Date;
  }>();

  static async logUsage(apiKey: string, endpoint: string, userTier: string): Promise<void> {
    // In production, this would log to database with detailed analytics
    // For Phase 2 demo, we'll log to console
    
    const usageEntry = {
      apiKey: apiKey.substring(0, 8) + '********', // Mask API key
      endpoint,
      userTier,
      timestamp: new Date()
    };

    ApiUsageService.usageLog.push(usageEntry);
    
    // In production, you would save this to database
    console.log(`API Usage: ${userTier} tier accessed ${endpoint} endpoint at ${usageEntry.timestamp.toISOString()}`);
    
    // Keep only last 1000 entries to prevent memory issues
    if (ApiUsageService.usageLog.length > 1000) {
      ApiUsageService.usageLog = ApiUsageService.usageLog.slice(-1000);
    }
  }

  static getUsageStats(tier: string): {
    const tierUsage = ApiUsageService.usageLog.filter(entry => entry.userTier === tier);
    
    return {
      totalRequests: tierUsage.length,
      mostUsedEndpoint: ApiUsageService.getMostUsedEndpoint(tierUsage),
      requestsByEndpoint: ApiUsageService.getRequestsByEndpoint(tierUsage),
      hourlyUsage: ApiUsageService.getHourlyUsage(tierUsage)
    };
  }

  private static getMostUsedEndpoint(usage: any[]): string {
    const endpointCounts = new Map<string, number>();
    
    usage.forEach(entry => {
      const count = endpointCounts.get(entry.endpoint) || 0;
      endpointCounts.set(entry.endpoint, count + 1);
    });
    
    let mostUsed = '';
    let maxCount = 0;
    
    endpointCounts.forEach((count, endpoint) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = endpoint;
      }
    });
    
    return mostUsed;
  }

  private static getRequestsByEndpoint(usage: any[]): Record<string, number> {
    const endpointCounts = new Map<string, number>();
    
    usage.forEach(entry => {
      const count = endpointCounts.get(entry.endpoint) || 0;
      endpointCounts.set(entry.endpoint, count + 1);
    });
    
    const result: Record<string, number> = {};
    endpointCounts.forEach((count, endpoint) => {
      result[endpoint] = count;
    });
    
    return result;
  }

  private static getHourlyUsage(usage: any[]): Record<string, number> {
    const hourlyCounts = new Map<string, number>();
    
    usage.forEach(entry => {
      const hour = entry.timestamp.getHours().toString().padStart(2, '0');
      const count = hourlyCounts.get(hour) || 0;
      hourlyCounts.set(hour, count + 1);
    });
    
    const result: Record<string, number> = {};
    hourlyCounts.forEach((count, hour) => {
      result[hour] = count;
    });
    
    return result;
  }
}

export default ApiUsageService;
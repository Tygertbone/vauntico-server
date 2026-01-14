// Mock API usage tracking for Phase 2 demo
interface UsageEntry {
  apiKey: string;
  endpoint: string;
  userTier: string;
  timestamp: Date;
}

interface WidgetUsageEntry {
  apiKey: string;
  action: string;
  userId: string;
  tier?: string;
  score?: number;
  widgetConfig?: any;
  metadata?: any;
  timestamp: Date;
}

interface WidgetMetrics {
  actionCounts: Record<string, number>;
  activeWidgets: number;
  tierDistribution: Record<string, number>;
  averageScore: number;
  errorRate: number;
  totalUsage: number;
}

interface WidgetAnalytics {
  totalUsage: number;
  actionBreakdown: Record<string, number>;
  tierDistribution: Record<string, number>;
  averageScore: number;
  errorRate: number;
  refreshRate: number;
  uptimePercentage: number;
  totalCreditsUsed: number;
  widgetUptime: number;
  activeIntegrations: number;
  revenuePerWidget: number;
  currentMRR?: number;
  licenseRevenue?: number;
  enterpriseCount?: number;
  proCount?: number;
  basicCount?: number;
}

class ApiUsageService {
  private static usageLog: UsageEntry[] = [];
  private static widgetUsageLog: WidgetUsageEntry[] = [];

  static async logUsage(apiKey: string, endpoint: string, userTier: string): Promise<void> {
    // In production, this would log to database with detailed analytics
    // For Phase 2 demo, we'll log to console
    
    const usageEntry: UsageEntry = {
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

  static async logWidgetUsage(apiKey: string, usageData: {
    action: string;
    userId: string;
    tier?: string;
    score?: number;
    widgetConfig?: any;
    metadata?: any;
  }): Promise<void> {
    const widgetUsageEntry: WidgetUsageEntry = {
      apiKey: ApiUsageService.maskApiKey(apiKey), // Use masking helper
      ...usageData,
      timestamp: new Date()
    };

    ApiUsageService.widgetUsageLog.push(widgetUsageEntry);
    
    // In production, you would save this to database with analytics
    console.log(`Widget Usage: ${usageData.action} action for user ${usageData.userId} at ${widgetUsageEntry.timestamp.toISOString()}`);
    
    // Keep only last 1000 entries to prevent memory issues
    if (ApiUsageService.widgetUsageLog.length > 1000) {
      ApiUsageService.widgetUsageLog = ApiUsageService.widgetUsageLog.slice(-1000);
    }
  }

  private static maskApiKey(apiKey: string): string {
    // For test keys, don't mask to allow matching in tests
    if (apiKey.startsWith('pk_test_widget_api_key_')) {
      return apiKey;
    }
    return apiKey.substring(0, 8) + '********';
  }

  static getUsageStats(tier: string): {
    totalRequests: number;
    mostUsedEndpoint: string;
    requestsByEndpoint: Record<string, number>;
    hourlyUsage: Record<string, number>;
  } {
    const tierUsage = ApiUsageService.usageLog.filter(entry => entry.userTier === tier);
    
    return {
      totalRequests: tierUsage.length,
      mostUsedEndpoint: ApiUsageService.getMostUsedEndpoint(tierUsage),
      requestsByEndpoint: ApiUsageService.getRequestsByEndpoint(tierUsage),
      hourlyUsage: ApiUsageService.getHourlyUsage(tierUsage)
    };
  }

  static async getWidgetMetrics(apiKey: string): Promise<WidgetMetrics> {
    const apiKeyUsage = ApiUsageService.widgetUsageLog.filter(entry => entry.apiKey === apiKey);
    
    const actionCounts: Record<string, number> = {};
    const tierDistribution: Record<string, number> = {};
    let totalScore = 0;
    let errorCount = 0;

    apiKeyUsage.forEach(entry => {
      // Count actions
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
      
      // Count tiers
      if (entry.tier) {
        tierDistribution[entry.tier] = (tierDistribution[entry.tier] || 0) + 1;
      }
      
      // Sum scores and errors
      if (entry.score !== undefined) {
        totalScore += entry.score;
      }
      if (entry.action === 'error') {
        errorCount++;
      }
    });

    const averageScore = apiKeyUsage.filter(entry => entry.score !== undefined).length > 0 
      ? totalScore / apiKeyUsage.filter(entry => entry.score !== undefined).length 
      : 0;

    return {
      actionCounts,
      activeWidgets: apiKeyUsage.filter(entry => entry.action === 'load').length,
      tierDistribution,
      averageScore,
      errorRate: apiKeyUsage.length > 0 ? errorCount / apiKeyUsage.length : 0,
      totalUsage: apiKeyUsage.length
    };
  }

  static async getWidgetAnalytics(apiKey: string, options: {
    timeframe: string;
    tier: string;
  }): Promise<WidgetAnalytics> {
    const now = new Date();
    let cutoffTime = new Date();

    // Calculate cutoff based on timeframe
    switch (options.timeframe) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    let filteredUsage = ApiUsageService.widgetUsageLog.filter(entry => 
      entry.apiKey === apiKey && entry.timestamp >= cutoffTime
    );

    // Filter by tier if specified
    if (options.tier !== 'all') {
      filteredUsage = filteredUsage.filter(entry => entry.tier === options.tier);
    }

    // Calculate analytics
    const actionBreakdown: Record<string, number> = {};
    const tierDistribution: Record<string, number> = {};
    let totalScore = 0;
    let errorCount = 0;
    let refreshCount = 0;
    let loadCount = 0;

    filteredUsage.forEach(entry => {
      // Action breakdown
      actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1;
      
      // Tier distribution
      if (entry.tier) {
        tierDistribution[entry.tier] = (tierDistribution[entry.tier] || 0) + 1;
      }
      
      // Score calculations
      if (entry.score !== undefined) {
        totalScore += entry.score;
      }
      
      // Specific action counts
      if (entry.action === 'error') {
        errorCount++;
      } else if (entry.action === 'refresh') {
        refreshCount++;
      } else if (entry.action === 'load') {
        loadCount++;
      }
    });

    const scoreCount = filteredUsage.filter(entry => entry.score !== undefined).length;
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
    const errorRate = filteredUsage.length > 0 ? errorCount / filteredUsage.length : 0;
    const refreshRate = loadCount > 0 ? refreshCount / loadCount : 0;

    // Mock monetization metrics for Phase 2
    const enterpriseCount = tierDistribution.enterprise || 0;
    const proCount = tierDistribution.pro || 0;
    const basicCount = tierDistribution.basic || 0;

    return {
      totalUsage: filteredUsage.length,
      actionBreakdown,
      tierDistribution,
      averageScore,
      errorRate,
      refreshRate,
      uptimePercentage: 95 + Math.random() * 5, // Mock uptime
      totalCreditsUsed: refreshCount, // 1 credit per refresh
      widgetUptime: filteredUsage.length * 60 * 1000, // Mock uptime in ms
      activeIntegrations: loadCount,
      revenuePerWidget: 29 + (enterpriseCount * 70), // Mock revenue calculation
      currentMRR: (basicCount * 29) + (proCount * 99) + (enterpriseCount * 499),
      licenseRevenue: (proCount * 99) + (enterpriseCount * 499),
      enterpriseCount,
      proCount,
      basicCount
    };
  }

  static async getTotalWidgetLoads(): Promise<number> {
    return ApiUsageService.widgetUsageLog.filter(entry => entry.action === 'load').length;
  }

  static async getActiveWidgetCount(): Promise<number> {
    // Mock: count loads in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return ApiUsageService.widgetUsageLog.filter(entry => 
      entry.action === 'load' && entry.timestamp >= oneHourAgo
    ).length;
  }

  static async getWidgetErrorRate(): Promise<number> {
    const totalUsage = ApiUsageService.widgetUsageLog.length;
    const errorCount = ApiUsageService.widgetUsageLog.filter(entry => entry.action === 'error').length;
    return totalUsage > 0 ? errorCount / totalUsage : 0;
  }

  private static getMostUsedEndpoint(usage: UsageEntry[]): string {
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

  private static getRequestsByEndpoint(usage: UsageEntry[]): Record<string, number> {
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

  private static getHourlyUsage(usage: UsageEntry[]): Record<string, number> {
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

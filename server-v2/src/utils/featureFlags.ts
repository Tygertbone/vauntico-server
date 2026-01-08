import crypto from 'crypto';
import { redis, RedisCache } from '../queue/upstash';
import { logger } from './logger';

// Feature flag types and interfaces
export enum FeatureFlagType {
  BOOLEAN = 'boolean',           // Simple on/off flag
  PERCENTAGE = 'percentage',      // Percentage rollout (0-100%)
  USER_TARGETING = 'user',        // Specific user targeting
  ENVIRONMENT = 'environment'     // Environment-based
}

export interface FeatureFlag {
  key: string;
  type: FeatureFlagType;
  enabled: boolean;
  description?: string;
  percentage?: number;            // For percentage rollouts (0-100)
  userIds?: string[];             // For user targeting
  environments?: string[];        // For environment targeting
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface FeatureFlagCheck {
  key: string;
  enabled?: boolean;
  userId?: string;
  userEmail?: string;
  context?: Record<string, any>;
}

// Feature Flag Manager singleton
export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private cache = new RedisCache('feature-flags');
  private cacheTTL = 300; // 5 minutes cache

  private constructor() {}

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  // Generate consistent hash for user-based percentage rollouts
  private generateUserHash(userId: string, featureKey: string): number {
    const hash = crypto.createHash('sha256')
      .update(`${userId}:${featureKey}`)
      .digest('hex');

    // Convert first 8 chars of hash to number between 0-100
    const hashInt = parseInt(hash.substring(0, 8), 16);
    return (hashInt % 100) + 1; // 1-100 range
  }

  // Check if a feature flag is enabled for a given context
  async isEnabled(key: string, context: FeatureFlagCheck = { key }): Promise<boolean> {
    try {
      // Try cache first
      const cacheKey = `flag:${key}`;
      const cachedResult = await this.cache.get<boolean>(cacheKey);

      if (cachedResult !== null) {
        return cachedResult;
      }

      // Get flag definition from Redis/database
      const flag = await this.getFeatureFlag(key);

      if (!flag || !flag.enabled) {
        await this.cache.set(cacheKey, false, { ttl: this.cacheTTL });
        return false;
      }

      let enabled = false;

      switch (flag.type) {
        case FeatureFlagType.BOOLEAN:
          enabled = flag.enabled;
          break;

        case FeatureFlagType.PERCENTAGE:
          if (flag.percentage && flag.percentage > 0) {
            if (context.userId) {
              const userPercentage = this.generateUserHash(context.userId, key);
              enabled = userPercentage <= flag.percentage;
            } else {
              // Random percentage for anonymous users (not ideal but simple)
              enabled = Math.random() * 100 <= flag.percentage;
            }
          }
          break;

        case FeatureFlagType.USER_TARGETING:
          if (flag.userIds && context.userId) {
            enabled = flag.userIds.includes(context.userId);
          } else if (flag.userIds && context.userEmail) {
            enabled = flag.userIds.includes(context.userEmail);
          }
          break;

        case FeatureFlagType.ENVIRONMENT:
          const currentEnv = process.env.NODE_ENV || 'development';
          enabled = flag.environments?.includes(currentEnv) || false;
          break;

        default:
          enabled = false;
      }

      // Cache result for performance
      await this.cache.set(cacheKey, enabled, { ttl: this.cacheTTL });

      return enabled;
    } catch (error) {
      logger.error('Feature flag check failed', {
        flagKey: key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Default to false on error (fail-safe)
      return false;
    }
  }

  // Get feature flag definition
  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    try {
      const flagKey = `feature-flag:${key}`;
      const flagData = await redis.get(flagKey);

      if (!flagData) {
        return null;
      }

      return JSON.parse(flagData as string) as FeatureFlag;
    } catch (error) {
      logger.error('Failed to get feature flag', {
        flagKey: key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  // Set/update feature flag
  async setFeatureFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const fullFlag: FeatureFlag = {
        ...flag,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const flagKey = `feature-flag:${flag.key}`;
      await redis.set(flagKey, JSON.stringify(fullFlag));

      // Clear cached results for this flag
      await this.cache.del(`flag:${flag.key}`);

      logger.info('Feature flag updated', {
        flagKey: flag.key,
        type: flag.type,
        enabled: flag.enabled,
        percentage: flag.percentage,
      });

      return true;
    } catch (error) {
      logger.error('Failed to set feature flag', {
        flagKey: flag.key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Delete feature flag
  async deleteFeatureFlag(key: string): Promise<boolean> {
    try {
      const flagKey = `feature-flag:${key}`;
      const cacheKey = `flag:${key}`;

      await redis.del(flagKey);
      await this.cache.del(cacheKey);

      logger.info('Feature flag deleted', { flagKey: key });
      return true;
    } catch (error) {
      logger.error('Failed to delete feature flag', {
        flagKey: key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // List all feature flags
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const keys = await redis.keys('feature-flag:*');
      const flags: FeatureFlag[] = [];

      for (const key of keys) {
        const flagData = await redis.get(key);
        if (flagData) {
          flags.push(JSON.parse(flagData as string) as FeatureFlag);
        }
      }

      // Sort by creation date (newest first)
      return flags.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      logger.error('Failed to list feature flags', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  // Emergency kill switch - disable all feature flags
  async emergencyDisableAll(): Promise<void> {
    try {
      logger.warn('Emergency: Disabling all feature flags');

      const keys = await redis.keys('feature-flag:*');

      for (const key of keys) {
        const flagData = await redis.get(key);
        if (flagData) {
          const flag = JSON.parse(flagData as string) as FeatureFlag;

          // Disable flag but keep configuration
          flag.enabled = false;
          flag.updatedAt = new Date();

          await redis.set(key, JSON.stringify(flag));
          await this.cache.del(`flag:${flag.key}`);
        }
      }

      logger.warn('Emergency disable completed');
    } catch (error) {
      logger.error('Emergency disable failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get feature rollouts analytics (implementation notes)
  async getAnalytics(): Promise<{
    totalFlags: number;
    enabledFlags: number;
    flagsByType: Record<FeatureFlagType, number>;
    recentActivity: any[];
  }> {
    try {
      const flags = await this.listFeatureFlags();

      const enabledFlags = flags.filter(f => f.enabled).length;
      const flagsByType = flags.reduce((acc, flag) => {
        acc[flag.type] = (acc[flag.type] || 0) + 1;
        return acc;
      }, {} as Record<FeatureFlagType, number>);

      return {
        totalFlags: flags.length,
        enabledFlags,
        flagsByType,
        recentActivity: flags.slice(0, 10), // Last 10 updated
      };
    } catch (error) {
      logger.error('Failed to get feature flag analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        totalFlags: 0,
        enabledFlags: 0,
        flagsByType: {} as Record<FeatureFlagType, number>,
        recentActivity: [],
      };
    }
  }
}

// Express middleware for feature flag checks
export const featureFlagMiddleware = (flagKey: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const manager = FeatureFlagManager.getInstance();
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      const context: FeatureFlagCheck = {
        key: flagKey,
        userId,
        userEmail,
        context: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          path: req.path,
        },
      };

      req.featureEnabled = await manager.isEnabled(flagKey, context);

      // Add feature flag info to response headers for debugging
      if (req.featureEnabled) {
        res.set('X-Feature-Enabled', flagKey);
      }

      next();
    } catch (error) {
      logger.error('Feature flag middleware error', {
        flagKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fail safe - continue without feature flags
      req.featureEnabled = false;
      next();
    }
  };
};

// Emergency feature flags for critical system controls
export const EMERGENCY_FLAGS = {
  // Kill switches for major features
  TRUST_SCORE_CALCULATION: 'trust_score_calculation',
  SOCIAL_SHARING: 'social_sharing',
  AI_FEATURES: 'ai_features',
  EMAIL_NOTIFICATIONS: 'email_notifications',

  // Rollout controls
  NEW_UI_COMPONENTS: 'new_ui_components',
  ADVANCED_ANALYTICS: 'advanced_analytics',

  // Experimental features
  BETA_API_ENDPOINTS: 'beta_api_endpoints',
  DEBUG_MODE: 'debug_mode',
} as const;

// Helper function for checking emergency flags
export const isFeatureEnabled = async (
  flagKey: string,
  context?: FeatureFlagCheck
): Promise<boolean> => {
  const manager = FeatureFlagManager.getInstance();
  return manager.isEnabled(flagKey, context);
};

// Export singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();

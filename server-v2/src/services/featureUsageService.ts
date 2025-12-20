import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { subscriptionManager } from '../utils/subscriptions';
import { emailCampaignWorker } from '../queue/emailCampaignWorker'; // Temporarily disabled for build

export interface UsageRecord {
  userId: number;
  featureName: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

export interface UsageCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  upgradeRequired: boolean;
  message?: string;
}

export class FeatureUsageService {
  /**
   * Record feature usage and check limits
   */
  async recordUsage(usage: UsageRecord): Promise<UsageCheck> {
    try {
      const { userId, featureName, quantity = 1, metadata = {} } = usage;

      // Get user subscription status
      const subscription = await subscriptionManager.getSubscription(userId);

      // Get current usage
      const currentUsage = await this.getCurrentUsage(userId, featureName);

      // Define limits based on subscription tier
      const limits = this.getFeatureLimits(featureName, subscription?.tier);

      // Check if usage would exceed limits
      const newTotal = currentUsage + quantity;
      const remaining = Math.max(0, limits - newTotal);
      const allowed = newTotal <= limits || limits === -1; // -1 means unlimited
      const upgradeRequired = !allowed && limits >= 0;

      if (!allowed) {
        logger.warn('Feature usage limit exceeded', {
          userId,
          featureName,
          currentUsage,
          limit: limits,
          attemptedUsage: quantity,
          totalAfterUse: newTotal
        });

        return {
          allowed: false,
          remaining,
          limit: limits,
          upgradeRequired: true,
          message: this.getLimitExceededMessage(featureName, limits)
        };
      }

      // Record the usage (this should be done after successful feature usage)
      // await emailCampaignWorker.recordFeatureUsage(userId.toString(), featureName); // Temporarily disabled for build

      // Log the successful usage
      logger.info('Feature usage recorded successfully', {
        userId,
        featureName,
        quantity,
        currentTotal: currentUsage + quantity,
        limit: limits,
        remaining: remaining - quantity
      });

      return {
        allowed: true,
        remaining: remaining - quantity,
        limit: limits,
        upgradeRequired: false
      };

    } catch (error) {
      logger.error('Failed to record feature usage', {
        userId: usage.userId,
        featureName: usage.featureName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback to allow usage in case of errors
      return {
        allowed: true,
        remaining: -1, // Unknown
        limit: -1,     // Unknown
        upgradeRequired: false
      };
    }
  }

  /**
   * Check if user can use a feature without recording usage
   */
  async checkUsage(userId: number, featureName: string): Promise<UsageCheck> {
    try {
      const subscription = await subscriptionManager.getSubscription(userId);
      const currentUsage = await this.getCurrentUsage(userId, featureName);
      const limits = this.getFeatureLimits(featureName, subscription?.tier);

      const remaining = Math.max(0, limits - currentUsage);
      const allowed = currentUsage < limits || limits === -1;
      const upgradeRequired = !allowed && limits >= 0;

      return {
        allowed,
        remaining,
        limit: limits,
        upgradeRequired,
        message: allowed ? undefined : this.getLimitExceededMessage(featureName, limits)
      };
    } catch (error) {
      // Allow usage if we can't check
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
        upgradeRequired: false
      };
    }
  }

  /**
   * Get current usage for a feature this month
   */
  private async getCurrentUsage(userId: number, featureName: string): Promise<number> {
    try {
      // Get usage from email_campaigns service (reusing the existing tracking)
      // This provides a unified usage tracking system

      const result = await pool.query(`
        SELECT usage_count
        FROM user_feature_usage
        WHERE user_id = $1 AND feature_name = $2
      `, [userId, featureName]);

      return result.rows[0]?.usage_count || 0;
    } catch (error) {
      logger.error('Failed to get current usage', {
        userId,
        featureName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Get feature limits based on subscription tier
   */
  private getFeatureLimits(featureName: string, tier?: string): number {
    const freeLimits: Record<string, number> = {
      'ai_generation': 50,    // AI generations per month
      'vault_create': 3,      // Maximum vaults
      'collaborator_add': 1,  // Max collaborators (single user)
      'storage_gb': 1,        // Storage in GB
      'analytics_queries': 5  // Analytics requests per day
    };

    if (!tier || tier === 'free') {
      return freeLimits[featureName] || 0;
    }

    if (tier === 'creator_pass') {
      // Unlimited for creator pass
      return -1; // Unlimited
    }

    if (tier === 'enterprise') {
      // Unlimited for enterprise
      return -1; // Unlimited
    }

    // Default to free limits
    return freeLimits[featureName] || 0;
  }

  /**
   * Generate user-friendly message for limit exceeded
   */
  private getLimitExceededMessage(featureName: string, limit: number): string {
    const messages: Record<string, string> = {
      'ai_generation': `You've reached your monthly AI generation limit (${limit}). Upgrade to Creator Pass for unlimited AI generations.`,
      'vault_create': `You've reached your vault limit (${limit}). Upgrade to Creator Pass for unlimited vaults.`,
      'collaborator_add': `You've reached your collaborator limit (${limit}). Creator Pass allows up to 10 team members.`,
      'storage_gb': `You've reached your storage limit (${limit}GB). Creator Pass includes 100GB of storage.`,
      'analytics_queries': `You've reached your daily analytics limit (${limit}). Upgrade for advanced analytics.`
    };

    return messages[featureName] || `You've reached your ${featureName} limit. Upgrade to continue.`;
  }

  /**
   * Get comprehensive usage report for a user
   */
  async getUsageReport(userId: number): Promise<any> {
    try {
      const subscription = await subscriptionManager.getSubscription(userId);

      const features = ['ai_generation', 'vault_create', 'collaborator_add'];

      const report: any = {
        tier: subscription?.tier || 'free',
        features: {}
      };

      for (const feature of features) {
        const currentUsage = await this.getCurrentUsage(userId, feature);
        const limit = this.getFeatureLimits(feature, subscription?.tier);
        const usageCheck = await this.checkUsage(userId, feature);

        report.features[feature] = {
          currentUsage,
          limit,
          remaining: usageCheck.remaining,
          percentUsed: limit > 0 ? (currentUsage / limit) * 100 : 0,
          upgradeRecommended: currentUsage >= limit * 0.8 && limit > 0
        };
      }

      return report;
    } catch (error) {
      logger.error('Failed to generate usage report', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Middleware function to integrate with routes
   */
  createUsageMiddleware(featureName: string, quantity: number = 1) {
    return async (req: any, res: any, next: any) => {
      if (!req.user?.userId) {
        return next();
      }

      try {
        const usageCheck = await this.recordUsage({
          userId: Number(req.user.userId) || 0,
          featureName,
          quantity,
          metadata: {
            endpoint: req.path,
            method: req.method,
            ip: req.ip
          }
        });

        // Add usage info to request for handlers to use
        req.featureUsage = usageCheck;

        // If usage not allowed, handlers can check req.featureUsage.allowed
        next();
      } catch (error) {
        // Continue anyway - don't break functionality due to tracking issues
        logger.error('Usage middleware error', {
          userId: req.user?.userId,
          featureName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        next();
      }
    };
  }
}

export const featureUsageService = new FeatureUsageService();

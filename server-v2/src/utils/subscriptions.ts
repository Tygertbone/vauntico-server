import { pool } from '../db/pool';
import { logger } from './logger';
import { featureFlagManager, EMERGENCY_FLAGS } from './featureFlags';
import { redis, RedisCache } from '../queue/upstash';

export enum SubscriptionTier {
  FREE = 'free',
  CREATOR_PASS = 'creator_pass',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete'
}

export enum PaymentProvider {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe'
}

export interface FeatureUsage {
  id: number;
  user_id: string;
  feature_key: string;
  usage_count: number;
  usage_limit: number;
  period_start: Date;
  period_end: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  paymentProvider: PaymentProvider;
  // Paystack-specific fields
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  // Stripe-specific fields (kept for future migration)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  vaultsLimit: number;
  aiGenerationsLimit: number;
  storageLimitGb: number;
  teamMembersLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionManager {
  private cache = new RedisCache('subscriptions');
  private cacheTTL = 600; // 10 minutes cache

  // Check if user has premium subscription
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      // Try cache first
      const cacheKey = `premium:${userId}`;
      const cached = await this.cache.get<boolean>(cacheKey);

      if (cached !== null) {
        return cached;
      }

      // Check emergency kill switch first
      const emergencyKill = await featureFlagManager.isEnabled(
        EMERGENCY_FLAGS.AI_FEATURES,
        { key: EMERGENCY_FLAGS.AI_FEATURES, userId }
      );

      if (!emergencyKill) {
        // Check database
        const result = await pool.query(
          'SELECT user_has_premium_access($1) as has_access',
          [userId]
        );

        const hasAccess = result.rows[0]?.has_access || false;

        // Cache result
        await this.cache.set(cacheKey, hasAccess, { ttl: this.cacheTTL });

        return hasAccess;
      }

      // Emergency mode - cached result only
      return false;
    } catch (error) {
      logger.error('Error checking premium access', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fail-safe: return false on error
      return false;
    }
  }

  // Check if user can access specific premium feature
  async canAccessFeature(userId: string, featureKey: string): Promise<boolean> {
    try {
      // Emergency kill switch check
      const emergencyKill = await featureFlagManager.isEnabled(featureKey, {
        key: featureKey,
        userId
      });
      if (!emergencyKill) return false;

      // Check if user has premium access
      const hasPremium = await this.hasPremiumAccess(userId);
      if (hasPremium) return true;

      // For free users, check feature usage limits
      const usage = await this.getFeatureUsage(userId, featureKey);

      // If no usage data or no limit set, allow access
      if (!usage || !usage.usage_limit) return true;

      // Check usage against limits
      return usage.usage_count < usage.usage_limit;
    } catch (error) {
      logger.error('Error checking feature access', {
        userId,
        featureKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fail-safe: deny access on error
      return false;
    }
  }

  // Increment feature usage counter
  async incrementFeatureUsage(
    userId: string,
    featureKey: string,
    increment: number = 1
  ): Promise<void> {
    try {
      await pool.query(
        'SELECT increment_feature_usage($1, $2, $3)',
        [userId, featureKey, increment]
      );

      // Clear cache
      await this.cache.del(`usage:${userId}:${featureKey}`);
    } catch (error) {
      logger.error('Error incrementing feature usage', {
        userId,
        featureKey,
        increment,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get feature usage for a user
  async getFeatureUsage(userId: string, featureKey: string): Promise<FeatureUsage | null> {
    try {
      const cacheKey = `usage:${userId}:${featureKey}`;
      const cached = await this.cache.get<FeatureUsage>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await pool.query(
        'SELECT * FROM feature_usage WHERE user_id = $1 AND feature_key = $2',
        [userId, featureKey]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const usage = result.rows[0];

      // Cache result
      await this.cache.set(cacheKey, usage, { ttl: this.cacheTTL });

      return usage;
    } catch (error) {
      logger.error('Error getting feature usage', {
        userId,
        featureKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Get user's subscription details
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const cacheKey = `sub:${userId}`;
      const cached = await this.cache.get<Subscription>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const sub = result.rows[0];

      // Cache result
      await this.cache.set(cacheKey, sub, { ttl: this.cacheTTL });

      return sub;
    } catch (error) {
      logger.error('Error getting subscription', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Update subscription (for Stripe webhooks)
  async updateSubscription(
    userId: string,
    updateData: Partial<Subscription>
  ): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      });

      if (fields.length === 0) return false;

      values.push(userId);

      const query = `
        UPDATE subscriptions
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE user_id = $${paramIndex}
      `;

      await pool.query(query, values);

      // Clear caches
      await this.cache.del(`sub:${userId}`);
      await this.cache.del(`premium:${userId}`);

      logger.info('Subscription updated', { userId, fields: fields.length });
      return true;
    } catch (error) {
      logger.error('Error updating subscription', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Get subscription analytics (for admin dashboard)
  async getAnalytics(): Promise<{
    freeUsers: number;
    premiumUsers: number;
    trialUsers: number;
    revenue: { monthly: number; annual: number };
    churnRate: number;
    conversionRate: number;
  }> {
    try {
      // This would be implemented with more complex queries
      // For now, return placeholder data
      return {
        freeUsers: 0,
        premiumUsers: 0,
        trialUsers: 0,
        revenue: { monthly: 0, annual: 0 },
        churnRate: 0,
        conversionRate: 0
      };
    } catch (error) {
      logger.error('Error getting subscription analytics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        freeUsers: 0,
        premiumUsers: 0,
        trialUsers: 0,
        revenue: { monthly: 0, annual: 0 },
        churnRate: 0,
        conversionRate: 0
      };
    }
  }

  // Start trial for user (for Stripe integration)
  async startTrial(userId: string, trialDays: number = 14): Promise<boolean> {
    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + trialDays);

      const updateData = {
        tier: SubscriptionTier.CREATOR_PASS,
        status: SubscriptionStatus.ACTIVE,
        trialStart: new Date(),
        trialEnd: trialEnd
      };

      return await this.updateSubscription(userId, updateData);
    } catch (error) {
      logger.error('Error starting trial', {
        userId,
        trialDays,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();

// Premium feature flag constants with revenue focus
export const PREMIUM_FEATURES = {
  // Core premium features
  UNLIMITED_VAULTS: 'unlimited_vaults',
  UNLIMITED_AI_GENERATIONS: 'unlimited_ai_generations',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_BRANDING: 'custom_branding',
  PRIORITY_SUPPORT: 'priority_support',

  // Revenue-generating features
  EXPORT_DATA: 'export_data',
  TEAM_COLLABORATION: 'team_collaboration',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',

  // Growth features
  ADVANCED_SHARING: 'advanced_sharing',
  SOCIAL_PROOF: 'social_proof',
  INTEGRATION_WEBHOOKS: 'integration_webhooks'
} as const;

// Tier limits (matching pricing page)
export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    vaults: 3,
    aiGenerations: 50,
    storageGb: 1,
    teamMembers: 1
  },
  [SubscriptionTier.CREATOR_PASS]: {
    vaults: -1, // unlimited
    aiGenerations: -1, // unlimited
    storageGb: 100,
    teamMembers: 10
  },
  [SubscriptionTier.ENTERPRISE]: {
    vaults: -1, // unlimited
    aiGenerations: -1, // unlimited
    storageGb: -1, // unlimited
    teamMembers: -1 // unlimited
  }
};

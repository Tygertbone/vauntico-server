import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { subscriptionManager } from '../utils/subscriptions';
import { emailCampaignWorker } from '../queue/emailCampaignWorker';

export interface ConversionEvent {
  userId: string;
  eventType: string;
  eventSource?: string;
  metadata?: any;
  sessionId?: string;
  funnelStage?: string;
}

export interface ABVariant {
  name: string;
  weight: number;
  config?: any;
}

export interface ABExperiment {
  id: number;
  experimentKey: string;
  experimentName: string;
  targetMetric: string;
  variants: ABVariant[];
  status: string;
}

export interface ConversionTrigger {
  id: number;
  triggerKey: string;
  triggerName: string;
  conditions: any;
  actions: any;
  priority: number;
}

export interface UserConversionScore {
  overallConversionScore: number;
  trialLikelihood: number;
  upgradeIntent: number;
  churnRisk: number;
  priceSensitivity: string;
  preferredFeatures: string[];
}

export class ConversionAnalyticsService {
  private static instance: ConversionAnalyticsService;

  private constructor() {}

  static getInstance(): ConversionAnalyticsService {
    if (!ConversionAnalyticsService.instance) {
      ConversionAnalyticsService.instance = new ConversionAnalyticsService();
    }
    return ConversionAnalyticsService.instance;
  }

  /**
   * Track conversion event in the user journey
   */
  async trackConversionEvent(event: ConversionEvent): Promise<void> {
    try {
      const conversionProbability = await this.calculateConversionProbability(event.userId);

      await pool.query(`
        INSERT INTO conversion_events (
          user_id, event_type, event_source, metadata, session_id, funnel_stage, conversion_probability
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        event.userId,
        event.eventType,
        event.eventSource,
        JSON.stringify(event.metadata || {}),
        event.sessionId,
        event.funnelStage || this.inferFunnelStage(event.eventType),
        conversionProbability
      ]);

      // Update conversion score after significant events
      if (['upgrade_clicked', 'payment_completed', 'trial_started'].includes(event.eventType)) {
        await this.updateUserConversionScore(event.userId);
      }

      // Trigger behavioral campaigns if applicable
      await this.checkAndExecuteTriggers(event.userId, event.eventType, event.metadata);

    } catch (error) {
      logger.error('Failed to track conversion event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: event.userId,
        eventType: event.eventType
      });
    }
  }

  /**
   * Assign user to A/B test experiment
   */
  async assignUserToExperiment(userId: string, experimentKey: string): Promise<string | null> {
    try {
      // Get active experiment
      const experimentResult = await pool.query(`
        SELECT id, variants FROM ab_experiments
        WHERE experiment_key = $1 AND status = 'active'
      `, [experimentKey]);

      if (experimentResult.rows.length === 0) {
        return null;
      }

      const experiment = experimentResult.rows[0];
      const variants: ABVariant[] = JSON.parse(experiment.variants);

      // Check if user is already assigned
      const assignmentResult = await pool.query(`
        SELECT variant_name FROM experiment_assignments
        WHERE experiment_id = $1 AND user_id = $2
      `, [experiment.id, userId]);

      if (assignmentResult.rows.length > 0) {
        return assignmentResult.rows[0].variant_name;
      }

      // Assign to variant based on weighted random selection
      const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
      let randomWeight = Math.random() * totalWeight;

      for (const variant of variants) {
        randomWeight -= variant.weight;
        if (randomWeight <= 0) {
          await pool.query(`
            INSERT INTO experiment_assignments (experiment_id, user_id, variant_name)
            VALUES ($1, $2, $3)
          `, [experiment.id, userId, variant.name]);

          return variant.name;
        }
      }

      return variants[0].name; // Fallback to first variant

    } catch (error) {
      logger.error('Failed to assign user to experiment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        experimentKey
      });
      return null;
    }
  }

  /**
   * Get personalized upgrade prompt configuration for user
   */
  async getPersonalizedUpgradePrompt(userId: string): Promise<{
    variant: string;
    urgency: string;
    discount: number;
    features: string[];
    cta: string;
  }> {
    try {
      // Get user's conversion score
      const score = await this.getUserConversionScore(userId);

      // Assign to A/B experiments
      const positioningVariant = await this.assignUserToExperiment(userId, 'upgrade_prompt_positioning');
      const pricingVariant = await this.assignUserToExperiment(userId, 'pricing_display');

      // Calculate personalization based on user profile
      let variant = 'standard';
      let urgency = 'medium';
      let discount = 0;

      if (score?.upgradeIntent && score.upgradeIntent > 0.7) {
        variant = 'personalized_high_intent';
        urgency = 'high';
        discount = 0.15; // 15% discount
      } else if (score?.priceSensitivity === 'high') {
        variant = 'value_focused';
        discount = 0.25; // 25% discount for price-sensitive users
      } else if (score?.preferredFeatures && score.preferredFeatures.length > 0) {
        variant = 'feature_focused';
      }

      // Get user's preferred features from usage data
      const preferredFeatures = await this.getUserPreferredFeatures(userId);

      return {
        variant: positioningVariant || variant,
        urgency,
        discount,
        features: preferredFeatures.length > 0 ? preferredFeatures.slice(0, 3) : ['unlimited_ai', 'advanced_analytics', 'team_collaboration'],
        cta: this.generatePersonalizedCTA(score, urgency === 'high')
      };

    } catch (error) {
      logger.error('Failed to get personalized upgrade prompt', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      // Fallback to basic prompt
      return {
        variant: 'standard',
        urgency: 'medium',
        discount: 0,
        features: ['unlimited_ai', 'advanced_analytics', 'team_collaboration'],
        cta: 'Upgrade Now'
      };
    }
  }

  /**
   * Calculate conversion probability based on user behavior
   */
  private async calculateConversionProbability(userId: string): Promise<number> {
    try {
      // Get recent conversion events
      const eventResult = await pool.query(`
        SELECT event_type, created_at FROM conversion_events
        WHERE user_id = $1
        ORDER BY created_at DESC LIMIT 20
      `, [userId]);

      const events = eventResult.rows;
      let probability = 0.1; // Base probability

      // Calculate probability based on event patterns
      const positiveEvents = events.filter(e =>
        ['upgrade_clicked', 'payment_completed', 'trial_started'].includes(e.event_type)
      ).length;

      const totalEvents = events.length;
      if (totalEvents > 0) {
        probability = Math.min(positiveEvents / totalEvents * 0.3 + probability, 0.9);
      }

      // Adjust based on recency (recent activity increases likelihood)
      const daysSinceLastActivity = events.length > 0
        ? (Date.now() - new Date(events[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
        : 30;

      if (daysSinceLastActivity < 7) {
        probability *= 1.5;
      } else if (daysSinceLastActivity > 30) {
        probability *= 0.5;
      }

      return Math.max(0, Math.min(probability, 1));

    } catch (error) {
      logger.error('Failed to calculate conversion probability', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return 0.1; // Default conservative estimate
    }
  }

  /**
   * Update user's conversion score based on behavior
   */
  private async updateUserConversionScore(userId: string): Promise<void> {
    try {
      const score = await this.calculateUserConversionScore(userId);

      await pool.query(`
        INSERT INTO user_conversion_scores (
          user_id, overall_conversion_score, trial_likelihood, upgrade_intent, churn_risk,
          price_sensitivity, preferred_features, engagement_patterns, segment_tags,
          last_calculated_at, calculated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          overall_conversion_score = EXCLUDED.overall_conversion_score,
          trial_likelihood = EXCLUDED.trial_likelihood,
          upgrade_intent = EXCLUDED.upgrade_intent,
          churn_risk = EXCLUDED.churn_risk,
          price_sensitivity = EXCLUDED.price_sensitivity,
          preferred_features = EXCLUDED.preferred_features,
          engagement_patterns = EXCLUDED.engagement_patterns,
          segment_tags = EXCLUDED.segment_tags,
          calculated_at = NOW()
      `, [
        userId,
        score.overallConversionScore,
        score.trialLikelihood,
        score.upgradeIntent,
        score.churnRisk,
        score.priceSensitivity,
        score.preferredFeatures,
        JSON.stringify(await this.getEngagementPatterns(userId)),
        this.generateSegmentTags(score)
      ]);

    } catch (error) {
      logger.error('Failed to update user conversion score', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Calculate comprehensive user conversion score
   */
  private async calculateUserConversionScore(userId: string): Promise<UserConversionScore> {
    try {
      // Get subscription status
      const subscription = await subscriptionManager.getSubscription(userId);
      const isFreeUser = !subscription;

      // Get recent events (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const eventsResult = await pool.query(`
        SELECT event_type, created_at FROM conversion_events
        WHERE user_id = $1 AND created_at > $2
      `, [userId, thirtyDaysAgo]);

      const events = eventsResult.rows;

      // Calculate signal strengths
      const trialLikelihood = this.calculateTrialLikelihood(events, isFreeUser);
      const upgradeIntent = this.calculateUpgradeIntent(events, isFreeUser);
      const churnRisk = this.calculateChurnRisk(events, subscription);
      const preferredFeatures = await this.getUserPreferredFeatures(userId);
      const priceSensitivity = this.calculatePriceSensitivity(events);

      const overallScore = (
        trialLikelihood * 0.2 +
        upgradeIntent * 0.4 +
        (1 - churnRisk) * 0.3 +
        (priceSensitivity === 'low' ? 0.3 : priceSensitivity === 'medium' ? 0.2 : 0.1) * 0.1
      );

      return {
        overallConversionScore: Math.max(0, Math.min(overallScore, 1)),
        trialLikelihood,
        upgradeIntent,
        churnRisk,
        priceSensitivity,
        preferredFeatures: preferredFeatures.slice(0, 5)
      };

    } catch (error) {
      logger.error('Failed to calculate user conversion score', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      return {
        overallConversionScore: 0.1,
        trialLikelihood: 0.1,
        upgradeIntent: 0.1,
        churnRisk: 0.8,
        priceSensitivity: 'medium',
        preferredFeatures: ['unlimited_ai']
      };
    }
  }

  /**
   * Check and execute conversion triggers
   */
  private async checkAndExecuteTriggers(userId: string, eventType: string, metadata?: any): Promise<void> {
    try {
      // Get active triggers
      const triggersResult = await pool.query(`
        SELECT id, trigger_key, conditions, actions, trigger_type
        FROM conversion_triggers
        WHERE is_active = true
        ORDER BY priority DESC
      `);

      for (const trigger of triggersResult.rows) {
        if (await this.shouldExecuteTrigger(userId, trigger, eventType, metadata)) {
          await this.executeTrigger(userId, trigger);
        }
      }

    } catch (error) {
      logger.error('Failed to check conversion triggers', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Determine if trigger conditions are met
   */
  private async shouldExecuteTrigger(userId: string, trigger: any, eventType: string, metadata?: any): Promise<boolean> {
    const conditions = trigger.conditions;

    // Check event-based conditions
    if (eventType === 'usage_limit_reached' && trigger.trigger_key === 'usage_limit_ai_generation') {
      return metadata?.feature === conditions.feature && metadata?.usagePercent >= conditions.threshold;
    }

    if (eventType === 'trial_expiring' && trigger.trigger_key === 'trial_expiry_warning') {
      return metadata?.daysRemaining <= conditions.days_remaining;
    }

    // Add more trigger condition checks as needed
    return false;
  }

  /**
   * Execute trigger actions
   */
  private async executeTrigger(userId: string, trigger: any): Promise<void> {
    try {
      const actions = trigger.actions;

      if (actions.type === 'upgrade_prompt') {
        // Trigger personalized upgrade prompt
        await this.sendPersonalizedUpgradePrompt(userId, actions);
      } else if (actions.type === 'email_campaign') {
        // Send targeted email campaign
        await emailCampaignWorker.queueCampaignEmail(parseInt(userId), actions.template, actions);
      } else if (actions.type === 'personalized_offer') {
        // Send personalized offer
        await this.sendPersonalizedOffer(userId, actions);
      }

    } catch (error) {
      logger.error('Failed to execute conversion trigger', {
        error: error instanceof Error ? error.message : 'Unknown error',
        triggerKey: trigger.trigger_key,
        userId
      });
    }
  }

  // Helper methods

  private inferFunnelStage(eventType: string): string {
    const stageMap: { [key: string]: string } = {
      'trial_started': 'interest',
      'feature_used': 'decision',
      'upgrade_prompt_shown': 'decision',
      'upgrade_clicked': 'action',
      'payment_completed': 'action',
      'trial_expired': 'retention'
    };
    return stageMap[eventType] || 'awareness';
  }

  private async getUserPreferredFeatures(userId: string): Promise<string[]> {
    try {
      // This would be implemented based on usage pattern analysis
      // For now, return common premium features
      return ['unlimited_ai', 'advanced_analytics', 'team_collaboration', 'custom_branding'];
    } catch (error) {
      return ['unlimited_ai', 'advanced_analytics'];
    }
  }

  private async getEngagementPatterns(userId: string): Promise<any> {
    return {
      recency: 'high',
      frequency: 'medium',
      monetary: 'low',
      lastActivity: new Date().toISOString()
    };
  }

  private calculateTrialLikelihood(events: any[], isFreeUser: boolean): number {
    if (!isFreeUser) return 1.0;
    const trialEvents = events.filter(e => e.event_type === 'trial_started').length;
    return Math.min(trialEvents * 0.3, 1.0);
  }

  private calculateUpgradeIntent(events: any[], isFreeUser: boolean): number {
    if (!isFreeUser) return 1.0;
    const upgradeEvents = events.filter(e => ['upgrade_clicked', 'upgrade_prompt_shown'].includes(e.event_type)).length;
    return Math.min(upgradeEvents * 0.25 + (events.length > 10 ? 0.2 : 0), 1.0);
  }

  private calculateChurnRisk(events: any[], subscription: any): number {
    if (!subscription) return 0.9; // Free users at high risk

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.created_at) > thirtyDaysAgo);

    if (recentEvents.length === 0) return 0.8;
    return Math.max(0, 1 - (recentEvents.length / 20));
  }

  private calculatePriceSensitivity(events: any[]): string {
    const upgradeEvents = events.filter(e => e.event_type === 'upgrade_clicked').length;
    const totalEvents = events.length;

    if (upgradeEvents / Math.max(totalEvents, 1) > 0.3) return 'low'; // Responsive to offers
    if (upgradeEvents / Math.max(totalEvents, 1) < 0.1) return 'high'; // Hard to convert
    return 'medium';
  }

  private generateSegmentTags(score: UserConversionScore): string[] {
    const tags = [];

    if (score.upgradeIntent > 0.7) tags.push('high_intent');
    if (score.churnRisk > 0.7) tags.push('at_risk');
    if (score.overallConversionScore > 0.8) tags.push('ready_to_convert');
    if (score.priceSensitivity === 'low') tags.push('price_insensitive');
    if (score.preferredFeatures.includes('team_collaboration')) tags.push('business_user');

    return tags;
  }

  private generatePersonalizedCTA(score: UserConversionScore | null, urgent: boolean): string {
    if (!score) return 'Start Free Trial';

    if (urgent) return 'Upgrade Now - Limited Time';
    if (score.upgradeIntent > 0.7) return 'Get Started Today';
    if (score.churnRisk > 0.7) return 'Don\'t Lose Progress';

    return 'View Premium Plan';
  }

  private async getUserConversionScore(userId: string): Promise<UserConversionScore | null> {
    try {
      const result = await pool.query(`
        SELECT overall_conversion_score, trial_likelihood, upgrade_intent, churn_risk,
               price_sensitivity, preferred_features
        FROM user_conversion_scores
        WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        overallConversionScore: row.overall_conversion_score,
        trialLikelihood: row.trial_likelihood,
        upgradeIntent: row.upgrade_intent,
        churnRisk: row.churn_risk,
        priceSensitivity: row.price_sensitivity,
        preferredFeatures: row.preferred_features || []
      };

    } catch (error) {
      return null;
    }
  }

  private async sendPersonalizedUpgradePrompt(userId: string, actions: any): Promise<void> {
    // This would integrate with the frontend to show personalized prompts
    // For now, log the intent
    logger.info('Personalized upgrade prompt triggered', { userId, actions });
  }

  private async sendPersonalizedOffer(userId: string, actions: any): Promise<void> {
    // This would send personalized offers via email or in-app
    logger.info('Personalized offer sent', { userId, actions });
  }
}

export const conversionAnalyticsService = ConversionAnalyticsService.getInstance();

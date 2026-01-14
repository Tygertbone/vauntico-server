import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { UserProfile } from '../types/service';

export interface TrustScore {
  score: number;
  factors: {
    content_quality: number;
    engagement: number;
    consistency: number;
    follower_count: number;
    post_frequency: number;
  };
  calculatedAt: Date;
  expiresAt: Date;
  creditsRemaining?: number;
  nextCalculationCost?: number;
  rateLimitRemaining?: number;
}

export interface TrustScoreHistory {
  scores: TrustScore[];
  total: number;
  hasMore: boolean;
  creditsUsed?: number;
}

export interface CalculationRequest {
  id: string;
  userId: string;
  tier: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  cost: number;
  startedAt: Date;
  estimatedTime?: number;
  completedAt?: Date;
  webhookUrl?: string;
}

export interface QuotaCheck {
  allowed: boolean;
  message?: string;
  creditsRemaining?: number;
  rateLimitRemaining?: number;
}

export interface ScoreCalculationFactors {
  content_quality: number;
  engagement: number;
  consistency: number;
  follower_count: number;
  post_frequency: number;
}

export interface UserActivityData {
  userId: string;
  totalPosts: number;
  totalFollowers: number;
  avgPostQuality: number;
  totalInteractions: number;
  lastActiveDate: Date;
}

export class TrustScoreService {
  /**
   * Calculates trust score based on multiple factors
   */
  static async calculateTrustScore(userId: string, tier: string): Promise<CalculationRequest> {
    const requestId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get user activity data
      const activityData = await this.getUserActivityData(userId);
      
      // Check quota limits
      const quotaCheck = await this.checkCalculationQuota(userId, tier);
      if (!quotaCheck.allowed) {
        return {
          id: requestId,
          userId,
          tier,
          status: 'failed',
          cost: 0,
          startedAt: new Date(),
          completedAt: new Date(),
          message: quotaCheck.message || 'Calculation quota exceeded'
        };
      }

      // Calculate score factors
      const factors = this.calculateScoreFactors(activityData, tier);
      
      // Calculate final trust score
      const score = this.calculateFinalScore(factors);
      
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days

      // Save calculation request
      await this.saveCalculationRequest({
        id: requestId,
        userId,
        tier,
        status: 'processing',
        cost: factors.score > 70 ? 0.1 : 0, // Cost credits only for high scores
        startedAt: new Date(),
        estimatedTime: 30 + Math.random() * 10 // 30-40 seconds
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, (3000 + Math.random() * 1000))); // 3-4 seconds

      // Complete calculation
      await this.saveCalculationRequest({
        id: requestId,
        userId,
        tier,
        status: 'completed',
        cost: factors.score > 70 ? 0.1 : 0,
        startedAt: new Date(),
        completedAt: new Date(),
        message: `Trust score calculation completed with score: ${score}`
      });

      // Update user's trust score
      await this.updateUserTrustScore(userId, score, expiresAt, factors);

      return {
        id: requestId,
        userId,
        tier,
        status: 'completed',
        cost: factors.score > 70 ? 0.1 : 0,
        startedAt: new Date(),
        completedAt: new Date(),
        message: `Trust score calculation completed with score: ${score}`
      };

    } catch (error) {
      logger.error('Trust score calculation failed', {
        userId,
        tier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        id: requestId,
        userId,
        tier,
        status: 'failed',
        cost: 0,
        startedAt: new Date(),
        completedAt: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets user's current trust score
   */
  static async getTrustScore(userId: string): Promise<TrustScore | null> {
    try {
      const result = await pool.query(
        `SELECT score, factors, calculated_at, expires_at 
         FROM user_trust_scores 
         WHERE user_id = $1 
         ORDER BY calculated_at DESC 
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        score: row.score,
        factors: row.factors,
        calculatedAt: row.calculated_at,
        expiresAt: row.expires_at
      };
    } catch (error) {
      logger.error('Failed to get trust score', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Gets user's trust score history
   */
  static async getTrustScoreHistory(
    userId: string,
    tier: string,
    limit: number,
    offset: number
  ): Promise<TrustScoreHistory> {
    try {
      const result = await pool.query(
        `SELECT score, factors, calculated_at, expires_at 
         FROM user_trust_scores 
         WHERE user_id = $1 
         ORDER BY calculated_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const total = await pool.query(
        `SELECT COUNT(*) as total 
         FROM user_trust_scores 
         WHERE user_id = $1`,
        [userId]
      );

      const totalCount = parseInt(total.rows[0]?.total || '0');

      const scores = result.rows.map(row => ({
        score: row.score,
        factors: row.factors,
        calculatedAt: row.calculated_at,
        expiresAt: row.expires_at
      }));

      const hasMore = result.rows.length >= (offset + limit);

      // Calculate credits used (simplified)
      const creditsUsed = scores.length * 0.1; // 0.1 credits per calculation

      return {
        scores,
        total: totalCount,
        hasMore,
        creditsUsed
      };
    } catch (error) {
      logger.error('Failed to get trust score history', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        scores: [],
        total: 0,
        hasMore: false,
        creditsUsed: 0
      };
    }
  }

  /**
   * Gets user activity data for score calculation
   */
  private static async getUserActivityData(userId: string): Promise<UserActivityData> {
    try {
      // Get user's basic data
      const userResult = await pool.query(
        `SELECT email, created_at 
         FROM users 
         WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];
      const daysSinceCreation = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

      // Calculate various activity metrics (mock implementation for Phase 2)
      const totalPosts = Math.floor(Math.random() * 50) + daysSinceCreation * 2;
      const totalFollowers = Math.floor(Math.random() * 30) + daysSinceCreation * 5;
      const avgPostQuality = 70 + Math.floor(Math.random() * 20);
      const totalInteractions = Math.floor(Math.random() * 200) + daysSinceCreation * 10;
      const lastActiveDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      return {
        userId,
        totalPosts,
        totalFollowers,
        avgPostQuality,
        totalInteractions,
        lastActiveDate
      };
    } catch (error) {
      logger.error('Failed to get user activity data', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return default values for demo
      return {
        userId,
        totalPosts: 10,
        totalFollowers: 5,
        avgPostQuality: 75,
        totalInteractions: 50,
        lastActiveDate: new Date()
      };
    }
  }

  /**
   * Calculates score factors based on user activity
   */
  private static calculateScoreFactors(activityData: UserActivityData, tier: string): ScoreCalculationFactors {
    // Content quality factor (based on post quality and engagement)
    const contentQuality = Math.min(100, 
      Math.floor(activityData.avgPostQuality * 0.4) + 
      Math.floor((activityData.totalInteractions / activityData.totalPosts) * 20));

    // Engagement factor (based on post frequency and interactions)
    const engagement = Math.min(100, 
      Math.floor((activityData.totalPosts / 30) * 15) + 
      Math.floor((activityData.totalInteractions / 100) * 25));

    // Consistency factor (based on regular activity)
    const consistency = Math.min(100, 
      Math.floor((activityData.lastActiveDate ? 
        (Date.now() - activityData.lastActiveDate.getTime()) / (7 * 24 * 60 * 60 * 1000) * 10 : 0));

    // Follower factor (normalized)
    const followerFactor = Math.min(100, Math.floor(activityData.totalFollowers / 50));

    // Post frequency factor
    const postFrequency = Math.min(100, Math.floor(activityData.totalPosts / (daysSinceCreation || 1)));

    return {
      content_quality,
      engagement,
      consistency,
      follower_count: followerFactor,
      post_frequency
    };
  }

  /**
   * Calculates final trust score from factors
   */
  private static calculateFinalScore(factors: ScoreCalculationFactors): number {
    // Weighted score calculation
    const weights = {
      content_quality: 0.25,
      engagement: 0.3,
      consistency: 0.2,
      follower_count: 0.15,
      post_frequency: 0.1
    };

    return Math.round(
      factors.content_quality * weights.content_quality +
      factors.engagement * weights.engagement +
      factors.consistency * weights.consistency +
      factors.follower_count * weights.follower_count +
      factors.post_frequency * weights.post_frequency
    );
  }

  /**
   * Updates user's trust score in database
   */
  private static async updateUserTrustScore(
    userId: string, 
    score: number, 
    expiresAt: Date, 
    factors: ScoreCalculationFactors
  ): Promise<void> {
    try {
      await pool.query(
        `UPDATE users 
         SET trust_score = $1, trust_score_factors = $2, trust_score_expires_at = $3
         WHERE id = $4`,
        [score, JSON.stringify(factors), expiresAt.toISOString()]
      );

      // Update or insert trust score history
      const existingScore = await pool.query(
        `SELECT id FROM user_trust_scores 
         WHERE user_id = $1 
         ORDER BY calculated_at DESC 
         LIMIT 1`,
        [userId]
      );

      if (existingScore.rows.length > 0) {
        await pool.query(
          `UPDATE user_trust_scores 
             SET expires_at = NOW() 
             WHERE id = $1`,
          [existingScore.rows[0].id]
        );
      } else {
        // Insert new score
        await pool.query(
          `INSERT INTO user_trust_scores 
             (user_id, score, factors, calculated_at, expires_at)
             VALUES ($1, $2, $3, NOW(), NOW())`,
          [userId, score, JSON.stringify(factors), new Date()]
        );
      }

      logger.info('Trust score updated', {
        userId,
        score,
        expiresAt
      });

    } catch (error) {
      logger.error('Failed to update trust score', {
        userId,
        score,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Checks calculation quota for a user
   */
  private static async checkCalculationQuota(userId: string, tier: string): Promise<QuotaCheck> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as calculations_this_month 
         FROM user_trust_scores 
         WHERE user_id = $1 
         AND calculated_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      );

      const monthlyCalculations = parseInt(result.rows[0]?.calculations_this_month || '0');
      
      const tierLimits = {
        basic: 5,
        pro: 10,
        enterprise: 20
      };

      const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.basic;
      
      if (monthlyCalculations >= limits) {
        return { 
          allowed: false, 
          message: `Monthly calculation quota exceeded (${monthlyCalculations}/${limits})`,
          creditsRemaining: 0,
          rateLimitRemaining: 0
        };
      }

      return { 
        allowed: true, 
        creditsRemaining: limits - monthlyCalculations,
        rateLimitRemaining: 0
      };

    } catch (error) {
      logger.error('Failed to check calculation quota', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return { 
        allowed: true, 
        creditsRemaining: 5, // Default
        rateLimitRemaining: 0
      };
    }
  }

  /**
   * Saves calculation request for tracking
   */
  private static async saveCalculationRequest(request: {
    id: string;
    userId: string;
    tier: string;
    status: string;
    cost: number;
    startedAt: Date;
    completedAt?: Date;
    estimatedTime?: number;
    message?: string;
  }): Promise<void> {
    try {
      const query = `
        INSERT INTO score_calculation_requests 
             (id, user_id, tier, status, cost, started_at, completed_at, estimated_time, message)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

      const values = [
        request.id,
        request.userId,
        request.tier,
        request.status,
        request.cost,
        request.startedAt,
        request.completedAt,
        request.estimatedTime,
        request.message
      ];

      await pool.query(query, values);

      logger.info('Calculation request saved', {
        requestId: request.id,
        userId: request.userId,
        tier: request.tier,
        status: request.status
      });

    } catch (error) {
      logger.error('Failed to save calculation request', {
        requestId: request.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Gets calculation request by ID
   */
  static async getCalculationRequest(requestId: string): Promise<CalculationRequest | null> {
    try {
      const result = await pool.query(
        `SELECT id, user_id, tier, status, cost, started_at, completed_at, estimated_time, message
         FROM score_calculation_requests 
         WHERE id = $1`,
        [requestId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const request = result.rows[0];
      
      return {
        id: request.id,
        userId: request.user_id,
        tier: request.tier,
        status: request.status,
        cost: request.cost,
        startedAt: request.started_at,
        completedAt: request.completed_at,
        estimatedTime: request.estimated_time,
        message: request.message
      };
    } catch (error) {
      logger.error('Failed to get calculation request', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Updates calculation request status
   */
  static async updateCalculationRequest(
    requestId: string, 
    status: 'completed' | 'failed',
    completedAt?: Date,
    message?: string
  ): Promise<void> {
    try {
      await pool.query(
        `UPDATE score_calculation_requests 
         SET status = $1, completed_at = $2, message = $3
         WHERE id = $4`,
        [status, completedAt, message, requestId]
      );

      logger.info('Calculation request updated', {
        requestId,
        status,
        completedAt,
        message
      });

    } catch (error) {
      logger.error('Failed to update calculation request', {
        requestId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default TrustScoreService;

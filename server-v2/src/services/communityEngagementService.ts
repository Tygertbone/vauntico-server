/**
 * Community Engagement Service
 * Manages community interactions, engagement tracking, and creator relationships
 */

import { database } from '../utils/database';
import { trustScoreService, TrustScoreMetrics, CreatorProfile } from './trustScoreService';

export interface EngagementEvent {
  id: string;
  creatorId: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'unfollow' | 'view';
  platform: string;
  contentId?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CommunityStats {
  totalEngagements: number;
  uniqueUsers: number;
  topContent: Array<{ contentId: string; engagements: number }>;
  engagementRate: number;
  growthRate: number;
}

export interface CreatorRelationship {
  creatorId: string;
  followerId: string;
  status: 'following' | 'blocked' | 'muted';
  createdAt: Date;
  updatedAt: Date;
}

export class CommunityEngagementService {
  /**
   * Record an engagement event
   */
  async recordEngagement(event: Omit<EngagementEvent, 'id' | 'timestamp'>): Promise<string> {
    const id = `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const engagementEvent: EngagementEvent = {
      id,
      ...event,
      timestamp: new Date()
    };

    // Store in database
    await database.query(
      `INSERT INTO community_engagements (id, creator_id, type, platform, content_id, user_id, timestamp, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        engagementEvent.id,
        engagementEvent.creatorId,
        engagementEvent.type,
        engagementEvent.platform,
        engagementEvent.contentId,
        engagementEvent.userId,
        engagementEvent.timestamp,
        JSON.stringify(engagementEvent.metadata || {})
      ]
    );

    return id;
  }

  /**
   * Get community stats for a creator
   */
  async getCommunityStats(creatorId: string, timeWindowDays: number = 30): Promise<CommunityStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

    // Get engagement data
    const engagementResult = await database.query(
      `SELECT
        COUNT(*) as total_engagements,
        COUNT(DISTINCT user_id) as unique_users,
        type,
        content_id
       FROM community_engagements
       WHERE creator_id = $1 AND timestamp >= $2
       GROUP BY type, content_id`,
      [creatorId, cutoffDate]
    );

    const rows = engagementResult.rows;
    const totalEngagements = rows.reduce((sum, row) => sum + parseInt(row.total_engagements), 0);
    const uniqueUsers = rows.reduce((sum, row) => sum + parseInt(row.unique_users), 0);

    // Calculate top content
    const contentEngagements = new Map<string, number>();
    rows.forEach((row: any) => {
      if (row.content_id) {
        contentEngagements.set(
          row.content_id,
          (contentEngagements.get(row.content_id) || 0) + parseInt(row.total_engagements)
        );
      }
    });

    const topContent = Array.from(contentEngagements.entries())
      .map(([contentId, engagements]) => ({ contentId, engagements }))
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 10);

    // Calculate engagement rate and growth (mock data for now)
    const engagementRate = totalEngagements > 0 ? (uniqueUsers / totalEngagements) * 100 : 0;
    const growthRate = 12.5; // Mock growth rate

    return {
      totalEngagements,
      uniqueUsers,
      topContent,
      engagementRate,
      growthRate
    };
  }

  /**
   * Calculate trust score metrics from engagement data
   */
  async calculateTrustMetrics(creatorId: string): Promise<TrustScoreMetrics> {
    const stats = await this.getCommunityStats(creatorId, 30);

    // Get follower/following data
    const relationshipResult = await database.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'following') as followers,
        COUNT(*) FILTER (WHERE status = 'following' AND created_at >= NOW() - INTERVAL '30 days') as new_followers
       FROM creator_relationships
       WHERE creator_id = $1`,
      [creatorId]
    );

    const relationshipData = relationshipResult.rows[0];
    const followers = parseInt(relationshipData?.followers || '0');
    const newFollowers = parseInt(relationshipData?.new_followers || '0');

    // Calculate metrics
    const engagement = stats.totalEngagements > 0 ? (stats.uniqueUsers / stats.totalEngagements) * 100 : 0;
    const growth = followers > 0 ? (newFollowers / followers) * 100 : 0;

    // Mock consistency and authenticity (would be calculated from content analysis)
    const consistency = 85;
    const authenticity = 92;

    return {
      followers,
      engagement,
      consistency,
      authenticity,
      growth
    };
  }

  /**
   * Get creator relationships
   */
  async getCreatorRelationships(creatorId: string, type: 'followers' | 'following' = 'followers'): Promise<CreatorRelationship[]> {
    const query = type === 'followers'
      ? 'SELECT * FROM creator_relationships WHERE creator_id = $1 AND status = $2 ORDER BY created_at DESC'
      : 'SELECT * FROM creator_relationships WHERE follower_id = $1 AND status = $2 ORDER BY created_at DESC';

    const result = await database.query(query, [creatorId, 'following']);

    return result.rows.map((row: any) => ({
      creatorId: row.creator_id,
      followerId: row.follower_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  /**
   * Update creator relationship
   */
  async updateRelationship(creatorId: string, followerId: string, status: 'following' | 'blocked' | 'muted'): Promise<void> {
    await database.query(
      `INSERT INTO creator_relationships (creator_id, follower_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (creator_id, follower_id)
       DO UPDATE SET status = $3, updated_at = NOW()`,
      [creatorId, followerId, status]
    );
  }

  /**
   * Get engagement analytics
   */
  async getEngagementAnalytics(creatorId: string, startDate: Date, endDate: Date): Promise<{
    dailyEngagements: Array<{ date: string; count: number }>;
    topEngagementTypes: Array<{ type: string; count: number }>;
    engagementTrends: Array<{ date: string; engagement: number; reach: number }>;
  }> {
    // Get daily engagement counts
    const dailyResult = await database.query(
      `SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
       FROM community_engagements
       WHERE creator_id = $1 AND timestamp BETWEEN $2 AND $3
       GROUP BY DATE(timestamp)
       ORDER BY date`,
      [creatorId, startDate, endDate]
    );

    const dailyEngagements = dailyResult.rows.map((row: any) => ({
      date: row.date,
      count: parseInt(row.count)
    }));

    // Get top engagement types
    const typeResult = await database.query(
      `SELECT
        type,
        COUNT(*) as count
       FROM community_engagements
       WHERE creator_id = $1 AND timestamp BETWEEN $2 AND $3
       GROUP BY type
       ORDER BY count DESC
       LIMIT 5`,
      [creatorId, startDate, endDate]
    );

    const topEngagementTypes = typeResult.rows.map((row: any) => ({
      type: row.type,
      count: parseInt(row.count)
    }));

    // Calculate engagement trends (simplified)
    const engagementTrends = dailyEngagements.map(day => ({
      date: day.date,
      engagement: Math.random() * 10 + 5, // Mock engagement rate
      reach: day.count * (Math.random() * 5 + 1) // Mock reach
    }));

    return {
      dailyEngagements,
      topEngagementTypes,
      engagementTrends
    };
  }

  /**
   * Bulk process engagement events
   */
  async processBulkEngagements(events: Omit<EngagementEvent, 'id' | 'timestamp'>[]): Promise<string[]> {
    const ids: string[] = [];

    await database.transaction(async (client) => {
      for (const event of events) {
        const id = `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        ids.push(id);

        await client.query(
          `INSERT INTO community_engagements (id, creator_id, type, platform, content_id, user_id, timestamp, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            event.creatorId,
            event.type,
            event.platform,
            event.contentId,
            event.userId,
            new Date(),
            JSON.stringify(event.metadata || {})
          ]
        );
      }
    });

    return ids;
  }

  /**
   * Clean up old engagement data
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await database.query(
      'DELETE FROM community_engagements WHERE timestamp < $1',
      [cutoffDate]
    );

    return result.rowCount || 0;
  }
}

// Export singleton instance
export const communityEngagementService = new CommunityEngagementService();
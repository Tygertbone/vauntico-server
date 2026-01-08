import { pool } from '../utils/database';
import logger from '../utils/logger';
import { TrustScoreService } from './trustScoreService';

export interface CommunityEngagement {
  id: string;
  userId: string;
  actionType: 'love_loop' | 'legacy_tree' | 'leaderboard' | 'echo_chamber';
  targetId?: string;
  data: any;
  creditsEarned: number;
  createdAt: Date;
}

export interface LoveLoop {
  id: string;
  creatorId: string;
  supporterId: string;
  message: string;
  isPublic: boolean;
  creditsDonated: number;
  createdAt: Date;
  responseMessage?: string;
  respondedAt?: Date;
}

export interface LegacyTreeEntry {
  id: string;
  creatorId: string;
  contributorId: string;
  contributionType: 'mentorship' | 'collaboration' | 'resource_sharing' | 'skill_development';
  description: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  creditsEarned: number;
  createdAt: Date;
  parentEntryId?: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  category: 'trust_score' | 'credits_earned' | 'contributions_made' | 'community_impact';
  score: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  achievedAt: Date;
  badge?: string;
}

export interface EchoChamberStory {
  id: string;
  authorId: string;
  title: string;
  content: string;
  tags: string[];
  collaborators: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  shares: number;
  creditsEarned: number;
  createdAt: Date;
  publishedAt?: Date;
}

export interface CommunityStats {
  totalLoveLoops: number;
  totalLegacyEntries: number;
  totalEchoStories: number;
  activeUsers: number;
  creditsDistributed: number;
  topContributors: Array<{
    userId: string;
    totalCredits: number;
    rank: number;
  }>;
  recentActivities: CommunityEngagement[];
}

class CommunityEngagementService {
  private readonly CREDIT_REWARDS = {
    love_loop: 5,
    legacy_tree: 10,
    echo_chamber: 15,
    leaderboard_monthly: 50,
    leaderboard_weekly: 25,
    contribution_made: 3,
    story_published: 20,
    story_liked: 2
  };

  async recordEngagement(engagementData: Omit<CommunityEngagement, 'id' | 'createdAt'>): Promise<CommunityEngagement> {
    try {
      const id = this.generateId();
      const creditsEarned = this.calculateCreditsEarned(engagementData.actionType, engagementData.data);

      const query = `
        INSERT INTO community_engagement (
          id, user_id, action_type, target_id, data, credits_earned, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const values = [
        id,
        engagementData.userId,
        engagementData.actionType,
        engagementData.targetId,
        JSON.stringify(engagementData.data),
        creditsEarned,
        id,
        engagementData.userId,
        creditsEarned,
        'engagement_activity',
        id
      ];

      // Award credits to user
      await this.awardCredits(engagementData.userId, creditsEarned, engagementData.actionType, id);

      const result = await pool.query(query, values);

      return this.mapCommunityEngagement(result.rows[0]);
    } catch (error) {
      logger.error('Error recording community engagement:', error);
      throw error;
    }
  }

  async createLoveLoop(loopData: Omit<LoveLoop, 'id' | 'createdAt'>): Promise<LoveLoop> {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        const id = this.generateId();
        const creditsDonated = loopData.creditsDonated || 10;

        const query = `
          INSERT INTO love_loops (
            id, creator_id, supporter_id, message, is_public, credits_donated, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *
        `;

        const values = [
          id,
          loopData.creatorId,
          loopData.supporterId,
          loopData.message,
          loopData.isPublic || false,
          creditsDonated
        ];

        const result = await client.query(query, values);

        // Award credits to supporter
        await this.awardCredits(loopData.supporterId, this.CREDIT_REWARDS.love_loop, 'love_loop_created', id);

        // Award credits to creator
        await this.awardCredits(loopData.creatorId, Math.floor(creditsDonated * 0.5), 'love_loop_received', id);

        await client.query('COMMIT');

        return this.mapLoveLoop(result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error creating love loop:', error);
      throw error;
    }
  }

  async respondToLoveLoop(loopId: string, responderId: string, responseMessage: string): Promise<LoveLoop> {
    try {
      const query = `
        UPDATE love_loops 
        SET response_message = $2,
            responded_at = NOW()
        WHERE id = $1 AND creator_id = $3
        RETURNING *
      `;

      // Check if user is the creator of this loop
      const loopCheck = await pool.query(
        'SELECT creator_id FROM love_loops WHERE id = $1',
        [loopId]
      );

      if (loopCheck.rows.length === 0 || loopCheck.rows[0].creator_id !== responderId) {
        throw new Error('You can only respond to your own love loops');
      }

      const result = await pool.query(query, [responseMessage, responderId, loopId]);

      // Award credits for responding
      await this.awardCredits(responderId, 3, 'love_loop_responded', loopId);

      return this.mapLoveLoop(result.rows[0]);
    } catch (error) {
      logger.error('Error responding to love loop:', error);
      throw error;
    }
  }

  async addLegacyEntry(entryData: Omit<LegacyTreeEntry, 'id' | 'createdAt'>): Promise<LegacyTreeEntry> {
    try {
      const id = this.generateId();
      const creditsEarned = this.calculateLegacyCredits(entryData.contributionType, entryData.impactLevel);

      const query = `
        INSERT INTO legacy_tree (
          id, creator_id, contributor_id, contribution_type, description, impact_level,
          credits_earned, created_at, parent_entry_id
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        RETURNING *
      `;

      const values = [
        id,
        entryData.creatorId,
        entryData.contributorId,
        entryData.contributionType,
        entryData.description,
        entryData.impactLevel,
        creditsEarned,
        entryData.parentEntryId
      ];

      const result = await pool.query(query, values);

      // Award credits to contributor
      await this.awardCredits(entryData.contributorId, creditsEarned, 'legacy_tree_entry', id);

      return this.mapLegacyTreeEntry(result.rows[0]);
    } catch (error) {
      logger.error('Error adding legacy tree entry:', error);
      throw error;
    }
  }

  async createEchoChamberStory(storyData: Omit<EchoChamberStory, 'id' | 'createdAt'>): Promise<EchoChamberStory> {
    try {
      const id = this.generateId();
      const creditsEarned = this.CREDIT_REWARDS.echo_chamber;

      const query = `
        INSERT INTO echo_chamber (
          id, author_id, title, content, tags, collaborators, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const values = [
        id,
        storyData.authorId,
        storyData.title,
        storyData.content,
        storyData.tags || [],
        storyData.collaborators || [],
        storyData.status || 'draft'
      ];

      const result = await pool.query(query, values);

      // Award credits for creating story
      await this.awardCredits(storyData.authorId, creditsEarned, 'echo_chamber_created', id);

      return this.mapEchoChamberStory(result.rows[0]);
    } catch (error) {
      logger.error('Error creating echo chamber story:', error);
      throw error;
    }
  }

  async publishEchoChamberStory(storyId: string, authorId: string): Promise<EchoChamberStory> {
    try {
      const query = `
        UPDATE echo_chamber 
        SET status = 'published',
            published_at = NOW()
        WHERE id = $1 AND author_id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [storyId, authorId]);

      if (result.rows.length === 0) {
        throw new Error('Story not found or unauthorized');
      }

      // Award additional credits for publishing
      await this.awardCredits(authorId, this.CREDIT_REWARDS.story_published, 'echo_chamber_published', storyId);

      return this.mapEchoChamberStory(result.rows[0]);
    } catch (error) {
      logger.error('Error publishing echo chamber story:', error);
      throw error;
    }
  }

  async getLeaderboards(category: LeaderboardEntry['category'], period: LeaderboardEntry['period'] = 'monthly', limit = 100): Promise<LeaderboardEntry[]> {
    try {
      const query = `
        SELECT le.*, u.username
        FROM leaderboard_entries le
        JOIN users u ON le.user_id = u.id
        WHERE le.category = $1 AND le.period = $2
        ORDER BY le.score DESC, le.achieved_at ASC
        LIMIT $3
      `;

      const result = await pool.query(query, [category, period, limit]);
      return result.rows.map(this.mapLeaderboardEntry);
    } catch (error) {
      logger.error('Error fetching leaderboards:', error);
      throw error;
    }
  }

  async updateLeaderboardEntry(entryData: Omit<LeaderboardEntry, 'id' | 'userId' | 'achievedAt'>): Promise<LeaderboardEntry> {
    try {
      const query = `
        UPDATE leaderboard_entries 
        SET score = $2,
            achieved_at = NOW(),
            badge = $3
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [entryData.score, entryData.badge, entryData.id]);

      if (result.rows.length === 0) {
        throw new Error('Leaderboard entry not found');
      }

      return this.mapLeaderboardEntry(result.rows[0]);
    } catch (error) {
      logger.error('Error updating leaderboard entry:', error);
      throw error;
    }
  }

  async getCommunityStats(): Promise<CommunityStats> {
    try {
      const [loveLoopsResult, legacyResult, echoResult, engagementResult] = await Promise.all([
        pool.query('SELECT COUNT(*) as total FROM love_loops'),
        pool.query('SELECT COUNT(*) as total FROM legacy_tree'),
        pool.query('SELECT COUNT(*) as total FROM echo_chamber'),
        pool.query(`
          SELECT COUNT(DISTINCT user_id) as active_users, 
                 COALESCE(SUM(credits_earned), 0) as credits_distributed
          FROM community_engagement 
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `)
      ]);

      // Get top contributors
      const topContributorsResult = await pool.query(`
        SELECT user_id, SUM(credits_earned) as total credits,
               RANK() OVER (ORDER BY SUM(credits_earned) DESC) as rank
        FROM community_engagement
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY user_id
        ORDER BY total credits DESC
        LIMIT 10
      `);

      // Get recent activities
      const recentActivitiesResult = await pool.query(`
        SELECT ce.*, u.username
        FROM community_engagement ce
        JOIN users u ON ce.user_id = u.id
        ORDER BY ce.created_at DESC
        LIMIT 10
      `);

      return {
        totalLoveLoops: parseInt(loveLoopsResult.rows[0].total),
        totalLegacyEntries: parseInt(legacyResult.rows[0].total),
        totalEchoStories: parseInt(echoResult.rows[0].total),
        activeUsers: parseInt(engagementResult.rows[0].active_users),
        creditsDistributed: parseFloat(engagementResult.rows[0].credits_distributed),
        topContributors: topContributorsResult.rows.map((row: any) => ({
          userId: row.user_id,
          totalCredits: parseInt(row.total_credits),
          rank: row.rank
        })),
        recentActivities: recentActivitiesResult.rows.map(this.mapCommunityEngagement)
      };
    } catch (error) {
      logger.error('Error fetching community stats:', error);
      throw error;
    }
  }

  private calculateCreditsEarned(actionType: CommunityEngagement['actionType'], data?: any): number {
    switch (actionType) {
      case 'love_loop':
        return this.CREDIT_REWARDS.love_loop;
      case 'legacy_tree':
        return this.calculateLegacyCredits(data?.contributionType, data?.impactLevel);
      case 'echo_chamber':
        return this.CREDIT_REWARDS.echo_chamber;
      case 'leaderboard':
        return data?.position ? 50 : 25; // Top position bonus
      default:
        return 1;
    }
  }

  private calculateLegacyCredits(contributionType: LegacyTreeEntry['contributionType'], impactLevel: LegacyTreeEntry['impactLevel']): number {
    const baseCredits = {
      mentorship: { low: 5, medium: 10, high: 20, critical: 50 },
      collaboration: { low: 3, medium: 8, high: 15, critical: 30 },
      resource_sharing: { low: 2, medium: 5, high: 10, critical: 20 },
      skill_development: { low: 8, medium: 15, high: 25, critical: 40 }
    };

    return baseCredits[contributionType]?.[impactLevel] || 5;
  }

  private async awardCredits(userId: string, amount: number, source: string, referenceId: string): Promise<void> {
    const creditId = this.generateId();
    await pool.query(`
      INSERT INTO vauntico_credits (id, user_id, amount, source, reference_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [creditId, userId, amount, source, referenceId]);
  }

  private mapCommunityEngagement(row: any): CommunityEngagement {
    return {
      id: row.id,
      userId: row.user_id,
      actionType: row.action_type,
      targetId: row.target_id,
      data: row.data ? JSON.parse(row.data) : undefined,
      creditsEarned: parseInt(row.credits_earned),
      createdAt: row.created_at
    };
  }

  private mapLoveLoop(row: any): LoveLoop {
    return {
      id: row.id,
      creatorId: row.creator_id,
      supporterId: row.supporter_id,
      message: row.message,
      isPublic: row.is_public,
      creditsDonated: parseInt(row.credits_donated),
      createdAt: row.created_at,
      responseMessage: row.response_message,
      respondedAt: row.responded_at
    };
  }

  private mapLegacyTreeEntry(row: any): LegacyTreeEntry {
    return {
      id: row.id,
      creatorId: row.creator_id,
      contributorId: row.contributor_id,
      contributionType: row.contribution_type,
      description: row.description,
      impactLevel: row.impact_level,
      creditsEarned: parseInt(row.credits_earned),
      createdAt: row.created_at,
      parentEntryId: row.parent_entry_id
    };
  }

  private mapLeaderboardEntry(row: any): LeaderboardEntry {
    return {
      id: row.id,
      userId: row.user_id,
      category: row.category,
      score: parseFloat(row.score),
      period: row.period,
      achievedAt: row.achieved_at,
      badge: row.badge
    };
  }

  private mapEchoChamberStory(row: any): EchoChamberStory {
    return {
      id: row.id,
      authorId: row.author_id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      collaborators: row.collaborators || [],
      status: row.status,
      views: parseInt(row.views || 0),
      likes: parseInt(row.likes || 0),
      shares: parseInt(row.shares || 0),
      creditsEarned: parseInt(row.credits_earned || 0),
      createdAt: row.created_at,
      publishedAt: row.published_at
    };
  }

  private generateId(): string {
    return `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const communityEngagementService = new CommunityEngagementService();
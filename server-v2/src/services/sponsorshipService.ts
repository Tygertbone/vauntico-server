import { pool } from '../utils/database';
import logger from '../utils/logger';
import { TrustScoreService } from './trustScoreService';

export interface Sponsorship {
  id: string;
  sponsorId: string;
  creatorId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  kpis: SponsorshipKPIs;
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorshipKPIs {
  engagementRate: number;
  followerGrowth: number;
  contentReach: number;
  brandMentions: number;
  conversionRate: number;
  revenueGenerated: number;
  roiScore: number;
  lastUpdated: Date;
}

export interface SponsorshipTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  minAmount: number;
  maxAmount: number;
  benefits: string[];
  duration: number; // in months
  vaunticoCreditsBonus: number;
  analyticsAccess: 'basic' | 'advanced' | 'premium' | 'enterprise';
}

class SponsorshipService {
  private readonly TIER_CONFIGS: SponsorshipTier[] = [
    {
      tier: 'bronze',
      minAmount: 100,
      maxAmount: 500,
      benefits: ['Basic analytics', 'Brand mention', 'Monthly report'],
      duration: 1,
      vaunticoCreditsBonus: 50,
      analyticsAccess: 'basic'
    },
    {
      tier: 'silver',
      minAmount: 500,
      maxAmount: 2000,
      benefits: ['Advanced analytics', 'Brand mention', 'Bi-weekly report', 'Priority support'],
      duration: 3,
      vaunticoCreditsBonus: 200,
      analyticsAccess: 'advanced'
    },
    {
      tier: 'gold',
      minAmount: 2000,
      maxAmount: 10000,
      benefits: ['Premium analytics', 'Brand integration', 'Weekly report', 'Dedicated support', 'Co-branded content'],
      duration: 6,
      vaunticoCreditsBonus: 1000,
      analyticsAccess: 'premium'
    },
    {
      tier: 'platinum',
      minAmount: 10000,
      maxAmount: 100000,
      benefits: ['Enterprise analytics', 'Full brand integration', 'Daily report', 'White-glove support', 'Exclusive content', 'Event access'],
      duration: 12,
      vaunticoCreditsBonus: 5000,
      analyticsAccess: 'enterprise'
    }
  ];

  async getSponsorships(filters?: {
    sponsorId?: string;
    creatorId?: string;
    status?: Sponsorship['status'];
    tier?: Sponsorship['tier'];
    limit?: number;
    offset?: number;
  }): Promise<{ sponsorships: Sponsorship[]; total: number }> {
    try {
      let query = `
        SELECT s.*, 
               u_sponsor.username as sponsor_username,
               u_creator.username as creator_username
        FROM sponsorships s
        JOIN users u_sponsor ON s.sponsor_id = u_sponsor.id
        JOIN users u_creator ON s.creator_id = u_creator.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.sponsorId) {
        query += ` AND s.sponsor_id = $${paramIndex++}`;
        params.push(filters.sponsorId);
      }

      if (filters?.creatorId) {
        query += ` AND s.creator_id = $${paramIndex++}`;
        params.push(filters.creatorId);
      }

      if (filters?.status) {
        query += ` AND s.status = $${paramIndex++}`;
        params.push(filters.status);
      }

      if (filters?.tier) {
        query += ` AND s.tier = $${paramIndex++}`;
        params.push(filters.tier);
      }

      query += ' ORDER BY s.created_at DESC';

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM sponsorships s
        WHERE 1=1
      `;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (filters?.sponsorId) {
        countQuery += ` AND s.sponsor_id = $${countParamIndex++}`;
        countParams.push(filters.sponsorId);
      }

      if (filters?.creatorId) {
        countQuery += ` AND s.creator_id = $${countParamIndex++}`;
        countParams.push(filters.creatorId);
      }

      if (filters?.status) {
        countQuery += ` AND s.status = $${countParamIndex++}`;
        countParams.push(filters.status);
      }

      if (filters?.tier) {
        countQuery += ` AND s.tier = $${countParamIndex++}`;
        countParams.push(filters.tier);
      }

      const countResult = await pool.query(countQuery, countParams);

      return {
        sponsorships: result.rows.map(this.mapSponsorship),
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      logger.error('Error fetching sponsorships:', error);
      throw error;
    }
  }

  async createSponsorship(sponsorshipData: Omit<Sponsorship, 'id' | 'createdAt' | 'updatedAt' | 'kpis'>): Promise<Sponsorship> {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Validate tier and amount
        const tierConfig = this.TIER_CONFIGS.find(t => t.tier === sponsorshipData.tier);
        if (!tierConfig) {
          throw new Error(`Invalid sponsorship tier: ${sponsorshipData.tier}`);
        }

        if (sponsorshipData.amount < tierConfig.minAmount || sponsorshipData.amount > tierConfig.maxAmount) {
          throw new Error(`Amount must be between ${tierConfig.minAmount} and ${tierConfig.maxAmount} for ${sponsorshipData.tier} tier`);
        }

        // Create sponsorship
        const id = this.generateId();
        const query = `
          INSERT INTO sponsorships (
            id, sponsor_id, creator_id, tier, amount, currency, status,
            start_date, end_date, kpis, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING *
        `;

        const values = [
          id,
          sponsorshipData.sponsorId,
          sponsorshipData.creatorId,
          sponsorshipData.tier,
          sponsorshipData.amount,
          sponsorshipData.currency || 'USD',
          sponsorshipData.status || 'pending',
          sponsorshipData.startDate,
          sponsorshipData.endDate,
          JSON.stringify(this.initializeKPIs())
        ];

        const result = await client.query(query, values);

        // Award Vauntico credits to sponsor
        await this.awardCredits(
          client,
          sponsorshipData.sponsorId,
          tierConfig.vaunticoCreditsBonus,
          'sponsorship_signup',
          id
        );

        await client.query('COMMIT');

        return this.mapSponsorship(result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error creating sponsorship:', error);
      throw error;
    }
  }

  async updateSponsorshipKPIs(sponsorshipId: string, kpis: Partial<SponsorshipKPIs>): Promise<Sponsorship> {
    try {
      const query = `
        UPDATE sponsorships 
        SET kpis = kpis || '{}'::jsonb,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [JSON.stringify(kpis)]);
      
      if (result.rows.length === 0) {
        throw new Error('Sponsorship not found');
      }

      return this.mapSponsorship(result.rows[0]);
    } catch (error) {
      logger.error('Error updating sponsorship KPIs:', error);
      throw error;
    }
  }

  async getSponsorshipTiers(): Promise<SponsorshipTier[]> {
    return this.TIER_CONFIGS;
  }

  async calculateROI(sponsorshipId: string): Promise<number> {
    try {
      const query = `
        SELECT amount, kpis, start_date
        FROM sponsorships
        WHERE id = $1
      `;

      const result = await pool.query(query, [sponsorshipId]);
      
      if (result.rows.length === 0) {
        throw new Error('Sponsorship not found');
      }

      const sponsorship = result.rows[0];
      const kpis = sponsorship.kpis as SponsorshipKPIs;
      
      // Simple ROI calculation: (Revenue Generated - Investment) / Investment * 100
      const investment = parseFloat(sponsorship.amount);
      const revenue = kpis.revenueGenerated || 0;
      
      return ((revenue - investment) / investment) * 100;
    } catch (error) {
      logger.error('Error calculating ROI:', error);
      throw error;
    }
  }

  async getSponsorshipAnalytics(sponsorshipId: string, timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    try {
      // In a real implementation, this would query actual engagement data
      // For now, return mock analytics data based on sponsorship tier
      const sponsorship = await this.getSponsorshipById(sponsorshipId);
      
      if (!sponsorship) {
        throw new Error('Sponsorship not found');
      }

      const baseMultiplier = {
        bronze: 1.0,
        silver: 1.5,
        gold: 2.5,
        platinum: 5.0
      }[sponsorship.tier];

      const timeframeMultiplier = {
        '7d': 0.25,
        '30d': 1.0,
        '90d': 3.0,
        '1y': 12.0
      }[timeframe];

      return {
        sponsorshipId,
        tier: sponsorship.tier,
        timeframe,
        impressions: Math.floor(10000 * baseMultiplier * timeframeMultiplier),
        clicks: Math.floor(500 * baseMultiplier * timeframeMultiplier),
        conversions: Math.floor(50 * baseMultiplier * timeframeMultiplier),
        revenue: sponsorship.amount * 0.1 * baseMultiplier * timeframeMultiplier,
        engagement: {
          likes: Math.floor(1000 * baseMultiplier * timeframeMultiplier),
          shares: Math.floor(200 * baseMultiplier * timeframeMultiplier),
          comments: Math.floor(100 * baseMultiplier * timeframeMultiplier)
        },
        demographics: {
          age: {
            '18-24': 25,
            '25-34': 35,
            '35-44': 25,
            '45+': 15
          },
          gender: {
            male: 55,
            female: 45
          },
          location: {
            'US': 40,
            'UK': 15,
            'Canada': 10,
            'Other': 35
          }
        }
      };
    } catch (error) {
      logger.error('Error fetching sponsorship analytics:', error);
      throw error;
    }
  }

  private async getSponsorshipById(id: string): Promise<Sponsorship | null> {
    try {
      const query = `
        SELECT s.*, 
               u_sponsor.username as sponsor_username,
               u_creator.username as creator_username
        FROM sponsorships s
        JOIN users u_sponsor ON s.sponsor_id = u_sponsor.id
        JOIN users u_creator ON s.creator_id = u_creator.id
        WHERE s.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapSponsorship(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error fetching sponsorship by ID:', error);
      throw error;
    }
  }

  private async awardCredits(client: any, userId: string, amount: number, source: string, referenceId: string): Promise<void> {
    const creditId = this.generateId();
    const query = `
      INSERT INTO vauntico_credits (id, user_id, amount, source, reference_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await client.query(query, [creditId, userId, amount, source, referenceId]);
  }

  private initializeKPIs(): SponsorshipKPIs {
    return {
      engagementRate: 0,
      followerGrowth: 0,
      contentReach: 0,
      brandMentions: 0,
      conversionRate: 0,
      revenueGenerated: 0,
      roiScore: 0,
      lastUpdated: new Date()
    };
  }

  private mapSponsorship(row: any): Sponsorship {
    return {
      id: row.id,
      sponsorId: row.sponsor_id,
      creatorId: row.creator_id,
      tier: row.tier,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      kpis: row.kpis as SponsorshipKPIs || this.initializeKPIs(),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private generateId(): string {
    return `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const sponsorshipService = new SponsorshipService();
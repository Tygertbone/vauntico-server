import { pool } from '../utils/database';
import logger from '../utils/logger';
import { TrustScoreService } from './trustScoreService';

export interface CouncilMember {
  id: string;
  userId: string;
  username: string;
  trustScore: number;
  votingWeight: number;
  joinedAt: Date;
  isActive: boolean;
  reputation: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'governance' | 'feature' | 'policy' | 'community';
  status: 'draft' | 'active' | 'voting' | 'completed' | 'rejected';
  createdBy: string;
  createdAt: Date;
  votingStartsAt?: Date;
  votingEndsAt?: Date;
  quorumRequired: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalWeight: number;
  trustScoreThreshold: number;
  tags: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  vote: 'yes' | 'no' | 'abstain';
  votingWeight: number;
  reasoning?: string;
  createdAt: Date;
  trustScoreAtTime: number;
}

export interface AuditTrail {
  id: string;
  action: string;
  entityType: 'proposal' | 'vote' | 'member' | 'council';
  entityId: string;
  userId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  reason?: string;
}

class UbuntuCouncilService {
  private readonly VOTING_WEIGHT_MULTIPLIER = 0.1;
  private readonly QUORUM_DEFAULT = 0.4; // 40% of total voting weight
  private readonly COUNCIL_TRUST_THRESHOLD = 750;

  async getCouncilMembers(): Promise<CouncilMember[]> {
    try {
      const query = `
        SELECT 
          cm.*,
          u.username,
          u.trust_score as currentTrustScore,
          u.reputation_score as reputation
        FROM council_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.is_active = true
        ORDER BY cm.voting_weight DESC
      `;
      
      const result = await pool.query(query);
      return result.rows.map(this.mapCouncilMember);
    } catch (error) {
      logger.error('Error fetching council members:', error);
      throw error;
    }
  }

  async addCouncilMember(userId: string): Promise<CouncilMember> {
    try {
      // Check if user meets trust score threshold
      const trustScoreResult = await TrustScoreService.calculateTrustScore(userId, 'pro');
      const trustScore = trustScoreResult.cost; // Use cost as a proxy for trust score in this mock
      if (trustScore < this.COUNCIL_TRUST_THRESHOLD) {
        throw new Error(`Trust score ${trustScore} below required threshold ${this.COUNCIL_TRUST_THRESHOLD}`);
      }

      // Calculate voting weight based on trust score
      const votingWeight = trustScore * this.VOTING_WEIGHT_MULTIPLIER;

      const query = `
        INSERT INTO council_members (user_id, voting_weight, joined_at, is_active)
        VALUES ($1, $2, NOW(), true)
        RETURNING *
      `;

      const result = await pool.query(query, [userId, votingWeight]);
      
      // Log to audit trail
      await this.logAuditTrail('member', result.rows[0].id, 'system', {
        action: 'add_council_member',
        userId,
        votingWeight,
        trustScore
      });

      return this.mapCouncilMember(result.rows[0]);
    } catch (error) {
      logger.error('Error adding council member:', error);
      throw error;
    }
  }

  async createProposal(proposalData: Omit<Proposal, 'id' | 'createdAt' | 'yesVotes' | 'noVotes' | 'abstainVotes' | 'totalWeight'>): Promise<Proposal> {
    try {
      const id = this.generateId();
      const quorumRequired = proposalData.quorumRequired || this.QUORUM_DEFAULT;

      const query = `
        INSERT INTO proposals (
          id, title, description, type, status, created_by, created_at,
          quorum_required, trust_score_threshold, tags, impact,
          voting_starts_at, voting_ends_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        id,
        proposalData.title,
        proposalData.description,
        proposalData.type,
        proposalData.status,
        proposalData.createdBy,
        quorumRequired,
        proposalData.trustScoreThreshold,
        proposalData.tags,
        proposalData.impact,
        proposalData.votingStartsAt,
        proposalData.votingEndsAt
      ];

      const result = await pool.query(query, values);
      
      // Log to audit trail
      await this.logAuditTrail('proposal', id, proposalData.createdBy, {
        action: 'create_proposal',
        proposalData
      });

      return this.mapProposal(result.rows[0]);
    } catch (error) {
      logger.error('Error creating proposal:', error);
      throw error;
    }
  }

  async getProposals(status?: Proposal['status'], limit = 50, offset = 0): Promise<Proposal[]> {
    try {
      let query = `
        SELECT p.*, u.username as creator_name
        FROM proposals p
        JOIN users u ON p.created_by = u.id
      `;
      const params: any[] = [];

      if (status) {
        query += ' WHERE p.status = $1';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows.map(this.mapProposal);
    } catch (error) {
      logger.error('Error fetching proposals:', error);
      throw error;
    }
  }

  async castVote(voteData: Omit<Vote, 'id' | 'createdAt' | 'votingWeight' | 'trustScoreAtTime'>): Promise<Vote> {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Check if user is eligible to vote
        const memberCheck = await client.query(
          'SELECT * FROM council_members WHERE user_id = $1 AND is_active = true',
          [voteData.userId]
        );

        if (memberCheck.rows.length === 0) {
          throw new Error('User is not an active council member');
        }

        // Get current trust score
        const trustScoreResult = await TrustScoreService.calculateTrustScore(voteData.userId, 'pro');
        const trustScore = trustScoreResult.cost; // Use cost as a proxy for trust score in this mock
        const votingWeight = trustScore * this.VOTING_WEIGHT_MULTIPLIER;

        // Check if user has already voted
        const existingVote = await client.query(
          'SELECT * FROM votes WHERE proposal_id = $1 AND user_id = $2',
          [voteData.proposalId, voteData.userId]
        );

        if (existingVote.rows.length > 0) {
          throw new Error('User has already voted on this proposal');
        }

        // Cast the vote
        const voteId = this.generateId();
        const voteQuery = `
          INSERT INTO votes (
            id, proposal_id, user_id, vote, voting_weight, reasoning, created_at, trust_score_at_time
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
          RETURNING *
        `;

        const voteResult = await client.query(voteQuery, [
          voteId,
          voteData.proposalId,
          voteData.userId,
          voteData.vote,
          votingWeight,
          voteData.reasoning,
          trustScore
        ]);

        // Update proposal vote counts
        await this.updateProposalVoteCounts(client, voteData.proposalId);

        await client.query('COMMIT');

        // Log to audit trail
        await this.logAuditTrail('vote', voteId, voteData.userId, {
          action: 'cast_vote',
          proposalId: voteData.proposalId,
          vote: voteData.vote,
          votingWeight,
          trustScore
        });

        return this.mapVote(voteResult.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error casting vote:', error);
      throw error;
    }
  }

  private async updateProposalVoteCounts(client: any, proposalId: string): Promise<void> {
    const updateQuery = `
      UPDATE proposals 
      SET 
        yes_votes = (SELECT COALESCE(SUM(voting_weight), 0) FROM votes WHERE proposal_id = $1 AND vote = 'yes'),
        no_votes = (SELECT COALESCE(SUM(voting_weight), 0) FROM votes WHERE proposal_id = $1 AND vote = 'no'),
        abstain_votes = (SELECT COALESCE(SUM(voting_weight), 0) FROM votes WHERE proposal_id = $1 AND vote = 'abstain'),
        total_weight = (SELECT COALESCE(SUM(voting_weight), 0) FROM votes WHERE proposal_id = $1)
      WHERE id = $1
    `;
    await client.query(updateQuery, [proposalId]);
  }

  async getAuditTrail(entityId?: string, entityType?: AuditTrail['entityType'], limit = 100): Promise<AuditTrail[]> {
    try {
      let query = 'SELECT * FROM audit_trail WHERE 1=1';
      const params: any[] = [];

      if (entityId) {
        query += ' AND entity_id = $' + (params.length + 1);
        params.push(entityId);
      }

      if (entityType) {
        query += ' AND entity_type = $' + (params.length + 1);
        params.push(entityType);
      }

      query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await pool.query(query, params);
      return result.rows.map(this.mapAuditTrail);
    } catch (error) {
      logger.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  private async logAuditTrail(
    entityType: AuditTrail['entityType'],
    entityId: string,
    userId: string,
    data: any,
    ipAddress = '0.0.0.0',
    userAgent = 'system'
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_trail (
          id, action, entity_type, entity_id, user_id, old_value, new_value, 
          timestamp, ip_address, user_agent, reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)
      `;

      await pool.query(query, [
        this.generateId(),
        data.action,
        entityType,
        entityId,
        userId,
        data.oldValue,
        data.newValue,
        ipAddress,
        userAgent,
        data.reason
      ]);
    } catch (error) {
      logger.error('Error logging audit trail:', error);
    }
  }

  private mapCouncilMember(row: any): CouncilMember {
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      trustScore: row.current_trust_score,
      votingWeight: parseFloat(row.voting_weight),
      joinedAt: row.joined_at,
      isActive: row.is_active,
      reputation: row.reputation || 0
    };
  }

  private mapProposal(row: any): Proposal {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      votingStartsAt: row.voting_starts_at,
      votingEndsAt: row.voting_ends_at,
      quorumRequired: parseFloat(row.quorum_required),
      yesVotes: parseFloat(row.yes_votes || 0),
      noVotes: parseFloat(row.no_votes || 0),
      abstainVotes: parseFloat(row.abstain_votes || 0),
      totalWeight: parseFloat(row.total_weight || 0),
      trustScoreThreshold: row.trust_score_threshold,
      tags: row.tags || [],
      impact: row.impact
    };
  }

  private mapVote(row: any): Vote {
    return {
      id: row.id,
      proposalId: row.proposal_id,
      userId: row.user_id,
      vote: row.vote,
      votingWeight: parseFloat(row.voting_weight),
      reasoning: row.reasoning,
      createdAt: row.created_at,
      trustScoreAtTime: row.trust_score_at_time
    };
  }

  private mapAuditTrail(row: any): AuditTrail {
    return {
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      userId: row.user_id,
      oldValue: row.old_value,
      newValue: row.new_value,
      timestamp: row.timestamp,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      reason: row.reason
    };
  }

  private generateId(): string {
    return `council_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const ubuntuCouncilService = new UbuntuCouncilService();
import { Pool } from "../db/pool";
import { logger } from "../utils/logger";

export interface Contributor {
  id: string;
  user_id: string;
  github_username?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  company?: string;
  join_date: Date;
  is_active: boolean;
  contribution_level: "bronze" | "silver" | "gold" | "platinum";
  total_contributions: number;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ComplianceBadge {
  id: string;
  contributor_id: string;
  badge_type: string;
  badge_level: "bronze" | "silver" | "gold" | "platinum";
  badge_name: string;
  badge_description?: string;
  badge_icon_url?: string;
  criteria_met: any;
  earned_at: Date;
  expires_at?: Date;
  is_active: boolean;
}

export interface LeaderboardEntry {
  id: string;
  contributor_id: string;
  leaderboard_type: string;
  team_id?: string;
  rank_position: number;
  score_value: number;
  ranking_period_start: Date;
  ranking_period_end: Date;
  created_at: Date;
}

export interface GamificationEvent {
  id: string;
  contributor_id: string;
  event_type: string;
  event_data: any;
  points_awarded: number;
  governance_impact_score: number;
  motivation_category: string;
  created_at: Date;
}

export class ContributorRecognitionService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool();
  }

  // Contributor Management
  async createContributor(
    contributorData: Partial<Contributor>
  ): Promise<Contributor> {
    logger.info("Creating new contributor", { contributorData });

    const query = `
      INSERT INTO contributors (
        user_id, github_username, email, display_name, avatar_url, 
        bio, location, company, contribution_level, total_contributions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      contributorData.user_id,
      contributorData.github_username,
      contributorData.email,
      contributorData.display_name,
      contributorData.avatar_url,
      contributorData.bio,
      contributorData.location,
      contributorData.company,
      contributorData.contribution_level || "bronze",
      contributorData.total_contributions || 0,
    ];

    try {
      const result = await this.pool.query(query, values);
      const contributor = result.rows[0];

      // Trigger gamification event for new contributor
      await this.createGamificationEvent(
        contributor.id,
        "contributor_joined",
        {
          contribution_level: contributor.contribution_level,
        },
        50,
        "onboarding"
      );

      logger.info("Contributor created successfully", {
        contributorId: contributor.id,
      });
      return contributor;
    } catch (error) {
      logger.error("Failed to create contributor", { error, contributorData });
      throw error;
    }
  }

  async getContributorById(contributorId: string): Promise<Contributor | null> {
    const query = "SELECT * FROM contributors WHERE id = $1";
    const result = await this.pool.query(query, [contributorId]);
    return result.rows[0] || null;
  }

  async getContributorByGithubUsername(
    githubUsername: string
  ): Promise<Contributor | null> {
    const query = "SELECT * FROM contributors WHERE github_username = $1";
    const result = await this.pool.query(query, [githubUsername]);
    return result.rows[0] || null;
  }

  async updateContributorActivity(
    contributorId: string,
    contributionsCount: number = 1
  ): Promise<void> {
    const query = `
      UPDATE contributors 
      SET total_contributions = total_contributions + $1,
          last_activity = NOW(),
          updated_at = NOW()
      WHERE id = $2
    `;

    await this.pool.query(query, [contributionsCount, contributorId]);

    // Create activity event
    await this.createGamificationEvent(
      contributorId,
      "activity_updated",
      {
        contributions_added: contributionsCount,
      },
      contributionsCount * 5,
      "engagement"
    );
  }

  // Badge Management
  async awardBadge(
    contributorId: string,
    badgeType: string,
    badgeLevel: string,
    criteria: any
  ): Promise<ComplianceBadge> {
    logger.info("Awarding badge to contributor", {
      contributorId,
      badgeType,
      badgeLevel,
    });

    // Check if badge already exists
    const existingQuery =
      "SELECT * FROM compliance_badges WHERE contributor_id = $1 AND badge_type = $2";
    const existingResult = await this.pool.query(existingQuery, [
      contributorId,
      badgeType,
    ]);

    if (existingResult.rows.length > 0) {
      // Update existing badge to higher level if applicable
      const existing = existingResult.rows[0];
      if (
        this.getBadgeLevelRank(badgeLevel) >
        this.getBadgeLevelRank(existing.badge_level)
      ) {
        const updateQuery = `
          UPDATE compliance_badges 
          SET badge_level = $1, criteria_met = $2, earned_at = NOW(), is_active = TRUE
          WHERE id = $3
          RETURNING *
        `;
        const updateResult = await this.pool.query(updateQuery, [
          badgeLevel,
          criteria,
          existing.id,
        ]);

        // Create badge upgrade event
        await this.createGamificationEvent(
          contributorId,
          "badge_upgraded",
          {
            badge_type: badgeType,
            old_level: existing.badge_level,
            new_level: badgeLevel,
          },
          100,
          "achievement"
        );

        return updateResult.rows[0];
      }
      return existing;
    }

    // Create new badge
    const badgeName = this.generateBadgeName(badgeType, badgeLevel);
    const badgeDescription = this.generateBadgeDescription(
      badgeType,
      badgeLevel
    );
    const iconUrl = this.getBadgeIconUrl(badgeType, badgeLevel);

    const insertQuery = `
      INSERT INTO compliance_badges (
        contributor_id, badge_type, badge_level, badge_name, 
        badge_description, badge_icon_url, criteria_met
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      contributorId,
      badgeType,
      badgeLevel,
      badgeName,
      badgeDescription,
      iconUrl,
      criteria,
    ];
    const result = await this.pool.query(insertQuery, values);
    const badge = result.rows[0];

    // Create badge earned event
    await this.createGamificationEvent(
      contributorId,
      "badge_earned",
      {
        badge_type: badgeType,
        badge_level: badgeLevel,
        badge_name: badgeName,
      },
      150,
      "achievement"
    );

    logger.info("Badge awarded successfully", { badgeId: badge.id });
    return badge;
  }

  async getContributorBadges(
    contributorId: string
  ): Promise<ComplianceBadge[]> {
    const query =
      "SELECT * FROM compliance_badges WHERE contributor_id = $1 AND is_active = TRUE ORDER BY earned_at DESC";
    const result = await this.pool.query(query, [contributorId]);
    return result.rows;
  }

  // Leaderboard Management
  async generateLeaderboard(
    leaderboardType: string,
    teamId?: string
  ): Promise<LeaderboardEntry[]> {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Use database function to generate rankings
    const functionName = "generate_leaderboard_rankings";
    await this.pool.query(`SELECT ${functionName}($1, $2, $3, $4)`, [
      leaderboardType,
      teamId,
      periodStart.toISOString().split("T")[0],
      periodEnd.toISOString().split("T")[0],
    ]);

    // Retrieve generated rankings
    const query = `
      SELECT le.*, c.display_name, c.avatar_url, c.github_username
      FROM leaderboard_entries le
      JOIN contributors c ON le.contributor_id = c.id
      WHERE le.leaderboard_type = $1 
      AND ($2::text IS NULL OR le.team_id = $2)
      AND le.ranking_period_start = $3
      AND le.ranking_period_end = $4
      ORDER BY le.rank_position ASC
    `;

    const result = await this.pool.query(query, [
      leaderboardType,
      teamId,
      periodStart.toISOString().split("T")[0],
      periodEnd.toISOString().split("T")[0],
    ]);

    return result.rows;
  }

  async getTopContributors(
    limit: number = 10,
    teamId?: string
  ): Promise<any[]> {
    const query = `
      SELECT 
        c.id,
        c.display_name,
        c.avatar_url,
        c.github_username,
        c.contribution_level,
        c.total_contributions,
        COALESCE(AVG(gks.overall_governance_score), 0) as avg_governance_score,
        COUNT(cb.id) as badge_count
      FROM contributors c
      LEFT JOIN governance_kpi_scores gks ON c.id = gks.contributor_id 
        AND gks.score_date >= CURRENT_DATE - INTERVAL '30 days'
      LEFT JOIN compliance_badges cb ON c.id = cb.contributor_id AND cb.is_active = TRUE
      WHERE c.is_active = TRUE
      AND ($2::text IS NULL OR EXISTS (
        SELECT 1 FROM governance_kpi_scores gks2 
        WHERE gks2.contributor_id = c.id AND gks2.team_id = $2
      ))
      GROUP BY c.id
      ORDER BY avg_governance_score DESC, c.total_contributions DESC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limit, teamId]);
    return result.rows;
  }

  // Gamification Events
  async createGamificationEvent(
    contributorId: string,
    eventType: string,
    eventData: any,
    pointsAwarded: number = 0,
    motivationCategory: string = "general"
  ): Promise<GamificationEvent> {
    const governanceImpactScore = this.calculateGovernanceImpact(
      eventType,
      pointsAwarded
    );

    const query = `
      INSERT INTO gamification_events (
        contributor_id, event_type, event_data, points_awarded, 
        governance_impact_score, motivation_category
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      contributorId,
      eventType,
      eventData,
      pointsAwarded,
      governanceImpactScore,
      motivationCategory,
    ];
    const result = await this.pool.query(query, values);

    return result.rows[0];
  }

  async getContributorGamificationEvents(
    contributorId: string,
    limit: number = 50
  ): Promise<GamificationEvent[]> {
    const query = `
      SELECT * FROM gamification_events 
      WHERE contributor_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await this.pool.query(query, [contributorId, limit]);
    return result.rows;
  }

  // Badge Evaluation and Auto-award
  async evaluateAndAwardBadges(
    contributorId: string,
    kpiScores: any
  ): Promise<void> {
    logger.info("Evaluating badges for contributor", {
      contributorId,
      kpiScores,
    });

    // Test Coverage Badge
    if (kpiScores.test_coverage_score >= 95) {
      await this.awardBadge(contributorId, "test_champion", "platinum", {
        test_coverage: kpiScores.test_coverage_score,
        period: "30_days",
      });
    } else if (kpiScores.test_coverage_score >= 85) {
      await this.awardBadge(contributorId, "test_champion", "gold", {
        test_coverage: kpiScores.test_coverage_score,
        period: "30_days",
      });
    } else if (kpiScores.test_coverage_score >= 75) {
      await this.awardBadge(contributorId, "test_champion", "silver", {
        test_coverage: kpiScores.test_coverage_score,
        period: "30_days",
      });
    }

    // Security Expert Badge
    if (kpiScores.security_score >= 95) {
      await this.awardBadge(contributorId, "security_expert", "platinum", {
        security_score: kpiScores.security_score,
        vulnerabilities_fixed: kpiScores.issues_resolved,
      });
    } else if (kpiScores.security_score >= 85) {
      await this.awardBadge(contributorId, "security_expert", "gold", {
        security_score: kpiScores.security_score,
        vulnerabilities_fixed: kpiScores.issues_resolved,
      });
    }

    // Documentation Hero Badge
    if (kpiScores.documentation_score >= 90) {
      await this.awardBadge(contributorId, "documentation_hero", "gold", {
        documentation_score: kpiScores.documentation_score,
      });
    }

    // Remediation Master Badge
    if (
      kpiScores.remediation_success_rate >= 95 &&
      kpiScores.auto_fixes_applied >= 10
    ) {
      await this.awardBadge(contributorId, "remediation_master", "platinum", {
        success_rate: kpiScores.remediation_success_rate,
        auto_fixes: kpiScores.auto_fixes_applied,
      });
    }

    // Consistency Badge (for maintaining high scores over time)
    const contributor = await this.getContributorById(contributorId);
    if (contributor && contributor.contribution_level === "platinum") {
      await this.awardBadge(contributorId, "consistency_champion", "platinum", {
        contribution_level: contributor.contribution_level,
        total_contributions: contributor.total_contributions,
      });
    }
  }

  // Dashboard Data
  async getContributorDashboard(contributorId: string): Promise<any> {
    const contributor = await this.getContributorById(contributorId);
    if (!contributor) {
      throw new Error("Contributor not found");
    }

    const [badges, recentEvents, leaderboardPosition] = await Promise.all([
      this.getContributorBadges(contributorId),
      this.getContributorGamificationEvents(contributorId, 10),
      this.getLeaderboardPosition(contributorId),
    ]);

    // Get KPI scores from last 30 days
    const kpiQuery = `
      SELECT * FROM governance_kpi_scores 
      WHERE contributor_id = $1 
      AND score_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY score_date DESC
      LIMIT 1
    `;
    const kpiResult = await this.pool.query(kpiQuery, [contributorId]);
    const latestKpi = kpiResult.rows[0];

    return {
      contributor,
      badges,
      recentEvents,
      leaderboardPosition,
      latestKpi,
      totalPoints: await this.getTotalPoints(contributorId),
      nextLevelProgress: this.calculateNextLevelProgress(
        contributor,
        latestKpi
      ),
    };
  }

  // Helper Methods
  private getBadgeLevelRank(level: string): number {
    const ranks = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    return ranks[level as keyof typeof ranks] || 0;
  }

  private generateBadgeName(badgeType: string, level: string): string {
    const typeNames = {
      test_champion: "Test Champion",
      security_expert: "Security Expert",
      documentation_hero: "Documentation Hero",
      remediation_master: "Remediation Master",
      consistency_champion: "Consistency Champion",
    };

    return `${level.charAt(0).toUpperCase() + level.slice(1)} ${typeNames[badgeType as keyof typeof typeNames] || badgeType}`;
  }

  private generateBadgeDescription(badgeType: string, level: string): string {
    const descriptions = {
      test_champion: `Achieved ${level === "platinum" ? "95%+" : level === "gold" ? "85%+" : "75%+"} test coverage`,
      security_expert: `Maintained ${level === "platinum" ? "95%+" : "85%+"} security compliance score`,
      documentation_hero: `Achieved 90%+ documentation completeness`,
      remediation_master: `95%+ remediation success rate with 10+ auto-fixes`,
      consistency_champion:
        "Maintained platinum contribution level through consistent excellence",
    };

    return (
      descriptions[badgeType as keyof typeof descriptions] ||
      `Earned ${level} level achievement`
    );
  }

  private getBadgeIconUrl(badgeType: string, level: string): string {
    const colors = {
      bronze: "#CD7F32",
      silver: "#C0C0C0",
      gold: "#FFD700",
      platinum: "#E5E4E2",
    };

    const icons = {
      test_champion: "🧪",
      security_expert: "🛡️",
      documentation_hero: "📚",
      remediation_master: "🔧",
      consistency_champion: "⭐",
    };

    return `https://img.shields.io/badge/${icons[badgeType as keyof typeof icons]}-${level}-${colors[level as keyof typeof colors]}`;
  }

  private calculateGovernanceImpact(
    eventType: string,
    pointsAwarded: number
  ): number {
    const impactMultipliers = {
      badge_earned: 2.0,
      badge_upgraded: 2.5,
      leaderboard_climb: 1.5,
      contributor_joined: 1.0,
      activity_updated: 0.5,
      streak_maintained: 1.8,
      remediation_success: 2.2,
    };

    const multiplier =
      impactMultipliers[eventType as keyof typeof impactMultipliers] || 1.0;
    return Math.round(pointsAwarded * multiplier * 100) / 100;
  }

  private async getLeaderboardPosition(contributorId: string): Promise<any> {
    const query = `
      SELECT 
        leaderboard_type,
        rank_position,
        score_value,
        ranking_period_start,
        ranking_period_end
      FROM leaderboard_entries
      WHERE contributor_id = $1
      AND ranking_period_end >= CURRENT_DATE
      ORDER BY ranking_period_end DESC, rank_position ASC
      LIMIT 5
    `;
    const result = await this.pool.query(query, [contributorId]);
    return result.rows;
  }

  private async getTotalPoints(contributorId: string): Promise<number> {
    const query =
      "SELECT SUM(points_awarded) as total FROM gamification_events WHERE contributor_id = $1";
    const result = await this.pool.query(query, [contributorId]);
    return parseInt(result.rows[0]?.total || "0");
  }

  private calculateNextLevelProgress(
    contributor: Contributor,
    latestKpi: any
  ): any {
    const currentLevel = contributor.contribution_level;
    const currentScore = latestKpi?.overall_governance_score || 0;

    const thresholds = {
      bronze: { min: 0, next: "silver", nextThreshold: 75 },
      silver: { min: 75, next: "gold", nextThreshold: 85 },
      gold: { min: 85, next: "platinum", nextThreshold: 95 },
      platinum: { min: 95, next: null, nextThreshold: null },
    };

    const levelInfo = thresholds[currentLevel as keyof typeof thresholds];

    if (!levelInfo?.next) {
      return { currentLevel, progress: 100, nextLevel: null, pointsNeeded: 0 };
    }

    const progress = Math.min(
      100,
      ((currentScore - levelInfo.min) /
        (levelInfo.nextThreshold! - levelInfo.min)) *
        100
    );
    const pointsNeeded = Math.max(0, levelInfo.nextThreshold! - currentScore);

    return {
      currentLevel,
      progress: Math.round(progress),
      nextLevel: levelInfo.next,
      pointsNeeded: Math.round(pointsNeeded),
    };
  }
}

export default ContributorRecognitionService;

/**
 * Trust Score Service
 * Calculates and manages trust scores for creators and content
 */

export interface TrustScoreMetrics {
  followers: number;
  engagement: number;
  consistency: number;
  authenticity: number;
  growth: number;
}

export interface TrustScoreResult {
  score: number;
  level: string;
  breakdown: {
    authenticity: number;
    consistency: number;
    engagement: number;
    reach: number;
    growth: number;
  };
  recommendations: string[];
}

export interface CreatorProfile {
  id: string;
  platform: string;
  username: string;
  metrics: TrustScoreMetrics;
  lastCalculated: Date;
  trustScore: number;
}

export class TrustScoreService {
  /**
   * Calculate trust score based on metrics
   */
  calculateScore(metrics: TrustScoreMetrics): TrustScoreResult {
    // Weighted calculation
    const authenticityScore = Math.round(metrics.authenticity * 0.35);
    const consistencyScore = Math.round(metrics.consistency * 0.25);
    const engagementScore = Math.round(metrics.engagement * 5);
    const reachScore = Math.round(Math.log10(metrics.followers) * 10);
    const growthScore = Math.round(metrics.growth * 0.5);

    const totalScore = Math.min(100, Math.max(0,
      authenticityScore + consistencyScore + engagementScore + reachScore + growthScore
    ));

    const level = this.getScoreLevel(totalScore);
    const recommendations = this.generateRecommendations(metrics, totalScore);

    return {
      score: totalScore,
      level,
      breakdown: {
        authenticity: authenticityScore,
        consistency: consistencyScore,
        engagement: engagementScore,
        reach: reachScore,
        growth: growthScore
      },
      recommendations
    };
  }

  /**
   * Get trust score level based on score
   */
  private getScoreLevel(score: number): string {
    if (score >= 90) return 'Legendary';
    if (score >= 80) return 'Elite';
    if (score >= 70) return 'Verified';
    if (score >= 60) return 'Rising';
    return 'Emerging';
  }

  /**
   * Generate recommendations based on metrics and score
   */
  private generateRecommendations(metrics: TrustScoreMetrics, score: number): string[] {
    const recommendations: string[] = [];

    if (metrics.engagement < 3) {
      recommendations.push('Increase engagement rate to 3%+ by posting consistently and interacting with your audience');
    }

    if (metrics.consistency < 70) {
      recommendations.push('Improve posting consistency to 70%+ by maintaining a regular schedule');
    }

    if (metrics.authenticity < 80) {
      recommendations.push('Boost authenticity score by being more genuine and transparent in your content');
    }

    if (metrics.followers < 10000 && score < 70) {
      recommendations.push('Focus on growing your audience organically to improve reach metrics');
    }

    if (metrics.growth < 5) {
      recommendations.push('Implement growth strategies to increase monthly follower growth to 5%+');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your trust score is excellent! Keep up the great work.');
    }

    return recommendations;
  }

  /**
   * Calculate trust score for multiple creators
   */
  calculateBulkScores(profiles: CreatorProfile[]): TrustScoreResult[] {
    return profiles.map(profile => this.calculateScore(profile.metrics));
  }

  /**
   * Get trust score trends over time
   */
  getScoreTrends(profileId: string, days: number = 30): Promise<Array<{ date: Date; score: number }>> {
    // In a real implementation, this would query the database
    // For now, return mock data
    const trends: Array<{ date: Date; score: number }> = [];
    const baseDate = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      trends.push({
        date,
        score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
      });
    }

    return Promise.resolve(trends);
  }

  /**
   * Compare trust scores between creators
   */
  compareScores(profiles: CreatorProfile[]): Array<{
    profile: CreatorProfile;
    score: number;
    percentile: number;
  }> {
    const results = profiles.map(profile => ({
      profile,
      score: this.calculateScore(profile.metrics).score,
      percentile: 0
    }));

    // Sort by score and calculate percentiles
    results.sort((a, b) => b.score - a.score);

    results.forEach((result, index) => {
      result.percentile = ((results.length - index) / results.length) * 100;
    });

    return results;
  }

  /**
   * Validate trust score metrics
   */
  validateMetrics(metrics: TrustScoreMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (metrics.followers < 0) {
      errors.push('Followers count cannot be negative');
    }

    if (metrics.engagement < 0 || metrics.engagement > 100) {
      errors.push('Engagement rate must be between 0 and 100');
    }

    if (metrics.consistency < 0 || metrics.consistency > 100) {
      errors.push('Consistency score must be between 0 and 100');
    }

    if (metrics.authenticity < 0 || metrics.authenticity > 100) {
      errors.push('Authenticity score must be between 0 and 100');
    }

    if (metrics.growth < -100 || metrics.growth > 1000) {
      errors.push('Growth rate must be reasonable (-100% to 1000%)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get benchmark data for trust scores
   */
  getBenchmarks(platform?: string): {
    averageScore: number;
    topPerformers: number;
    distribution: { [key: string]: number };
  } {
    // Mock benchmark data
    return {
      averageScore: 72,
      topPerformers: 85,
      distribution: {
        'Emerging': 25,
        'Rising': 35,
        'Verified': 25,
        'Elite': 10,
        'Legendary': 5
      }
    };
  }
}

// Export singleton instance
export const trustScoreService = new TrustScoreService();
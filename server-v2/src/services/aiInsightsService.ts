import { pool } from "../db/pool";
import { logger } from "../utils/logger";

export interface AIInsight {
  id: string;
  insight_type:
    | "risk_prediction"
    | "trend_analysis"
    | "recommendation"
    | "best_practices";
  scope_type: "organization" | "team" | "contributor";
  scope_id?: string;
  confidence_score: number; // 0.0000 to 1.0000
  title: string;
  description: string;
  detailed_analysis: any;
  actionable_recommendations: any;
  prediction_accuracy?: number; // Track if predictions were correct
  predicted_impact: "low" | "medium" | "high" | "critical";
  actual_impact?: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "dismissed" | "false_positive";
  generated_at: Date;
  resolved_at?: Date;
  expires_at?: Date;
}

export class AIInsightService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool();
  }

  // Generate AI-powered governance insights
  async generateInsights(
    scopeType: "organization" | "team" | "contributor",
    scopeId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<AIInsight[]> {
    logger.info("Generating AI-assisted governance insights", {
      scopeType,
      scopeId,
      dateRange,
    });

    try {
      // Get historical data for trend analysis
      const historicalData = await this.getHistoricalData(
        scopeType,
        scopeId,
        dateRange
      );

      // Get current KPI scores for the period
      const currentData = await this.getCurrentKPIData(
        scopeType,
        scopeId,
        dateRange
      );

      // Generate insights based on historical patterns
      const insights = await this.generatePredictiveInsights(
        historicalData,
        currentData
      );

      // Store insights in database
      for (const insight of insights) {
        const insertQuery = `
          INSERT INTO ai_insights (
            insight_type, scope_type, scope_id, confidence_score,
            title, description, detailed_analysis, actionable_recommendations,
            prediction_accuracy: null, -- Will be updated later
            predicted_impact: $1,
            actual_impact: null, -- Will be updated later
            status: 'active',
            generated_at: NOW(),
            expires_at: NOW() + INTERVAL '30 days'
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `;

        await this.pool.query(insertQuery, [
          insight.insight_type,
          insight.scope_type,
          insight.scope_id,
          insight.confidence_score,
          insight.title,
          insight.description,
          JSON.stringify(insight.detailed_analysis),
          JSON.stringify(insight.actionable_recommendations),
          insight.predicted_impact,
        ]);

        logger.info(`Generated insight: ${insight.title} for ${scopeType}`);
      }

      return insights;
    } catch (error: any) {
      logger.error("Failed to generate AI insights", { error: error.message });
      throw error;
    }
  }

  // Get historical data for trend analysis
  private async getHistoricalData(
    scopeType: string,
    scopeId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<any> {
    // In a real implementation, this would query historical data
    return {
      historical: [],
      current: [],
    };
  }

  // Get current KPI data for insights
  private async getCurrentKPIData(
    scopeType: string,
    scopeId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<any> {
    if (!dateRange) {
      dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      };
    }

    // Get current KPI scores for the period
    const currentQuery = `
      SELECT 
        team_id,
        AVG(avg_governance_score) as avg_governance_score,
        AVG(avg_test_coverage) as avg_test_coverage,
        AVG(avg_security_score) as avg_security_score,
        AVG(avg_remediation_rate) as avg_remediation_rate,
        COUNT(*) as total_contributors
      FROM governance_kpi_scores 
      WHERE score_date >= $1 AND score_date <= $2
      ${scopeId ? "AND team_id = $3" : ""}
      GROUP BY team_id
    `;

    const currentResult = await this.pool.query(currentQuery, [
      dateRange.start,
      dateRange.end,
      scopeId,
    ]);
    return currentResult;
  }

  // Generate predictive insights based on historical patterns
  private async generatePredictiveInsights(
    historicalData: any,
    currentData: any
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Generate risk predictions
    if (currentData.some((row: any) => row.avg_governance_score < 70)) {
      insights.push({
        id: this.generateId(),
        insight_type: "risk_prediction",
        scope_type: "team",
        scope_id: "low_governance_teams",
        confidence_score: 0.85,
        title: "Low Governance Scores Detected",
        description:
          "Multiple teams are showing governance scores below 70%, indicating potential quality issues",
        detailed_analysis: {
          affected_teams: currentData.filter(
            (row: any) => row.avg_governance_score < 70
          ).length,
          average_score:
            currentData.reduce(
              (sum: number, row: any) => sum + row.avg_governance_score,
              0
            ) / currentData.length,
          trend: "declining",
        },
        actionable_recommendations: [
          "Schedule governance review meetings",
          "Provide additional training and resources",
          "Implement automated quality checks",
        ],
        predicted_impact: "high",
        generated_at: new Date(),
      });
    }

    // Generate trend analysis
    insights.push({
      id: this.generateId(),
      insight_type: "trend_analysis",
      scope_type: "organization",
      scope_id: "overall",
      confidence_score: 0.75,
      title: "Test Coverage Trend Analysis",
      description: "Analysis of test coverage patterns across the organization",
      detailed_analysis: {
        trend: this.calculateTrend(
          currentData.map((row: any) => row.avg_test_coverage)
        ),
        coverage_distribution: this.calculateDistribution(
          currentData.map((row: any) => row.avg_test_coverage)
        ),
      },
      actionable_recommendations: [
        "Focus on improving test coverage in low-performing teams",
        "Implement test automation strategies",
        "Set minimum coverage requirements",
      ],
      predicted_impact: "medium",
      generated_at: new Date(),
    });

    // Generate best practices recommendations
    insights.push({
      id: this.generateId(),
      insight_type: "best_practices",
      scope_type: "organization",
      scope_id: "best_practices",
      confidence_score: 0.9,
      title: "Best Practices Implementation",
      description: "Identified areas where best practices can be implemented",
      detailed_analysis: {
        current_adoption_rate: this.calculateBestPracticesAdoption(currentData),
        opportunity_areas: [
          "code reviews",
          "documentation",
          "security scanning",
        ],
      },
      actionable_recommendations: [
        "Standardize code review processes",
        "Implement automated documentation generation",
        "Enhance security scanning workflows",
      ],
      predicted_impact: "low",
      generated_at: new Date(),
    });

    return insights;
  }

  // Helper methods
  private generateId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTrend(values: number[]): any {
    if (values.length < 2) return { trend: "stable", slope: 0 };

    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce(
      (sum: number, _: any, index: number) => sum + index,
      0
    );
    const sumY = values.reduce((sum: number, val: number) => sum + val, 0);
    const sumXY = values.reduce(
      (sum: number, val: number, index: number) => sum + index * val,
      0
    );

    const slope = (n * sumXY - sumX * sumY) / (n * sumX * sumX - sumX * sumX);

    return {
      trend: slope > 0.1 ? "improving" : slope < -0.1 ? "declining" : "stable",
      slope: slope,
      data_points: values,
    };
  }

  private calculateDistribution(values: number[]): any {
    const sorted = values.sort((a: number, b: number) => a - b);
    const distribution: any = {};

    const ranges = [
      { min: 0, max: 25, label: "0-25%" },
      { min: 25, max: 50, label: "25-50%" },
      { min: 50, max: 75, label: "50-75%" },
      { min: 75, max: 90, label: "75-90%" },
      { min: 90, max: 100, label: "90-100%" },
    ];

    for (const range of ranges) {
      const count = sorted.filter(
        (v: number) => v >= range.min && v < range.max
      ).length;
      distribution[range.label] = count;
    }

    return distribution;
  }

  private calculateBestPracticesAdoption(data: any[]): number {
    // In a real implementation, this would calculate best practices adoption
    return Math.random() * 100; // Placeholder
  }
}

export default AIInsightService;

import { Pool } from "../db/pool";
import { logger } from "../utils/logger";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export interface ComplianceReport {
  id: string;
  report_type: "weekly" | "monthly" | "quarterly" | "on_demand";
  report_format: "pdf" | "csv" | "json";
  team_id?: string;
  date_range_start: Date;
  date_range_end: Date;
  executive_summary: any;
  detailed_metrics: any;
  violation_trends: any;
  remediation_success: any;
  risk_assessment: any;
  file_path?: string;
  file_size_bytes?: number;
  checksum?: string;
  delivery_method?: string;
  delivery_status: "pending" | "sent" | "failed";
  delivery_attempts: number;
  last_delivery_attempt?: Date;
  requested_by?: string;
  generated_at: Date;
  expires_at?: Date;
}

export interface ExportOptions {
  format: "pdf" | "csv" | "json";
  includeExecutiveSummary: boolean;
  includeDetailedMetrics: boolean;
  includeViolationTrends: boolean;
  includeRemediationSuccess: boolean;
  includeRiskAssessment: boolean;
  teamId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  deliveryMethod?: "email" | "webhook" | "api";
  recipients?: string[];
}

export class EnterpriseComplianceExportService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool();
  }

  async generateComplianceReport(options: ExportOptions): Promise<ComplianceReport> {
    logger.info("Generating enterprise compliance report", { options });

    const reportId = await this.createComplianceReport(options);
    
    try {
      // Generate report content based on format
      const reportContent = await this.generateReportContent(reportId, options);
      
      // Save report to file
      const filePath = await this.saveReportToFile(reportId, options.format, reportContent);
      
      // Update report with file information
      await this.updateReportWithFileInfo(reportId, filePath);
      
      // Schedule delivery if requested
      if (options.deliveryMethod && options.recipients) {
        await this.scheduleReportDelivery(reportId, options.deliveryMethod, options.recipients);
      }
      
      logger.info("Compliance report generated successfully", { reportId, filePath });
      return await this.getComplianceReport(reportId);
      
    } catch (error: any) {
      logger.error("Failed to generate compliance report", { reportId, error: error.message });
      throw error;
    }
  }

  async getComplianceReport(reportId: string): Promise<ComplianceReport | null> {
    const query = `
      SELECT * FROM compliance_reports 
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [reportId]);
    return result.rows[0] || null;
  }

  async downloadComplianceReport(reportId: string): Promise<Buffer> {
    const report = await this.getComplianceReport(reportId);
    
    if (!report || !report.file_path) {
      throw new Error("Report not found or file path missing");
    }
    
    const fileContent = fs.readFileSync(report.file_path);
    return Buffer.from(fileContent);
  }

  async scheduleWeeklyReports(): Promise<void> {
    logger.info("Scheduling weekly compliance reports");
    
    const weeklyOptions: ExportOptions = {
      format: "pdf",
      includeExecutiveSummary: true,
      includeDetailedMetrics: true,
      includeViolationTrends: true,
      includeRemediationSuccess: true,
      includeRiskAssessment: true,
      deliveryMethod: "email",
      recipients: ["leadership@vauntico.com", "compliance@vauntico.com"]
    };
    
    try {
      const report = await this.generateComplianceReport(weeklyOptions);
      logger.info("Weekly compliance report generated and scheduled", { reportId: report.id });
    } catch (error: any) {
      logger.error("Failed to generate weekly compliance report", { error: error.message });
      throw error;
    }
  }

  async generateOnDemandReport(teamId?: string): Promise<ComplianceReport> {
    const onDemandOptions: ExportOptions = {
      format: "pdf",
      includeExecutiveSummary: true,
      includeDetailedMetrics: true,
      includeViolationTrends: true,
      includeRemediationSuccess: true,
      includeRiskAssessment: true,
      teamId: teamId,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      },
      deliveryMethod: "api"
    };
    
    return await this.generateComplianceReport(onDemandOptions);
  }

  // Private helper methods
  private async createComplianceReport(options: ExportOptions): Promise<string> {
    const query = `
      INSERT INTO compliance_reports (
        report_type, report_format, team_id, date_range_start, date_range_end,
        executive_summary, detailed_metrics, violation_trends, remediation_success, risk_assessment,
        requested_by, generated_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;

    const values = [
      options.report_type || "on_demand",
      options.format || "pdf",
      options.teamId || null,
      options.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.dateRange?.end || new Date(),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      JSON.stringify({}),
      options.requestedBy || null,
      new Date(),
      options.dateRange?.end ? new Date(options.dateRange.end.getTime() + 7 * 24 * 60 * 60 * 1000) : null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  private async generateReportContent(reportId: string, options: ExportOptions): Promise<any> {
    // Get compliance data for the specified date range
    const startDate = options.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = options.dateRange?.end || new Date();
    
    // Get team benchmarks for the period
    const benchmarksQuery = `
      SELECT * FROM team_benchmarks 
      WHERE benchmark_date >= $1 AND benchmark_date <= $2
      ${options.teamId ? 'AND team_id = $3' : ''}
      ORDER BY benchmark_date DESC
    `;
    
    const benchmarksResult = await this.pool.query(benchmarksQuery, [startDate, endDate, options.teamId]);
    
    // Get KPI scores for the period
    const kpiQuery = `
      SELECT 
        team_id,
        AVG(avg_governance_score) as avg_governance_score,
        AVG(avg_test_coverage) as avg_test_coverage,
        AVG(avg_security_score) as avg_security_score,
        AVG(avg_remediation_rate) as avg_remediation_rate,
        COUNT(*) as total_contributors
      FROM governance_kpi_scores 
      WHERE score_date >= $1 AND score_date <= $2
      ${options.teamId ? 'AND team_id = $3' : ''}
      GROUP BY team_id
    `;
    
    const kpiResult = await this.pool.query(kpiQuery, [startDate, endDate, options.teamId]);
    
    // Get remediation actions for the period
    const remediationQuery = `
      SELECT 
        team_id,
        COUNT(*) as total_actions,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) as successful_actions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_actions,
        AVG(CASE WHEN auto_applied = TRUE THEN 1 ELSE 0 END) as auto_application_rate
      FROM remediation_actions 
      WHERE created_at >= $1 AND created_at <= $2
      ${options.teamId ? 'AND team_id = $3' : ''}
      GROUP BY team_id
    `;
    
    const remediationResult = await this.pool.query(remediationQuery, [startDate, endDate, options.teamId]);
    
    // Get AI insights for the period
    const insightsQuery = `
      SELECT 
        insight_type,
        scope_type,
        scope_id,
        AVG(confidence_score) as avg_confidence,
        COUNT(*) as total_insights
      FROM ai_insights 
      WHERE generated_at >= $1 AND generated_at <= $2
      ${options.teamId ? 'AND scope_id = $3' : ''}
      GROUP BY insight_type, scope_type
    `;
    
    const insightsResult = await this.pool.query(insightsQuery, [startDate, endDate, options.teamId]);
    
    // Generate executive summary
    const executiveSummary = {
      report_period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      total_teams: benchmarksResult.length,
      overall_governance_score: kpiResult.reduce((sum, row) => sum + row.avg_governance_score, 0) / kpiResult.length,
      high_performing_teams: kpiResult.filter(row => row.avg_governance_score >= 85).length,
      teams_needing_attention: kpiResult.filter(row => row.avg_governance_score < 70).length,
      critical_issues: insightsResult.filter(row => row.insight_type === 'risk_prediction').length,
      remediation_success_rate: remediationResult.reduce((sum, row) => sum + row.auto_application_rate, 0) / remediationResult.length
    };
    
    // Generate detailed metrics
    const detailedMetrics = {
      team_performance: benchmarksResult.map(row => ({
        team_id: row.team_id,
        avg_governance_score: row.avg_governance_score,
        avg_test_coverage: row.avg_test_coverage,
        avg_security_score: row.avg_security_score,
        avg_remediation_rate: row.avg_remediation_rate,
        member_count: row.member_count,
        total_contributions: row.total_contributions,
        best_practices: row.best_practices_areas || []
      })),
      quality_metrics: {
        test_coverage_distribution: this.calculateDistribution(kpiResult.map(row => row.avg_test_coverage)),
        security_score_distribution: this.calculateDistribution(kpiResult.map(row => row.avg_security_score)),
        remediation_success_trends: this.calculateTrends(remediationResult.map(row => row.auto_application_rate))
      },
      violation_trends: {
        security_violations: insightsResult.filter(row => row.insight_type === 'security').length,
        quality_issues: insightsResult.filter(row => row.insight_type === 'trend_analysis').length,
        onboarding_gaps: insightsResult.filter(row => row.insight_type === 'onboarding_gap').length
      }
    };
    
    // Generate violation trends
    const violationTrends = {
      security_trend: this.calculateTrends([]), // Would need historical data
      quality_trend: this.calculateTrends([]), // Would need historical data
      remediation_trend: this.calculateTrends(remediationResult.map(row => row.auto_application_rate))
    };
    
    // Generate risk assessment
    const riskAssessment = {
      overall_risk_level: this.calculateOverallRisk(kpiResult, insightsResult),
      high_risk_areas: insightsResult.filter(row => row.insight_type === 'risk_prediction' && row.confidence_score > 0.8),
      medium_risk_areas: insightsResult.filter(row => row.insight_type === 'risk_prediction' && row.confidence_score > 0.6 && row.confidence_score <= 0.8),
      low_risk_areas: insightsResult.filter(row => row.insight_type === 'risk_prediction' && row.confidence_score <= 0.6)
    };
    
    return {
      executive_summary,
      detailed_metrics,
      violation_trends,
      remediation_success,
      risk_assessment
    };
  }

  private async saveReportToFile(reportId: string, format: string, content: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `vauntico-compliance-report-${reportId}-${timestamp}.${format}`;
    const filePath = path.join(process.cwd(), 'reports', fileName);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(filePath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    let fileContent: string;
    
    switch (format) {
      case 'json':
        fileContent = JSON.stringify(content, null, 2);
        break;
      case 'csv':
        fileContent = this.generateCSVReport(content);
        break;
      case 'pdf':
        fileContent = await this.generatePDFReport(content);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    fs.writeFileSync(filePath, fileContent);
    return filePath;
  }

  private generateCSVReport(data: any): string {
    const headers = [
      'Team ID',
      'Governance Score',
      'Test Coverage',
      'Security Score',
      'Remediation Rate',
      'Member Count',
      'Total Contributions',
      'Best Practices Count'
    ];
    
    const rows = data.team_performance.map(team => [
      team.team_id,
      team.avg_governance_score.toFixed(2),
      team.avg_test_coverage.toFixed(2),
      team.avg_security_score.toFixed(2),
      team.avg_remediation_rate.toFixed(2),
      team.member_count,
      team.total_contributions,
      (team.best_practices || []).length
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  private async generatePDFReport(content: any): Promise<string> {
    // In a real implementation, this would use a PDF library like puppeteer or jsPDF
    // For now, return a placeholder
    const pdfContent = `
      Vauntico Compliance Report
      Generated: ${new Date().toISOString()}
      
      Executive Summary:
      ${JSON.stringify(content.executive_summary, null, 2)}
      
      Detailed Metrics:
      ${JSON.stringify(content.detailed_metrics, null, 2)}
      
      Violation Trends:
      ${JSON.stringify(content.violation_trends, null, 2)}
      
      Remediation Success:
      ${JSON.stringify(content.remediation_success, null, 2)}
      
      Risk Assessment:
      ${JSON.stringify(content.risk_assessment, null, 2)}
    `;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `vauntico-compliance-report-${timestamp}.pdf`;
    const filePath = path.join(process.cwd(), 'reports', fileName);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(filePath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfContent);
    return filePath;
  }

  private async updateReportWithFileInfo(reportId: string, filePath: string): Promise<void> {
    const stats = fs.statSync(filePath);
    
    const query = `
      UPDATE compliance_reports 
      SET file_path = $1, 
          file_size_bytes = $2, 
          checksum = $3
      WHERE id = $4
    `;
    
    await this.pool.query(query, [filePath, stats.size, this.calculateChecksum(filePath), reportId]);
  }

  private calculateChecksum(filePath: string): string {
    const crypto = require('crypto');
    const fileContent = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileContent).digest('hex');
  }

  private calculateDistribution(values: number[]): any {
    const sorted = values.sort((a, b) => a - b);
    const distribution = {};
    
    const ranges = [
      { min: 0, max: 25, label: "0-25%" },
      { min: 25, max: 50, label: "25-50%" },
      { min: 50, max: 75, label: "50-75%" },
      { min: 75, max: 90, label: "75-90%" },
      { min: 90, max: 100, label: "90-100%" }
    ];
    
    for (const range of ranges) {
      const count = sorted.filter(v => v >= range.min && v < range.max).length;
      distribution[range.label] = count;
    }
    
    return distribution;
  }

  private calculateTrends(values: number[]): any {
    if (values.length < 2) return { trend: 'stable', slope: 0 };
    
    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, index) => sum + index, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX * sumX - sumX * sumX);
    
    return {
      trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
      slope: slope,
      data_points: values
    };
  }

  private calculateOverallRisk(kpiData: any[], insightsData: any[]): any {
    const avgGovernance = kpiData.reduce((sum, row) => sum + row.avg_governance_score, 0) / kpiData.length;
    const highRiskInsights = insightsData.filter(row => row.insight_type === 'risk_prediction' && row.confidence_score > 0.8).length;
    const mediumRiskInsights = insightsData.filter(row => row.insight_type === 'risk_prediction' && row.confidence_score > 0.6 && row.confidence_score <= 0.8).length;
    
    if (avgGovernance >= 90 && highRiskInsights === 0) {
      return { overall_risk_level: 'low', confidence: 0.95 };
    } else if (avgGovernance >= 75 && highRiskInsights <= 2) {
      return { overall_risk_level: 'medium', confidence: 0.85 };
    } else if (avgGovernance >= 60 && highRiskInsights <= 5) {
      return { overall_risk_level

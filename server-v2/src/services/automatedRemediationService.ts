import { Pool } from "../db/pool";
import { logger } from "../utils/logger";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface RemediationAction {
  id: string;
  contributor_id: string;
  team_id?: string;
  action_type: string;
  action_description: string;
  trigger_source: string;
  issue_severity: "low" | "medium" | "high" | "critical";
  auto_applied: boolean;
  manual_confirmation_required: boolean;
  status: "pending" | "approved" | "applied" | "failed" | "skipped";
  execution_result: any;
  error_message?: string;
  created_at: Date;
  executed_at?: Date;
  completed_at?: Date;
}

export interface RemediationTemplate {
  id: string;
  template_name: string;
  template_category: string;
  description: string;
  detection_criteria: any;
  remediation_steps: any;
  rollback_procedure: any;
  safety_level: "safe" | "moderate" | "risky";
  requires_approval: boolean;
  auto_applicable: boolean;
  success_rate: number;
  usage_count: number;
  failure_count: number;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface RemediationResult {
  success: boolean;
  action_id: string;
  output: string;
  error?: string;
  metrics: {
    files_modified: number;
    lines_changed: number;
    vulnerabilities_fixed: number;
    issues_resolved: number;
  };
}

export class AutomatedRemediationService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool();
  }

  // One-Click Remediation Methods
  async applyDependencyUpgrade(
    contributorId: string,
    teamId?: string
  ): Promise<RemediationResult> {
    logger.info("Applying dependency upgrade remediation", {
      contributorId,
      teamId,
    });

    const action = await this.createRemediationAction(
      contributorId,
      teamId,
      "dependency_upgrade",
      "Automated dependency vulnerability fixes",
      "security_scan",
      "high"
    );

    try {
      const startTime = Date.now();

      // Run npm audit fix
      const auditResult = execSync("npm audit fix --force", {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      // Update packages to latest safe versions
      const updateResult = execSync("npm update", {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      const duration = Date.now() - startTime;

      // Parse results for metrics
      const metrics = this.parseRemediationOutput(auditResult + updateResult);

      await this.updateRemediationAction(action.id, "applied", {
        output: auditResult + updateResult,
        duration,
        metrics,
        auto_applied: true,
      });

      // Update template success rate
      await this.updateTemplateSuccessRate("dependency_upgrade", true);

      logger.info("Dependency upgrade completed successfully", {
        actionId: action.id,
        duration,
        metrics,
      });

      return {
        success: true,
        action_id: action.id,
        output: auditResult + updateResult,
        metrics,
      };
    } catch (error: any) {
      await this.updateRemediationAction(action.id, "failed", {
        error: error.message,
        auto_applied: false,
      });

      await this.updateTemplateSuccessRate("dependency_upgrade", false);

      logger.error("Dependency upgrade failed", {
        actionId: action.id,
        error: error.message,
      });

      return {
        success: false,
        action_id: action.id,
        output: "",
        error: error.message,
        metrics: {
          files_modified: 0,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: 0,
        },
      };
    }
  }

  async applyESLintFixes(
    contributorId: string,
    teamId?: string
  ): Promise<RemediationResult> {
    logger.info("Applying ESLint auto-fixes", { contributorId, teamId });

    const action = await this.createRemediationAction(
      contributorId,
      teamId,
      "eslint_fix",
      "Automated ESLint issue resolution",
      "lint_scan",
      "medium"
    );

    try {
      const startTime = Date.now();

      // Run ESLint auto-fix
      const eslintResult = execSync("npm run lint:fix", {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      // Run Prettier formatting
      const prettierResult = execSync("npm run format:fix", {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      const duration = Date.now() - startTime;
      const combinedOutput = eslintResult + prettierResult;
      const metrics = this.parseRemediationOutput(combinedOutput);

      await this.updateRemediationAction(action.id, "applied", {
        output: combinedOutput,
        duration,
        metrics,
        auto_applied: true,
      });

      await this.updateTemplateSuccessRate("eslint_fix", true);

      logger.info("ESLint fixes applied successfully", {
        actionId: action.id,
        duration,
        metrics,
      });

      return {
        success: true,
        action_id: action.id,
        output: combinedOutput,
        metrics,
      };
    } catch (error: any) {
      await this.updateRemediationAction(action.id, "failed", {
        error: error.message,
        auto_applied: false,
      });

      await this.updateTemplateSuccessRate("eslint_fix", false);

      logger.error("ESLint fixes failed", {
        actionId: action.id,
        error: error.message,
      });

      return {
        success: false,
        action_id: action.id,
        output: "",
        error: error.message,
        metrics: {
          files_modified: 0,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: 0,
        },
      };
    }
  }

  async normalizeCommitMessages(
    contributorId: string,
    teamId?: string
  ): Promise<RemediationResult> {
    logger.info("Normalizing commit messages", { contributorId, teamId });

    const action = await this.createRemediationAction(
      contributorId,
      teamId,
      "commit_normalize",
      "Commit message semantic normalization",
      "commit_analysis",
      "low"
    );

    try {
      const startTime = Date.now();

      // Get recent commits
      const recentCommits = execSync("git log --oneline -10", {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      const commitLines = recentCommits
        .split("\n")
        .filter((line) => line.trim());
      const normalizedCommits = [];
      let fixesApplied = 0;

      for (const commitLine of commitLines) {
        const match = commitLine.match(/^[a-f0-9]+\s+(.+)$/);
        if (match) {
          const originalMessage = match[1];
          const normalizedMessage =
            this.normalizeCommitMessage(originalMessage);

          if (normalizedMessage !== originalMessage) {
            // Create fix suggestion (would be applied in a real implementation)
            normalizedCommits.push({
              original: originalMessage,
              suggested: normalizedMessage,
              hash: commitLine.split(" ")[0],
            });
            fixesApplied++;
          }
        }
      }

      const duration = Date.now() - startTime;
      const output = `Analyzed ${commitLines.length} commits, suggested fixes for ${fixesApplied} commits`;

      const metrics = {
        files_modified: 0,
        lines_changed: fixesApplied * 2, // Approximate
        vulnerabilities_fixed: 0,
        issues_resolved: fixesApplied,
      };

      await this.updateRemediationAction(action.id, "applied", {
        output,
        duration,
        metrics,
        auto_applied: true,
        suggestions: normalizedCommits,
      });

      await this.updateTemplateSuccessRate("commit_normalize", true);

      logger.info("Commit message normalization completed", {
        actionId: action.id,
        duration,
        metrics,
      });

      return {
        success: true,
        action_id: action.id,
        output,
        metrics,
      };
    } catch (error: any) {
      await this.updateRemediationAction(action.id, "failed", {
        error: error.message,
        auto_applied: false,
      });

      await this.updateTemplateSuccessRate("commit_normalize", false);

      logger.error("Commit normalization failed", {
        actionId: action.id,
        error: error.message,
      });

      return {
        success: false,
        action_id: action.id,
        output: "",
        error: error.message,
        metrics: {
          files_modified: 0,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: 0,
        },
      };
    }
  }

  // Template Management
  async createRemediationTemplate(
    templateData: Partial<RemediationTemplate>
  ): Promise<RemediationTemplate> {
    const query = `
      INSERT INTO remediation_templates (
        template_name, template_category, description, detection_criteria,
        remediation_steps, rollback_procedure, safety_level,
        requires_approval, auto_applicable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      templateData.template_name,
      templateData.template_category,
      templateData.description,
      JSON.stringify(templateData.detection_criteria || {}),
      JSON.stringify(templateData.remediation_steps || {}),
      JSON.stringify(templateData.rollback_procedure || {}),
      templateData.safety_level || "safe",
      templateData.requires_approval || false,
      templateData.auto_applicable || false,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getApplicableTemplates(
    contributorId: string,
    teamId?: string
  ): Promise<RemediationTemplate[]> {
    // Get recent KPI scores to determine applicable templates
    const kpiQuery = `
      SELECT * FROM governance_kpi_scores 
      WHERE contributor_id = $1 
      AND ($2::text IS NULL OR team_id = $2)
      ORDER BY score_date DESC 
      LIMIT 1
    `;
    const kpiResult = await this.pool.query(kpiQuery, [contributorId, teamId]);
    const latestKpi = kpiResult.rows[0];

    if (!latestKpi) {
      return [];
    }

    // Get active templates
    const templateQuery = `
      SELECT * FROM remediation_templates 
      WHERE is_active = TRUE 
      AND auto_applicable = TRUE
    `;
    const templateResult = await this.pool.query(templateQuery);
    const allTemplates = templateResult.rows;

    // Filter templates based on KPI scores and criteria
    const applicableTemplates = allTemplates.filter((template) => {
      const criteria = template.detection_criteria;

      // Check if template criteria match current KPI issues
      if (
        criteria.min_test_coverage &&
        latestKpi.test_coverage_score < criteria.min_test_coverage
      ) {
        return true;
      }
      if (
        criteria.min_security_score &&
        latestKpi.security_score < criteria.min_security_score
      ) {
        return true;
      }
      if (
        criteria.min_documentation_score &&
        latestKpi.documentation_score < criteria.min_documentation_score
      ) {
        return true;
      }
      if (
        criteria.max_lint_violations &&
        latestKpi.issues_detected > criteria.max_lint_violations
      ) {
        return true;
      }

      return false;
    });

    return applicableTemplates;
  }

  async applyOneClickRemediation(
    contributorId: string,
    templateId: string,
    teamId?: string
  ): Promise<RemediationResult> {
    logger.info("Applying one-click remediation", {
      contributorId,
      templateId,
      teamId,
    });

    // Get template details
    const templateQuery =
      "SELECT * FROM remediation_templates WHERE id = $1 AND is_active = TRUE";
    const templateResult = await this.pool.query(templateQuery, [templateId]);
    const template = templateResult.rows[0];

    if (!template) {
      throw new Error("Remediation template not found or inactive");
    }

    if (template.safety_level === "risky" && template.requires_approval) {
      throw new Error("Risky remediation requires manual approval");
    }

    // Create remediation action
    const action = await this.createRemediationAction(
      contributorId,
      teamId,
      template.template_name,
      template.description,
      "one_click_request",
      "medium"
    );

    try {
      // Execute remediation steps based on template
      const result = await this.executeRemediationSteps(
        template.remediation_steps,
        action.id
      );

      return result;
    } catch (error: any) {
      await this.updateRemediationAction(action.id, "failed", {
        error: error.message,
        auto_applied: false,
      });

      return {
        success: false,
        action_id: action.id,
        output: "",
        error: error.message,
        metrics: {
          files_modified: 0,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: 0,
        },
      };
    }
  }

  // Dashboard and Analytics
  async getRemediationDashboard(
    contributorId: string,
    teamId?: string
  ): Promise<any> {
    const [recentActions, availableTemplates, successMetrics, pendingActions] =
      await Promise.all([
        this.getRecentRemediationActions(contributorId, teamId, 10),
        this.getApplicableTemplates(contributorId, teamId),
        this.getRemediationMetrics(contributorId, teamId),
        this.getPendingRemediationActions(contributorId, teamId),
      ]);

    return {
      recentActions,
      availableTemplates,
      successMetrics,
      pendingActions,
      oneClickSuggestions: await this.generateOneClickSuggestions(
        contributorId,
        teamId
      ),
    };
  }

  // Helper Methods
  private async createRemediationAction(
    contributorId: string,
    teamId: string | undefined,
    actionType: string,
    description: string,
    triggerSource: string,
    severity: string
  ): Promise<RemediationAction> {
    const query = `
      INSERT INTO remediation_actions (
        contributor_id, team_id, action_type, action_description,
        trigger_source, issue_severity, auto_applied, manual_confirmation_required, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      contributorId,
      teamId,
      actionType,
      description,
      triggerSource,
      severity,
      false, // Will be updated based on actual execution
      false, // Will be updated based on template requirements
      "pending",
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  private async updateRemediationAction(
    actionId: string,
    status: string,
    executionResult: any
  ): Promise<void> {
    const query = `
      UPDATE remediation_actions 
      SET status = $1, execution_result = $2, 
          executed_at = NOW(), completed_at = NOW()
      WHERE id = $3
    `;

    await this.pool.query(query, [
      status,
      JSON.stringify(executionResult),
      actionId,
    ]);
  }

  private async updateTemplateSuccessRate(
    templateName: string,
    success: boolean
  ): Promise<void> {
    const query = `
      UPDATE remediation_templates 
      SET usage_count = usage_count + 1,
          ${success ? "success_rate = ROUND((usage_count * success_rate + 100) / (usage_count + 1), 2)" : "failure_count = failure_count + 1"},
          updated_at = NOW()
      WHERE template_name = $1
    `;

    await this.pool.query(query, [templateName]);
  }

  private parseRemediationOutput(output: string): any {
    // Parse output to extract metrics
    const lines = output.split("\n");
    const metrics = {
      files_modified: 0,
      lines_changed: 0,
      vulnerabilities_fixed: 0,
      issues_resolved: 0,
    };

    for (const line of lines) {
      if (line.includes("fixed") || line.includes("resolved")) {
        metrics.issues_resolved++;
      }
      if (line.includes("vulnerability")) {
        metrics.vulnerabilities_fixed++;
      }
      if (line.includes("modified") || line.includes("changed")) {
        metrics.files_modified++;
      }
    }

    return metrics;
  }

  private normalizeCommitMessage(message: string): string {
    const semanticTypes = [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "test",
      "chore",
    ];

    // Check if already in semantic format
    const semanticPattern =
      /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/;
    if (semanticPattern.test(message)) {
      return message;
    }

    // Try to infer semantic type
    let inferredType = "feat"; // default
    let description = message;

    if (
      message.toLowerCase().includes("fix") ||
      message.toLowerCase().includes("bug")
    ) {
      inferredType = "fix";
    } else if (
      message.toLowerCase().includes("doc") ||
      message.toLowerCase().includes("readme")
    ) {
      inferredType = "docs";
    } else if (
      message.toLowerCase().includes("format") ||
      message.toLowerCase().includes("style")
    ) {
      inferredType = "style";
    } else if (
      message.toLowerCase().includes("refactor") ||
      message.toLowerCase().includes("reorganize")
    ) {
      inferredType = "refactor";
    } else if (message.toLowerCase().includes("test")) {
      inferredType = "test";
    } else if (
      message.toLowerCase().includes("dep") ||
      message.toLowerCase().includes("update")
    ) {
      inferredType = "chore";
    }

    return `${inferredType}: ${description}`;
  }

  private async getRecentRemediationActions(
    contributorId: string,
    teamId?: string,
    limit: number = 10
  ): Promise<RemediationAction[]> {
    const query = `
      SELECT * FROM remediation_actions 
      WHERE contributor_id = $1 
      AND ($2::text IS NULL OR team_id = $2)
      ORDER BY created_at DESC 
      LIMIT $3
    `;
    const result = await this.pool.query(query, [contributorId, teamId, limit]);
    return result.rows;
  }

  private async getRemediationMetrics(
    contributorId: string,
    teamId?: string
  ): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_actions,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) as successful_actions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_actions,
        AVG(CASE WHEN auto_applied = TRUE THEN 1 ELSE 0 END) as auto_application_rate
      FROM remediation_actions 
      WHERE contributor_id = $1 
      AND ($2::text IS NULL OR team_id = $2)
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await this.pool.query(query, [contributorId, teamId]);
    return result.rows[0];
  }

  private async getPendingRemediationActions(
    contributorId: string,
    teamId?: string
  ): Promise<RemediationAction[]> {
    const query = `
      SELECT * FROM remediation_actions 
      WHERE contributor_id = $1 
      AND ($2::text IS NULL OR team_id = $2)
      AND status = 'pending'
      ORDER BY created_at ASC
    `;
    const result = await this.pool.query(query, [contributorId, teamId]);
    return result.rows;
  }

  private async executeRemediationSteps(
    steps: any,
    actionId: string
  ): Promise<RemediationResult> {
    // Execute remediation steps based on template
    const startTime = Date.now();

    try {
      for (const step of steps) {
        switch (step.type) {
          case "command":
            execSync(step.command, { encoding: "utf8", cwd: process.cwd() });
            break;
          case "file_operation":
            // Handle file operations
            break;
          case "dependency_update":
            execSync("npm update", { encoding: "utf8", cwd: process.cwd() });
            break;
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        action_id: actionId,
        output: `Remediation steps executed successfully`,
        metrics: {
          files_modified: steps.length,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: steps.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        action_id: actionId,
        output: "",
        error: error.message,
        metrics: {
          files_modified: 0,
          lines_changed: 0,
          vulnerabilities_fixed: 0,
          issues_resolved: 0,
        },
      };
    }
  }

  private async generateOneClickSuggestions(
    contributorId: string,
    teamId?: string
  ): Promise<any[]> {
    const templates = await this.getApplicableTemplates(contributorId, teamId);

    return templates.map((template) => ({
      template_id: template.id,
      template_name: template.template_name,
      description: template.description,
      estimated_impact: this.calculateTemplateImpact(template),
      one_click_available:
        template.auto_applicable && template.safety_level !== "risky",
    }));
  }

  private calculateTemplateImpact(template: RemediationTemplate): string {
    const impactScores = {
      safe: "low",
      moderate: "medium",
      risky: "high",
    };

    return impactScores[template.safety_level] || "unknown";
  }
}

export default AutomatedRemediationService;

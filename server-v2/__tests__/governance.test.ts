import request from "supertest";
import express from "express";
import ContributorRecognitionService from "../src/services/contributorRecognitionService";
import AutomatedRemediationService from "../src/services/automatedRemediationService";
import AIInsightService from "../src/services/aiInsightsService";
import { EnterpriseComplianceExportService } from "../src/services/enterpriseComplianceExportService";
import governanceRoutes from "../src/routes/governance";
import { logger } from "../src/utils/logger";

// Mock the services
jest.mock("../src/services/contributorRecognitionService");
jest.mock("../src/services/automatedRemediationService");
jest.mock("../src/services/aiInsightsService");
jest.mock("../src/services/enterpriseComplianceExportService");

const mockContributorService =
  ContributorRecognitionService as jest.MockedClass<
    typeof ContributorRecognitionService
  >;
const mockRemediationService = AutomatedRemediationService as jest.MockedClass<
  typeof AutomatedRemediationService
>;
const mockAIInsightService = AIInsightService as jest.MockedClass<
  typeof AIInsightService
>;
const mockComplianceExportService =
  EnterpriseComplianceExportService as jest.MockedClass<
    typeof EnterpriseComplianceExportService
  >;

describe("Governance API Routes", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/governance", governanceRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Contributor Recognition", () => {
    describe("GET /api/v1/governance/contributors", () => {
      it("should return contributors list", async () => {
        const response = await request(app)
          .get("/api/v1/governance/contributors")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contributors).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(Array.isArray(response.body.data.contributors)).toBe(true);
      });

      it("should filter contributors by team", async () => {
        const response = await request(app)
          .get("/api/v1/governance/contributors?team_id=frontend")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contributors).toBeDefined();
      });

      it("should filter contributors by level", async () => {
        const response = await request(app)
          .get("/api/v1/governance/contributors?level=platinum")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contributors).toBeDefined();
      });

      it("should limit results", async () => {
        const response = await request(app)
          .get("/api/v1/governance/contributors?limit=5")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contributors.length).toBeLessThanOrEqual(5);
      });
    });

    describe("GET /api/v1/governance/contributors/:id/dashboard", () => {
      it("should return contributor dashboard", async () => {
        const mockDashboard = {
          contributor: {
            id: "contributor_001",
            user_id: "user_123",
            github_username: "john-doe",
            display_name: "John Doe",
            avatar_url: "https://example.com/avatar.jpg",
            bio: "Test bio",
            location: "Test location",
            company: "Test Company",
            join_date: new Date(),
            is_active: true,
            contribution_level: "platinum",
            total_contributions: 245,
            last_activity: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
          badges: [],
          recentEvents: [],
          leaderboardPosition: [],
          latestKpi: {},
          totalPoints: 1250,
          nextLevelProgress: {
            currentLevel: "platinum",
            progress: 100,
            nextLevel: null,
            pointsNeeded: 0,
          },
        };

        mockContributorService.prototype.getContributorDashboard.mockResolvedValue(
          mockDashboard
        );

        const response = await request(app)
          .get("/api/v1/governance/contributors/contributor_001/dashboard")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockDashboard);
        expect(
          mockContributorService.prototype.getContributorDashboard
        ).toHaveBeenCalledWith("contributor_001");
      });

      it("should handle contributor not found", async () => {
        mockContributorService.prototype.getContributorDashboard.mockRejectedValue(
          new Error("Contributor not found")
        );

        const response = await request(app)
          .get("/api/v1/governance/contributors/nonexistent/dashboard")
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(
          "Failed to retrieve contributor dashboard"
        );
      });
    });

    describe("POST /api/v1/governance/contributors", () => {
      it("should create new contributor", async () => {
        const contributorData = {
          user_id: "user_123",
          github_username: "john-doe",
          display_name: "John Doe",
          contribution_level: "bronze",
        };

        const mockContributor = {
          id: "contributor_001",
          ...contributorData,
          created_at: new Date().toISOString(),
        };

        mockContributorService.prototype.createContributor.mockResolvedValue(
          mockContributor
        );

        const response = await request(app)
          .post("/api/v1/governance/contributors")
          .send(contributorData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockContributor);
        expect(
          mockContributorService.prototype.createContributor
        ).toHaveBeenCalledWith(contributorData);
      });

      it("should handle creation errors", async () => {
        mockContributorService.prototype.createContributor.mockRejectedValue(
          new Error("Database error")
        );

        const response = await request(app)
          .post("/api/v1/governance/contributors")
          .send({})
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Failed to create contributor");
      });
    });

    describe("POST /api/v1/governance/contributors/:id/badges", () => {
      it("should award badge to contributor", async () => {
        const badgeData = {
          badge_type: "test_champion",
          badge_level: "platinum",
          criteria: { test_coverage: 95 },
        };

        const mockBadge = {
          id: "badge_001",
          contributor_id: "contributor_001",
          ...badgeData,
          earned_at: new Date().toISOString(),
        };

        mockContributorService.prototype.awardBadge.mockResolvedValue(
          mockBadge
        );

        const response = await request(app)
          .post("/api/v1/governance/contributors/contributor_001/badges")
          .send(badgeData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockBadge);
        expect(
          mockContributorService.prototype.awardBadge
        ).toHaveBeenCalledWith("contributor_001", "test_champion", "platinum", {
          test_coverage: 95,
        });
      });

      it("should validate required fields", async () => {
        const response = await request(app)
          .post("/api/v1/governance/contributors/contributor_001/badges")
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain("Missing required fields");
      });
    });
  });

  describe("Leaderboards", () => {
    describe("GET /api/v1/governance/leaderboards", () => {
      it("should return leaderboard data", async () => {
        const mockLeaderboard = [
          {
            contributor_id: "contributor_001",
            rank_position: 1,
            score_value: 95.5,
          },
          {
            contributor_id: "contributor_002",
            rank_position: 2,
            score_value: 87.3,
          },
        ];

        mockContributorService.prototype.generateLeaderboard.mockResolvedValue(
          mockLeaderboard
        );

        const response = await request(app)
          .get("/api/v1/governance/leaderboards")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.leaderboard_type).toBe("overall");
        expect(response.body.data.entries).toEqual(mockLeaderboard);
        expect(
          mockContributorService.prototype.generateLeaderboard
        ).toHaveBeenCalledWith("overall", undefined);
      });

      it("should filter by team", async () => {
        const response = await request(app)
          .get("/api/v1/governance/leaderboards?team_id=frontend")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.team_id).toBe("frontend");
      });

      it("should limit results", async () => {
        const response = await request(app)
          .get("/api/v1/governance/leaderboards?limit=5")
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe("GET /api/v1/governance/top-contributors", () => {
      it("should return top contributors", async () => {
        const mockTopContributors = [
          {
            id: "contributor_001",
            display_name: "John Doe",
            avg_governance_score: 95.5,
            total_contributions: 245,
          },
        ];

        mockContributorService.prototype.getTopContributors.mockResolvedValue(
          mockTopContributors
        );

        const response = await request(app)
          .get("/api/v1/governance/top-contributors")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contributors).toEqual(mockTopContributors);
        expect(
          mockContributorService.prototype.getTopContributors
        ).toHaveBeenCalledWith(10, undefined);
      });
    });
  });

  describe("Automated Remediation", () => {
    describe("GET /api/v1/governance/remediation/dashboard", () => {
      it("should return remediation dashboard", async () => {
        const mockDashboard = {
          recentActions: [],
          availableTemplates: [],
          successMetrics: {},
          pendingActions: [],
          oneClickSuggestions: [],
        };

        mockRemediationService.prototype.getRemediationDashboard.mockResolvedValue(
          mockDashboard
        );

        const response = await request(app)
          .get(
            "/api/v1/governance/remediation/dashboard?contributor_id=contributor_001"
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockDashboard);
        expect(
          mockRemediationService.prototype.getRemediationDashboard
        ).toHaveBeenCalledWith("contributor_001", undefined);
      });

      it("should require contributor_id", async () => {
        const response = await request(app)
          .get("/api/v1/governance/remediation/dashboard")
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain(
          "Missing required parameter: contributor_id"
        );
      });
    });

    describe("POST /api/v1/governance/remediation/apply-dependency-upgrade", () => {
      it("should apply dependency upgrade", async () => {
        const mockResult = {
          success: true,
          action_id: "action_001",
          output: "Dependencies upgraded successfully",
          metrics: {
            files_modified: 5,
            vulnerabilities_fixed: 3,
            issues_resolved: 3,
          },
        };

        mockRemediationService.prototype.applyDependencyUpgrade.mockResolvedValue(
          mockResult
        );

        const response = await request(app)
          .post("/api/v1/governance/remediation/apply-dependency-upgrade")
          .send({ contributor_id: "contributor_001" })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockResult);
        expect(
          mockRemediationService.prototype.applyDependencyUpgrade
        ).toHaveBeenCalledWith("contributor_001", undefined);
      });

      it("should require contributor_id", async () => {
        const response = await request(app)
          .post("/api/v1/governance/remediation/apply-dependency-upgrade")
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain(
          "Missing required field: contributor_id"
        );
      });
    });

    describe("GET /api/v1/governance/remediation/templates", () => {
      it("should return available templates", async () => {
        const mockTemplates = [
          {
            id: "template_001",
            template_name: "Security Scan Fix",
            template_category: "security",
            safety_level: "safe",
            auto_applicable: true,
          },
        ];

        mockRemediationService.prototype.getApplicableTemplates.mockResolvedValue(
          mockTemplates
        );

        const response = await request(app)
          .get(
            "/api/v1/governance/remediation/templates?contributor_id=contributor_001"
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.templates).toEqual(mockTemplates);
        expect(
          mockRemediationService.prototype.getApplicableTemplates
        ).toHaveBeenCalledWith("contributor_001", undefined);
      });
    });
  });

  describe("AI Insights", () => {
    describe("POST /api/v1/governance/insights/generate", () => {
      it("should generate AI insights", async () => {
        const mockInsights = [
          {
            id: "insight_001",
            insight_type: "risk_prediction",
            scope_type: "organization",
            confidence_score: 0.85,
            title: "Low Governance Scores Detected",
            status: "active",
          },
        ];

        mockAIInsightService.prototype.generateInsights.mockResolvedValue(
          mockInsights
        );

        const response = await request(app)
          .post("/api/v1/governance/insights/generate")
          .send({ scope_type: "organization" })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.insights).toEqual(mockInsights);
        expect(response.body.data.scope_type).toBe("organization");
        expect(response.body.data.generated_at).toBeDefined();
        expect(
          mockAIInsightService.prototype.generateInsights
        ).toHaveBeenCalledWith("organization", undefined, undefined);
      });
    });

    describe("GET /api/v1/governance/insights", () => {
      it("should return AI insights", async () => {
        const response = await request(app)
          .get("/api/v1/governance/insights")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.insights).toBeDefined();
        expect(Array.isArray(response.body.data.insights)).toBe(true);
        expect(response.body.data.total).toBeDefined();
      });

      it("should filter insights by type", async () => {
        const response = await request(app)
          .get("/api/v1/governance/insights?insight_type=risk_prediction")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.insight_type).toBe("risk_prediction");
      });

      it("should limit results", async () => {
        const response = await request(app)
          .get("/api/v1/governance/insights?limit=10")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.insights.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe("Compliance Export", () => {
    describe("POST /api/v1/governance/compliance/reports/generate", () => {
      it("should generate compliance report", async () => {
        const mockReport = {
          id: "report_001",
          report_type: "weekly",
          report_format: "pdf",
          generated_at: new Date().toISOString(),
        };

        mockComplianceExportService.prototype.generateComplianceReport.mockResolvedValue(
          mockReport
        );

        const options = {
          format: "pdf",
          includeExecutiveSummary: true,
          includeDetailedMetrics: true,
        };

        const response = await request(app)
          .post("/api/v1/governance/compliance/reports/generate")
          .send(options)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockReport);
        expect(
          mockComplianceExportService.prototype.generateComplianceReport
        ).toHaveBeenCalledWith(options);
      });
    });

    describe("GET /api/v1/governance/compliance/reports/:id", () => {
      it("should return compliance report", async () => {
        const mockReport = {
          id: "report_001",
          report_type: "weekly",
          report_format: "pdf",
          generated_at: new Date().toISOString(),
        };

        mockComplianceExportService.prototype.getComplianceReport.mockResolvedValue(
          mockReport
        );

        const response = await request(app)
          .get("/api/v1/governance/compliance/reports/report_001")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockReport);
        expect(
          mockComplianceExportService.prototype.getComplianceReport
        ).toHaveBeenCalledWith("report_001");
      });

      it("should handle report not found", async () => {
        mockComplianceExportService.prototype.getComplianceReport.mockResolvedValue(
          null
        );

        const response = await request(app)
          .get("/api/v1/governance/compliance/reports/nonexistent")
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Report not found");
      });
    });

    describe("POST /api/v1/governance/compliance/reports/weekly", () => {
      it("should schedule weekly report", async () => {
        mockComplianceExportService.prototype.scheduleWeeklyReports.mockResolvedValue(
          undefined
        );

        const response = await request(app)
          .post("/api/v1/governance/compliance/reports/weekly")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain(
          "Weekly compliance report scheduled successfully"
        );
        expect(
          mockComplianceExportService.prototype.scheduleWeeklyReports
        ).toHaveBeenCalled();
      });
    });
  });

  describe("Cross-Team Benchmarking", () => {
    describe("GET /api/v1/governance/benchmarks", () => {
      it("should return team benchmarks", async () => {
        const response = await request(app)
          .get("/api/v1/governance/benchmarks")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.benchmarks).toBeDefined();
        expect(Array.isArray(response.body.data.benchmarks)).toBe(true);
        expect(response.body.data.total_teams).toBeDefined();
      });

      it("should filter by team", async () => {
        const response = await request(app)
          .get("/api/v1/governance/benchmarks?team_id=frontend")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.team_id).toBe("frontend");
      });
    });

    describe("GET /api/v1/governance/benchmarks/compare", () => {
      it("should compare team performance", async () => {
        const response = await request(app)
          .get("/api/v1/governance/benchmarks/compare?teams=frontend,backend")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.teams_compared).toEqual([
          "frontend",
          "backend",
        ]);
        expect(response.body.data.comparison_metrics).toBeDefined();
        expect(response.body.data.overall_ranking).toBeDefined();
        expect(response.body.data.best_performer).toBeDefined();
      });

      it("should require teams parameter", async () => {
        const response = await request(app)
          .get("/api/v1/governance/benchmarks/compare")
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain(
          "Missing required parameter: teams"
        );
      });
    });
  });

  describe("Dashboard Overview", () => {
    describe("GET /api/v1/governance/dashboard", () => {
      it("should return main dashboard", async () => {
        const response = await request(app)
          .get("/api/v1/governance/dashboard")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.overview).toBeDefined();
        expect(response.body.data.contributor_highlights).toBeDefined();
        expect(response.body.data.remediation_status).toBeDefined();
        expect(response.body.data.ai_insights).toBeDefined();
        expect(response.body.data.compliance_reports).toBeDefined();
        expect(response.body.data.team_performance).toBeDefined();
        expect(response.body.data.alerts).toBeDefined();
      });

      it("should filter by team", async () => {
        const response = await request(app)
          .get("/api/v1/governance/dashboard?team_id=frontend")
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe("Health Check", () => {
    describe("GET /api/v1/governance/health", () => {
      it("should return governance service health", async () => {
        const response = await request(app)
          .get("/api/v1/governance/health")
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("healthy");
        expect(response.body.data.services).toBeDefined();
        expect(response.body.data.database).toBeDefined();
        expect(response.body.data.metrics).toBeDefined();
        expect(response.body.data.timestamp).toBeDefined();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for unknown routes", async () => {
      const response = await request(app)
        .get("/api/v1/governance/unknown")
        .expect(404);
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/v1/governance/contributors")
        .send("invalid json")
        .expect(400);
    });
  });
});

describe("Governance Services Integration", () => {
  let contributorService: ContributorRecognitionService;
  let remediationService: AutomatedRemediationService;
  let aiInsightService: AIInsightService;
  let complianceExportService: EnterpriseComplianceExportService;

  beforeEach(() => {
    contributorService = new ContributorRecognitionService();
    remediationService = new AutomatedRemediationService();
    aiInsightService = new AIInsightService();
    complianceExportService = new EnterpriseComplianceExportService();
  });

  describe("Contributor Recognition Service", () => {
    it("should create and manage contributors", async () => {
      const contributorData = {
        user_id: "user_123",
        github_username: "test-user",
        display_name: "Test User",
        contribution_level: "bronze" as const,
      };

      const contributor =
        await contributorService.createContributor(contributorData);
      expect(contributor).toBeDefined();
      expect(contributor.user_id).toBe("user_123");
      expect(contributor.contribution_level).toBe("bronze");
    });

    it("should award badges based on KPI scores", async () => {
      const mockKpiScores = {
        test_coverage_score: 95,
        security_score: 90,
        documentation_score: 85,
        issues_resolved: 10,
        auto_fixes_applied: 5,
      };

      // Test badge awarding logic
      const badge = await contributorService.awardBadge(
        "contributor_001",
        "test_champion",
        "platinum",
        { test_coverage: 95 }
      );

      expect(badge).toBeDefined();
      expect(badge.badge_type).toBe("test_champion");
      expect(badge.badge_level).toBe("platinum");
    });
  });

  describe("Automated Remediation Service", () => {
    it("should apply dependency upgrades", async () => {
      const result =
        await remediationService.applyDependencyUpgrade("contributor_001");

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
      if (result.success) {
        expect(result.metrics).toBeDefined();
        expect(result.action_id).toBeDefined();
      }
    });

    it("should apply ESLint fixes", async () => {
      const result =
        await remediationService.applyESLintFixes("contributor_001");

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should normalize commit messages", async () => {
      const result =
        await remediationService.normalizeCommitMessages("contributor_001");

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
      if (result.success) {
        expect(result.metrics).toBeDefined();
      }
    });
  });

  describe("AI Insights Service", () => {
    it("should generate predictive insights", async () => {
      const insights = await aiInsightService.generateInsights(
        "organization",
        undefined,
        {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        }
      );

      expect(Array.isArray(insights)).toBe(true);
      if (insights.length > 0) {
        expect(insights[0].insight_type).toBeDefined();
        expect(insights[0].confidence_score).toBeGreaterThan(0);
        expect(insights[0].confidence_score).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Compliance Export Service", () => {
    it("should generate compliance reports", async () => {
      const options = {
        format: "pdf" as const,
        includeExecutiveSummary: true,
        includeDetailedMetrics: true,
        includeViolationTrends: true,
        includeRemediationSuccess: true,
        includeRiskAssessment: true,
      };

      const report =
        await complianceExportService.generateComplianceReport(options);

      expect(report).toBeDefined();
      expect(report.report_type).toBeDefined();
      expect(report.report_format).toBe("pdf");
    });

    it("should schedule weekly reports", async () => {
      await expect(
        complianceExportService.scheduleWeeklyReports()
      ).resolves.not.toThrow();
    });

    it("should generate on-demand reports", async () => {
      const report =
        await complianceExportService.generateOnDemandReport("frontend");

      expect(report).toBeDefined();
      expect(report.report_type).toBe("on_demand");
    });
  });

  describe("Cross-Service Integration", () => {
    it("should integrate contributor recognition with remediation", async () => {
      // Create contributor
      const contributor = await contributorService.createContributor({
        user_id: "user_integration_test",
        github_username: "integration-user",
        display_name: "Integration Test User",
        contribution_level: "silver" as const,
      });

      // Get applicable remediation templates
      const templates = await remediationService.getApplicableTemplates(
        contributor.id
      );
      expect(Array.isArray(templates)).toBe(true);

      // Apply remediation if templates available
      if (templates.length > 0) {
        const result = await remediationService.applyOneClickRemediation(
          contributor.id,
          templates[0].id
        );
        expect(result).toBeDefined();
      }
    });

    it("should integrate AI insights with compliance reporting", async () => {
      // Generate AI insights
      const insights = await aiInsightService.generateInsights("organization");
      expect(insights.length).toBeGreaterThan(0);

      // Generate compliance report that includes insights
      const report = await complianceExportService.generateComplianceReport({
        format: "json" as const,
        includeExecutiveSummary: true,
        includeDetailedMetrics: true,
        includeViolationTrends: true,
        includeRemediationSuccess: true,
        includeRiskAssessment: true,
      });

      expect(report).toBeDefined();
      expect(report.report_format).toBe("json");
    });
  });
});

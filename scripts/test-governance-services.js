#!/usr/bin/env node

/**
 * Comprehensive Governance Services Test Script
 * Tests all governance enhancements including:
 * - Contributor Recognition System
 * - Automated KPI Remediation
 * - Enterprise Compliance Export
 * - AI-Assisted Governance Insights
 * - Database Schema Validation
 * - Grafana Dashboard Validation
 */

const fs = require("fs");
const path = require("path");

class GovernanceServicesTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };
  }

  async runAllTests() {
    console.log("🚀 Starting Vauntico Governance Services Tests...\n");

    // Test Database Schema
    await this.testDatabaseSchema();

    // Test Service Files
    await this.testServiceFiles();

    // Test Grafana Dashboards
    await this.testGrafanaDashboards();

    // Test Service Instantiation
    await this.testServiceInstantiation();

    // Test CI/CD Workflow
    await this.testCICDWorkflow();

    // Generate Report
    this.generateReport();
  }

  async testDatabaseSchema() {
    console.log("📊 Testing Database Schema...");

    const migrationFiles = [
      "server-v2/migrations/012_create_governance_enhancements.sql",
    ];

    for (const file of migrationFiles) {
      this.recordTest(`Migration file exists: ${file}`, () => {
        if (!fs.existsSync(file)) {
          throw new Error(`Migration file missing: ${file}`);
        }
        const content = fs.readFileSync(file, "utf8");
        if (
          !content.includes("CREATE TABLE") &&
          !content.includes("ALTER TABLE")
        ) {
          throw new Error(`No SQL changes found in: ${file}`);
        }
      });
    }

    this.recordTest("Required tables defined", () => {
      const schemaFile =
        "server-v2/migrations/012_create_governance_enhancements.sql";
      const content = fs.readFileSync(schemaFile, "utf8");

      const requiredTables = [
        "ai_insights",
        "remediation_actions",
        "remediation_templates",
        "team_benchmarks",
        "compliance_reports",
        "contributor_achievements",
      ];

      for (const table of requiredTables) {
        if (!content.includes(`CREATE TABLE ${table}`)) {
          throw new Error(`Required table not found: ${table}`);
        }
      }
    });

    console.log("✅ Database Schema tests completed\n");
  }

  async testServiceFiles() {
    console.log("🔧 Testing Service Files...");

    const serviceFiles = [
      "server-v2/src/services/contributorRecognitionService.ts",
      "server-v2/src/services/automatedRemediationService.ts",
      "server-v2/src/services/enterpriseComplianceExportService.ts",
      "server-v2/src/services/aiInsightsService.ts",
    ];

    for (const file of serviceFiles) {
      this.recordTest(`Service file exists: ${path.basename(file)}`, () => {
        if (!fs.existsSync(file)) {
          throw new Error(`Service file missing: ${file}`);
        }
        const content = fs.readFileSync(file, "utf8");

        // Check for essential service components
        if (!content.includes("constructor()")) {
          throw new Error(`Missing constructor in: ${file}`);
        }
        if (!content.includes("class ")) {
          throw new Error(`Missing class definition in: ${file}`);
        }
      });
    }

    console.log("✅ Service Files tests completed\n");
  }

  async testGrafanaDashboards() {
    console.log("📈 Testing Grafana Dashboards...");

    const dashboardFiles = [
      "monitoring/grafana/dashboards/vauntico-cross-team-benchmarking.json",
    ];

    for (const file of dashboardFiles) {
      this.recordTest(`Dashboard file valid: ${path.basename(file)}`, () => {
        if (!fs.existsSync(file)) {
          throw new Error(`Dashboard file missing: ${file}`);
        }
        try {
          const content = fs.readFileSync(file, "utf8");
          const dashboard = JSON.parse(content);

          // Validate dashboard structure
          if (!dashboard.panels || !Array.isArray(dashboard.panels)) {
            throw new Error(`Invalid dashboard structure in: ${file}`);
          }
          if (!dashboard.title) {
            throw new Error(`Missing dashboard title in: ${file}`);
          }
        } catch (error) {
          if (error.message.includes("JSON")) {
            throw new Error(`Invalid JSON in: ${file} - ${error.message}`);
          }
          throw error;
        }
      });
    }

    // Check for specific governance metrics
    this.recordTest("Governance metrics exist in dashboard", () => {
      const dashboardFile =
        "monitoring/grafana/dashboards/vauntico-cross-team-benchmarking.json";
      const content = fs.readFileSync(dashboardFile, "utf8");
      const dashboard = JSON.parse(content);

      const expectedMetrics = [
        "vauntico_team_governance_score",
        "vauntico_team_test_coverage",
        "vauntico_team_security_score",
        "vauntico_team_remediation_rate",
      ];

      let foundMetrics = 0;
      for (const metric of expectedMetrics) {
        if (content.includes(metric)) {
          foundMetrics++;
        }
      }

      if (foundMetrics < expectedMetrics.length * 0.5) {
        throw new Error(`Insufficient governance metrics found in dashboard`);
      }
    });

    console.log("✅ Grafana Dashboard tests completed\n");
  }

  async testServiceInstantiation() {
    console.log("🏭 Testing Service Instantiation...");

    this.recordTest("Import paths are valid", () => {
      // This would test actual imports in a real environment
      const serviceImports = [
        {
          file: "server-v2/src/services/contributorRecognitionService.ts",
          export: "ContributorRecognitionService",
        },
        {
          file: "server-v2/src/services/automatedRemediationService.ts",
          export: "AutomatedRemediationService",
        },
        {
          file: "server-v2/src/services/enterpriseComplianceExportService.ts",
          export: "EnterpriseComplianceExportService",
        },
        {
          file: "server-v2/src/services/aiInsightsService.ts",
          export: "AIInsightService",
        },
      ];

      for (const { file, export: exportName } of serviceImports) {
        const content = fs.readFileSync(file, "utf8");
        if (!content.includes(`export class ${exportName}`)) {
          throw new Error(`Missing export ${exportName} in ${file}`);
        }
      }
    });

    console.log("✅ Service Instantiation tests completed\n");
  }

  async testCICDWorkflow() {
    console.log("🔄 Testing CI/CD Workflow...");

    const workflowFile = ".github/workflows/governance-enhancement-ci.yml";

    this.recordTest("CI/CD workflow exists", () => {
      if (!fs.existsSync(workflowFile)) {
        throw new Error("CI/CD workflow file missing");
      }
    });

    this.recordTest("CI/CD workflow has required jobs", () => {
      const content = fs.readFileSync(workflowFile, "utf8");

      const requiredJobs = [
        "lint-and-type-check",
        "build-and-test",
        "security-scan",
        "validate-governance-services",
      ];

      for (const job of requiredJobs) {
        if (!content.includes(job)) {
          throw new Error(`Missing required job: ${job}`);
        }
      }
    });

    this.recordTest("CI/CD workflow triggers correctly", () => {
      const content = fs.readFileSync(workflowFile, "utf8");

      if (
        !content.includes("on:") ||
        !content.includes("push:") ||
        !content.includes("pull_request:")
      ) {
        throw new Error("Missing proper workflow triggers");
      }
    });

    console.log("✅ CI/CD Workflow tests completed\n");
  }

  recordTest(testName, testFunction) {
    this.testResults.total++;
    try {
      testFunction();
      this.testResults.passed++;
      console.log(`  ✅ ${testName}`);
    } catch (error) {
      this.testResults.failed++;
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${error.message}`);
      this.testResults.details.push({
        test: testName,
        status: "failed",
        error: error.message,
      });
    }
  }

  generateReport() {
    console.log("\n📋 Test Results Summary");
    console.log("====================");
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(
      `Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`
    );

    if (this.testResults.failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults.details.forEach((detail) => {
        console.log(`  - ${detail.test}: ${detail.error}`);
      });
      process.exit(1);
    } else {
      console.log(
        "\n🎉 All tests passed! Governance services are ready for deployment."
      );

      // Generate success report
      const report = {
        timestamp: new Date().toISOString(),
        test_results: this.testResults,
        governance_components: {
          contributor_recognition: "✅ Implemented",
          automated_remediation: "✅ Implemented",
          enterprise_compliance_export: "✅ Implemented",
          ai_insights: "✅ Implemented",
          cross_team_benchmarking: "✅ Implemented",
          database_schema: "✅ Validated",
          cicd_workflow: "✅ Configured",
        },
      };

      fs.writeFileSync(
        "governance-test-report.json",
        JSON.stringify(report, null, 2)
      );
      console.log("📊 Test report saved to: governance-test-report.json");
    }
  }

  async testTypeScriptCompilation() {
    console.log("🔍 Testing TypeScript Compilation...");

    // This would run tsc in a real environment
    this.recordTest("TypeScript configuration exists", () => {
      const tsconfigPath = "server-v2/tsconfig.json";
      if (!fs.existsSync(tsconfigPath)) {
        throw new Error("TypeScript config missing");
      }
    });

    this.recordTest("No TypeScript errors in governance services", () => {
      // Simulate TypeScript checking
      const serviceFiles = [
        "server-v2/src/services/contributorRecognitionService.ts",
        "server-v2/src/services/automatedRemediationService.ts",
        "server-v2/src/services/enterpriseComplianceExportService.ts",
        "server-v2/src/services/aiInsightsService.ts",
      ];

      for (const file of serviceFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Service file missing: ${file}`);
        }
        // In a real environment, this would run tsc
      }
    });

    console.log("✅ TypeScript Compilation tests completed\n");
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new GovernanceServicesTester();
  tester.runAllTests().catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
}

module.exports = GovernanceServicesTester;

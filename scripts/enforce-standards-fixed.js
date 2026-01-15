#!/usr/bin/env node

/**
 * Vauntico Standards Enforcement Script
 *
 * This script enforces all coding standards, security requirements,
 * and governance rules across the codebase.
 *
 * Usage: node scripts/enforce-standards.js [options]
 *
 * Options:
 *   --category <type>    Run specific category (lint, security, logger, docs, workflow)
 *   --quick-scan         Fast scan for critical issues only
 *   --comprehensive       Full comprehensive scan with detailed reporting
 *   --auto-fix           Attempt to auto-fix common issues
 *   --generate-report     Generate detailed compliance report
 *   --weekly-scan        Run weekly compliance scan
 *   --verbose            Show detailed output
 *   --help               Show help information
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ANSI color codes for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(message, color = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ERROR: ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️ WARNING: ${message}`, "yellow");
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logInfo(message) {
  log(`ℹ️ ${message}`, "blue");
}

class StandardsEnforcer {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = process.cwd();
  }

  // 1. Lint & Hygiene Enforcement
  async checkLintAndHygiene() {
    logInfo("Checking Lint & Hygiene Enforcement...");

    try {
      // Check ESLint configuration exists and is proper
      const eslintConfigPath = path.join(
        this.projectRoot,
        "server-v2/.eslintrc.cjs"
      );
      if (!fs.existsSync(eslintConfigPath)) {
        this.errors.push(
          "ESLint configuration not found at server-v2/.eslintrc.cjs"
        );
        return;
      }

      const eslintConfig = require(eslintConfigPath);

      // Verify key ESLint rules are enforced
      const requiredRules = [
        "no-console",
        "@typescript-eslint/no-require-imports",
        "@typescript-eslint/consistent-type-imports",
        "@typescript-eslint/no-var-requires",
      ];

      for (const rule of requiredRules) {
        if (!eslintConfig.rules || eslintConfig.rules[rule] !== "error") {
          this.errors.push(`ESLint rule '${rule}' must be set to 'error'`);
        }
      }

      logSuccess("ESLint configuration validated");

      // Run ESLint check
      try {
        execSync("cd server-v2 && npm run lint", { stdio: "pipe" });
        logSuccess("ESLint validation passed");
      } catch (error) {
        this.errors.push(
          'ESLint validation failed. Run "npm run lint" to see issues.'
        );
      }

      // Check for console.log usage (should be blocked)
      const files = this.getAllSourceFiles();
      for (const file of files) {
        if (this.shouldCheckFile(file)) {
          const content = fs.readFileSync(file, "utf8");
          if (
            content.includes("console.log") &&
            !file.includes(".test.") &&
            !file.includes("spec.")
          ) {
            // Check if it's in a test file or has proper logger import
            if (
              !content.includes("import.*logger.*from") &&
              !file.includes("test")
            ) {
              this.warnings.push(
                `Console.log usage detected in ${file}. Use logger instead.`
              );
            }
          }
        }
      }

      // Check for require() usage (should be ES modules)
      for (const file of files) {
        if (this.shouldCheckFile(file) && file.endsWith(".ts")) {
          const content = fs.readFileSync(file, "utf8");
          if (
            content.includes("require(") &&
            !file.includes(".config.") &&
            !file.includes("test")
          ) {
            this.errors.push(
              `require() usage detected in ${file}. Use ES module imports instead.`
            );
          }
        }
      }
    } catch (error) {
      this.errors.push(`Lint check failed: ${error.message}`);
    }
  }

  // 2. Logger Discipline
  async checkLoggerDiscipline() {
    logInfo("Checking Logger Discipline...");

    try {
      const loggerPath = path.join(
        this.projectRoot,
        "server-v2/src/utils/logger.ts"
      );
      if (!fs.existsSync(loggerPath)) {
        this.errors.push(
          "Logger implementation not found at server-v2/src/utils/logger.ts"
        );
        return;
      }

      // Check logger implementation
      const loggerContent = fs.readFileSync(loggerPath, "utf8");

      // Verify structured JSON logging
      if (!loggerContent.includes("winston.format.json()")) {
        this.errors.push("Logger must use structured JSON formatting");
      }

      // Verify Sentry integration
      if (!loggerContent.includes("@sentry/node")) {
        this.warnings.push("Sentry integration not found in logger");
      }

      // Verify Prometheus metrics
      if (!loggerContent.includes("prom-client")) {
        this.warnings.push(
          "Prometheus metrics integration not found in logger"
        );
      }

      logSuccess("Logger implementation validated");

      // Check all source files for proper logger usage
      const files = this.getAllSourceFiles();
      for (const file of files) {
        if (this.shouldCheckFile(file) && file.includes("server-v2/src/")) {
          const content = fs.readFileSync(file, "utf8");

          // Check for logger imports
          if (content.includes("logger.") || content.includes("logger.")) {
            if (!content.includes("import.*logger.*from")) {
              this.warnings.push(
                `Logger usage found in ${file} but no import statement detected`
              );
            }
          }

          // Check for structured logging with metadata
          if (
            content.includes("logger.error") ||
            content.includes("logger.info")
          ) {
            const hasMetadata =
              content.includes("logger.") &&
              content.includes("{") &&
              content.includes("}");
            if (!hasMetadata) {
              this.warnings.push(
                `Logger usage in ${file} should include structured metadata`
              );
            }
          }
        }
      }
    } catch (error) {
      this.errors.push(`Logger check failed: ${error.message}`);
    }
  }

  // 3. Security Guardrails
  async checkSecurityGuardrails() {
    logInfo("Checking Security Guardrails...");

    try {
      // Check CodeQL workflow
      const codeqlPath = path.join(
        this.projectRoot,
        ".github/workflows/codeql-analysis.yml"
      );
      if (!fs.existsSync(codeqlPath)) {
        this.errors.push("CodeQL workflow not found");
        return;
      }

      const codeqlContent = fs.readFileSync(codeqlPath, "utf8");

      // Verify weekly schedule
      if (
        !codeqlContent.includes("schedule:") ||
        !codeqlContent.includes("cron:")
      ) {
        this.warnings.push(
          "CodeQL workflow should include weekly scheduled scans"
        );
      }

      // Verify PR triggers
      if (!codeqlContent.includes("pull_request:")) {
        this.warnings.push("CodeQL workflow should run on pull requests");
      }

      logSuccess("CodeQL workflow validated");

      // Check secret scanning workflow
      const secretScanPath = path.join(
        this.projectRoot,
        ".github/workflows/secret-scan.yml"
      );
      if (!fs.existsSync(secretScanPath)) {
        this.errors.push("Secret scanning workflow not found");
        return;
      }

      const secretScanContent = fs.readFileSync(secretScanPath, "utf8");

      // Verify secret scanning blocks merges
      if (!secretScanContent.includes("exit 1")) {
        this.errors.push(
          "Secret scanning must block merges on detected secrets"
        );
      }

      logSuccess("Secret scanning workflow validated");

      // Check for hardcoded secrets in source code
      const files = this.getAllSourceFiles();
      const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /api_key\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /token\s*=\s*['"][^'"]+['"]/i,
        /sk_test_[a-zA-Z0-9]{24,}/, // Stripe test keys
        /sk_live_[a-zA-Z0-9]{24,}/, // Stripe live keys
      ];

      for (const file of files) {
        if (this.shouldCheckFile(file)) {
          const content = fs.readFileSync(file, "utf8");

          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              this.errors.push(
                `Potential hardcoded secret detected in ${file}`
              );
            }
          }
        }
      }

      // Check .gitignore for sensitive files
      const gitignorePath = path.join(this.projectRoot, ".gitignore");
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        const requiredIgnores = [
          ".env",
          ".env.local",
          "*.log",
          "dist/",
          "build/",
        ];

        for (const ignore of requiredIgnores) {
          if (!gitignoreContent.includes(ignore)) {
            this.warnings.push(`.gitignore should include ${ignore}`);
          }
        }
      }
    } catch (error) {
      this.errors.push(`Security check failed: ${error.message}`);
    }
  }

  // 4. Documentation & Onboarding
  async checkDocumentation() {
    logInfo("Checking Documentation & Onboarding...");

    try {
      // Check contributor guide
      const contributorGuidePath = path.join(
        this.projectRoot,
        "CONTRIBUTOR_GUIDE.md"
      );
      if (!fs.existsSync(contributorGuidePath)) {
        this.errors.push("CONTRIBUTOR_GUIDE.md not found");
        return;
      }

      const contributorContent = fs.readFileSync(contributorGuidePath, "utf8");

      // Check for ES module migration reference
      if (!contributorContent.includes("ES module")) {
        this.warnings.push(
          "Contributor guide should reference ES module migration"
        );
      }

      // Check for migration checklist
      if (!contributorContent.includes("migration checklist")) {
        this.warnings.push(
          "Contributor guide should include migration checklist"
        );
      }

      logSuccess("Contributor guide validated");

      // Check for README.md
      const readmePath = path.join(this.projectRoot, "README.md");
      if (!fs.existsSync(readmePath)) {
        this.errors.push("README.md not found");
      }

      // Check for onboarding documentation
      const onboardingPath = path.join(
        this.projectRoot,
        "CONTRIBUTOR_ONBOARDING.md"
      );
      if (!fs.existsSync(onboardingPath)) {
        this.warnings.push("CONTRIBUTOR_ONBOARDING.md not found");
      }

      // Check governance documentation
      const governanceFiles = [
        "VAUNTICO.md",
        "SECURITY_OPERATIONS.md",
        "DEPLOYMENT_GUIDE.md",
      ];

      for (const file of governanceFiles) {
        const filePath = path.join(this.projectRoot, file);
        if (!fs.existsSync(filePath)) {
          this.warnings.push(
            `${file} not found - should be referenced as canonical governance source`
          );
        }
      }
    } catch (error) {
      this.errors.push(`Documentation check failed: ${error.message}`);
    }
  }

  // 5. Workflow Discipline
  async checkWorkflowDiscipline() {
    logInfo("Checking Workflow Discipline...");

    try {
      // Check semantic commits workflow
      const semanticCommitsPath = path.join(
        this.projectRoot,
        ".github/workflows/semantic-commits.yml"
      );
      if (!fs.existsSync(semanticCommitsPath)) {
        this.errors.push("Semantic commits workflow not found");
        return;
      }

      const semanticContent = fs.readFileSync(semanticCommitsPath, "utf8");

      // Verify semantic commit types are enforced
      const requiredTypes = [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
      ];
      for (const type of requiredTypes) {
        if (!semanticContent.includes(type)) {
          this.warnings.push(
            `Semantic commits workflow should enforce '${type}' type`
          );
        }
      }

      logSuccess("Semantic commits workflow validated");

      // Check recent commits for semantic format
      try {
        const recentCommits = execSync("git log --oneline -10", {
          encoding: "utf8",
        });
        const commitLines = recentCommits
          .split("\n")
          .filter((line) => line.trim());

        const semanticPattern =
          /^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: .+/;

        for (const line of commitLines) {
          const commit = line.replace(/^[a-f0-9]+\s+/, ""); // Remove hash
          if (!semanticPattern.test(commit)) {
            this.warnings.push(
              `Commit "${commit}" does not follow semantic format`
            );
          }
        }
      } catch (error) {
        this.warnings.push("Could not validate recent commit format");
      }

      // Check for action version check workflow
      const actionVersionPath = path.join(
        this.projectRoot,
        "server-v2/.github/workflows/action-version-check.yml"
      );
      if (!fs.existsSync(actionVersionPath)) {
        this.warnings.push("Action version check workflow not found");
      }
    } catch (error) {
      this.errors.push(`Workflow discipline check failed: ${error.message}`);
    }
  }

  // Helper methods
  getAllSourceFiles() {
    const extensions = [".js", ".ts", ".jsx", ".tsx"];
    const sourceDirs = [
      "src",
      "server-v2/src",
      "widget/src",
      "vauntico-fulfillment-engine",
    ];
    const files = [];

    for (const dir of sourceDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.walkDirectory(fullPath, files, extensions);
      }
    }

    return files;
  }

  walkDirectory(dir, files, extensions) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        this.walkDirectory(fullPath, files, extensions);
      } else if (
        stat.isFile() &&
        extensions.some((ext) => item.endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }
  }

  shouldCheckFile(filePath) {
    // Skip test files, config files, and generated files
    const skipPatterns = [
      /\.test\./,
      /\.spec\./,
      /\.config\./,
      /node_modules/,
      /dist/,
      /build/,
      /coverage/,
    ];

    return !skipPatterns.some((pattern) => pattern.test(filePath));
  }

  // Enhanced methods for comprehensive standards enforcement
  async runWeeklyScan(options) {
    this.logInfo("🗓️ Running Weekly Compliance Scan...", "cyan");
    this.logInfo("=".repeat(50), "cyan");

    const categories = [
      "security",
      "standards",
      "performance",
      "dependencies",
      "governance",
    ];
    const results = {};

    for (const category of categories) {
      this.logInfo(`Scanning ${category}...`, "blue");
      await this.runCategoryCheck(category, { ...options, verbose: true });
      results[category] = {
        errors: this.errors.length,
        warnings: this.warnings.length,
      };
      this.errors = [];
      this.warnings = [];
    }

    await this.generateWeeklyReport(results);
    return 0;
  }

  async generateComplianceReport(options) {
    this.logInfo("📊 Generating Comprehensive Compliance Report...", "cyan");

    const reportData = {
      generated: new Date().toISOString(),
      repository: process.cwd(),
      scanResults: {},
    };

    const categories = [
      "lint",
      "security",
      "logger",
      "documentation",
      "workflow",
    ];

    for (const category of categories) {
      await this.runCategoryCheck(category, options);
      reportData.scanResults[category] = {
        errors: this.errors.length,
        warnings: this.warnings.length,
        details: this.errors.concat(this.warnings),
      };
      this.errors = [];
      this.warnings = [];
    }

    const reportPath = path.join(this.projectRoot, "compliance-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    this.logSuccess(`Compliance report generated: ${reportPath}`);
    return 0;
  }

  async runComprehensiveScan(options) {
    this.logInfo("🔍 Running Comprehensive Standards Scan...", "cyan");
    this.logInfo("=".repeat(50), "cyan");

    const startTime = Date.now();

    await this.checkLintAndHygiene();
    await this.checkLoggerDiscipline();
    await this.checkSecurityGuardrails();
    await this.checkDocumentation();
    await this.checkWorkflowDiscipline();

    const duration = Date.now() - startTime;

    await this.generateComprehensiveSummary(duration);
    return this.getExitCode();
  }

  async runQuickScan(options) {
    this.logInfo("⚡ Running Quick Standards Scan...", "cyan");

    // Critical checks only
    await this.checkLintAndHygiene();
    await this.checkSecurityGuardrails();

    if (this.errors.length === 0) {
      this.logSuccess("✅ Quick scan passed - No critical issues found");
    } else {
      this.logError(
        `❌ Quick scan failed - ${this.errors.length} critical issues found`
      );
    }

    return this.getExitCode();
  }

  async runCategoryCheck(category, options) {
    switch (category) {
      case "lint":
        await this.checkLintAndHygiene();
        break;
      case "security":
        await this.checkSecurityGuardrails();
        break;
      case "logger":
        await this.checkLoggerDiscipline();
        break;
      case "docs":
      case "documentation":
        await this.checkDocumentation();
        break;
      case "workflow":
        await this.checkWorkflowDiscipline();
        break;
      default:
        this.logError(`Unknown category: ${category}`);
        return 1;
    }

    return this.getExitCode();
  }

  async runAutoFix(options) {
    this.logInfo("🔧 Running Auto-Fix for Common Issues...", "cyan");

    try {
      // Auto-fix ESLint issues
      this.logInfo("Running ESLint auto-fix...");
      execSync("cd server-v2 && npm run lint:fix", { stdio: "pipe" });
      this.logSuccess("ESLint auto-fix completed");

      // Auto-fix Prettier issues
      this.logInfo("Running Prettier auto-fix...");
      execSync("npm run format:fix", { stdio: "pipe" });
      this.logSuccess("Prettier auto-fix completed");

      this.logSuccess("🎉 Auto-fix completed successfully");
      return 0;
    } catch (error) {
      this.logError(`Auto-fix failed: ${error.message}`);
      return 1;
    }
  }

  async generateWeeklyReport(results) {
    const reportPath = path.join(
      this.projectRoot,
      "weekly-compliance-report.md"
    );

    const reportContent = `# Vauntico Weekly Compliance Report

**Generated:** ${new Date().toISOString()}
**Repository:** ${this.projectRoot}

## Executive Summary

${Object.entries(results)
  .map(
    ([category, result]) =>
      `- **${category.charAt(0).toUpperCase() + category.slice(1)}:** ${result.errors === 0 ? "✅ PASSED" : "❌ FAILED"} (${result.errors} errors, ${result.warnings} warnings)`
  )
  .join("\n")}

## Detailed Results

${Object.entries(results)
  .map(
    ([category, result]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1)}

- **Status:** ${result.errors === 0 ? "COMPLIANT" : "NON-COMPLIANT"}
- **Errors:** ${result.errors}
- **Warnings:** ${result.warnings}
`
  )
  .join("\n")}

## Recommendations

1. Address any critical errors immediately
2. Review warnings for potential improvements
3. Schedule regular follow-up scans
4. Maintain continuous monitoring

---
*Generated by Vauntico Compliance Scanner*
`;

    fs.writeFileSync(reportPath, reportContent);
    this.logSuccess(`Weekly compliance report generated: ${reportPath}`);
  }

  async generateComprehensiveSummary(duration) {
    const summaryPath = path.join(
      this.projectRoot,
      "comprehensive-standards-summary.md"
    );

    const summaryContent = `# Vauntico Comprehensive Standards Summary

**Generated:** ${new Date().toISOString()}
**Duration:** ${duration}ms
**Repository:** ${this.projectRoot}

## Compliance Overview

- **Lint & Hygiene:** ${this.errors.filter((e) => e.includes("ESLint")).length === 0 ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}
- **Logger Discipline:** ${this.warnings.filter((w) => w.includes("logger")).length === 0 ? "✅ COMPLIANT" : "⚠️ NEEDS ATTENTION"}
- **Security Guardrails:** ${this.errors.filter((e) => e.includes("security")).length === 0 ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}
- **Documentation:** ${this.warnings.filter((w) => w.includes("documentation")).length === 0 ? "✅ COMPLIANT" : "⚠️ NEEDS ATTENTION"}
- **Workflow Discipline:** ${this.warnings.filter((w) => w.includes("workflow")).length === 0 ? "✅ COMPLIANT" : "⚠️ NEEDS ATTENTION"}

## Summary Statistics

- **Total Errors:** ${this.errors.length}
- **Total Warnings:** ${this.warnings.length}
- **Overall Status:** ${this.errors.length === 0 ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}

## Action Items

${
  this.errors.length > 0
    ? `
### Critical Issues (Must Fix)
${this.errors.map((error) => `- ${error}`).join("\n")}
`
    : "### Critical Issues: None ✅"
}

${
  this.warnings.length > 0
    ? `
### Warnings (Should Review)
${this.warnings.map((warning) => `- ${warning}`).join("\n")}
`
    : "### Warnings: None ✅"
}

## Next Steps

1. **Immediate:** Fix all critical errors
2. **Short-term:** Address warnings for improved quality
3. **Long-term:** Establish continuous monitoring

---
*Generated by Vauntico Standards Enforcement System*
`;

    fs.writeFileSync(summaryPath, summaryContent);
    this.logSuccess(`Comprehensive summary generated: ${summaryPath}`);
  }

  getExitCode() {
    if (this.errors.length > 0) {
      this.logError(
        "\n❌ Standards validation FAILED - Fix critical errors before proceeding"
      );
      return 1;
    } else if (this.warnings.length > 0) {
      this.logWarning(
        "\n⚠️ Standards validation completed with warnings - Review and address if needed"
      );
      return 0;
    } else {
      this.logSuccess("\n🎉 All standards are compliant!");
      return 0;
    }
  }

  async runAllChecks() {
    this.logInfo("🚀 Starting Vauntico Standards Enforcement...", "cyan");
    this.logInfo("=".repeat(50), "cyan");

    await this.checkLintAndHygiene();
    await this.checkLoggerDiscipline();
    await this.checkSecurityGuardrails();
    await this.checkDocumentation();
    await this.checkWorkflowDiscipline();

    this.logInfo("=".repeat(50), "cyan");
    this.logInfo("📊 Standards Enforcement Summary:", "cyan");

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.logSuccess("🎉 All standards are compliant!");
      return 0;
    }

    if (this.errors.length > 0) {
      this.logError(`\n🔴 Critical Errors (${this.errors.length}):`);
      this.errors.forEach((error) => this.logError(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      this.logWarning(`\n🟡 Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning) => this.logWarning(`  • ${warning}`));
    }

    if (this.errors.length > 0) {
      this.logError(
        "\n❌ Standards validation FAILED - Fix critical errors before proceeding"
      );
      return 1;
    } else {
      this.logWarning(
        "\n⚠️ Standards validation completed with warnings - Review and address if needed"
      );
      return 0;
    }
  }
}

// Enhanced CLI interface
async function main() {
  const args = process.argv.slice(2);
  const enforcer = new StandardsEnforcer();

  // Parse command line arguments
  const options = {
    category: null,
    quickScan: false,
    comprehensive: false,
    autoFix: false,
    generateReport: false,
    weeklyScan: false,
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--category":
        options.category = args[++i];
        break;
      case "--quick-scan":
        options.quickScan = true;
        break;
      case "--comprehensive":
        options.comprehensive = true;
        break;
      case "--auto-fix":
        options.autoFix = true;
        break;
      case "--generate-report":
        options.generateReport = true;
        break;
      case "--weekly-scan":
        options.weeklyScan = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--help":
        options.help = true;
        break;
    }
  }

  if (options.help) {
    showHelp();
    return 0;
  }

  let exitCode = 0;

  try {
    if (options.weeklyScan) {
      exitCode = await enforcer.runWeeklyScan(options);
    } else if (options.generateReport) {
      exitCode = await enforcer.generateComplianceReport(options);
    } else if (options.comprehensive) {
      exitCode = await enforcer.runComprehensiveScan(options);
    } else if (options.quickScan) {
      exitCode = await enforcer.runQuickScan(options);
    } else if (options.category) {
      exitCode = await enforcer.runCategoryCheck(options.category, options);
    } else if (options.autoFix) {
      exitCode = await enforcer.runAutoFix(options);
    } else {
      exitCode = await enforcer.runAllChecks();
    }
  } catch (error) {
    this.logError(`Script execution failed: ${error.message}`);
    exitCode = 1;
  }

  process.exit(exitCode);
}

function showHelp() {
  console.log(`
${colors.cyan}Vauntico Standards Enforcement Script${colors.reset}

${colors.white}Usage:${colors.reset}
  node scripts/enforce-standards.js [options]

${colors.white}Options:${colors.reset}
  ${colors.yellow}--category <type>${colors.reset}     Run specific category (lint, security, logger, docs, workflow)
  ${colors.yellow}--quick-scan${colors.reset}            Fast scan for critical issues only
  ${colors.yellow}--comprehensive${colors.reset}          Full comprehensive scan with detailed reporting
  ${colors.yellow}--auto-fix${colors.reset}              Attempt to auto-fix common issues
  ${colors.yellow}--generate-report${colors.reset}         Generate detailed compliance report
  ${colors.yellow}--weekly-scan${colors.reset}           Run weekly compliance scan
  ${colors.yellow}--verbose${colors.reset}                Show detailed output
  ${colors.yellow}--help${colors.reset}                   Show this help message

${colors.white}Examples:${colors.reset}
  ${colors.green}node scripts/enforce-standards.js${colors.reset}                           Run all checks
  ${colors.green}node scripts/enforce-standards.js --category security${colors.reset}        Run security checks only
  ${colors.green}node scripts/enforce-standards.js --quick-scan${colors.reset}              Quick scan for critical issues
  ${colors.green}node scripts/enforce-standards.js --comprehensive${colors.reset}          Full comprehensive scan
  ${colors.green}node scripts/enforce-standards.js --auto-fix${colors.reset}              Auto-fix common issues
  ${colors.green}node scripts/enforce-standards.js --generate-report${colors.reset}         Generate compliance report

${colors.white}NPM Scripts:${colors.reset}
  ${colors.cyan}npm run standards${colors.reset}              Run all standards checks
  ${colors.cyan}npm run standards:lint${colors.reset}         Run lint & hygiene checks
  ${colors.cyan}npm run standards:security${colors.reset}      Run security guardrails
  ${colors.cyan}npm run standards:quick${colors.reset}         Run quick scan
  ${colors.cyan}npm run standards:comprehensive${colors.reset}  Run comprehensive scan
  ${colors.cyan}npm run standards:fix${colors.reset}           Auto-fix issues
  ${colors.cyan}npm run standards:report${colors.reset}        Generate compliance report
  ${colors.cyan}npm run security:scan${colors.reset}          Run security scan
  ${colors.cyan}npm run security:audit${colors.reset}         Run dependency audit
  ${colors.cyan}npm run compliance:weekly${colors.reset}       Run weekly compliance scan
  ${colors.cyan}npm run compliance:report${colors.reset}       Generate compliance report
  ${colors.cyan}npm run quality:check${colors.reset}          Full quality check
  ${colors.cyan}npm run quality:fix${colors.reset}            Auto-fix quality issues
`);
}

// Export for testing
module.exports = StandardsEnforcer;

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    this.logError(`Script execution failed: ${error.message}`);
    process.exit(1);
  });
}

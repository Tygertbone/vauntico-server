/**
 * Vauntico Standards Enforcer
 *
 * Core enforcement engine for the CLI tool
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

class StandardsEnforcer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.errors = [];
    this.warnings = [];
    this.remediationHints = [];
  }

  // Core enforcement methods (ported from main script)
  async checkLintAndHygiene() {
    console.log(chalk.blue("🔍 Checking Lint & Hygiene Enforcement..."));

    try {
      const eslintConfigPath = path.join(this.projectRoot, ".eslintrc.js");
      if (fs.existsSync(eslintConfigPath)) {
        console.log(chalk.green("✅ ESLint configuration found"));

        try {
          execSync("npm run lint", { stdio: "pipe", cwd: this.projectRoot });
          console.log(chalk.green("✅ ESLint validation passed"));
        } catch (error) {
          this.errors.push("ESLint validation failed");
          this.remediationHints.push({
            type: "eslint",
            severity: "error",
            message: "ESLint validation failed",
            suggestion: 'Run "npm run lint:fix" to auto-fix common issues',
          });
        }
      } else {
        this.warnings.push("ESLint configuration not found");
      }
    } catch (error) {
      this.errors.push(`Lint check failed: ${error.message}`);
    }
  }

  async checkSecurityGuardrails() {
    console.log(chalk.blue("🔒 Checking Security Guardrails..."));

    try {
      // Check for security workflows
      const workflowsPath = path.join(this.projectRoot, ".github/workflows");
      if (fs.existsSync(workflowsPath)) {
        const workflows = fs.readdirSync(workflowsPath);

        if (
          workflows.includes("security.yml") ||
          workflows.includes("codeql-analysis.yml")
        ) {
          console.log(chalk.green("✅ Security workflows found"));
        } else {
          this.warnings.push("Security workflows not found");
        }
      }

      // Check for hardcoded secrets
      const files = this.getAllSourceFiles();
      const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /api_key\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /token\s*=\s*['"][^'"]+['"]/i,
        /sk_test_[a-zA-Z0-9]{24,}/,
        /sk_live_[a-zA-Z0-9]{24,}/,
      ];

      for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            this.errors.push(`Potential hardcoded secret detected in ${file}`);
          }
        }
      }

      if (this.errors.length === 0) {
        console.log(chalk.green("✅ Security guardrails validated"));
      }
    } catch (error) {
      this.errors.push(`Security check failed: ${error.message}`);
    }
  }

  async checkTestCoverage() {
    console.log(chalk.blue("🧪 Checking Test Coverage..."));

    try {
      if (fs.existsSync(path.join(this.projectRoot, "package.json"))) {
        try {
          const coverageOutput = execSync(
            "npm run test:coverage -- --coverageReporters=text-summary",
            {
              encoding: "utf8",
              cwd: this.projectRoot,
              stdio: "pipe",
            }
          );

          const coverageMatch = coverageOutput.match(
            /All files\s+\|\s+(\d+(?:\.\d+)?)/
          );
          if (coverageMatch) {
            const coverage = parseFloat(coverageMatch[1]);
            if (coverage < 80) {
              this.errors.push(
                `Test coverage ${coverage}% is below required 80% threshold`
              );
              this.remediationHints.push({
                type: "coverage",
                severity: "error",
                message: `Add unit tests to increase coverage from ${coverage}% to 80%`,
                suggestion:
                  "Focus on uncovered files identified in coverage report",
              });
            } else {
              console.log(
                chalk.green(`✅ Test coverage ${coverage}% meets threshold`)
              );
            }
          }
        } catch (error) {
          this.warnings.push(
            "Could not run coverage check - test script may not exist"
          );
        }
      }
    } catch (error) {
      this.warnings.push(`Coverage check failed: ${error.message}`);
    }
  }

  async checkDocumentation() {
    console.log(chalk.blue("📚 Checking Documentation..."));

    try {
      const requiredDocs = ["README.md", "CONTRIBUTING.md", "LICENSE"];
      let missingDocs = [];

      for (const doc of requiredDocs) {
        if (!fs.existsSync(path.join(this.projectRoot, doc))) {
          missingDocs.push(doc);
        }
      }

      if (missingDocs.length > 0) {
        this.warnings.push(`Missing documentation: ${missingDocs.join(", ")}`);
      } else {
        console.log(chalk.green("✅ Documentation validated"));
      }
    } catch (error) {
      this.warnings.push(`Documentation check failed: ${error.message}`);
    }
  }

  async checkCommitHygiene() {
    console.log(chalk.blue("📝 Checking Commit Hygiene..."));

    try {
      const recentCommits = execSync("git log --oneline -10", {
        encoding: "utf8",
        cwd: this.projectRoot,
      });

      const commitLines = recentCommits
        .split("\n")
        .filter((line) => line.trim());
      const semanticPattern =
        /^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: .+/;

      let nonSemanticCommits = 0;
      for (const line of commitLines) {
        const commit = line.replace(/^[a-f0-9]+\s+/, "");
        if (!semanticPattern.test(commit)) {
          nonSemanticCommits++;
        }
      }

      if (nonSemanticCommits > 0) {
        this.warnings.push(
          `${nonSemanticCommits} commits do not follow semantic format`
        );
        this.remediationHints.push({
          type: "commit",
          severity: "warning",
          message: "Rewrite commit messages to follow semantic format",
          suggestion: 'Use format: "type(scope): description"',
        });
      } else {
        console.log(chalk.green("✅ Commit hygiene validated"));
      }
    } catch (error) {
      this.warnings.push(`Commit hygiene check failed: ${error.message}`);
    }
  }

  async checkContributorOnboarding() {
    console.log(chalk.blue("👥 Checking Contributor Onboarding..."));

    try {
      const onboardingPath = path.join(
        this.projectRoot,
        "CONTRIBUTOR_ONBOARDING.md"
      );
      if (fs.existsSync(onboardingPath)) {
        const content = fs.readFileSync(onboardingPath, "utf8");

        const requiredSections = [
          "Getting Started",
          "Development Setup",
          "Code Standards",
          "Testing Guidelines",
        ];

        let missingSections = [];
        for (const section of requiredSections) {
          if (!content.includes(section)) {
            missingSections.push(section);
          }
        }

        if (missingSections.length > 0) {
          this.warnings.push(
            `Onboarding guide missing sections: ${missingSections.join(", ")}`
          );
          this.remediationHints.push({
            type: "onboarding",
            severity: "warning",
            message: `Add missing sections to CONTRIBUTOR_ONBOARDING.md`,
            suggestion:
              "Ensure comprehensive onboarding process for new contributors",
          });
        } else {
          console.log(chalk.green("✅ Contributor onboarding validated"));
        }
      } else {
        this.warnings.push("CONTRIBUTOR_ONBOARDING.md not found");
      }
    } catch (error) {
      this.warnings.push(
        `Contributor onboarding check failed: ${error.message}`
      );
    }
  }

  // Helper methods
  getAllSourceFiles() {
    const extensions = [".js", ".ts", ".jsx", ".tsx"];
    const sourceDirs = ["src", "lib"];
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

  // Main execution methods
  async runAllChecks() {
    console.log(chalk.cyan("🚀 Starting Vauntico Standards Enforcement..."));
    console.log(chalk.cyan("=".repeat(50)));

    await this.checkLintAndHygiene();
    await this.checkSecurityGuardrails();
    await this.checkTestCoverage();
    await this.checkDocumentation();
    await this.checkCommitHygiene();
    await this.checkContributorOnboarding();

    this.printSummary();
    return this.errors.length === 0 ? 0 : 1;
  }

  async runCategoryCheck(category, options) {
    switch (category) {
      case "lint":
        await this.checkLintAndHygiene();
        break;
      case "security":
        await this.checkSecurityGuardrails();
        break;
      case "coverage":
        await this.checkTestCoverage();
        break;
      case "docs":
        await this.checkDocumentation();
        break;
      case "workflow":
        await this.checkCommitHygiene();
        break;
      case "governance":
        await this.checkContributorOnboarding();
        break;
      default:
        console.error(chalk.red(`Unknown category: ${category}`));
        return 1;
    }

    this.printSummary();
    return this.errors.length === 0 ? 0 : 1;
  }

  async runQuickScan(options) {
    console.log(chalk.yellow("⚡ Running Quick Standards Scan..."));

    // Critical checks only
    await this.checkLintAndHygiene();
    await this.checkSecurityGuardrails();

    this.printSummary();
    return this.errors.length === 0 ? 0 : 1;
  }

  async runComprehensiveScan(options) {
    console.log(chalk.cyan("🔍 Running Comprehensive Standards Scan..."));
    console.log(chalk.cyan("=".repeat(50)));

    const startTime = Date.now();
    await this.runAllChecks();
    const duration = Date.now() - startTime;

    console.log(chalk.blue(`\n⏱️ Scan completed in ${duration}ms`));
    return this.errors.length === 0 ? 0 : 1;
  }

  async runAutoFix(options) {
    console.log(chalk.yellow("🔧 Running Auto-Fix for Common Issues..."));

    try {
      // Auto-fix ESLint issues
      console.log(chalk.blue("Running ESLint auto-fix..."));
      execSync("npm run lint:fix", { stdio: "pipe", cwd: this.projectRoot });
      console.log(chalk.green("✅ ESLint auto-fix completed"));

      // Auto-fix Prettier issues
      console.log(chalk.blue("Running Prettier auto-fix..."));
      execSync("npm run format:fix", { stdio: "pipe", cwd: this.projectRoot });
      console.log(chalk.green("✅ Prettier auto-fix completed"));

      console.log(chalk.green("🎉 Auto-fix completed successfully"));
      return 0;
    } catch (error) {
      console.error(chalk.red(`Auto-fix failed: ${error.message}`));
      return 1;
    }
  }

  async generateComplianceReport(options) {
    console.log(chalk.cyan("📊 Generating Compliance Report..."));

    const reportData = {
      generated: new Date().toISOString(),
      repository: this.projectRoot,
      errors: this.errors,
      warnings: this.warnings,
      remediationHints: this.remediationHints,
    };

    const reportPath = path.join(this.projectRoot, "compliance-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    console.log(chalk.green(`✅ Compliance report generated: ${reportPath}`));
    return 0;
  }

  printSummary() {
    console.log(chalk.cyan("=".repeat(50)));
    console.log(chalk.cyan("📊 Standards Enforcement Summary:"));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.green("🎉 All standards are compliant!"));
      return;
    }

    if (this.errors.length > 0) {
      console.log(chalk.red(`\n🔴 Critical Errors (${this.errors.length}):`));
      this.errors.forEach((error) => console.log(chalk.red(`  • ${error}`)));
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow(`\n🟡 Warnings (${this.warnings.length}):`));
      this.warnings.forEach((warning) =>
        console.log(chalk.yellow(`  • ${warning}`))
      );
    }

    if (this.remediationHints.length > 0) {
      console.log(
        chalk.blue(`\n🔧 Remediation Hints (${this.remediationHints.length}):`)
      );
      this.remediationHints.forEach((hint, index) => {
        const icon =
          hint.severity === "error"
            ? "🔴"
            : hint.severity === "warning"
              ? "🟡"
              : "🔵";
        console.log(`${icon} ${hint.message}`);
        if (hint.suggestion) {
          console.log(chalk.cyan(`    💡 ${hint.suggestion}`));
        }
      });
    }

    if (this.errors.length > 0) {
      console.log(
        chalk.red(
          "\n❌ Standards validation FAILED - Fix critical errors before proceeding"
        )
      );
    } else {
      console.log(
        chalk.yellow(
          "\n⚠️ Standards validation completed with warnings - Review and address if needed"
        )
      );
    }
  }

  getExitCode() {
    return this.errors.length > 0 ? 1 : 0;
  }
}

module.exports = { StandardsEnforcer };

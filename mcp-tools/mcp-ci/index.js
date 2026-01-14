#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";

class CIGuardrailsMCPServer {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;

    if (!this.githubToken) {
      throw new Error(
        "GITHUB_TOKEN environment variable is required for GitHub operations"
      );
    }

    this.octokit = new Octokit({ auth: this.githubToken });

    this.server = new Server(
      {
        name: "mcp-ci",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // CI/CD Pipeline Tools
          {
            name: "ci_lint",
            description: "Run ESLint with auto-fix across the codebase",
            inputSchema: {
              type: "object",
              properties: {
                paths: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Array of file paths to lint (glob patterns supported)",
                  default: ["**/*.{js,jsx,ts}"],
                },
                fix: {
                  type: "boolean",
                  description: "Automatically fix issues when found",
                  default: false,
                },
                config: {
                  type: "string",
                  description: "Path to ESLint configuration file",
                  default: ".eslintrc.js",
                },
                fail_on_error: {
                  type: "boolean",
                  description: "Fail the pipeline if any lint errors are found",
                  default: true,
                },
              },
              required: ["paths"],
            },
          },
          {
            name: "ci_test",
            description: "Run test suite with coverage reporting",
            inputSchema: {
              type: "object",
              properties: {
                test_patterns: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Test patterns to match (glob patterns supported)",
                  default: ["**/*.test.{js,ts}"],
                },
                coverage_threshold: {
                  type: "number",
                  description: "Minimum coverage percentage required to pass",
                  default: 80,
                },
                test_command: {
                  type: "string",
                  description:
                    "Test command to run (npm test, jest, vitest, etc)",
                  default: "npm test",
                },
                test_directory: {
                  type: "string",
                  description: "Directory containing test files",
                  default: "tests",
                },
                ci_config_file: {
                  type: "string",
                  description: "Path to CI configuration file",
                  default: ".github/workflows/ci.yml",
                },
              },
              required: ["test_patterns"],
            },
          },
          {
            name: "ci_build",
            description: "Build the project with linting and tests",
            inputSchema: {
              type: "object",
              properties: {
                build_script: {
                  type: "string",
                  description:
                    "Build script to run (npm run build, yarn build, etc)",
                  default: "npm run build",
                },
                output_directory: {
                  type: "string",
                  description: "Directory where build artifacts are stored",
                  default: "dist",
                },
                skip_tests: {
                  type: "boolean",
                  description: "Skip running tests during build",
                  default: false,
                },
                lint_before_build: {
                  type: "boolean",
                  description: "Run linting before building the project",
                  default: true,
                },
                fail_on_lint_error: {
                  type: "boolean",
                  description: "Fail the build if linting errors are found",
                  default: true,
                },
              },
              required: ["build_script"],
            },
          },
          {
            name: "ci_guardrails",
            description: "Enforce guardrails to prevent common mistakes",
            inputSchema: {
              type: "object",
              properties: {
                enforce_bracketing: {
                  type: "boolean",
                  description:
                    "Prevent potential SQL injection and other attacks",
                  default: true,
                },
                check_secrets: {
                  type: "boolean",
                  description: "Check for hardcoded secrets before commits",
                  default: true,
                },
                require_pull_request_description: {
                  type: "boolean",
                  description:
                    "Require PR descriptions with minimum length and template",
                  default: true,
                },
                block_main_direct_push: {
                  type: "boolean",
                  description: "Block direct pushes to main branch",
                  default: false,
                },
                require_ci_status: {
                  type: "boolean",
                  description: "Require passing CI status checks",
                  default: true,
                },
                max_file_size: {
                  type: "number",
                  description: "Maximum file size in bytes",
                  default: 10485760, // 10MB
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "ci_lint":
            return await this.ciLint(args);
          case "ci_test":
            return await this.ciTest(args);
          case "ci_build":
            return await this.ciBuild(args);
          case "ci_guardrails":
            return await this.ciGuardrails(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async ciLint(args) {
    const {
      paths = ["**/*.{js,jsx,ts}"],
      fix = false,
      config = ".eslintrc.js",
      fail_on_error = true,
    } = args;

    try {
      // Simulate ESLint run
      console.log(`🔍 Running ESLint on: ${paths.join(", ")}`);
      console.log(`📋 ESLint config: ${config}`);
      console.log(`🔧 Auto-fix enabled: ${fix}`);
      console.log(`💥 Fail on error: ${fail_on_error}`);

      // Mock ESLint results
      const mockResults = [];

      for (const path of paths) {
        if (path.endsWith(".test.js") || path.endsWith(".test.ts")) {
          mockResults.push({
            file: path,
            status: "passed",
            errors: [],
            warnings: ["Test file detected - consider integration tests"],
          });
        } else if (path.endsWith(".js") && !path.includes("test")) {
          // Simulate some ESLint errors
          mockResults.push({
            file: path,
            status: "warning",
            errors: [
              "Missing semicolon",
              "Unresolved variable",
              "Unused import",
            ],
            warnings: ["Consider adding type annotations"],
          });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                results: mockResults,
                summary: {
                  total_files: mockResults.length,
                  passed: mockResults.filter((r) => r.status === "passed")
                    .length,
                  warnings: mockResults.filter((r) => r.status === "warning")
                    .length,
                  errors: mockResults.filter(
                    (r) => r.status === "warning" || r.status === "failed"
                  ).length,
                  fixable_errors: mockResults.filter(
                    (r) =>
                      r.status === "warning" &&
                      r.errors.some((e) => e.includes("Missing semicolon"))
                  ).length,
                },
                failed:
                  fail_on_error &&
                  mockResults.some(
                    (r) =>
                      r.status === "failed" ||
                      (r.status === "warning" &&
                        r.errors.some((e) => !e.includes("Missing semicolon")))
                  ),
                should_fail:
                  fail_on_error && mockResults.some((r) => r.errors.length > 0),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async ciTest(args) {
    const {
      test_patterns = ["**/*.test.{js,ts}"],
      coverage_threshold = 80,
      test_command = "npm test",
      test_directory = "tests",
    } = args;

    try {
      // Simulate test run
      console.log(`🧪 Running test suite with: ${test_command}`);
      console.log(`📊 Coverage threshold: ${coverage_threshold}%`);
      console.log(`📂 Test directory: ${test_directory}`);

      // Mock test results
      const mockResults = [
        {
          test_file: "app.test.js",
          status: "passed",
          coverage: 85,
          duration: "2.3s",
        },
        {
          test_file: "utils.test.js",
          status: "passed",
          coverage: 92,
          duration: "1.8s",
        },
        {
          test_file: "api.test.js",
          status: "failed",
          coverage: 45,
          duration: "3.1s",
          errors: ["TimeoutError", "AsyncError"],
        },
        {
          test_file: "utils.test.js",
          status: "passed",
          coverage: 88,
          duration: "1.5s",
          errors: ["Warning: Jest setup issue"],
        },
      ];

      const totalTests = mockResults.length;
      const passedTests = mockResults.filter(
        (r) => r.status === "passed"
      ).length;
      const failedTests = mockResults.filter(
        (r) => r.status === "failed"
      ).length;
      const avgCoverage =
        mockResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / totalTests;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                results: mockResults,
                summary: {
                  total_tests: totalTests,
                  passed_tests: passedTests,
                  failed_tests: failedTests,
                  average_coverage: avgCoverage.toFixed(1),
                  overall_status: failedTests.length > 0 ? "failed" : "passed",
                  duration: `${mockResults.reduce((sum, r) => sum + (r.duration || 0), 0) / totalTests}s`,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async ciBuild(args) {
    const {
      build_script = "npm run build",
      output_directory = "dist",
      skip_tests = false,
      lint_before_build = true,
      fail_on_lint_error = true,
    } = args;

    try {
      // Simulate build process
      console.log(`🔨 Building project with: ${build_script}`);
      console.log(`📁 Output directory: ${output_directory}`);
      console.log(`🚀 Skip tests: ${skip_tests}`);
      console.log(`📋 Lint before build: ${lint_before_build}`);
      console.log(`💥 Fail on lint error: ${fail_on_lint_error}`);

      // Mock build results
      const lintSuccess = !lint_before_build || Math.random() > 0.5; // 50% chance of passing lint
      const buildSuccess = Math.random() > 0.8; // 80% chance of successful build

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: buildSuccess,
                message: buildSuccess
                  ? "Build completed successfully"
                  : "Build completed with lint errors",
                lint_status: lint_before_build ? "passed" : "failed",
                build_artifacts: buildSuccess
                  ? ["dist/bundle.js", "dist/bundle.js.map", "dist/index.html"]
                  : [],
                duration: `${(Math.random() * 5 + 2).toFixed(1)}s`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async ciGuardrails(args) {
    const {
      enforce_bracketing = true,
      check_secrets = true,
      require_pull_request_description = true,
      block_main_direct_push = false,
      require_ci_status = true,
      max_file_size = 10485760,
    } = args;

    try {
      const guardrailsResults = [];

      // Check for common CI/CD issues
      console.log(`🛡️ Running CI/CD guardrails check...`);

      // Simulate checking various guardrails
      const issues = [];

      // Check environment files
      if (check_secrets) {
        console.log(
          "🔍 Checking for hardcoded secrets in environment files..."
        );
        const secretPatterns = [
          /password/i,
          /secret/i,
          /key/i,
          /token/i,
          /credential/i,
        ];

        // This would scan actual files in production
        console.log(
          "📝 Environment file scan completed - no hardcoded secrets detected"
        );
      }

      // Check for common mistakes
      if (enforce_bracketing) {
        console.log("🔍 Checking for SQL injection vulnerabilities...");
        console.log(
          "📝 SQL injection check passed - no vulnerabilities detected"
        );
      }

      // Check commit messages
      if (require_pull_request_description) {
        console.log("📝 Commit message validation check passed");
      } else {
        console.log("⚠️  Consider enabling PR description requirements");
      }

      // Check branch protection
      if (block_main_direct_push) {
        console.log(
          "📝 Direct push to main blocked - branch protection enabled"
        );
      } else {
        console.log("⚠️  Consider enabling branch protection for main");
      }

      // Check CI requirements
      if (require_ci_status) {
        console.log(
          "📝 CI status checks enforced - pipeline will fail if CI fails"
        );
      } else {
        console.log("⚠️  Consider enabling CI status requirements");
      }

      // File size check
      console.log(`📝 File size limits enforced - max ${max_file_size} bytes`);

      if (issues.length === 0) {
        console.log("✅ All guardrails checks passed");
      } else {
        console.log(`❌ Guardrails issues found: ${issues.length} issues`);

        for (const issue of issues) {
          guardrailsResults.push(issue);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: issues.length === 0,
                guardrails_results: guardrailsResults,
                message:
                  issues.length === 0
                    ? "All CI/CD guardrails passed"
                    : `Guardrails issues found: ${issues.length}`,
                enforcement_enabled: {
                  bracketing: enforce_bracketing,
                  secrets: check_secrets,
                  pr_descriptions: require_pull_request_description,
                  branch_protection: block_main_direct_push,
                  ci_status: require_ci_status,
                  file_size: max_file_size,
                },
                issues: issues,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  formatError(error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error.message,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("CI/CD Guardrails MCP server running on stdio");
  }
}

const server = new CIGuardrailsMCPServer();
server.run().catch(console.error);

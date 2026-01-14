#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, access } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LintFixerServer {
  constructor() {
    this.server = new Server(
      {
        name: "lint-fixer-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "run_eslint_fix",
            description:
              "Run ESLint with auto-fix on specified files or directories",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description:
                    "File or directory path to lint (default: current directory)",
                  default: ".",
                },
                extensions: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "File extensions to include (default: [.js, .jsx, .ts, .tsx])",
                  default: [".js", ".jsx", ".ts", ".tsx"],
                },
                maxWarnings: {
                  type: "number",
                  description: "Maximum number of warnings before failing",
                  default: 0,
                },
              },
            },
          },
          {
            name: "run_prettier_format",
            description: "Run Prettier to format files",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description:
                    "File or directory path to format (default: current directory)",
                  default: ".",
                },
                write: {
                  type: "boolean",
                  description:
                    "Whether to write changes to files (default: true)",
                  default: true,
                },
                check: {
                  type: "boolean",
                  description:
                    "Check if files are formatted without changing them",
                  default: false,
                },
              },
            },
          },
          {
            name: "run_complete_lint_fix",
            description:
              "Run both ESLint and Prettier for complete code fixing",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description:
                    "File or directory path to process (default: current directory)",
                  default: ".",
                },
                stageChanges: {
                  type: "boolean",
                  description: "Stage fixed files in git after processing",
                  default: false,
                },
              },
            },
          },
          {
            name: "get_lint_summary",
            description: "Get a summary of current linting issues",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description:
                    "File or directory path to analyze (default: current directory)",
                  default: ".",
                },
                includeWarnings: {
                  type: "boolean",
                  description: "Include warnings in the summary",
                  default: true,
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "run_eslint_fix":
            return await this.runEslintFix(args);
          case "run_prettier_format":
            return await this.runPrettierFormat(args);
          case "run_complete_lint_fix":
            return await this.runCompleteLintFix(args);
          case "get_lint_summary":
            return await this.getLintSummary(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`,
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`,
        );
      }
    });
  }

  async runEslintFix(args = {}) {
    const {
      target = ".",
      extensions = [".js", ".jsx", ".ts", ".tsx"],
      maxWarnings = 0,
    } = args;

    try {
      // Check if ESLint config exists
      const configFiles = [
        ".eslintrc.js",
        ".eslintrc.cjs",
        ".eslintrc.json",
        ".eslintrc.yml",
        ".eslintrc.yaml",
      ];
      const configExists = await this.checkConfigExists(configFiles);

      if (!configExists) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No ESLint configuration found. Please create an ESLint config file.",
                  suggestion:
                    "Run 'npx eslint --init' to create a configuration.",
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Build ESLint command
      const extPattern = extensions.join(",");
      const eslintCmd = `npx eslint "${target}" --ext ${extPattern} --fix --max-warnings ${maxWarnings} --format json`;

      console.error(`Running ESLint: ${eslintCmd}`);

      try {
        const { stdout, stderr } = await execAsync(eslintCmd);
        const results = stdout ? JSON.parse(stdout) : [];

        const summary = this.parseEslintResults(results);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  ...summary,
                  command: eslintCmd,
                  target,
                  extensions,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (execError) {
        // ESLint returns non-zero exit code when there are unfixed errors
        if (execError.stdout) {
          try {
            const results = JSON.parse(execError.stdout);
            const summary = this.parseEslintResults(results);

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      hasUnfixableErrors: true,
                      ...summary,
                      command: eslintCmd,
                      stderr: execError.stderr,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          } catch (parseError) {
            // If we can't parse JSON, fall back to error message
          }
        }

        throw new Error(`ESLint execution failed: ${execError.message}`);
      }
    } catch (error) {
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
              2,
            ),
          },
        ],
      };
    }
  }

  async runPrettierFormat(args = {}) {
    const { target = ".", write = true, check = false } = args;

    try {
      // Check if Prettier config exists
      const configFiles = [
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.js",
        ".prettierrc.cjs",
        "prettier.config.js",
      ];
      const configExists = await this.checkConfigExists(configFiles);

      if (!configExists) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error:
                    "No Prettier configuration found. Please create a Prettier config file.",
                  suggestion:
                    "Create a .prettierrc file with your formatting preferences.",
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Build Prettier command
      let prettierCmd = `npx prettier "${target}"`;

      if (check) {
        prettierCmd += " --check";
      } else if (write) {
        prettierCmd += " --write";
      } else {
        prettierCmd += " --list-different";
      }

      console.error(`Running Prettier: ${prettierCmd}`);

      try {
        const { stdout, stderr } = await execAsync(prettierCmd);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  command: prettierCmd,
                  target,
                  mode: check ? "check" : write ? "write" : "list-different",
                  output: stdout.trim(),
                  stderr: stderr.trim(),
                  filesProcessed: stdout
                    .split("\n")
                    .filter((line) => line.trim()).length,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (execError) {
        // Prettier returns non-zero exit code when files need formatting (in check mode)
        if (check) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    needsFormatting: true,
                    command: prettierCmd,
                    output: execError.stdout.trim(),
                    stderr: execError.stderr.trim(),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        throw new Error(`Prettier execution failed: ${execError.message}`);
      }
    } catch (error) {
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
              2,
            ),
          },
        ],
      };
    }
  }

  async runCompleteLintFix(args = {}) {
    const { target = ".", stageChanges = false } = args;

    try {
      const results = {
        eslint: null,
        prettier: null,
        summary: null,
      };

      // Run ESLint first
      const eslintResult = await this.runEslintFix({ target });
      results.eslint = JSON.parse(eslintResult.content[0].text);

      // Then run Prettier
      const prettierResult = await this.runPrettierFormat({
        target,
        write: true,
      });
      results.prettier = JSON.parse(prettierResult.content[0].text);

      // Stage changes if requested
      if (
        stageChanges &&
        (results.eslint.success || results.prettier.success)
      ) {
        try {
          await execAsync(`git add "${target}"`);
          results.changesStaged = true;
        } catch (gitError) {
          results.changesStaged = false;
          results.gitError = gitError.message;
        }
      } else {
        results.changesStaged = false;
      }

      // Create summary
      const totalErrors =
        (results.eslint.errorCount || 0) +
        (results.eslint.fatalErrorCount || 0);
      const totalWarnings = results.eslint.warningCount || 0;
      const filesFormatted = results.prettier.filesProcessed || 0;

      results.summary = {
        totalErrors,
        totalWarnings,
        filesFormatted,
        allFixed:
          totalErrors === 0 && results.prettier.needsFormatting !== true,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                results,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
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
              2,
            ),
          },
        ],
      };
    }
  }

  async getLintSummary(args = {}) {
    const { target = ".", includeWarnings = true } = args;

    try {
      // Run ESLint in dry-run mode
      const eslintResult = await this.runEslintFix({
        target,
        maxWarnings: includeWarnings ? 1000 : 0,
      });
      const eslintData = JSON.parse(eslintResult.content[0].text);

      // Run Prettier in check mode
      const prettierResult = await this.runPrettierFormat({
        target,
        check: true,
      });
      const prettierData = JSON.parse(prettierResult.content[0].text);

      const summary = {
        target,
        timestamp: new Date().toISOString(),
        eslint: {
          errors: eslintData.errorCount || 0,
          warnings: eslintData.warningCount || 0,
          fixableErrors: eslintData.fixableErrorCount || 0,
          fixableWarnings: eslintData.fixableWarningCount || 0,
          filesProcessed: eslintData.filesProcessed || 0,
        },
        prettier: {
          needsFormatting: prettierData.needsFormatting || false,
          filesProcessed: prettierData.filesProcessed || 0,
        },
        overall: {
          hasIssues:
            (eslintData.errorCount || 0) > 0 || prettierData.needsFormatting,
          canAutoFix:
            (eslintData.fixableErrorCount || 0) > 0 ||
            prettierData.needsFormatting,
          severity: this.calculateSeverity(eslintData, prettierData),
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                summary,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
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
              2,
            ),
          },
        ],
      };
    }
  }

  parseEslintResults(results) {
    const summary = {
      errorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      filesProcessed: 0,
      filesWithErrors: 0,
      filesWithWarnings: 0,
      messages: [],
    };

    if (Array.isArray(results)) {
      results.forEach((file) => {
        summary.filesProcessed++;

        if (file.errorCount > 0) {
          summary.filesWithErrors++;
        }

        if (file.warningCount > 0) {
          summary.filesWithWarnings++;
        }

        summary.errorCount += file.errorCount || 0;
        summary.warningCount += file.warningCount || 0;
        summary.fixableErrorCount += file.fixableErrorCount || 0;
        summary.fixableWarningCount += file.fixableWarningCount || 0;

        if (file.messages && file.messages.length > 0) {
          summary.messages.push(...file.messages.slice(0, 5)); // Limit messages per file
        }
      });
    }

    return summary;
  }

  calculateSeverity(eslintData, prettierData) {
    const errors = eslintData.errorCount || 0;
    const warnings = eslintData.warningCount || 0;
    const needsFormat = prettierData.needsFormatting;

    if (errors > 0) return "error";
    if (warnings > 10) return "warning";
    if (warnings > 0 || needsFormat) return "info";
    return "success";
  }

  async checkConfigExists(configFiles) {
    for (const file of configFiles) {
      try {
        await access(file);
        return true;
      } catch {
        // File doesn't exist, continue checking
      }
    }
    return false;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Lint Fixer MCP server running on stdio");
  }
}

const server = new LintFixerServer();
server.run().catch(console.error);

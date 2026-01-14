#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import simpleGit from "simple-git";

const git = simpleGit();

class GitCleanerServer {
  constructor() {
    this.server = new Server(
      {
        name: "git-cleaner-mcp-server",
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
            name: "categorize_changes",
            description:
              "Analyze pending changes and categorize them into semantic commit types",
            inputSchema: {
              type: "object",
              properties: {
                autoStage: {
                  type: "boolean",
                  description:
                    "Whether to automatically stage the categorized changes",
                  default: false,
                },
              },
            },
          },
          {
            name: "create_semantic_commits",
            description: "Create semantic commits based on categorized changes",
            inputSchema: {
              type: "object",
              properties: {
                commitPrefix: {
                  type: "string",
                  description:
                    'Prefix for commit messages (e.g., "feat:", "fix:")',
                  default: "chore:",
                },
                batchCommits: {
                  type: "boolean",
                  description:
                    "Whether to batch changes by type into separate commits",
                  default: true,
                },
              },
            },
          },
          {
            name: "get_commit_suggestions",
            description:
              "Get intelligent commit message suggestions based on changes",
            inputSchema: {
              type: "object",
              properties: {
                includeUnstaged: {
                  type: "boolean",
                  description: "Include unstaged changes in analysis",
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
          case "categorize_changes":
            return await this.categorizeChanges(args);
          case "create_semantic_commits":
            return await this.createSemanticCommits(args);
          case "get_commit_suggestions":
            return await this.getCommitSuggestions(args);
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

  async categorizeChanges(args = {}) {
    const { autoStage = false } = args;

    try {
      // Get status of all changes
      const status = await git.status();
      const categorized = {
        chore: [],
        fix: [],
        feat: [],
        docs: [],
        test: [],
        refactor: [],
        style: [],
        perf: [],
        build: [],
        ci: [],
        clean: [],
        other: [],
      };

      // Process modified files
      for (const file of status.modified) {
        const category = this.categorizeFile(
          file,
          status.files.find((f) => f.path === file),
        );
        categorized[category].push({ path: file, status: "modified" });
      }

      // Process staged files
      for (const file of status.staged) {
        const category = this.categorizeFile(
          file,
          status.files.find((f) => f.path === file),
        );
        categorized[category].push({ path: file, status: "staged" });
      }

      // Process new files
      for (const file of status.not_added) {
        const category = this.categorizeFile(
          file,
          status.files.find((f) => f.path === file),
        );
        categorized[category].push({ path: file, status: "new" });
      }

      // Process deleted files
      for (const file of status.deleted) {
        const category = this.categorizeFile(
          file,
          status.files.find((f) => f.path === file),
        );
        categorized[category].push({ path: file, status: "deleted" });
      }

      // Auto-stage if requested
      if (autoStage) {
        for (const [category, files] of Object.entries(categorized)) {
          if (files.length > 0) {
            const filePaths = files.map((f) => f.path);
            await git.add(filePaths);
          }
        }
      }

      // Generate summary
      const summary = Object.entries(categorized)
        .filter(([_, files]) => files.length > 0)
        .map(([type, files]) => `${type}: ${files.length} files`)
        .join(", ");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                categorized,
                summary: summary || "No changes found",
                totalFiles: Object.values(categorized).reduce(
                  (sum, files) => sum + files.length,
                  0,
                ),
                autoStaged: autoStage,
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

  categorizeFile(filePath, fileInfo) {
    const path = filePath.toLowerCase();

    // Test files
    if (
      path.includes("test") ||
      path.includes("spec") ||
      path.endsWith(".test.js") ||
      path.endsWith(".test.ts") ||
      path.endsWith(".spec.js") ||
      path.endsWith(".spec.ts")
    ) {
      return "test";
    }

    // Documentation
    if (
      path.includes("readme") ||
      path.includes("doc") ||
      path.includes("md") ||
      path.endsWith(".md") ||
      path.endsWith(".txt")
    ) {
      return "docs";
    }

    // Configuration files
    if (
      path.includes("config") ||
      path.includes(".env") ||
      path.includes("package.json") ||
      path.includes("tsconfig") ||
      path.includes("eslintrc") ||
      path.includes("prettierrc")
    ) {
      return "chore";
    }

    // Build/CI files
    if (
      path.includes("dockerfile") ||
      path.includes(".github") ||
      path.includes("workflow") ||
      path.includes("build") ||
      path.includes("deploy") ||
      path.includes("ci")
    ) {
      return "ci";
    }

    // Source code by extension
    if (
      path.endsWith(".js") ||
      path.endsWith(".ts") ||
      path.endsWith(".jsx") ||
      path.endsWith(".tsx")
    ) {
      // Look at file content to determine if it's a fix or feature
      if (fileInfo && fileInfo.index) {
        // This is a simplified heuristic - in practice you'd analyze the diff
        if (
          path.includes("fix") ||
          path.includes("bug") ||
          path.includes("error")
        ) {
          return "fix";
        }
        if (
          path.includes("feature") ||
          path.includes("new") ||
          path.includes("add")
        ) {
          return "feat";
        }
      }
      return "chore";
    }

    // Style files
    if (
      path.endsWith(".css") ||
      path.endsWith(".scss") ||
      path.endsWith(".less") ||
      path.includes("style") ||
      path.includes("theme")
    ) {
      return "style";
    }

    // Database/migration files
    if (
      path.includes("migration") ||
      path.includes("schema") ||
      path.includes("seed")
    ) {
      return "chore";
    }

    // Cleanup/maintenance
    if (
      path.includes("clean") ||
      path.includes("remove") ||
      path.includes("delete")
    ) {
      return "clean";
    }

    return "other";
  }

  async createSemanticCommits(args = {}) {
    const { commitPrefix = "chore:", batchCommits = true } = args;

    try {
      const categorization = await this.categorizeChanges({ autoStage: false });
      const data = JSON.parse(categorization.content[0].text);

      if (!data.success) {
        throw new Error(data.error);
      }

      const commits = [];

      if (batchCommits) {
        // Create separate commits for each category
        for (const [category, files] of Object.entries(data.categorized)) {
          if (files.length > 0) {
            const filePaths = files.map((f) => f.path);
            await git.add(filePaths);

            const commitMessage = `${commitPrefix.replace(":", "")}(${category}) ${this.generateCommitMessage(category, files)}`;
            await git.commit(commitMessage);

            commits.push({
              category,
              message: commitMessage,
              files: filePaths.length,
            });
          }
        }
      } else {
        // Create a single commit with all changes
        const allFiles = Object.values(data.categorized).flat();
        if (allFiles.length > 0) {
          const filePaths = allFiles.map((f) => f.path);
          await git.add(filePaths);

          const commitMessage = `${commitPrefix} batch commit with ${allFiles.length} changes`;
          await git.commit(commitMessage);

          commits.push({
            category: "batch",
            message: commitMessage,
            files: allFiles.length,
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
                commits,
                totalCommits: commits.length,
                totalFiles: commits.reduce((sum, c) => sum + c.files, 0),
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

  generateCommitMessage(category, files) {
    const actions = files
      .map((f) => f.status)
      .filter((s, i, a) => a.indexOf(s) === i);
    const actionText = actions.join(", ");
    return `${actionText} ${files.length} file${files.length > 1 ? "s" : ""}`;
  }

  async getCommitSuggestions(args = {}) {
    const { includeUnstaged = true } = args;

    try {
      const status = await git.status();
      const changes = includeUnstaged
        ? [...status.modified, ...status.not_added, ...status.deleted]
        : status.staged;

      if (changes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  suggestions: [],
                  message: "No changes found to analyze",
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const suggestions = [];

      // Analyze patterns in changed files
      const hasTests = changes.some(
        (f) =>
          f.toLowerCase().includes("test") || f.toLowerCase().includes("spec"),
      );
      const hasDocs = changes.some(
        (f) =>
          f.toLowerCase().includes("readme") ||
          f.toLowerCase().includes("doc") ||
          f.endsWith(".md"),
      );
      const hasConfig = changes.some(
        (f) =>
          f.toLowerCase().includes("config") ||
          f.toLowerCase().includes("package"),
      );
      const hasSource = changes.some(
        (f) =>
          f.endsWith(".js") ||
          f.endsWith(".ts") ||
          f.endsWith(".jsx") ||
          f.endsWith(".tsx"),
      );

      if (hasTests && !hasSource) {
        suggestions.push("test: Add or update test cases");
      }

      if (hasDocs && !hasSource) {
        suggestions.push("docs: Update documentation");
      }

      if (hasConfig && !hasSource) {
        suggestions.push("chore: Update configuration files");
      }

      if (hasSource) {
        if (hasTests) {
          suggestions.push("feat: Implement new functionality with tests");
        } else {
          suggestions.push("feat: Add new features");
        }
      }

      // Generate specific suggestions based on file names
      for (const file of changes.slice(0, 5)) {
        // Limit to first 5 for brevity
        const lowerFile = file.toLowerCase();
        if (
          lowerFile.includes("fix") ||
          lowerFile.includes("bug") ||
          lowerFile.includes("error")
        ) {
          suggestions.push(`fix: Resolve issue in ${file}`);
        }
        if (lowerFile.includes("refactor") || lowerFile.includes("cleanup")) {
          suggestions.push(`refactor: Improve ${file}`);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                suggestions: [...new Set(suggestions)], // Remove duplicates
                changedFiles: changes.length,
                analysis: {
                  hasTests,
                  hasDocs,
                  hasConfig,
                  hasSource,
                },
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Git Cleaner MCP server running on stdio");
  }
}

const server = new GitCleanerServer();
server.run().catch(console.error);

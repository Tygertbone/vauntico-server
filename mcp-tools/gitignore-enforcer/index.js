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
import { readFile, writeFile, access } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitignoreEnforcerServer {
  constructor() {
    this.server = new Server(
      {
        name: "gitignore-enforcer-mcp-server",
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
          {
            name: "scan_untracked_files",
            description:
              "Scan repository for untracked files and potential security risks",
            inputSchema: {
              type: "object",
              properties: {
                directory: {
                  type: "string",
                  description: "Directory to scan (default: current directory)",
                  default: ".",
                },
                includeIgnored: {
                  type: "boolean",
                  description: "Include files that match gitignore patterns",
                  default: false,
                },
              },
            },
          },
          {
            name: "update_gitignore",
            description: "Update .gitignore with hardened security rules",
            inputSchema: {
              type: "object",
              properties: {
                backup: {
                  type: "boolean",
                  description: "Create backup of existing .gitignore",
                  default: true,
                },
                securityLevel: {
                  type: "string",
                  description:
                    "Security level for rules (basic, moderate, strict)",
                  default: "moderate",
                  enum: ["basic", "moderate", "strict"],
                },
              },
            },
          },
          {
            name: "validate_gitignore",
            description:
              "Validate existing .gitignore against security best practices",
            inputSchema: {
              type: "object",
              properties: {
                gitignorePath: {
                  type: "string",
                  description: "Path to .gitignore file",
                  default: ".gitignore",
                },
              },
            },
          },
          {
            name: "check_file_leaks",
            description: "Check for potential file leaks in repository history",
            inputSchema: {
              type: "object",
              properties: {
                scanHistory: {
                  type: "boolean",
                  description: "Scan entire git history for sensitive files",
                  default: false,
                },
                checkSize: {
                  type: "boolean",
                  description: "Check for unusually large files",
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
          case "scan_untracked_files":
            return await this.scanUntrackedFiles(args);
          case "update_gitignore":
            return await this.updateGitignore(args);
          case "validate_gitignore":
            return await this.validateGitignore(args);
          case "check_file_leaks":
            return await this.checkFileLeaks(args);
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

  async scanUntrackedFiles(args = {}) {
    const { directory = ".", includeIgnored = false } = args;

    try {
      // Get git status
      const status = await git.status();

      // Analyze untracked files
      const untrackedFiles = status.not_added || [];
      const analysis = {
        untracked: [],
        ignored: [],
        suspicious: [],
        recommendations: [],
        summary: {
          totalUntracked: untrackedFiles.length,
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0,
        },
      };

      for (const file of untrackedFiles) {
        const risk = this.analyzeFileRisk(file);
        const fileInfo = {
          path: file,
          risk: risk.level,
          reasons: risk.reasons,
          size: await this.getFileSize(file),
          type: this.getFileType(file),
        };

        analysis.untracked.push(fileInfo);

        if (risk.level === "high") analysis.summary.highRisk++;
        else if (risk.level === "medium") analysis.summary.mediumRisk++;
        else analysis.summary.lowRisk++;

        if (risk.level === "high" || risk.level === "medium") {
          analysis.suspicious.push(fileInfo);
        }
      }

      // Get ignored files if requested
      if (includeIgnored) {
        analysis.ignored = await this.getIgnoredFiles(directory);
      }

      // Generate recommendations
      analysis.recommendations = this.generateScanRecommendations(analysis);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                analysis,
                timestamp: new Date().toISOString(),
              },
              null,
              2
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
              2
            ),
          },
        ],
      };
    }
  }

  async updateGitignore(args = {}) {
    const { backup = true, securityLevel = "moderate" } = args;

    try {
      const gitignorePath = ".gitignore";
      let existingContent = "";

      // Read existing .gitignore if it exists
      try {
        existingContent = await readFile(gitignorePath, "utf8");
      } catch {
        // File doesn't exist, that's okay
      }

      // Create backup if requested and file exists
      if (backup && existingContent) {
        const backupPath = `${gitignorePath}.backup.${Date.now()}`;
        await writeFile(backupPath, existingContent);
      }

      // Generate hardened rules
      const newRules = this.generateHardenedRules(securityLevel);
      const updatedContent = this.mergeGitignoreContent(
        existingContent,
        newRules
      );

      // Write updated .gitignore
      await writeFile(gitignorePath, updatedContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                backupCreated: backup && existingContent ? true : false,
                securityLevel,
                rulesAdded: newRules.length,
                totalLines: updatedContent.split("\n").length,
                recommendations:
                  this.generateUpdateRecommendations(securityLevel),
              },
              null,
              2
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
              2
            ),
          },
        ],
      };
    }
  }

  async validateGitignore(args = {}) {
    const { gitignorePath = ".gitignore" } = args;

    try {
      const exists = await this.checkFileExists(gitignorePath);

      if (!exists) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: ".gitignore file not found",
                  suggestion:
                    "Create a .gitignore file to protect sensitive data",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const content = await readFile(gitignorePath, "utf8");
      const validation = this.validateGitignoreContent(content);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                validation,
                recommendations:
                  this.generateValidationRecommendations(validation),
              },
              null,
              2
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
              2
            ),
          },
        ],
      };
    }
  }

  async checkFileLeaks(args = {}) {
    const { scanHistory = false, checkSize = true } = args;

    try {
      const analysis = {
        currentFiles: [],
        largeFiles: [],
        sensitiveFiles: [],
        historyLeaks: [],
        summary: {
          totalFiles: 0,
          largeFilesCount: 0,
          sensitiveFilesCount: 0,
          historyIssues: 0,
        },
      };

      // Check current files
      const status = await git.status();
      const allFiles = [
        ...(status.modified || []),
        ...(status.staged || []),
        ...(status.not_added || []),
      ];

      for (const file of allFiles) {
        const fileInfo = await this.analyzeFile(file);
        analysis.currentFiles.push(fileInfo);
        analysis.summary.totalFiles++;

        if (checkSize && fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
          // 10MB
          analysis.largeFiles.push(fileInfo);
          analysis.summary.largeFilesCount++;
        }

        if (fileInfo.isSensitive) {
          analysis.sensitiveFiles.push(fileInfo);
          analysis.summary.sensitiveFilesCount++;
        }
      }

      // Check git history if requested
      if (scanHistory) {
        analysis.historyLeaks = await this.scanGitHistory();
        analysis.summary.historyIssues = analysis.historyLeaks.length;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                analysis,
                recommendations: this.generateLeakRecommendations(analysis),
              },
              null,
              2
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
              2
            ),
          },
        ],
      };
    }
  }

  analyzeFileRisk(filePath) {
    const path = filePath.toLowerCase();
    const risk = {
      level: "low",
      reasons: [],
    };

    // High-risk files
    if (
      path.includes("key") ||
      path.includes("secret") ||
      path.includes("password")
    ) {
      risk.level = "high";
      risk.reasons.push("Contains sensitive keywords (key, secret, password)");
    }

    if (path.includes(".env") || path.includes("config")) {
      risk.level = "high";
      risk.reasons.push("Configuration file that may contain secrets");
    }

    if (
      path.endsWith(".pem") ||
      path.endsWith(".key") ||
      path.endsWith(".p12")
    ) {
      risk.level = "high";
      risk.reasons.push("Certificate or private key file");
    }

    // Medium-risk files
    if (path.includes("log") || path.endsWith(".log")) {
      if (risk.level !== "high") risk.level = "medium";
      risk.reasons.push("Log file may contain sensitive information");
    }

    if (path.includes("backup") || path.includes(".bak")) {
      if (risk.level !== "high") risk.level = "medium";
      risk.reasons.push("Backup file may contain old sensitive data");
    }

    // File extensions that are risky
    const riskyExtensions = [".exe", ".msi", ".dmg", ".pkg", ".deb", ".rpm"];
    if (riskyExtensions.some((ext) => path.endsWith(ext))) {
      if (risk.level !== "high") risk.level = "medium";
      risk.reasons.push("Executable file");
    }

    return risk;
  }

  async getFileSize(filePath) {
    try {
      const { stdout } = await git.raw(["ls-files", "-s", filePath]);
      if (stdout) {
        const size = parseInt(stdout.split(/\s+/)[0], 10);
        return size;
      }
    } catch {
      // File might not be tracked yet
    }
    return null;
  }

  getFileType(filePath) {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const typeMap = {
      js: "javascript",
      ts: "typescript",
      json: "json",
      env: "environment",
      key: "certificate",
      pem: "certificate",
      log: "log",
      exe: "executable",
      dll: "library",
      so: "library",
    };
    return typeMap[ext] || "unknown";
  }

  async getIgnoredFiles(directory) {
    try {
      const { stdout } = await git.raw([
        "ls-files",
        "--others",
        "--ignored",
        "--exclude-standard",
      ]);
      return stdout.split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }

  generateScanRecommendations(analysis) {
    const recommendations = [];

    if (analysis.summary.highRisk > 0) {
      recommendations.push({
        priority: "critical",
        message: "Immediate action required: High-risk files detected",
        action: "Review and secure/remove high-risk files immediately",
      });
    }

    if (analysis.summary.mediumRisk > 0) {
      recommendations.push({
        priority: "high",
        message: "Medium-risk files need attention",
        action: "Review medium-risk files and update .gitignore",
      });
    }

    if (analysis.suspicious.length > 5) {
      recommendations.push({
        priority: "medium",
        message: "Multiple suspicious files detected",
        action: "Consider implementing stricter security policies",
      });
    }

    return recommendations;
  }

  generateHardenedRules(securityLevel) {
    const baseRules = [
      "# Security-sensitive files",
      "*.env",
      "*.env.*",
      "!*.env.example",
      "!*.env.template",
      "*.key",
      "*.pem",
      "*.p12",
      "*.pfx",
      "*.crt",
      "*.jks",
      "*.keystore",
      "secrets.json",
      "credentials.json",
      "config.json",
      "private.json",
    ];

    const moderateRules = [
      ...baseRules,
      "",
      "# Build and dependency directories",
      "node_modules/",
      "dist/",
      "build/",
      "out/",
      "target/",
      "bin/",
      "obj/",
      "",
      "# Logs and temporary files",
      "*.log",
      "*.tmp",
      "*.temp",
      "logs/",
      "tmp/",
      "temp/",
      "",
      "# Database files",
      "*.sqlite",
      "*.sqlite3",
      "*.db",
      "",
      "# Backup files",
      "*.backup",
      "*.bak",
      "*.old",
      "*.orig",
      "*.rej",
    ];

    const strictRules = [
      ...moderateRules,
      "",
      "# IDE and editor files",
      ".vscode/",
      ".idea/",
      "*.swp",
      "*.swo",
      "*~",
      ".DS_Store",
      "Thumbs.db",
      "",
      "# OS generated files",
      ".DS_Store?",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
      "ehthumbs.db",
      "Thumbs.db",
      "",
      "# Package files",
      "*.zip",
      "*.tar",
      "*.tar.gz",
      "*.rar",
      "*.7z",
      "",
      "# Runtime data",
      "pids/",
      "*.pid",
      "*.seed",
      "*.pid.lock",
    ];

    switch (securityLevel) {
      case "basic":
        return baseRules;
      case "moderate":
        return moderateRules;
      case "strict":
        return strictRules;
      default:
        return moderateRules;
    }
  }

  mergeGitignoreContent(existing, newRules) {
    const existingLines = existing ? existing.split("\n") : [];
    const newLines = [...newRules];

    // Remove duplicates while preserving order
    const merged = [...existingLines, ...newLines];
    const unique = merged.filter((line, index) => {
      // Remove empty lines and comments from duplicate check
      if (!line.trim() || line.trim().startsWith("#")) return true;
      return merged.indexOf(line) === index;
    });

    return unique.join("\n") + "\n";
  }

  generateUpdateRecommendations(securityLevel) {
    const recommendations = [
      "Review the updated .gitignore file",
      "Test that legitimate files are not incorrectly ignored",
    ];

    if (securityLevel === "strict") {
      recommendations.push(
        "Strict mode may ignore some development files - adjust as needed"
      );
    }

    return recommendations;
  }

  validateGitignoreContent(content) {
    const validation = {
      hasEnvFiles: false,
      hasKeyFiles: false,
      hasBuildDirs: false,
      hasLogFiles: false,
      hasIDEFiles: false,
      score: 0,
      issues: [],
      suggestions: [],
    };

    const lines = content.split("\n");

    validation.hasEnvFiles = lines.some(
      (line) =>
        line.includes(".env") &&
        !line.includes("example") &&
        !line.includes("template")
    );
    validation.hasKeyFiles = lines.some(
      (line) =>
        line.includes(".key") || line.includes(".pem") || line.includes(".p12")
    );
    validation.hasBuildDirs = lines.some(
      (line) =>
        line.includes("node_modules") ||
        line.includes("dist") ||
        line.includes("build")
    );
    validation.hasLogFiles = lines.some(
      (line) => line.includes(".log") || line.includes("logs/")
    );
    validation.hasIDEFiles = lines.some(
      (line) =>
        line.includes(".vscode") ||
        line.includes(".idea") ||
        line.includes("DS_Store")
    );

    // Calculate score
    if (validation.hasEnvFiles) validation.score += 20;
    if (validation.hasKeyFiles) validation.score += 20;
    if (validation.hasBuildDirs) validation.score += 15;
    if (validation.hasLogFiles) validation.score += 15;
    if (validation.hasIDEFiles) validation.score += 10;

    // Identify issues
    if (!validation.hasEnvFiles) {
      validation.issues.push("Missing environment file protection");
    }
    if (!validation.hasKeyFiles) {
      validation.issues.push("Missing certificate/key file protection");
    }
    if (!validation.hasBuildDirs) {
      validation.issues.push("Missing build directory protection");
    }
    if (!validation.hasLogFiles) {
      validation.issues.push("Missing log file protection");
    }

    return validation;
  }

  generateValidationRecommendations(validation) {
    const recommendations = [];

    if (!validation.hasEnvFiles) {
      recommendations.push({
        priority: "high",
        message: "Add .env file protection",
        action: 'Add "*.env" and "*.env.*" to .gitignore',
      });
    }

    if (!validation.hasKeyFiles) {
      recommendations.push({
        priority: "high",
        message: "Add certificate and key file protection",
        action: 'Add "*.key", "*.pem", "*.p12" to .gitignore',
      });
    }

    if (!validation.hasBuildDirs) {
      recommendations.push({
        priority: "medium",
        message: "Add build directory protection",
        action: 'Add "node_modules/", "dist/", "build/" to .gitignore',
      });
    }

    if (validation.score < 70) {
      recommendations.push({
        priority: "low",
        message: "Consider strengthening .gitignore rules",
        action: "Review security best practices for .gitignore",
      });
    }

    return recommendations;
  }

  async analyzeFile(filePath) {
    const risk = this.analyzeFileRisk(filePath);
    return {
      path: filePath,
      risk: risk.level,
      reasons: risk.reasons,
      size: await this.getFileSize(filePath),
      type: this.getFileType(filePath),
      isSensitive: risk.level === "high",
    };
  }

  async scanGitHistory() {
    // Simplified history scan - in practice, this would be more sophisticated
    const leaks = [];

    try {
      // Check for potentially sensitive files in history
      const { stdout } = await git.raw([
        "log",
        "--name-only",
        "--pretty=format:",
        "--all",
      ]);
      const files = stdout.split("\n").filter(Boolean);

      const sensitivePatterns = [
        /key/i,
        /secret/i,
        /password/i,
        /\.env$/i,
        /\.pem$/i,
        /\.key$/i,
      ];

      for (const file of files) {
        if (sensitivePatterns.some((pattern) => pattern.test(file))) {
          leaks.push({
            file,
            reason: "Sensitive file detected in git history",
            severity: "high",
          });
        }
      }
    } catch {
      // History scan failed, return empty array
    }

    return leaks;
  }

  generateLeakRecommendations(analysis) {
    const recommendations = [];

    if (analysis.summary.largeFilesCount > 0) {
      recommendations.push({
        priority: "medium",
        message: "Large files detected in repository",
        action:
          "Consider using Git LFS for large files or move to external storage",
      });
    }

    if (analysis.summary.sensitiveFilesCount > 0) {
      recommendations.push({
        priority: "critical",
        message: "Sensitive files detected",
        action: "Remove sensitive files and add to .gitignore",
      });
    }

    if (analysis.summary.historyIssues > 0) {
      recommendations.push({
        priority: "high",
        message: "Sensitive files found in git history",
        action:
          "Consider git history rewrite or BFG Repo-Cleaner to remove sensitive data",
      });
    }

    return recommendations;
  }

  async checkFileExists(filePath) {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Gitignore Enforcer MCP server running on stdio");
  }
}

const server = new GitignoreEnforcerServer();
server.run().catch(console.error);

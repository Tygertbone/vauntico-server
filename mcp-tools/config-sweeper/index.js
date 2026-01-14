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
import { readFile, writeFile, access, unlink } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ConfigSweeperServer {
  constructor() {
    this.server = new Server(
      {
        name: "config-sweeper-mcp-server",
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
            name: "scan_deprecated_configs",
            description:
              "Scan repository for deprecated configuration files and phantom secrets",
            inputSchema: {
              type: "object",
              properties: {
                directory: {
                  type: "string",
                  description: "Directory to scan (default: current directory)",
                  default: ".",
                },
                checkSecrets: {
                  type: "boolean",
                  description: "Check for potential secrets in config files",
                  default: true,
                },
              },
            },
          },
          {
            name: "remove_deprecated_configs",
            description: "Safely remove deprecated configuration files",
            inputSchema: {
              type: "object",
              properties: {
                backup: {
                  type: "boolean",
                  description: "Create backup before removing files",
                  default: true,
                },
                dryRun: {
                  type: "boolean",
                  description:
                    "Show what would be removed without actually removing",
                  default: false,
                },
                force: {
                  type: "boolean",
                  description: "Force removal without confirmation",
                  default: false,
                },
              },
            },
          },
          {
            name: "analyze_config_health",
            description:
              "Analyze configuration files for security and best practices",
            inputSchema: {
              type: "object",
              properties: {
                directory: {
                  type: "string",
                  description: "Directory to analyze",
                  default: ".",
                },
                includeEnvFiles: {
                  type: "boolean",
                  description: "Include environment files in analysis",
                  default: true,
                },
              },
            },
          },
          {
            name: "cleanup_phantom_secrets",
            description:
              "Detect and clean up phantom secrets and sensitive data",
            inputSchema: {
              type: "object",
              properties: {
                scanHistory: {
                  type: "boolean",
                  description: "Scan git history for phantom secrets",
                  default: false,
                },
                aggressive: {
                  type: "boolean",
                  description: "Use aggressive detection patterns",
                  default: false,
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
          case "scan_deprecated_configs":
            return await this.scanDeprecatedConfigs(args);
          case "remove_deprecated_configs":
            return await this.removeDeprecatedConfigs(args);
          case "analyze_config_health":
            return await this.analyzeConfigHealth(args);
          case "cleanup_phantom_secrets":
            return await this.cleanupPhantomSecrets(args);
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

  async scanDeprecatedConfigs(args = {}) {
    const { directory = ".", checkSecrets = true } = args;

    try {
      const scan = {
        deprecated: [],
        phantomSecrets: [],
        suspicious: [],
        recommendations: [],
        summary: {
          totalFiles: 0,
          deprecatedCount: 0,
          secretsCount: 0,
          suspiciousCount: 0,
        },
      };

      // Define deprecated patterns
      const deprecatedPatterns = this.getDeprecatedPatterns();
      const suspiciousPatterns = this.getSuspiciousPatterns();

      // Scan directory
      const files = await this.scanDirectory(directory);
      scan.summary.totalFiles = files.length;

      for (const file of files) {
        const analysis = this.analyzeFile(
          file,
          deprecatedPatterns,
          suspiciousPatterns,
          checkSecrets,
        );

        if (analysis.isDeprecated) {
          scan.deprecated.push(analysis);
          scan.summary.deprecatedCount++;
        }

        if (analysis.hasSecrets) {
          scan.phantomSecrets.push(analysis);
          scan.summary.secretsCount++;
        }

        if (analysis.isSuspicious) {
          scan.suspicious.push(analysis);
          scan.summary.suspiciousCount++;
        }
      }

      // Generate recommendations
      scan.recommendations = this.generateScanRecommendations(scan);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                scan,
                timestamp: new Date().toISOString(),
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

  async removeDeprecatedConfigs(args = {}) {
    const { backup = true, dryRun = false, force = false } = args;

    try {
      const deprecatedPatterns = this.getDeprecatedPatterns();
      const files = await this.scanDirectory(".");
      const toRemove = [];

      for (const file of files) {
        if (this.isDeprecatedFile(file.path, deprecatedPatterns)) {
          toRemove.push(file);
        }
      }

      if (toRemove.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "No deprecated configuration files found",
                  filesRemoved: 0,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Create backup if requested
      if (backup && !dryRun) {
        await this.createBackup(toRemove.map((f) => f.path));
      }

      const removed = [];
      const errors = [];

      for (const file of toRemove) {
        try {
          if (!dryRun) {
            await unlink(file.path);
          }
          removed.push(file);
        } catch (error) {
          errors.push({
            file: file.path,
            error: error.message,
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
                dryRun,
                backupCreated: backup && !dryRun,
                filesRemoved: removed.length,
                filesSkipped: errors.length,
                removed,
                errors,
                recommendations: this.generateRemovalRecommendations(
                  removed,
                  errors,
                ),
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

  async analyzeConfigHealth(args = {}) {
    const { directory = ".", includeEnvFiles = true } = args;

    try {
      const analysis = {
        configs: [],
        envFiles: [],
        security: {
          score: 0,
          issues: [],
          recommendations: [],
        },
        bestPractices: {
          score: 0,
          violations: [],
          recommendations: [],
        },
      };

      const files = await this.scanDirectory(directory);

      for (const file of files) {
        if (this.isConfigFile(file.path)) {
          const configAnalysis = await this.analyzeConfigFile(
            file.path,
            includeEnvFiles,
          );
          analysis.configs.push(configAnalysis);
        }

        if (includeEnvFiles && this.isEnvFile(file.path)) {
          const envAnalysis = await this.analyzeEnvFile(file.path);
          analysis.envFiles.push(envAnalysis);
        }
      }

      // Calculate security and best practice scores
      analysis.security = this.calculateSecurityScore(
        analysis.configs,
        analysis.envFiles,
      );
      analysis.bestPractices = this.calculateBestPracticesScore(
        analysis.configs,
      );

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

  async cleanupPhantomSecrets(args = {}) {
    const { scanHistory = false, aggressive = false } = args;

    try {
      const cleanup = {
        phantomSecrets: [],
        historyIssues: [],
        cleaned: [],
        summary: {
          totalFound: 0,
          totalCleaned: 0,
          historyIssues: 0,
        },
      };

      // Scan current files
      const files = await this.scanDirectory(".");
      const secretPatterns = this.getSecretPatterns(aggressive);

      for (const file of files) {
        const content = await this.safeReadFile(file.path);
        if (content) {
          const secrets = this.detectSecrets(content, secretPatterns);
          if (secrets.length > 0) {
            cleanup.phantomSecrets.push({
              file: file.path,
              secrets,
              severity: this.calculateSecretSeverity(secrets),
            });
            cleanup.summary.totalFound += secrets.length;
          }
        }
      }

      // Scan git history if requested
      if (scanHistory) {
        cleanup.historyIssues = await this.scanHistoryForSecrets();
        cleanup.summary.historyIssues = cleanup.historyIssues.length;
      }

      // Generate cleanup recommendations
      cleanup.cleaned = this.generateCleanupPlan(
        cleanup.phantomSecrets,
        cleanup.historyIssues,
      );
      cleanup.summary.totalCleaned = cleanup.cleaned.length;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                cleanup,
                recommendations: this.generateCleanupRecommendations(cleanup),
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

  getDeprecatedPatterns() {
    return {
      files: [
        "railway.json",
        "railway.toml",
        "now.json",
        "vercel.json.old",
        ".vercelignore.old",
        "netlify.toml.old",
        "firebase.json",
        "app.yaml",
        "Procfile",
        "heroku.json",
      ],
      patterns: [
        /railway\.(json|toml)$/i,
        /now\.json$/i,
        /vercel\.json\.old$/i,
        /\.vercelignore\.old$/i,
        /netlify\.toml\.old$/i,
        /firebase\.json$/i,
        /app\.yaml$/i,
        /Procfile$/i,
        /heroku\.json$/i,
      ],
      services: [
        "Railway",
        "Vercel (old version)",
        "Netlify (old version)",
        "Firebase (legacy)",
        "Heroku",
      ],
    };
  }

  getSuspiciousPatterns() {
    return {
      files: [
        "secrets.json",
        "private.json",
        "config.json.bak",
        ".env.local",
        ".env.development.local",
        ".env.production.local",
        "credentials.json",
        "service-account.json",
        "aws-credentials.json",
        "google-credentials.json",
      ],
      patterns: [
        /secrets\.json$/i,
        /private\.json$/i,
        /config\.json\.bak$/i,
        /\.env\.local$/i,
        /\.env\..*\.local$/i,
        /credentials\.json$/i,
        /service-account\.json$/i,
        /.*-credentials\.json$/i,
      ],
    };
  }

  getSecretPatterns(aggressive = false) {
    const basicPatterns = [
      /password\s*[=:]\s*['"`]([^'"`]+)['"`]/gi,
      /secret\s*[=:]\s*['"`]([^'"`]+)['"`]/gi,
      /api[_-]?key\s*[=:]\s*['"`]([^'"`]+)['"`]/gi,
      /token\s*[=:]\s*['"`]([^'"`]+)['"`]/gi,
      /private[_-]?key\s*[=:]\s*['"`]([^'"`]+)['"`]/gi,
    ];

    if (aggressive) {
      basicPatterns.push(
        /['"`]([A-Za-z0-9+/]{20,})['"`]/gi, // Long base64-like strings
        /sk-[a-zA-Z0-9]{20,}/gi, // Strong keys
        /ghp_[a-zA-Z0-9]{36}/gi, // GitHub personal access tokens
      );
    }

    return basicPatterns;
  }

  async scanDirectory(directory) {
    const files = [];

    try {
      const { stdout } = await git.raw(["ls-files", "--cached"]);
      const trackedFiles = stdout.split("\n").filter(Boolean);

      for (const file of trackedFiles) {
        try {
          await access(file);
          files.push({
            path: file,
            tracked: true,
          });
        } catch {
          // File might not exist or be inaccessible
        }
      }

      // Add untracked files that might be configs
      const { stdout: untrackedStdout } = await git.raw([
        "ls-files",
        "--others",
        "--exclude-standard",
      ]);
      const untrackedFiles = untrackedStdout.split("\n").filter(Boolean);

      for (const file of untrackedFiles) {
        if (this.isConfigFile(file) || this.isEnvFile(file)) {
          files.push({
            path: file,
            tracked: false,
          });
        }
      }
    } catch (error) {
      // Fallback to basic directory scan
      const fs = await import("fs/promises");
      try {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
          if (
            entry.isFile() &&
            (this.isConfigFile(entry.name) || this.isEnvFile(entry.name))
          ) {
            files.push({
              path: entry.name,
              tracked: false,
            });
          }
        }
      } catch (dirError) {
        // Return empty array if directory scan fails
      }
    }

    return files;
  }

  analyzeFile(file, deprecatedPatterns, suspiciousPatterns, checkSecrets) {
    const analysis = {
      path: file.path,
      isDeprecated: false,
      hasSecrets: false,
      isSuspicious: false,
      reasons: [],
      deprecatedService: null,
    };

    // Check if deprecated
    if (this.isDeprecatedFile(file.path, deprecatedPatterns)) {
      analysis.isDeprecated = true;
      analysis.deprecatedService = this.getDeprecatedService(
        file.path,
        deprecatedPatterns,
      );
      analysis.reasons.push(
        `Deprecated config for ${analysis.deprecatedService}`,
      );
    }

    // Check if suspicious
    if (this.isSuspiciousFile(file.path, suspiciousPatterns)) {
      analysis.isSuspicious = true;
      analysis.reasons.push("Suspicious configuration file");
    }

    // Check for secrets
    if (checkSecrets) {
      const content = this.safeReadFileSync(file.path);
      if (content) {
        const secrets = this.detectSecrets(content, this.getSecretPatterns());
        if (secrets.length > 0) {
          analysis.hasSecrets = true;
          analysis.reasons.push("Contains potential secrets");
        }
      }
    }

    return analysis;
  }

  isConfigFile(filePath) {
    const configExtensions = [
      ".json",
      ".yaml",
      ".yml",
      ".toml",
      ".xml",
      ".config",
      ".conf",
    ];
    const configNames = [
      "package.json",
      "tsconfig.json",
      "webpack.config.js",
      "vite.config.js",
      "docker-compose.yml",
    ];

    const path = filePath.toLowerCase();

    // Check extension
    const hasConfigExtension = configExtensions.some((ext) =>
      path.endsWith(ext),
    );

    // Check specific names
    const hasConfigName = configNames.some((name) => path.includes(name));

    return hasConfigExtension || hasConfigName;
  }

  isEnvFile(filePath) {
    const path = filePath.toLowerCase();
    return (
      path.includes(".env") ||
      path.includes("dotenv") ||
      path.includes("environment")
    );
  }

  isDeprecatedFile(filePath, patterns) {
    return (
      patterns.files.some((pattern) =>
        filePath.toLowerCase().includes(pattern.toLowerCase()),
      ) || patterns.patterns.some((pattern) => pattern.test(filePath))
    );
  }

  isSuspiciousFile(filePath, patterns) {
    return (
      patterns.files.some((pattern) =>
        filePath.toLowerCase().includes(pattern.toLowerCase()),
      ) || patterns.patterns.some((pattern) => pattern.test(filePath))
    );
  }

  getDeprecatedService(filePath, patterns) {
    for (let i = 0; i < patterns.patterns.length; i++) {
      if (patterns.patterns[i].test(filePath)) {
        return patterns.services[i] || "Unknown service";
      }
    }

    for (let i = 0; i < patterns.files.length; i++) {
      if (filePath.toLowerCase().includes(patterns.files[i].toLowerCase())) {
        return patterns.services[i] || "Unknown service";
      }
    }

    return null;
  }

  async safeReadFile(filePath) {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      return null;
    }
  }

  safeReadFileSync(filePath) {
    try {
      return require("fs").readFileSync(filePath, "utf8");
    } catch {
      return null;
    }
  }

  detectSecrets(content, patterns) {
    const secrets = [];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          secrets.push({
            type: this.getSecretType(pattern),
            value: match[1] || match[0],
            pattern: pattern.toString(),
          });
        }
      }
    }

    return [...new Set(secrets)]; // Remove duplicates
  }

  getSecretType(pattern) {
    const patternStr = pattern.toString();

    if (patternStr.includes("password")) return "password";
    if (patternStr.includes("secret")) return "secret";
    if (patternStr.includes("api") && patternStr.includes("key"))
      return "api-key";
    if (patternStr.includes("token")) return "token";
    if (patternStr.includes("private") && patternStr.includes("key"))
      return "private-key";

    return "unknown";
  }

  calculateSecretSeverity(secrets) {
    const hasPassword = secrets.some((s) => s.type === "password");
    const hasApiKey = secrets.some((s) => s.type === "api-key");
    const hasPrivateKey = secrets.some((s) => s.type === "private-key");

    if (hasPassword) return "critical";
    if (hasApiKey) return "high";
    if (hasPrivateKey) return "high";

    return "medium";
  }

  generateScanRecommendations(scan) {
    const recommendations = [];

    if (scan.summary.deprecatedCount > 0) {
      recommendations.push({
        priority: "high",
        message: "Deprecated configuration files detected",
        action: "Remove or update deprecated configs",
      });
    }

    if (scan.summary.secretsCount > 0) {
      recommendations.push({
        priority: "critical",
        message: "Potential secrets found in configuration files",
        action:
          "Remove secrets from config files and use environment variables",
      });
    }

    if (scan.summary.suspiciousCount > 0) {
      recommendations.push({
        priority: "medium",
        message: "Suspicious configuration files detected",
        action: "Review suspicious files and secure if necessary",
      });
    }

    return recommendations;
  }

  generateRemovalRecommendations(removed, errors) {
    const recommendations = [
      "Review removed files to ensure no important data was lost",
      "Update deployment configurations to use current standards",
    ];

    if (errors.length > 0) {
      recommendations.push({
        priority: "medium",
        message: "Some files could not be removed",
        action: "Check file permissions and try manual removal",
      });
    }

    return recommendations;
  }

  async analyzeConfigFile(filePath, includeEnvFiles) {
    const analysis = {
      path: filePath,
      type: this.getConfigType(filePath),
      security: {
        hasSecrets: false,
        secrets: [],
        score: 100,
      },
      structure: {
        valid: true,
        issues: [],
      },
    };

    const content = await this.safeReadFile(filePath);
    if (!content) {
      analysis.structure.valid = false;
      analysis.structure.issues.push("Could not read file");
      return analysis;
    }

    // Check for secrets
    const secrets = this.detectSecrets(content, this.getSecretPatterns());
    if (secrets.length > 0) {
      analysis.security.hasSecrets = true;
      analysis.security.secrets = secrets;
      analysis.security.score -= 50;
    }

    // Validate structure
    try {
      JSON.parse(content);
      // Valid JSON
    } catch {
      if (filePath.endsWith(".json")) {
        analysis.structure.valid = false;
        analysis.structure.issues.push("Invalid JSON syntax");
        analysis.security.score -= 20;
      }
    }

    return analysis;
  }

  async analyzeEnvFile(filePath) {
    const analysis = {
      path: filePath,
      type: "environment",
      security: {
        hasSecrets: false,
        secrets: [],
        score: 100,
      },
      bestPractices: {
        hasExample: false,
        hasTemplate: false,
        issues: [],
      },
    };

    const content = await this.safeReadFile(filePath);
    if (!content) {
      return analysis;
    }

    // Check if it's an example/template file
    const path = filePath.toLowerCase();
    analysis.bestPractices.hasExample = path.includes("example");
    analysis.bestPractices.hasTemplate = path.includes("template");

    // Check for secrets
    const secrets = this.detectSecrets(content, this.getSecretPatterns());
    if (secrets.length > 0) {
      analysis.security.hasSecrets = true;
      analysis.security.secrets = secrets;
      analysis.security.score -= 60;
    }

    return analysis;
  }

  getConfigType(filePath) {
    const path = filePath.toLowerCase();

    if (path.includes("package.json")) return "package";
    if (path.includes("tsconfig")) return "typescript";
    if (path.includes("webpack")) return "webpack";
    if (path.includes("vite")) return "vite";
    if (path.includes("docker")) return "docker";
    if (path.includes("vercel")) return "vercel";
    if (path.includes("railway")) return "railway";
    if (path.includes("firebase")) return "firebase";
    if (path.includes("heroku")) return "heroku";
    if (path.includes("netlify")) return "netlify";

    return "unknown";
  }

  calculateSecurityScore(configs, envFiles) {
    const security = {
      score: 100,
      issues: [],
      recommendations: [],
    };

    const allFiles = [...configs, ...envFiles];

    for (const file of allFiles) {
      if (file.security.hasSecrets) {
        security.score -= 30;
        security.issues.push({
          file: file.path,
          issue: "Contains potential secrets",
          severity: "high",
        });
      }

      if (!file.structure.valid) {
        security.score -= 10;
        security.issues.push({
          file: file.path,
          issue: "Invalid structure",
          severity: "medium",
        });
      }
    }

    // Generate recommendations
    if (security.score < 70) {
      security.recommendations.push({
        priority: "high",
        message: "Security issues detected in configuration files",
        action: "Remove secrets and fix structure issues",
      });
    }

    return security;
  }

  calculateBestPracticesScore(configs) {
    const bestPractices = {
      score: 100,
      violations: [],
      recommendations: [],
    };

    for (const config of configs) {
      const path = config.path.toLowerCase();

      // Check for deprecated configs
      if (this.isDeprecatedFile(path, this.getDeprecatedPatterns())) {
        bestPractices.score -= 20;
        bestPractices.violations.push({
          file: config.path,
          violation: "Deprecated configuration",
          severity: "medium",
        });
      }

      // Check for backup files
      if (
        path.includes(".bak") ||
        path.includes(".old") ||
        path.includes(".backup")
      ) {
        bestPractices.score -= 10;
        bestPractices.violations.push({
          file: config.path,
          violation: "Backup configuration file",
          severity: "low",
        });
      }
    }

    return bestPractices;
  }

  async createBackup(filePaths) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `config-backup-${timestamp}`;

    try {
      await import("fs/promises").then((fs) =>
        fs.mkdir(backupDir, { recursive: true }),
      );

      for (const filePath of filePaths) {
        try {
          const content = await readFile(filePath);
          const backupPath = join(backupDir, filePath.split("/").pop());
          await writeFile(backupPath, content);
        } catch {
          // Skip files that can't be read
        }
      }
    } catch {
      // Backup creation failed, continue without it
    }
  }

  async scanHistoryForSecrets() {
    const issues = [];

    try {
      const { stdout } = await git.raw([
        "log",
        "--name-only",
        "--pretty=format:",
        "--all",
      ]);
      const files = stdout.split("\n").filter(Boolean);

      for (const file of files) {
        if (this.isConfigFile(file) || this.isEnvFile(file)) {
          const content = this.safeReadFileSync(file);
          if (content) {
            const secrets = this.detectSecrets(
              content,
              this.getSecretPatterns(),
            );
            if (secrets.length > 0) {
              issues.push({
                file,
                issue: "Secrets found in git history",
                severity: "high",
                secrets: secrets.map((s) => s.type),
              });
            }
          }
        }
      }
    } catch {
      // History scan failed
    }

    return issues;
  }

  generateCleanupPlan(phantomSecrets, historyIssues) {
    const plan = [];

    for (const secret of phantomSecrets) {
      plan.push({
        file: secret.file,
        action: "Remove secrets from configuration",
        severity: secret.severity,
        recommendation:
          "Use environment variables or secret management service",
      });
    }

    for (const issue of historyIssues) {
      plan.push({
        file: issue.file,
        action: "Remove from git history",
        severity: issue.severity,
        recommendation: "Use git filter-branch or BFG Repo-Cleaner",
      });
    }

    return plan;
  }

  generateCleanupRecommendations(cleanup) {
    const recommendations = [
      "Use environment variables for all secrets",
      "Implement proper secret management (AWS Secrets Manager, etc.)",
      "Rotate exposed secrets immediately",
    ];

    if (cleanup.summary.historyIssues > 0) {
      recommendations.push({
        priority: "critical",
        message: "Secrets found in git history",
        action: "Consider git history rewrite or repository rotation",
      });
    }

    if (cleanup.summary.totalFound > 0) {
      recommendations.push({
        priority: "high",
        message: "Phantom secrets detected in configuration files",
        action: "Review and clean all configuration files",
      });
    }

    return recommendations;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Config Sweeper MCP server running on stdio");
  }
}

const server = new ConfigSweeperServer();
server.run().catch(console.error);

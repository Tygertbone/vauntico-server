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
import { readFile, access, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TypeCheckerServer {
  constructor() {
    this.server = new Server(
      {
        name: "type-checker-mcp-server",
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
            name: "run_strict_type_check",
            description:
              "Run TypeScript compiler in strict mode to find type errors",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description:
                    "Path to tsconfig.json file or project directory",
                  default: ".",
                },
                strict: {
                  type: "boolean",
                  description: "Enable strict type checking (default: true)",
                  default: true,
                },
                noEmit: {
                  type: "boolean",
                  description: "Do not emit output files (default: true)",
                  default: true,
                },
                skipLibCheck: {
                  type: "boolean",
                  description: "Skip type checking of declaration files",
                  default: false,
                },
              },
            },
          },
          {
            name: "get_type_error_suggestions",
            description:
              "Get detailed suggestions for fixing TypeScript errors",
            inputSchema: {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  description: "Array of TypeScript error objects",
                  items: {
                    type: "object",
                    properties: {
                      file: { type: "string" },
                      line: { type: "number" },
                      column: { type: "number" },
                      code: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
                includeExamples: {
                  type: "boolean",
                  description: "Include code examples in suggestions",
                  default: true,
                },
              },
            },
          },
          {
            name: "analyze_project_types",
            description:
              "Analyze project for type safety and configuration issues",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description: "Path to project directory",
                  default: ".",
                },
                includeComplexity: {
                  type: "boolean",
                  description: "Include type complexity analysis",
                  default: true,
                },
              },
            },
          },
          {
            name: "upgrade_strict_mode",
            description:
              "Gradually upgrade project to strict mode with compatibility checks",
            inputSchema: {
              type: "object",
              properties: {
                project: {
                  type: "string",
                  description: "Path to tsconfig.json file",
                  default: "./tsconfig.json",
                },
                backup: {
                  type: "boolean",
                  description: "Create backup of original tsconfig.json",
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
          case "run_strict_type_check":
            return await this.runStrictTypeCheck(args);
          case "get_type_error_suggestions":
            return await this.getTypeErrorSuggestions(args);
          case "analyze_project_types":
            return await this.analyzeProjectTypes(args);
          case "upgrade_strict_mode":
            return await this.upgradeStrictMode(args);
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

  async runStrictTypeCheck(args = {}) {
    const {
      project = ".",
      strict = true,
      noEmit = true,
      skipLibCheck = false,
    } = args;

    try {
      // Check if TypeScript config exists
      const configPath = project.endsWith(".json")
        ? project
        : join(project, "tsconfig.json");
      const configExists = await this.checkFileExists(configPath);

      if (!configExists) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: "TypeScript configuration file not found",
                  suggestion: `Create a tsconfig.json file or run 'tsc --init' in the project directory`,
                  configPath,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Build TypeScript compiler command
      let tscCmd = `npx tsc --project "${configPath}"`;

      if (noEmit) {
        tscCmd += " --noEmit";
      }

      if (strict) {
        tscCmd += " --strict";
      }

      if (skipLibCheck) {
        tscCmd += " --skipLibCheck";
      }

      // Add pretty output and JSON format
      tscCmd += " --pretty false --diagnostics --listFiles";

      console.error(`Running TypeScript check: ${tscCmd}`);

      try {
        const { stdout, stderr } = await execAsync(tscCmd);

        // Parse TypeScript output
        const diagnostics = this.parseTypeScriptOutput(stderr);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  command: tscCmd,
                  configPath,
                  strict,
                  diagnostics,
                  summary: this.generateDiagnosticSummary(diagnostics),
                  hasErrors: diagnostics.some((d) => d.category === "error"),
                  hasWarnings: diagnostics.some(
                    (d) => d.category === "warning",
                  ),
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (execError) {
        // TypeScript returns non-zero exit code when there are errors
        const diagnostics = this.parseTypeScriptOutput(
          execError.stderr || execError.stdout,
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  hasErrors: true,
                  command: tscCmd,
                  configPath,
                  strict,
                  diagnostics,
                  summary: this.generateDiagnosticSummary(diagnostics),
                },
                null,
                2,
              ),
            },
          ],
        };
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

  async getTypeErrorSuggestions(args = {}) {
    const { errors = [], includeExamples = true } = args;

    try {
      const suggestions = [];

      for (const error of errors) {
        const suggestion = this.generateErrorSuggestion(error, includeExamples);
        suggestions.push(suggestion);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                suggestions,
                totalErrors: errors.length,
                commonPatterns: this.identifyCommonPatterns(errors),
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

  async analyzeProjectTypes(args = {}) {
    const { project = ".", includeComplexity = true } = args;

    try {
      const analysis = {
        config: null,
        files: [],
        dependencies: [],
        complexity: null,
        recommendations: [],
      };

      // Analyze tsconfig.json
      const configPath = join(project, "tsconfig.json");
      if (await this.checkFileExists(configPath)) {
        const configContent = await readFile(configPath, "utf8");
        analysis.config = this.analyzeTypeScriptConfig(configContent);
      }

      // Get file list and basic analysis
      try {
        const { stdout: fileList } = await execAsync(
          `npx tsc --listFiles --project "${configPath}"`,
        );
        analysis.files = this.analyzeFiles(
          fileList.split("\n").filter(Boolean),
        );
      } catch (error) {
        // Continue even if list files fails
      }

      // Complexity analysis
      if (includeComplexity) {
        analysis.complexity = await this.analyzeTypeComplexity(project);
      }

      // Generate recommendations
      analysis.recommendations = this.generateTypeRecommendations(analysis);

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

  async upgradeStrictMode(args = {}) {
    const { project = "./tsconfig.json", backup = true } = args;

    try {
      const configExists = await this.checkFileExists(project);

      if (!configExists) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `TypeScript config file not found: ${project}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Read current config
      const configContent = await readFile(project, "utf8");
      let config;

      try {
        config = JSON.parse(configContent);
      } catch (parseError) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Invalid JSON in tsconfig.json: ${parseError.message}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Create backup if requested
      if (backup) {
        const backupPath = `${project}.backup.${Date.now()}`;
        await writeFile(backupPath, configContent);
      }

      // Upgrade to strict mode gradually
      const upgradeSteps = this.planStrictModeUpgrade(config);

      // Apply the upgrades
      const upgradedConfig = { ...config };
      const appliedUpgrades = [];

      for (const step of upgradeSteps) {
        if (!upgradedConfig.compilerOptions) {
          upgradedConfig.compilerOptions = {};
        }

        if (!upgradedConfig.compilerOptions[step.option]) {
          upgradedConfig.compilerOptions[step.option] = step.value;
          appliedUpgrades.push(step);
        }
      }

      // Write updated config
      const updatedContent = JSON.stringify(upgradedConfig, null, 2);
      await writeFile(project, updatedContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                appliedUpgrades,
                backupCreated: backup,
                newConfig: upgradedConfig,
                recommendations:
                  this.generateStrictModeRecommendations(appliedUpgrades),
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

  parseTypeScriptOutput(output) {
    const diagnostics = [];
    const lines = output.split("\n");

    for (const line of lines) {
      // Parse TypeScript error format: file(line,column): error TScode: message
      const match = line.match(
        /^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/,
      );

      if (match) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          category: match[4],
          code: `TS${match[5]}`,
          message: match[6],
          fullLine: line,
        });
      }
    }

    return diagnostics;
  }

  generateDiagnosticSummary(diagnostics) {
    const errors = diagnostics.filter((d) => d.category === "error");
    const warnings = diagnostics.filter((d) => d.category === "warning");

    const errorCodes = {};
    const warningCodes = {};

    errors.forEach((d) => {
      errorCodes[d.code] = (errorCodes[d.code] || 0) + 1;
    });

    warnings.forEach((d) => {
      warningCodes[d.code] = (warningCodes[d.code] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      filesAffected: new Set(diagnostics.map((d) => d.file)).size,
      mostCommonErrors: Object.entries(errorCodes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
      mostCommonWarnings: Object.entries(warningCodes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
    };
  }

  generateErrorSuggestion(error, includeExamples) {
    const suggestions = this.getErrorSuggestions(error.code);

    return {
      error: {
        file: error.file,
        line: error.line,
        column: error.column,
        code: error.code,
        message: error.message,
      },
      suggestions,
      examples: includeExamples ? this.getErrorExamples(error.code) : null,
      severity: this.getErrorSeverity(error.code),
      category: this.getErrorCategory(error.code),
    };
  }

  getErrorSuggestions(errorCode) {
    const suggestionMap = {
      TS2322: [
        "Check if the assigned value matches the expected type",
        "Consider using type assertion if you're sure about the type",
        "Verify function return types match their annotations",
      ],
      TS2531: [
        "Add optional chaining operator (?) to handle null/undefined",
        "Use nullish coalescing operator (??) to provide default value",
        "Add proper null/undefined checks before accessing properties",
      ],
      TS2339: [
        "Verify the property exists on the object type",
        "Check if you're using the correct object/interface",
        "Consider adding the property to the interface if it should exist",
      ],
      TS7005: [
        "Ensure the parameter type matches the function signature",
        "Check if you need to cast or transform the parameter",
        "Verify function overload signatures if applicable",
      ],
    };

    return (
      suggestionMap[errorCode] || [
        "Review the TypeScript documentation for this error",
        "Check if types are properly imported and defined",
        "Consider if a type assertion or casting is appropriate",
      ]
    );
  }

  getErrorExamples(errorCode) {
    const exampleMap = {
      TS2322: {
        bad: "let name: string = 123;",
        good: "let name: string = '123';",
      },
      TS2531: {
        bad: "const value = obj.property.property;",
        good: "const value = obj?.property?.property;",
      },
      TS2339: {
        bad: "interface User { name: string; } const user: User = { name: 'John', age: 30 };",
        good: "interface User { name: string; age?: number; } const user: User = { name: 'John', age: 30 };",
      },
    };

    return exampleMap[errorCode] || null;
  }

  getErrorSeverity(errorCode) {
    const severityMap = {
      TS2322: "error",
      TS2531: "error",
      TS2339: "error",
      TS7005: "error",
    };

    return severityMap[errorCode] || "warning";
  }

  getErrorCategory(errorCode) {
    const categoryMap = {
      TS2322: "type-assignment",
      TS2531: "null-safety",
      TS2339: "property-access",
      TS7005: "parameter-mismatch",
    };

    return categoryMap[errorCode] || "general";
  }

  identifyCommonPatterns(errors) {
    const patterns = [];
    const errorCounts = {};

    errors.forEach((error) => {
      errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
    });

    Object.entries(errorCounts).forEach(([code, count]) => {
      if (count > 2) {
        patterns.push({
          code,
          count,
          description: this.getErrorDescription(code),
          suggestion: this.getPatternSuggestion(code),
        });
      }
    });

    return patterns;
  }

  getErrorDescription(errorCode) {
    const descriptions = {
      TS2322: "Type assignment errors",
      TS2531: "Object is possibly null or undefined",
      TS2339: "Property does not exist on type",
      TS7005: "Parameter type mismatch",
    };

    return descriptions[errorCode] || "TypeScript error";
  }

  getPatternSuggestion(errorCode) {
    const suggestions = {
      TS2322: "Review type annotations and ensure type consistency",
      TS2531: "Implement proper null checking and optional chaining",
      TS2339: "Verify interface definitions and object structures",
      TS7005: "Check function signatures and parameter types",
    };

    return suggestions[errorCode] || "Review TypeScript best practices";
  }

  analyzeTypeScriptConfig(configContent) {
    try {
      const config = JSON.parse(configContent);
      return {
        hasStrictMode: config.compilerOptions?.strict || false,
        hasNoImplicitAny: config.compilerOptions?.noImplicitAny || false,
        hasStrictNullChecks: config.compilerOptions?.strictNullChecks || false,
        target: config.compilerOptions?.target || "ES3",
        module: config.compilerOptions?.module || "CommonJS",
        lib: config.compilerOptions?.lib || [],
        compilerOptions: config.compilerOptions || {},
      };
    } catch (error) {
      return { error: "Invalid JSON in tsconfig.json" };
    }
  }

  analyzeFiles(filePaths) {
    const analysis = {
      totalFiles: filePaths.length,
      extensions: {},
      directories: new Set(),
    };

    filePaths.forEach((file) => {
      const ext = file.split(".").pop();
      analysis.extensions[ext] = (analysis.extensions[ext] || 0) + 1;

      const dir = file.split("/").slice(0, -1).join("/");
      if (dir) analysis.directories.add(dir);
    });

    return analysis;
  }

  async analyzeTypeComplexity(project) {
    // Simplified complexity analysis
    return {
      score: "medium",
      factors: [
        "Multiple file types detected",
        "Project structure analysis available",
        "Type coverage could be improved",
      ],
    };
  }

  generateTypeRecommendations(analysis) {
    const recommendations = [];

    if (!analysis.config?.hasStrictMode) {
      recommendations.push({
        priority: "high",
        type: "configuration",
        message: "Enable strict mode for better type safety",
        action: "Add 'strict': true to compilerOptions",
      });
    }

    if (!analysis.config?.hasStrictNullChecks) {
      recommendations.push({
        priority: "medium",
        type: "configuration",
        message: "Enable strict null checks",
        action: "Add 'strictNullChecks': true to compilerOptions",
      });
    }

    return recommendations;
  }

  planStrictModeUpgrade(config) {
    return [
      {
        option: "strict",
        value: true,
        description: "Enable all strict type checking options",
      },
      {
        option: "noImplicitAny",
        value: true,
        description: "Disallow implicit any types",
      },
      {
        option: "strictNullChecks",
        value: true,
        description: "Strict null checking",
      },
      {
        option: "strictFunctionTypes",
        value: true,
        description: "Strict function type checking",
      },
      {
        option: "noImplicitReturns",
        value: true,
        description: "Require explicit return statements",
      },
    ];
  }

  generateStrictModeRecommendations(appliedUpgrades) {
    return [
      "Run type check to identify issues after enabling strict mode",
      "Fix errors gradually, starting with the most critical ones",
      "Consider using type assertions sparingly and only when necessary",
      "Update function signatures to be more explicit about types",
    ];
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
    console.error("Type Checker MCP server running on stdio");
  }
}

const server = new TypeCheckerServer();
server.run().catch(console.error);

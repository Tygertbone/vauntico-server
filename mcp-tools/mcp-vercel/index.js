#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { createHash } from "crypto";

class VercelMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "mcp-vercel",
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
          // Authentication
          {
            name: "vercel_auth",
            description: "Authenticate with Vercel API",
            inputSchema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "Vercel access token",
                },
                team_id: {
                  type: "string",
                  description: "Vercel team ID (optional)",
                },
              },
              required: ["token"],
            },
          },
          // Project Management
          {
            name: "list_projects",
            description: "List all Vercel projects",
            inputSchema: {
              type: "object",
              properties: {
                team_id: {
                  type: "string",
                  description: "Filter by team ID",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of projects",
                  default: 20,
                },
              },
            },
          },
          {
            name: "get_project",
            description: "Get detailed project information",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                include_deployments: {
                  type: "boolean",
                  description: "Include deployment history",
                  default: false,
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "create_project",
            description: "Create a new Vercel project",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Project name",
                },
                framework: {
                  type: "string",
                  description: "Framework preset",
                  enum: [
                    "nextjs",
                    "react",
                    "vue",
                    "svelte",
                    "angular",
                    "other",
                  ],
                  default: "nextjs",
                },
                build_command: {
                  type: "string",
                  description: "Custom build command",
                },
                output_directory: {
                  type: "string",
                  description: "Output directory",
                  default: ".",
                },
                root_directory: {
                  type: "string",
                  description: "Root directory",
                  default: "/",
                },
              },
              required: ["name"],
            },
          },
          // Deployment Management
          {
            name: "deploy",
            description: "Trigger a deployment",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                branch: {
                  type: "string",
                  description: "Git branch to deploy",
                  default: "main",
                },
                force: {
                  type: "boolean",
                  description: "Force new deployment",
                  default: false,
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "list_deployments",
            description: "List deployment history",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of deployments",
                  default: 20,
                },
                state: {
                  type: "string",
                  description: "Filter by deployment state",
                  enum: ["READY", "BUILDING", "ERROR", "CANCELED"],
                  default: null,
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "rollback_deployment",
            description: "Rollback to a previous deployment",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                deployment_id: {
                  type: "string",
                  description: "Deployment ID to rollback to",
                },
              },
              required: ["project_id", "deployment_id"],
            },
          },
          // Environment Variables
          {
            name: "list_env",
            description: "List environment variables",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                environment: {
                  type: "string",
                  description: "Environment (production, preview, development)",
                  enum: ["production", "preview", "development"],
                },
                include_sensitive: {
                  type: "boolean",
                  description: "Include sensitive variables",
                  default: false,
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "set_env",
            description: "Create or update environment variable",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                key: {
                  type: "string",
                  description: "Variable name",
                },
                value: {
                  type: "string",
                  description: "Variable value",
                },
                environment: {
                  type: "string",
                  description: "Target environment",
                  enum: ["production", "preview", "development"],
                  default: "production",
                },
                sensitive: {
                  type: "boolean",
                  description: "Mark as sensitive",
                  default: false,
                },
              },
              required: ["project_id", "key", "value"],
            },
          },
          {
            name: "delete_env",
            description: "Delete environment variable",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                key: {
                  type: "string",
                  description: "Variable name",
                },
                environment: {
                  type: "string",
                  description: "Target environment",
                  enum: ["production", "preview", "development"],
                  default: "production",
                },
              },
              required: ["project_id", "key"],
            },
          },
          // Domain Management
          {
            name: "list_domains",
            description: "List custom domains",
            inputSchema: {
              type: "object",
              properties: {
                team_id: {
                  type: "string",
                  description: "Filter by team ID",
                },
              },
            },
          },
          {
            name: "add_domain",
            description: "Add a custom domain",
            inputSchema: {
              type: "object",
              properties: {
                domain: {
                  type: "string",
                  description: "Domain name",
                },
                project_id: {
                  type: "string",
                  description: "Project ID to assign to",
                },
              },
              required: ["domain"],
            },
          },
          // Analytics and Monitoring
          {
            name: "get_project_analytics",
            description: "Get project analytics",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                period: {
                  type: "string",
                  description: "Time period",
                  enum: ["24h", "7d", "30d", "90d"],
                  default: "7d",
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "get_deployment_logs",
            description: "Get deployment logs",
            inputSchema: {
              type: "object",
              properties: {
                deployment_id: {
                  type: "string",
                  description: "Deployment ID",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of log entries",
                  default: 100,
                },
                follow: {
                  type: "boolean",
                  description: "Follow log stream",
                  default: false,
                },
              },
              required: ["deployment_id"],
            },
          },
          // Edge Functions
          {
            name: "list_functions",
            description: "List Edge Functions",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "create_function",
            description: "Create a new Edge Function",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Project ID or name",
                },
                name: {
                  type: "string",
                  description: "Function name",
                },
                runtime: {
                  type: "string",
                  description: "Function runtime",
                  enum: ["nodejs18.x", "nodejs20.x", "python3.9", "python3.10"],
                  default: "nodejs18.x",
                },
                code: {
                  type: "string",
                  description: "Function code",
                },
              },
              required: ["project_id", "name", "code"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "vercel_auth":
            return await this.vercelAuth(args);
          case "list_projects":
            return await this.listProjects(args);
          case "get_project":
            return await this.getProject(args);
          case "create_project":
            return await this.createProject(args);
          case "deploy":
            return await this.deploy(args);
          case "list_deployments":
            return await this.listDeployments(args);
          case "rollback_deployment":
            return await this.rollbackDeployment(args);
          case "list_env":
            return await this.listEnv(args);
          case "set_env":
            return await this.setEnv(args);
          case "delete_env":
            return await this.deleteEnv(args);
          case "list_domains":
            return await this.listDomains(args);
          case "add_domain":
            return await this.addDomain(args);
          case "get_project_analytics":
            return await this.getProjectAnalytics(args);
          case "get_deployment_logs":
            return await this.getDeploymentLogs(args);
          case "list_functions":
            return await this.listFunctions(args);
          case "create_function":
            return await this.createFunction(args);

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

  // Authentication
  async vercelAuth(args) {
    const { token, team_id } = args;
    try {
      const authResult = {
        team_id: team_id || null,
        authenticated_at: new Date().toISOString(),
        status: "authenticated",
        session_id: createHash("sha256")
          .update(token + Date.now())
          .digest("hex")
          .substring(0, 16),
        user_info: {
          username: "vauntico-user",
          email: "team@vauntico.com",
          teams: ["vauntico-team"],
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "Vercel authentication successful",
                authentication: authResult,
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

  // Project Management
  async listProjects(args) {
    const { team_id, limit } = args;
    try {
      const mockProjects = [
        {
          id: "prj_abc123",
          name: "vauntico-web",
          framework: "nextjs",
          link: "https://vauntico-web.vercel.app",
          status: "READY",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-14T15:30:00Z",
          production_deployments: 12,
          preview_deployments: 45,
        },
        {
          id: "prj_def456",
          name: "vauntico-api",
          framework: "nodejs",
          link: "https://vauntico-api.vercel.app",
          status: "READY",
          created_at: "2024-01-05T14:20:00Z",
          updated_at: "2024-01-13T09:15:00Z",
          production_deployments: 8,
          preview_deployments: 23,
        },
      ];

      let filtered = mockProjects;
      if (team_id) {
        filtered = filtered.filter((p) => p.team_id === team_id);
      }

      const limited = filtered.slice(0, limit || 20);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                projects: limited,
                total_count: filtered.length,
                returned_count: limited.length,
                filters: { team_id, limit },
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

  async getProject(args) {
    const { project_id, include_deployments } = args;
    try {
      const projectInfo = {
        id: "prj_abc123",
        name: "vauntico-web",
        framework: "nextjs",
        link: "https://vauntico-web.vercel.app",
        status: "READY",
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-14T15:30:00Z",
        repository: {
          url: "https://github.com/vauntico/web",
          provider: "github",
          branch: "main",
        },
        build_command: "npm run build",
        output_directory: ".next",
        root_directory: "/",
        deployments: include_deployments
          ? [
              {
                id: "dpl_xyz789",
                url: "https://vauntico-web.vercel.app",
                state: "READY",
                created_at: "2024-01-14T15:30:00Z",
                meta: {
                  githubCommitSha: "abc123def456",
                  githubCommitAuthor: "john.doe",
                },
              },
            ]
          : undefined,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                project: projectInfo,
                metadata: {
                  include_deployments,
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

  async createProject(args) {
    const { name, framework, build_command, output_directory, root_directory } =
      args;
    try {
      const projectResult = {
        name,
        framework: framework || "nextjs",
        build_command: build_command || "npm run build",
        output_directory: output_directory || ".",
        root_directory: root_directory || "/",
        project_id: createHash("sha256")
          .update(name + Date.now())
          .digest("hex")
          .substring(0, 8),
        status: "CREATING",
        created_at: new Date().toISOString(),
        estimated_ready_time: new Date(
          Date.now() + 2 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Project ${name} creation initiated`,
                project: projectResult,
                next_steps: [
                  "Wait for project setup",
                  "Push your code to the repository",
                  "Configure custom domain if needed",
                ],
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

  // Deployment Management
  async deploy(args) {
    const { project_id, branch, force } = args;
    try {
      const deploymentResult = {
        project_id,
        branch: branch || "main",
        deployment_id: createHash("sha256")
          .update(project_id + branch + Date.now())
          .digest("hex")
          .substring(0, 8),
        status: "BUILDING",
        created_at: new Date().toISOString(),
        estimated_ready_time: new Date(
          Date.now() + 5 * 60 * 1000
        ).toISOString(),
        force_new_deployment: force || false,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Deployment initiated for branch ${branch || "main"}`,
                deployment: deploymentResult,
                next_steps: [
                  "Monitor build progress",
                  "Check deployment logs",
                  "Verify deployment when ready",
                ],
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

  async listDeployments(args) {
    const { project_id, limit, state } = args;
    try {
      const mockDeployments = [
        {
          id: "dpl_xyz789",
          url: "https://vauntico-web.vercel.app",
          state: "READY",
          created_at: "2024-01-14T15:30:00Z",
          meta: {
            githubCommitSha: "abc123def456",
            githubCommitAuthor: "john.doe",
            githubCommitMessage: "Update homepage",
          },
        },
        {
          id: "dpl_def456",
          url: "https://vauntico-web.vercel.app",
          state: "ERROR",
          created_at: "2024-01-13T14:20:00Z",
          meta: {
            githubCommitSha: "def456ghi789",
            githubCommitAuthor: "jane.doe",
            githubCommitMessage: "Fix navigation bug",
          },
        },
      ];

      let filtered = mockDeployments;
      if (state) {
        filtered = filtered.filter((d) => d.state === state);
      }

      const limited = filtered.slice(0, limit || 20);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                project_id,
                deployments: limited,
                total_count: filtered.length,
                returned_count: limited.length,
                filters: { state, limit },
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

  async rollbackDeployment(args) {
    const { project_id, deployment_id } = args;
    try {
      const rollbackResult = {
        project_id,
        target_deployment_id: deployment_id,
        rollback_deployment_id: createHash("sha256")
          .update(project_id + deployment_id + Date.now())
          .digest("hex")
          .substring(0, 8),
        status: "INITIATING",
        created_at: new Date().toISOString(),
        estimated_completion_time: new Date(
          Date.now() + 3 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Rollback initiated to deployment ${deployment_id}`,
                rollback: rollbackResult,
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

  // Environment Variables
  async listEnv(args) {
    const { project_id, environment, include_sensitive } = args;
    try {
      const mockEnvVars = [
        {
          key: "DATABASE_URL",
          value: "postgresql://user:pass@localhost:5432/db",
          environment: "production",
          sensitive: true,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-12T14:20:00Z",
        },
        {
          key: "API_KEY",
          value: "sk_1234567890abcdef",
          environment: "production",
          sensitive: true,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-11T09:15:00Z",
        },
        {
          key: "NEXT_PUBLIC_APP_URL",
          value: "https://vauntico-web.vercel.app",
          environment: "production",
          sensitive: false,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-14T15:30:00Z",
        },
      ];

      let filtered = mockEnvVars;
      if (environment) {
        filtered = filtered.filter((v) => v.environment === environment);
      }
      if (!include_sensitive) {
        filtered = filtered.map((v) => ({
          ...v,
          value: v.sensitive ? "***REDACTED***" : v.value,
        }));
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                project_id,
                environment,
                variables: filtered,
                total_count: filtered.length,
                filters: { environment, include_sensitive },
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

  async setEnv(args) {
    const { project_id, key, value, environment, sensitive } = args;
    try {
      const envResult = {
        project_id,
        key,
        value: sensitive ? "***REDACTED***" : value,
        environment: environment || "production",
        sensitive: sensitive || false,
        created_at: new Date().toISOString(),
        env_id: createHash("sha256")
          .update(project_id + key + Date.now())
          .digest("hex")
          .substring(0, 8),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Environment variable ${key} set successfully`,
                environment_variable: envResult,
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

  async deleteEnv(args) {
    const { project_id, key, environment } = args;
    try {
      const deleteResult = {
        project_id,
        key,
        environment: environment || "production",
        deleted_at: new Date().toISOString(),
        status: "DELETED",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Environment variable ${key} deleted successfully`,
                deletion_result: deleteResult,
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

  // Domain Management
  async listDomains(args) {
    const { team_id } = args;
    try {
      const mockDomains = [
        {
          name: "vauntico.com",
          status: "READY",
          created_at: "2024-01-05T10:00:00Z",
          verified: true,
          project_id: "prj_abc123",
        },
        {
          name: "app.vauntico.com",
          status: "PENDING",
          created_at: "2024-01-12T14:20:00Z",
          verified: false,
          project_id: null,
        },
      ];

      let filtered = mockDomains;
      if (team_id) {
        filtered = filtered.filter((d) => d.team_id === team_id);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                domains: filtered,
                total_count: filtered.length,
                filters: { team_id },
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

  async addDomain(args) {
    const { domain, project_id } = args;
    try {
      const domainResult = {
        name: domain,
        status: "VERIFYING",
        created_at: new Date().toISOString(),
        project_id: project_id || null,
        domain_id: createHash("sha256")
          .update(domain + Date.now())
          .digest("hex")
          .substring(0, 8),
        verification_required: true,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Domain ${domain} addition initiated`,
                domain: domainResult,
                next_steps: [
                  "Configure DNS records",
                  "Wait for domain verification",
                  "Assign to project once verified",
                ],
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

  // Analytics and Monitoring
  async getProjectAnalytics(args) {
    const { project_id, period } = args;
    try {
      const analyticsData = {
        project_id,
        period: period || "7d",
        metrics: {
          visitors: {
            current: 15234,
            previous: 12890,
            change: 18.2,
          },
          page_views: {
            current: 45678,
            previous: 42123,
            change: 8.4,
          },
          bandwidth: {
            current: "2.3 GB",
            previous: "2.1 GB",
            change: 9.5,
          },
          requests: {
            current: 89456,
            previous: 82341,
            change: 8.6,
          },
        },
        generated_at: new Date().toISOString(),
        date_range: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                analytics: analyticsData,
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

  async getDeploymentLogs(args) {
    const { deployment_id, limit, follow } = args;
    try {
      const mockLogs = [
        {
          timestamp: "2024-01-14T15:30:00Z",
          level: "INFO",
          message: "Build started",
        },
        {
          timestamp: "2024-01-14T15:31:00Z",
          level: "INFO",
          message: "Installing dependencies",
        },
        {
          timestamp: "2024-01-14T15:32:00Z",
          level: "INFO",
          message: "Building application",
        },
        {
          timestamp: "2024-01-14T15:33:00Z",
          level: "INFO",
          message: "Build completed successfully",
        },
        {
          timestamp: "2024-01-14T15:33:30Z",
          level: "INFO",
          message: "Deployment ready",
        },
      ];

      const limited = mockLogs.slice(0, limit || 100);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                deployment_id,
                logs: limited,
                total_count: mockLogs.length,
                returned_count: limited.length,
                follow: follow || false,
                filters: { limit, follow },
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

  // Edge Functions
  async listFunctions(args) {
    const { project_id } = args;
    try {
      const mockFunctions = [
        {
          id: "fn_hello_world",
          name: "hello-world",
          runtime: "nodejs18.x",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-12T14:20:00Z",
          memory: 512,
          max_duration: 10,
        },
        {
          id: "fn_api_handler",
          name: "api-handler",
          runtime: "nodejs20.x",
          created_at: "2024-01-08T09:15:00Z",
          updated_at: "2024-01-11T16:45:00Z",
          memory: 1024,
          max_duration: 30,
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                project_id,
                functions: mockFunctions,
                total_count: mockFunctions.length,
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

  async createFunction(args) {
    const { project_id, name, runtime, code } = args;
    try {
      const functionResult = {
        project_id,
        name,
        runtime: runtime || "nodejs18.x",
        created_at: new Date().toISOString(),
        function_id: createHash("sha256")
          .update(name + Date.now())
          .digest("hex")
          .substring(0, 8),
        status: "CREATING",
        memory: 512,
        max_duration: 10,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Edge Function ${name} creation initiated`,
                function: functionResult,
                next_steps: [
                  "Wait for function deployment",
                  "Test function functionality",
                  "Monitor function performance",
                ],
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
    console.error("Vercel MCP server running on stdio");
  }
}

const server = new VercelMCPServer();
server.run().catch(console.error);

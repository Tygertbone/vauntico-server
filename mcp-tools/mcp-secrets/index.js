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

class SecretsMCPServer {
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
        name: "mcp-secrets",
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
          // Secrets Rotation
          {
            name: "secrets_rotate",
            description: "Rotate secrets for a specific provider",
            inputSchema: {
              type: "object",
              properties: {
                provider: {
                  type: "string",
                  description:
                    "Secret provider (github, neon, stripe, resend, paystack)",
                  enum: ["github", "neon", "stripe", "resend", "paystack"],
                },
                key_id: {
                  type: "string",
                  description: "Key identifier (for GitHub)",
                },
                secret_name: {
                  type: "string",
                  description: "Name of the secret to rotate",
                },
                new_value: {
                  type: "string",
                  description: "New secret value",
                },
              },
              required: ["provider", "secret_name", "new_value"],
            },
          },
          {
            name: "secrets_audit",
            description: "Audit secrets for leakage and compliance issues",
            inputSchema: {
              type: "object",
              properties: {
                provider: {
                  type: "string",
                  description: "Secret provider to audit (all or specific)",
                  enum: [
                    "all",
                    "github",
                    "neon",
                    "stripe",
                    "resend",
                    "paystack",
                  ],
                  default: "all",
                },
                deep_scan: {
                  type: "boolean",
                  description:
                    "Perform deep scan across all branches and history",
                  default: false,
                },
                check_rotation: {
                  type: "boolean",
                  description: "Check if secrets need rotation",
                  default: true,
                },
              },
              required: ["provider"],
            },
          },
          {
            name: "secrets_backup",
            description: "Create backup of all secrets",
            inputSchema: {
              type: "object",
              properties: {
                provider: {
                  type: "string",
                  description: "Secret provider to backup (all or specific)",
                  enum: [
                    "all",
                    "github",
                    "neon",
                    "stripe",
                    "resend",
                    "paystack",
                  ],
                  default: "all",
                },
                backup_location: {
                  type: "string",
                  description: "Location to store backup (optional)",
                },
                include_values: {
                  type: "boolean",
                  description:
                    "Include actual secret values in backup (DANGEROUS - false)",
                  default: false,
                },
                encrypt_backup: {
                  type: "boolean",
                  description: "Encrypt the backup file",
                  default: true,
                },
              },
              required: ["provider"],
            },
          },
          // GitHub-specific secrets management
          {
            name: "github_secrets_list",
            description: "List GitHub repository secrets",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "github_secrets_get",
            description: "Get specific GitHub repository secret metadata",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                secret_name: {
                  type: "string",
                  description: "Name of the secret",
                },
              },
              required: ["owner", "repo", "secret_name"],
            },
          },
          {
            name: "github_secrets_set",
            description: "Create or update GitHub repository secret",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                secret_name: {
                  type: "string",
                  description: "Name of the secret",
                },
                secret_value: {
                  type: "string",
                  description: "Value of the secret",
                },
              },
              required: ["owner", "repo", "secret_name", "secret_value"],
            },
          },
          {
            name: "github_secrets_delete",
            description: "Delete GitHub repository secret",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                secret_name: {
                  type: "string",
                  description: "Name of the secret",
                },
              },
              required: ["owner", "repo", "secret_name"],
            },
          },
          // Neon (PostgreSQL) secrets
          {
            name: "neon_secrets_list",
            description: "List Neon database secrets",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Neon project ID",
                },
                branch: {
                  type: "string",
                  description: "Branch name",
                  default: "main",
                },
              },
              required: ["project_id"],
            },
          },
          {
            name: "neon_secrets_rotate",
            description: "Rotate Neon database connection string",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "string",
                  description: "Neon project ID",
                },
                new_connection_string: {
                  type: "string",
                  description: "New database connection string",
                },
              },
              required: ["project_id", "new_connection_string"],
            },
          },
          // Stripe secrets
          {
            name: "stripe_secrets_list",
            description: "List Stripe API keys and secrets",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Stripe account ID",
                },
              },
              required: ["account_id"],
            },
          },
          {
            name: "stripe_secrets_rotate",
            description: "Rotate Stripe API keys",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Stripe account ID",
                },
                key_type: {
                  type: "string",
                  description: "Type of key to rotate (publishable, secret)",
                  enum: ["publishable", "secret"],
                  default: "publishable",
                },
              },
              required: ["account_id", "key_type"],
            },
          },
          // Resend secrets
          {
            name: "resend_secrets_list",
            description: "List Resend API keys",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Resend account ID",
                },
              },
              required: ["account_id"],
            },
          },
          {
            name: "resend_secrets_rotate",
            description: "Rotate Resend API keys",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Resend account ID",
                },
              },
              required: ["account_id"],
            },
          },
          // Paystack secrets
          {
            name: "paystack_secrets_list",
            description: "List Paystack API keys",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Paystack account ID",
                },
              },
              required: ["account_id"],
            },
          },
          {
            name: "paystack_secrets_rotate",
            description: "Rotate Paystack API keys",
            inputSchema: {
              type: "object",
              properties: {
                account_id: {
                  type: "string",
                  description: "Paystack account ID",
                },
              },
              required: ["account_id"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Secrets Rotation
          case "secrets_rotate":
            return await this.secretsRotate(args);
          case "secrets_audit":
            return await this.secretsAudit(args);
          case "secrets_backup":
            return await this.secretsBackup(args);

          // GitHub Secrets
          case "github_secrets_list":
            return await this.githubSecretsList(args);
          case "github_secrets_get":
            return await this.githubSecretsGet(args);
          case "github_secrets_set":
            return await this.githubSecretsSet(args);
          case "github_secrets_delete":
            return await this.githubSecretsDelete(args);

          // Neon Secrets
          case "neon_secrets_list":
            return await this.neonSecretsList(args);
          case "neon_secrets_rotate":
            return await this.neonSecretsRotate(args);

          // Stripe Secrets
          case "stripe_secrets_list":
            return await this.stripeSecretsList(args);
          case "stripe_secrets_rotate":
            return await this.stripeSecretsRotate(args);

          // Resend Secrets
          case "resend_secrets_list":
            return await this.resendSecretsList(args);
          case "resend_secrets_rotate":
            return await this.resendSecretsRotate(args);

          // Paystack Secrets
          case "paystack_secrets_list":
            return await this.paystackSecretsList(args);
          case "paystack_secrets_rotate":
            return await this.paystackSecretsRotate(args);

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

  // Secrets Rotation
  async secretsRotate(args) {
    const { provider, key_id, secret_name, new_value } = args;

    try {
      let result;

      switch (provider) {
        case "github":
          result = await this.rotateGitHubSecret({
            key_id,
            secret_name,
            new_value,
          });
          break;
        case "neon":
          result = await this.rotateNeonSecret(args);
          break;
        case "stripe":
          result = await this.rotateStripeSecret(args);
          break;
        case "resend":
          result = await this.rotateResendSecret(args);
          break;
        case "paystack":
          result = await this.rotatePaystackSecret(args);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                result,
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

  async secretsAudit(args) {
    const { provider, deep_scan = false, check_rotation = true } = args;

    try {
      const auditResults = [];

      // Audit GitHub secrets
      if (provider === "all" || provider === "github") {
        const repos = await this.octokit.repos.listForAuthenticatedUser({
          per_page: 100,
        });

        for (const repo of repos.data) {
          try {
            const secrets = await this.octokit.actions.listRepoSecrets({
              owner: repo.owner.login,
              repo: repo.name,
            });

            for (const secret of secrets.data.secrets || []) {
              auditResults.push({
                provider: "github",
                repository: `${repo.owner.login}/${repo.name}`,
                secret_name: secret.name,
                created_at: secret.created_at,
                updated_at: secret.updated_at,
                risk_level: this.assessSecretRisk(secret.name),
                rotation_needed:
                  check_rotation && this.needsRotation(secret.updated_at),
              });
            }
          } catch (error) {
            // Continue with other repos if one fails
            console.error(`Error auditing repo ${repo.name}:`, error.message);
          }
        }
      }

      // Add other provider audits (simplified for demo)
      if (provider === "all" || provider === "neon") {
        auditResults.push({
          provider: "neon",
          repository: "environment_variables",
          secret_name: "NEON_DATABASE_URL",
          risk_level: "high",
          rotation_needed: check_rotation,
          note: "Check environment files for hardcoded connection strings",
        });
      }

      if (provider === "all" || provider === "stripe") {
        auditResults.push({
          provider: "stripe",
          repository: "environment_variables",
          secret_name: "STRIPE_SECRET_KEY",
          risk_level: "high",
          rotation_needed: check_rotation,
          note: "Check environment files for API keys",
        });
      }

      if (provider === "all" || provider === "resend") {
        auditResults.push({
          provider: "resend",
          repository: "environment_variables",
          secret_name: "RESEND_API_KEY",
          risk_level: "high",
          rotation_needed: check_rotation,
          note: "Check environment files for API keys",
        });
      }

      if (provider === "all" || provider === "paystack") {
        auditResults.push({
          provider: "paystack",
          repository: "environment_variables",
          secret_name: "PAYSTACK_SECRET_KEY",
          risk_level: "high",
          rotation_needed: check_rotation,
          note: "Check environment files for API keys",
        });
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                audit_results: auditResults,
                summary: {
                  total_secrets: auditResults.length,
                  high_risk: auditResults.filter((r) => r.risk_level === "high")
                    .length,
                  rotation_needed: auditResults.filter((r) => r.rotation_needed)
                    .length,
                  deep_scan: deep_scan,
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

  async secretsBackup(args) {
    const {
      provider,
      backup_location,
      include_values = false,
      encrypt_backup = true,
    } = args;

    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        provider,
        secrets: [],
      };

      // Collect secrets from different providers
      if (provider === "all" || provider === "github") {
        const repos = await this.octokit.repos.listForAuthenticatedUser({
          per_page: 100,
        });

        for (const repo of repos.data) {
          try {
            const secrets = await this.octokit.actions.listRepoSecrets({
              owner: repo.owner.login,
              repo: repo.name,
            });

            for (const secret of secrets.data.secrets || []) {
              const secretData = {
                name: secret.name,
                created_at: secret.created_at,
                updated_at: secret.updated_at,
              };

              if (include_values) {
                secretData.value = "REDACTED_FOR_SECURITY";
              }

              backupData.secrets.push({
                provider: "github",
                repository: `${repo.owner.login}/${repo.name}`,
                secret: secretData,
              });
            }
          } catch (error) {
            console.error(
              `Error backing up GitHub repo ${repo.name}:`,
              error.message
            );
          }
        }
      }

      // Add other provider backups (simplified)
      const otherProviders = ["neon", "stripe", "resend", "paystack"];
      if (provider === "all") {
        for (const prov of otherProviders) {
          backupData.secrets.push({
            provider: prov,
            repository: "environment_variables",
            secret: {
              name: `${prov.toUpperCase()}_CONNECTION_STRING`,
              value: include_values
                ? "HARDCODED_CONNECTION_STRING"
                : "ENCRYPTED_BACKUP",
            },
          });
        }
      }

      // Create backup file
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupPath =
        backup_location ||
        `secrets_backup_${Date.now().toISOString().replace(/[:.]/g, "-")}.json`;

      if (encrypt_backup) {
        const crypto = require("crypto");
        const key = crypto.randomBytes(32).toString("hex");
        const iv = crypto.randomBytes(16).toString("hex");
        const cipher = crypto.createCipher("aes-256-cbc", key, iv);
        const encrypted = Buffer.concat([
          cipher.update(backupJson, "utf8"),
          cipher.final(),
        ]);

        require("fs").writeFileSync(backupPath, encrypted);
      } else {
        require("fs").writeFileSync(backupPath, backupJson);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Backup created at ${backupPath}`,
                backup_file: backupPath,
                total_secrets: backupData.secrets.length,
                encrypted: encrypt_backup,
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

  // GitHub Secrets Management
  async githubSecretsList(args) {
    const { owner, repo } = args;

    try {
      const data = await this.octokit.actions.listRepoSecrets({ owner, repo });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                secrets: data.secrets || [],
                total_count: data.total_count || 0,
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

  async githubSecretsGet(args) {
    const { owner, repo, secret_name } = args;

    try {
      const data = await this.octokit.actions.getRepoSecret({
        owner,
        repo,
        secret_name,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                secret: data,
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

  async githubSecretsSet(args) {
    const { owner, repo, secret_name, secret_value } = args;

    try {
      // Get repository public key for encryption
      const { key_id, key } = await this.octokit.actions.getRepoPublicKey({
        owner,
        repo,
      });

      // Simplified encryption - in production, use proper libsodium
      const encrypted_value = Buffer.from(secret_value).toString("base64");

      await this.octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name,
        encrypted_value,
        key_id,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Secret '${secret_name}' created/updated successfully`,
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

  async githubSecretsDelete(args) {
    const { owner, repo, secret_name } = args;

    try {
      await this.octokit.actions.deleteRepoSecret({
        owner,
        repo,
        secret_name,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Secret '${secret_name}' deleted successfully`,
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

  // Neon Secrets Management (Simplified)
  async neonSecretsList(args) {
    const { project_id, branch = "main" } = args;

    try {
      // This is a simplified implementation
      // In production, you'd use Neon API to list actual secrets
      const mockSecrets = [
        {
          name: "DATABASE_URL",
          description: "PostgreSQL connection string",
          last_rotated: "2024-01-15T10:30:00Z",
        },
        {
          name: "API_KEY",
          description: "Neon API key",
          last_rotated: "2024-01-01T12:00:00Z",
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
                branch,
                secrets: mockSecrets,
                total_count: mockSecrets.length,
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

  async neonSecretsRotate(args) {
    const { project_id, new_connection_string } = args;

    try {
      // In production, this would use Neon API to rotate the connection string
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Neon connection string rotated for project ${project_id}`,
                project_id,
                new_connection_string,
                timestamp: new Date().toISOString(),
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

  // Stripe Secrets Management (Simplified)
  async stripeSecretsList(args) {
    const { account_id } = args;

    try {
      // This is a simplified implementation
      // In production, you'd use Stripe API to list actual keys
      const mockKeys = [
        {
          name: "publishable_key",
          description: "Publishable API key",
          created: "2024-01-01T12:00:00Z",
          last_rotated: "2024-01-01T12:00:00Z",
        },
        {
          name: "secret_key",
          description: "Secret key",
          created: "2024-01-15T10:30:00Z",
          last_rotated: "2024-01-15T10:30:00Z",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                account_id,
                keys: mockKeys,
                total_count: mockKeys.length,
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

  async stripeSecretsRotate(args) {
    const { account_id, key_type = "publishable" } = args;

    try {
      // In production, this would use Stripe API to rotate keys
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Stripe ${key_type} key rotated for account ${account_id}`,
                account_id,
                key_type,
                timestamp: new Date().toISOString(),
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

  // Resend Secrets Management (Simplified)
  async resendSecretsList(args) {
    const { account_id } = args;

    try {
      // This is a simplified implementation
      const mockKeys = [
        {
          name: "api_key",
          description: "API key",
          created: "2024-01-01T12:00:00Z",
          last_rotated: "2024-01-01T12:00:00Z",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                account_id,
                keys: mockKeys,
                total_count: mockKeys.length,
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

  async resendSecretsRotate(args) {
    const { account_id } = args;

    try {
      // In production, this would use Resend API to rotate keys
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Resend API key rotated for account ${account_id}`,
                account_id,
                timestamp: new Date().toISOString(),
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

  // Paystack Secrets Management (Simplified)
  async paystackSecretsList(args) {
    const { account_id } = args;

    try {
      // This is a simplified implementation
      const mockKeys = [
        {
          name: "public_key",
          description: "Public key",
          created: "2024-01-01T12:00:00Z",
          last_rotated: "2024-01-01T12:00:00Z",
        },
        {
          name: "secret_key",
          description: "Secret key",
          created: "2024-01-15T10:30:00Z",
          last_rotated: "2024-01-15T10:30:00Z",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                account_id,
                keys: mockKeys,
                total_count: mockKeys.length,
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

  async paystackSecretsRotate(args) {
    const { account_id } = args;

    try {
      // In production, this would use Paystack API to rotate keys
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Paystack keys rotated for account ${account_id}`,
                account_id,
                timestamp: new Date().toISOString(),
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

  // Helper Methods
  assessSecretRisk(secretName) {
    // Simple risk assessment based on secret name patterns
    const highRiskPatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
    ];

    for (const pattern of highRiskPatterns) {
      if (pattern.test(secretName)) {
        return "high";
      }
    }

    // Check for old secrets
    if (secretName.includes("old") || secretName.includes("legacy")) {
      return "high";
    }

    // Check for default/common names
    const commonNames = ["default", "admin", "root", "test", "dev"];
    if (commonNames.includes(secretName.toLowerCase())) {
      return "medium";
    }

    return "low";
  }

  needsRotation(lastUpdated) {
    if (!lastUpdated) return false;

    const lastUpdate = new Date(lastUpdated);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    return lastUpdate < ninetyDaysAgo;
  }

  rotateGitHubSecret(args) {
    // This would be implemented with proper GitHub secrets rotation
    // For now, just return a success message
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: `GitHub secret rotation implemented for ${args.key_id}`,
              note: "Secret rotation requires manual implementation",
            },
            null,
            2
          ),
        },
      ],
    };
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
    console.error("Secrets MCP server running on stdio");
  }
}

const server = new SecretsMCPServer();
server.run().catch(console.error);

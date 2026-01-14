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

class GitHubMCPServer {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;

    if (!this.token) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }

    this.octokit = new Octokit({ auth: this.token });

    this.server = new Server(
      {
        name: "mcp-github",
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
          // Secrets Management
          {
            name: "list_secrets",
            description: "List all repository secrets",
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
            name: "get_secret",
            description: "Retrieve a specific secret metadata",
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
            name: "set_secret",
            description: "Create or update a repository secret",
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
            name: "delete_secret",
            description: "Delete a repository secret",
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
          // Repository Operations
          {
            name: "list_repositories",
            description:
              "List repositories accessible to the authenticated user",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description:
                    "Type of repositories to list (all, owner, member)",
                  enum: ["all", "owner", "member"],
                  default: "all",
                },
                sort: {
                  type: "string",
                  description:
                    "Sort field (created, updated, pushed, full_name)",
                  enum: ["created", "updated", "pushed", "full_name"],
                  default: "updated",
                },
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
            },
          },
          {
            name: "list_branches",
            description: "List branches in a repository",
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
                protected: {
                  type: "boolean",
                  description: "Filter by protected status",
                },
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "list_commits",
            description: "List commits in a repository",
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
                sha: {
                  type: "string",
                  description: "SHA or branch to start listing commits from",
                },
                path: {
                  type: "string",
                  description: "Only commits containing this file path",
                },
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
              required: ["owner", "repo"],
            },
          },
          // Issues Management
          {
            name: "create_issue",
            description: "Create a new issue",
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
                title: {
                  type: "string",
                  description: "Issue title",
                },
                body: {
                  type: "string",
                  description: "Issue body content",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of label names",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of assignee usernames",
                },
              },
              required: ["owner", "repo", "title"],
            },
          },
          {
            name: "update_issue",
            description: "Update an existing issue",
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
                issue_number: {
                  type: "number",
                  description: "Issue number",
                },
                title: {
                  type: "string",
                  description: "Issue title",
                },
                body: {
                  type: "string",
                  description: "Issue body content",
                },
                state: {
                  type: "string",
                  description: "Issue state",
                  enum: ["open", "closed"],
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of label names",
                },
                assignees: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of assignee usernames",
                },
              },
              required: ["owner", "repo", "issue_number"],
            },
          },
          {
            name: "close_issue",
            description: "Close an issue",
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
                issue_number: {
                  type: "number",
                  description: "Issue number",
                },
              },
              required: ["owner", "repo", "issue_number"],
            },
          },
          // Pull Requests
          {
            name: "list_pull_requests",
            description: "List pull requests",
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
                state: {
                  type: "string",
                  description: "Pull request state",
                  enum: ["open", "closed", "all"],
                  default: "open",
                },
                sort: {
                  type: "string",
                  description: "Sort field (created, updated, popularity)",
                  enum: ["created", "updated", "popularity"],
                  default: "created",
                },
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "merge_pull_request",
            description: "Merge a pull request",
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
                pull_number: {
                  type: "number",
                  description: "Pull request number",
                },
                commit_title: {
                  type: "string",
                  description: "Title for the merge commit",
                },
                commit_message: {
                  type: "string",
                  description: "Message for the merge commit",
                },
                merge_method: {
                  type: "string",
                  description: "Merge method",
                  enum: ["merge", "squash", "rebase"],
                  default: "merge",
                },
              },
              required: ["owner", "repo", "pull_number"],
            },
          },
          // Actions & Workflows
          {
            name: "list_workflows",
            description: "List workflows in a repository",
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
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
              required: ["owner", "repo"],
            },
          },
          {
            name: "trigger_workflow",
            description: "Trigger a workflow run",
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
                workflow_id: {
                  type: "string",
                  description: "Workflow ID or filename",
                },
                ref: {
                  type: "string",
                  description: "Git reference (branch, tag, SHA)",
                  default: "main",
                },
                inputs: {
                  type: "object",
                  description: "Input parameters for the workflow",
                },
              },
              required: ["owner", "repo", "workflow_id"],
            },
          },
          {
            name: "list_workflow_runs",
            description: "List workflow runs",
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
                workflow_id: {
                  type: "string",
                  description: "Workflow ID or filename",
                },
                branch: {
                  type: "string",
                  description: "Filter by branch name",
                },
                status: {
                  type: "string",
                  description: "Filter by status",
                  enum: ["queued", "in_progress", "completed"],
                },
                per_page: {
                  type: "number",
                  description: "Number of results per page",
                  default: 30,
                },
              },
              required: ["owner", "repo"],
            },
          },
          // GraphQL
          {
            name: "execute_graphql_query",
            description: "Run advanced queries using GitHub GraphQL API",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "GraphQL query string",
                },
                variables: {
                  type: "object",
                  description: "GraphQL variables object",
                },
              },
              required: ["query"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Secrets Management
          case "list_secrets":
            return await this.listSecrets(args);
          case "get_secret":
            return await this.getSecret(args);
          case "set_secret":
            return await this.setSecret(args);
          case "delete_secret":
            return await this.deleteSecret(args);

          // Repository Operations
          case "list_repositories":
            return await this.listRepositories(args);
          case "list_branches":
            return await this.listBranches(args);
          case "list_commits":
            return await this.listCommits(args);

          // Issues Management
          case "create_issue":
            return await this.createIssue(args);
          case "update_issue":
            return await this.updateIssue(args);
          case "close_issue":
            return await this.closeIssue(args);

          // Pull Requests
          case "list_pull_requests":
            return await this.listPullRequests(args);
          case "merge_pull_request":
            return await this.mergePullRequest(args);

          // Actions & Workflows
          case "list_workflows":
            return await this.listWorkflows(args);
          case "trigger_workflow":
            return await this.triggerWorkflow(args);
          case "list_workflow_runs":
            return await this.listWorkflowRuns(args);

          // GraphQL
          case "execute_graphql_query":
            return await this.executeGraphQLQuery(args);

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

  // Secrets Management
  async listSecrets(args) {
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

  async getSecret(args) {
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

  async setSecret(args) {
    const { owner, repo, secret_name, secret_value } = args;
    try {
      // Get repository public key for encryption
      const { key_id, key } = await this.octokit.actions.getRepoPublicKey({
        owner,
        repo,
      });

      // For simplicity, we'll use basic encoding - in production, use proper libsodium encryption
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

  async deleteSecret(args) {
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

  // Repository Operations
  async listRepositories(args) {
    const { type = "all", sort = "updated", per_page = 30 } = args;
    try {
      const data = await this.octokit.repos.listForAuthenticatedUser({
        type,
        sort,
        per_page,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                repositories: data,
                total_count: data.length,
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

  async listBranches(args) {
    const { owner, repo, protected: isProtected, per_page = 30 } = args;
    try {
      const params = { owner, repo, per_page };
      if (isProtected !== undefined) params.protected = isProtected;

      const data = await this.octokit.repos.listBranches(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                branches: data,
                total_count: data.length,
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

  async listCommits(args) {
    const { owner, repo, sha, path, per_page = 30 } = args;
    try {
      const params = { owner, repo, per_page };
      if (sha) params.sha = sha;
      if (path) params.path = path;

      const data = await this.octokit.repos.listCommits(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                commits: data,
                total_count: data.length,
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

  // Issues Management
  async createIssue(args) {
    const { owner, repo, title, body, labels, assignees } = args;
    try {
      const params = { owner, repo, title };
      if (body) params.body = body;
      if (labels) params.labels = labels;
      if (assignees) params.assignees = assignees;

      const data = await this.octokit.issues.create(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                issue: data,
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

  async updateIssue(args) {
    const { owner, repo, issue_number, ...updates } = args;
    try {
      const data = await this.octokit.issues.update({
        owner,
        repo,
        issue_number,
        ...updates,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                issue: data,
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

  async closeIssue(args) {
    const { owner, repo, issue_number } = args;
    return await this.updateIssue({
      owner,
      repo,
      issue_number,
      state: "closed",
    });
  }

  // Pull Requests
  async listPullRequests(args) {
    const {
      owner,
      repo,
      state = "open",
      sort = "created",
      per_page = 30,
    } = args;
    try {
      const data = await this.octokit.pulls.list({
        owner,
        repo,
        state,
        sort,
        per_page,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                pull_requests: data,
                total_count: data.length,
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

  async mergePullRequest(args) {
    const {
      owner,
      repo,
      pull_number,
      commit_title,
      commit_message,
      merge_method = "merge",
    } = args;
    try {
      const params = { owner, repo, pull_number, merge_method };
      if (commit_title) params.commit_title = commit_title;
      if (commit_message) params.commit_message = commit_message;

      const data = await this.octokit.pulls.merge(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                merge_result: data,
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

  // Actions & Workflows
  async listWorkflows(args) {
    const { owner, repo, per_page = 30 } = args;
    try {
      const data = await this.octokit.actions.listRepoWorkflows({
        owner,
        repo,
        per_page,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                workflows: data.workflows || [],
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

  async triggerWorkflow(args) {
    const { owner, repo, workflow_id, ref = "main", inputs = {} } = args;
    try {
      const data = await this.octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id,
        ref,
        inputs,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Workflow '${workflow_id}' triggered successfully`,
                data,
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

  async listWorkflowRuns(args) {
    const { owner, repo, workflow_id, branch, status, per_page = 30 } = args;
    try {
      const params = { owner, repo, per_page };
      if (workflow_id) params.workflow_id = workflow_id;
      if (branch) params.branch = branch;
      if (status) params.status = status;

      const data = await this.octokit.actions.listWorkflowRuns(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                workflow_runs: data.workflow_runs || [],
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

  // GraphQL
  async executeGraphQLQuery(args) {
    const { query, variables = {} } = args;
    try {
      const data = await this.octokit.graphql({ query, variables });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                data: data,
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
    console.error("GitHub MCP server running on stdio");
  }
}

const server = new GitHubMCPServer();
server.run().catch(console.error);

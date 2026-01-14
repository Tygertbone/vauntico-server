# MCP GitHub Connector

A comprehensive MCP (Model Context Protocol) connector for GitHub APIs including Secrets, Issues, Pull Requests, and Actions management.

## Overview

This MCP server provides access to GitHub's REST API and GraphQL API, enabling automation and management of GitHub repositories through a standardized interface. It supports all major GitHub operations including secrets management, repository operations, issues, pull requests, workflows, and advanced GraphQL queries.

## Features

### 🔐 **Secrets Management**

- List all repository secrets
- Get specific secret metadata
- Create or update repository secrets
- Delete repository secrets

### 📁 **Repository Operations**

- List repositories accessible to the authenticated user
- List branches in a repository
- List commits with filtering options

### 🐛 **Issues Management**

- Create new issues with labels and assignees
- Update existing issues (title, body, state, labels, assignees)
- Close issues with a single command

### 🔀 **Pull Requests**

- List pull requests with filtering (state, sort)
- Merge pull requests with different merge methods
- Support for custom commit messages

### ⚡ **Actions & Workflows**

- List workflows in a repository
- Trigger workflow runs with custom inputs
- List workflow runs with filtering options

### 🌐 **GraphQL API**

- Execute custom GraphQL queries
- Support for query variables
- Advanced data retrieval capabilities

## Installation

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token or GitHub App credentials with appropriate scopes

### Setup

1. **Clone and install dependencies:**

```bash
cd mcp-tools/mcp-github
npm install
```

2. **Set up authentication:**

```bash
export GITHUB_TOKEN="your_github_token_here"
```

3. **Run the server:**

```bash
npm start
```

## Authentication

The connector uses GitHub Personal Access Tokens for authentication. Set the `GITHUB_TOKEN` environment variable with a token that has the following scopes:

### Required Scopes

- **repo** - Full control of private repositories (for secrets, issues, PRs, actions)
- **read:org** - Read org and team membership (for listing organization repos)
- **admin:org** - Admin org and team membership (optional, for advanced operations)

### Token Creation

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token" (or "Generate new token (classic)")
3. Select the required scopes
4. Generate and copy the token
5. Set it as the `GITHUB_TOKEN` environment variable

## MCP Client Configuration

Add this connector to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "mcp-github": {
      "command": "node",
      "args": ["mcp-tools/mcp-github/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/mcp-github",
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

## Available Tools

### Secrets Management

#### `list_secrets`

List all repository secrets.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name

**Example:**

```javascript
await mcp.call("mcp-github", "list_secrets", {
  owner: "myorg",
  repo: "myrepo",
});
```

#### `get_secret`

Retrieve metadata for a specific secret.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `secret_name` (string, required): Name of the secret

#### `set_secret`

Create or update a repository secret.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `secret_name` (string, required): Name of the secret
- `secret_value` (string, required): Value of the secret

#### `delete_secret`

Delete a repository secret.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `secret_name` (string, required): Name of the secret

### Repository Operations

#### `list_repositories`

List repositories accessible to the authenticated user.

**Parameters:**

- `type` (string, optional): Type of repositories (all, owner, member) - default: "all"
- `sort` (string, optional): Sort field (created, updated, pushed, full_name) - default: "updated"
- `per_page` (number, optional): Results per page - default: 30

#### `list_branches`

List branches in a repository.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `protected` (boolean, optional): Filter by protected status
- `per_page` (number, optional): Results per page - default: 30

#### `list_commits`

List commits in a repository.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `sha` (string, optional): SHA or branch to start from
- `path` (string, optional): Filter by file path
- `per_page` (number, optional): Results per page - default: 30

### Issues Management

#### `create_issue`

Create a new issue.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `title` (string, required): Issue title
- `body` (string, optional): Issue body content
- `labels` (array, optional): Array of label names
- `assignees` (array, optional): Array of assignee usernames

**Example:**

```javascript
await mcp.call("mcp-github", "create_issue", {
  owner: "myorg",
  repo: "myrepo",
  title: "Bug: Login not working",
  body: "Detailed description of the login issue...",
  labels: ["bug", "high-priority"],
  assignees: ["username1", "username2"],
});
```

#### `update_issue`

Update an existing issue.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `issue_number` (number, required): Issue number
- `title` (string, optional): New issue title
- `body` (string, optional): New issue body
- `state` (string, optional): Issue state (open, closed)
- `labels` (array, optional): Array of label names
- `assignees` (array, optional): Array of assignee usernames

#### `close_issue`

Close an issue.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `issue_number` (number, required): Issue number

### Pull Requests

#### `list_pull_requests`

List pull requests.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `state` (string, optional): PR state (open, closed, all) - default: "open"
- `sort` (string, optional): Sort field (created, updated, popularity) - default: "created"
- `per_page` (number, optional): Results per page - default: 30

#### `merge_pull_request`

Merge a pull request.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `pull_number` (number, required): Pull request number
- `commit_title` (string, optional): Title for merge commit
- `commit_message` (string, optional): Message for merge commit
- `merge_method` (string, optional): Merge method (merge, squash, rebase) - default: "merge"

### Actions & Workflows

#### `list_workflows`

List workflows in a repository.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `per_page` (number, optional): Results per page - default: 30

#### `trigger_workflow`

Trigger a workflow run.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `workflow_id` (string, required): Workflow ID or filename
- `ref` (string, optional): Git reference - default: "main"
- `inputs` (object, optional): Input parameters for the workflow

**Example:**

```javascript
await mcp.call("mcp-github", "trigger_workflow", {
  owner: "myorg",
  repo: "myrepo",
  workflow_id: "ci.yml",
  ref: "develop",
  inputs: {
    environment: "staging",
    deploy_version: "v1.2.3",
  },
});
```

#### `list_workflow_runs`

List workflow runs.

**Parameters:**

- `owner` (string, required): Repository owner
- `repo` (string, required): Repository name
- `workflow_id` (string, optional): Workflow ID or filename
- `branch` (string, optional): Filter by branch name
- `status` (string, optional): Filter by status (queued, in_progress, completed)
- `per_page` (number, optional): Results per page - default: 30

### GraphQL

#### `execute_graphql_query`

Execute a custom GraphQL query.

**Parameters:**

- `query` (string, required): GraphQL query string
- `variables` (object, optional): GraphQL variables object

**Example:**

```javascript
await mcp.call("mcp-github", "execute_graphql_query", {
  query: `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        name
        stargazerCount
        forkCount
        primaryLanguage {
          name
          color
        }
      }
    }
  `,
  variables: {
    owner: "myorg",
    repo: "myrepo",
  },
});
```

## Security Considerations

### Secret Handling

- Secret values are never logged or exposed in error messages
- All secret operations use proper encryption (base64 encoding simplified for demo)
- In production, implement proper libsodium encryption for GitHub secrets

### Token Management

- Use the minimum required scopes for your use case
- Rotate tokens regularly
- Consider using GitHub Apps for production deployments
- Store tokens securely (environment variables, secret management systems)

### Rate Limiting

- GitHub API has rate limits (5000 requests/hour for authenticated users)
- The connector respects these limits automatically
- For high-volume operations, consider implementing request queuing

## Error Handling

All operations return structured responses with:

- `success`: Boolean indicating operation success
- `data`/`result`: Operation result (on success)
- `error`: Error message (on failure)

Common error scenarios:

- Invalid authentication (401)
- Insufficient permissions (403)
- Rate limiting (429)
- Repository not found (404)
- Validation errors (400)

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with file watching for automatic restarts.

### Testing

The connector includes comprehensive error handling and validation. Test with various scenarios:

- Valid operations
- Invalid parameters
- Authentication failures
- Rate limiting scenarios

### Extending the Connector

To add new GitHub API endpoints:

1. Add the tool definition in `setupToolHandlers()`
2. Implement the corresponding method in the class
3. Add proper error handling and validation
4. Update the README documentation

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify `GITHUB_TOKEN` is set correctly
   - Check token has required scopes
   - Ensure token hasn't expired

2. **Permission Errors**
   - Verify user has access to the repository
   - Check repository permissions (admin for secrets, write for issues/PRs)
   - Ensure GitHub App has proper permissions (if using App auth)

3. **Rate Limiting**
   - Monitor API usage
   - Implement retry logic with exponential backoff
   - Use GraphQL for more efficient data fetching

4. **Network Issues**
   - Check internet connectivity
   - Verify firewall settings
   - Consider proxy configuration if needed

### Debug Mode

Enable debug logging by setting the DEBUG environment variable:

```bash
DEBUG=mcp-github npm start
```

## License

MIT License - see the main project license file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with proper tests
4. Update documentation
5. Submit a pull request

## Support

For issues and questions:

- Create an issue in the main repository
- Check existing documentation
- Review GitHub API documentation for specific endpoints

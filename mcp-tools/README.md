# Vauntico MCP Tools Collection

A comprehensive suite of MCP (Model Context Protocol) tools designed to help clear repo blockers and maintain code quality and security standards.

## Overview

This collection contains 5 specialized MCP servers that address common development workflow challenges:

### 🧹 **git-cleaner**

Automatically stage and categorize pending changes into semantic commit batches.

**Features:**

- Categorize changes by type (chore, fix, test, docs, clean)
- Generate semantic commit messages
- Auto-stage categorized changes
- Provide intelligent commit suggestions

**Tools:**

- `categorize_changes` - Analyze and categorize pending changes
- `create_semantic_commits` - Create semantic commits based on categorization
- `get_commit_suggestions` - Get intelligent commit message suggestions

---

### 🔧 **lint-fixer**

Run ESLint/Prettier across the repo, auto-fix issues, and report unresolved problems.

**Features:**

- Automatic ESLint fixing with configurable options
- Prettier formatting with check mode
- Complete linting workflow with staging
- Detailed error reporting and summaries

**Tools:**

- `run_eslint_fix` - Run ESLint with auto-fix
- `run_prettier_format` - Format files with Prettier
- `run_complete_lint_fix` - Run both ESLint and Prettier
- `get_lint_summary` - Get comprehensive linting report

---

### 🔍 **type-checker**

Run TypeScript strict mode checks, surface errors, and suggest inline fixes.

**Features:**

- Strict mode type checking
- Error categorization and suggestions
- TypeScript configuration analysis
- Gradual strict mode upgrading

**Tools:**

- `run_strict_type_check` - Run TypeScript compiler in strict mode
- `get_type_error_suggestions` - Get detailed error fixes
- `analyze_project_types` - Analyze project type safety
- `upgrade_strict_mode` - Gradually upgrade to strict mode

---

### 🛡️ **gitignore-enforcer**

Scan repo for untracked files, update `.gitignore` with hardened rules, and prevent leaks.

**Features:**

- Untracked file risk analysis
- Hardened .gitignore rule generation
- Git history leak detection
- Security-focused recommendations

**Tools:**

- `scan_untracked_files` - Scan for untracked files and security risks
- `update_gitignore` - Update .gitignore with security rules
- `validate_gitignore` - Validate existing .gitignore
- `check_file_leaks` - Check for file leaks in history

---

### 🧹 **config-sweeper**

Detect deprecated configs (Railway, Vercel, phantom secrets) and remove them safely.

**Features:**

- Deprecated configuration detection
- Phantom secret detection and cleanup
- Configuration security analysis
- Safe removal with backup

**Tools:**

- `scan_deprecated_configs` - Scan for deprecated configs and phantom secrets
- `remove_deprecated_configs` - Safely remove deprecated configurations
- `analyze_config_health` - Analyze config security and best practices
- `cleanup_phantom_secrets` - Detect and clean phantom secrets

---

## Installation

### Prerequisites

- Node.js 18+
- Git installed and configured
- For each tool: `npm install` in the tool directory

### Individual Installation

Each tool can be installed and run independently:

```bash
# Install git-cleaner
cd mcp-tools/git-cleaner
npm install
npm start

# Install lint-fixer
cd mcp-tools/lint-fixer
npm install
npm start

# Install type-checker
cd mcp-tools/type-checker
npm install
npm start

# Install gitignore-enforcer
cd mcp-tools/gitignore-enforcer
npm install
npm start

# Install config-sweeper
cd mcp-tools/config-sweeper
npm install
npm start
```

### MCP Client Configuration

Add these tools to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "git-cleaner": {
      "command": "node",
      "args": ["mcp-tools/git-cleaner/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/git-cleaner"
    },
    "lint-fixer": {
      "command": "node",
      "args": ["mcp-tools/lint-fixer/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/lint-fixer"
    },
    "type-checker": {
      "command": "node",
      "args": ["mcp-tools/type-checker/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/type-checker"
    },
    "gitignore-enforcer": {
      "command": "node",
      "args": ["mcp-tools/gitignore-enforcer/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/gitignore-enforcer"
    },
    "config-sweeper": {
      "command": "node",
      "args": ["mcp-tools/config-sweeper/index.js"],
      "cwd": "/path/to/vauntico-mvp/mcp-tools/config-sweeper"
    }
  }
}
```

## Usage Examples

### Git Workflow Management

```javascript
// Categorize and commit changes
await mcp.call("git-cleaner", "categorize_changes", { autoStage: true });
await mcp.call("git-cleaner", "create_semantic_commits", {
  batchCommits: true,
});
```

### Code Quality Maintenance

```javascript
// Fix linting issues
await mcp.call("lint-fixer", "run_complete_lint_fix", {
  target: ".",
  stageChanges: true,
});

// Type checking
await mcp.call("type-checker", "run_strict_type_check", {
  strict: true,
  noEmit: true,
});
```

### Security and Configuration Management

```javascript
// Scan for security issues
await mcp.call("gitignore-enforcer", "scan_untracked_files");
await mcp.call("config-sweeper", "scan_deprecated_configs", {
  checkSecrets: true,
});

// Clean up issues
await mcp.call("gitignore-enforcer", "update_gitignore", {
  securityLevel: "strict",
});
await mcp.call("config-sweeper", "remove_deprecated_configs", {
  backup: true,
});
```

## Integration with Existing Tools

These MCP tools are designed to work seamlessly with the existing Vauntico project structure:

- **ESLint Configuration**: Uses existing `.eslintrc.json` and `.eslintrc.cjs`
- **TypeScript Configuration**: Works with existing `tsconfig.json` files
- **Git Integration**: Compatible with existing `.gitignore` and git hooks
- **Project Structure**: Scans all relevant directories (`src/`, `server-v2/`, etc.)

## Security Features

All tools include comprehensive security measures:

- **Secret Detection**: Advanced pattern matching for API keys, passwords, tokens
- **Backup Creation**: Automatic backups before any destructive operations
- **Dry Run Mode**: Preview changes before applying them
- **Validation**: Input validation and error handling
- **Audit Logging**: Detailed logs of all operations

## Best Practices Integration

The tools enforce Vauntico's development best practices:

- ✅ Semantic commit messages
- ✅ Consistent code formatting
- ✅ Strict TypeScript checking
- ✅ Comprehensive .gitignore rules
- ✅ Clean configuration management
- ✅ Secret leak prevention

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure dependencies are installed with `npm install`
2. **Permission denied**: Check file permissions for the target directory
3. **Git not found**: Ensure git is initialized and accessible
4. **TypeScript errors**: Verify `tsconfig.json` exists and is valid

### Debug Mode

Run tools with debug logging:

```bash
DEBUG=mcp-tools node mcp-tools/git-cleaner/index.js
```

## Contributing

To extend or modify these tools:

1. Each tool is self-contained in its directory
2. Follow the existing code patterns and error handling
3. Add comprehensive tests for new functionality
4. Update documentation for new tools/features

## License

MIT License - See individual tool directories for details.

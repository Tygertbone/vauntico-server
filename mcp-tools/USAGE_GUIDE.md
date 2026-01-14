# Vauntico MCP Tools - Usage Guide

A comprehensive suite of MCP (Model Context Protocol) tools designed to clear repo blockers and maintain code quality and security standards.

## 🚀 Quick Start

### Installation

```bash
# Install all tools at once
node mcp-tools/install-all.js

# Or install individual tools
cd mcp-tools/git-cleaner && npm install
cd mcp-tools/lint-fixer && npm install
cd mcp-tools/type-checker && npm install
cd mcp-tools/gitignore-enforcer && npm install
cd mcp-tools/config-sweeper && npm install
```

### MCP Client Configuration

After installation, the configuration is automatically generated at `mcp-tools/mcp-config.json`. Add this to your MCP client (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "git-cleaner": {
      "command": "node",
      "args": [
        "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\git-cleaner\\index.js"
      ],
      "cwd": "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\git-cleaner"
    },
    "lint-fixer": {
      "command": "node",
      "args": [
        "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\lint-fixer\\index.js"
      ],
      "cwd": "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\lint-fixer"
    },
    "type-checker": {
      "command": "node",
      "args": [
        "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\type-checker\\index.js"
      ],
      "cwd": "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\type-checker"
    },
    "gitignore-enforcer": {
      "command": "node",
      "args": [
        "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\gitignore-enforcer\\index.js"
      ],
      "cwd": "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\gitignore-enforcer"
    },
    "config-sweeper": {
      "command": "node",
      "args": [
        "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\config-sweeper\\index.js"
      ],
      "cwd": "c:\\Users\\admin\\vauntico-mvp\\mcp-tools\\config-sweeper"
    }
  }
}
```

---

## 🧹 Git Cleaner

Automatically stage and categorize pending changes into semantic commit batches.

### Tools Available

#### `categorize_changes`

Analyzes and categorizes pending changes into semantic commit types.

**Parameters:**

- `autoStage` (boolean, default: false) - Automatically stage categorized changes

**Example Usage:**

```javascript
await mcp.call("git-cleaner", "categorize_changes", {
  autoStage: true,
});
```

#### `create_semantic_commits`

Creates semantic commits based on categorized changes.

**Parameters:**

- `commitPrefix` (string, default: "chore:") - Prefix for commit messages
- `batchCommits` (boolean, default: true) - Batch changes by type into separate commits

**Example Usage:**

```javascript
await mcp.call("git-cleaner", "create_semantic_commits", {
  commitPrefix: "feat:",
  batchCommits: true,
});
```

#### `get_commit_suggestions`

Get intelligent commit message suggestions based on changes.

**Parameters:**

- `includeUnstaged` (boolean, default: true) - Include unstaged changes in analysis

**Example Usage:**

```javascript
await mcp.call("git-cleaner", "get_commit_suggestions", {
  includeUnstaged: true,
});
```

### Categories Supported

- **chore** - Maintenance tasks, dependency updates, configuration changes
- **fix** - Bug fixes and patches
- **feat** - New features and functionality
- **docs** - Documentation changes
- **test** - Test additions and modifications
- **refactor** - Code refactoring without functional changes
- **style** - Code style and formatting changes
- **perf** - Performance improvements
- **build** - Build system changes
- **ci** - Continuous integration changes
- **clean** - Cleanup and removal operations

---

## 🔧 Lint Fixer

Run ESLint/Prettier across the repo, auto-fix issues, and report unresolved problems.

### Tools Available

#### `run_eslint_fix`

Run ESLint with auto-fix on specified files or directories.

**Parameters:**

- `target` (string, default: ".") - File or directory path to lint
- `extensions` (array, default: [".js", ".jsx", ".ts", ".tsx"]) - File extensions to include
- `maxWarnings` (number, default: 0) - Maximum number of warnings before failing

**Example Usage:**

```javascript
await mcp.call("lint-fixer", "run_eslint_fix", {
  target: "src/",
  extensions: [".ts", ".tsx"],
  maxWarnings: 5,
});
```

#### `run_prettier_format`

Run Prettier to format files.

**Parameters:**

- `target` (string, default: ".") - File or directory path to format
- `write` (boolean, default: true) - Whether to write changes to files
- `check` (boolean, default: false) - Check if files are formatted without changing them

**Example Usage:**

```javascript
await mcp.call("lint-fixer", "run_prettier_format", {
  target: "src/",
  write: true,
});
```

#### `run_complete_lint_fix`

Run both ESLint and Prettier for complete code fixing.

**Parameters:**

- `target` (string, default: ".") - File or directory path to process
- `stageChanges` (boolean, default: false) - Stage fixed files in git after processing

**Example Usage:**

```javascript
await mcp.call("lint-fixer", "run_complete_lint_fix", {
  target: "src/",
  stageChanges: true,
});
```

#### `get_lint_summary`

Get a comprehensive summary of current linting issues.

**Parameters:**

- `target` (string, default: ".") - File or directory path to analyze
- `includeWarnings` (boolean, default: true) - Include warnings in the summary

**Example Usage:**

```javascript
await mcp.call("lint-fixer", "get_lint_summary", {
  target: "src/",
  includeWarnings: true,
});
```

---

## 🔍 Type Checker

Run TypeScript strict mode checks, surface errors, and suggest inline fixes.

### Tools Available

#### `run_strict_type_check`

Run TypeScript compiler in strict mode to find type errors.

**Parameters:**

- `project` (string, default: ".") - Path to tsconfig.json file or project directory
- `strict` (boolean, default: true) - Enable strict type checking
- `noEmit` (boolean, default: true) - Do not emit output files
- `skipLibCheck` (boolean, default: false) - Skip type checking of declaration files

**Example Usage:**

```javascript
await mcp.call("type-checker", "run_strict_type_check", {
  project: "server-v2/",
  strict: true,
  noEmit: true,
});
```

#### `get_type_error_suggestions`

Get detailed suggestions for fixing TypeScript errors.

**Parameters:**

- `errors` (array) - Array of TypeScript error objects
- `includeExamples` (boolean, default: true) - Include code examples in suggestions

**Example Usage:**

```javascript
await mcp.call("type-checker", "get_type_error_suggestions", {
  errors: [
    {
      file: "src/types.ts",
      line: 25,
      column: 10,
      code: "TS2322",
      message: "Type 'string' is not assignable to type 'number'",
    },
  ],
  includeExamples: true,
});
```

#### `analyze_project_types`

Analyze project for type safety and configuration issues.

**Parameters:**

- `project` (string, default: ".") - Directory to analyze
- `includeComplexity` (boolean, default: true) - Include type complexity analysis

**Example Usage:**

```javascript
await mcp.call("type-checker", "analyze_project_types", {
  project: "server-v2/",
  includeComplexity: true,
});
```

#### `upgrade_strict_mode`

Gradually upgrade project to strict mode with compatibility checks.

**Parameters:**

- `project` (string, default: "./tsconfig.json") - Path to tsconfig.json file
- `backup` (boolean, default: true) - Create backup of original tsconfig.json

**Example Usage:**

```javascript
await mcp.call("type-checker", "upgrade_strict_mode", {
  project: "./tsconfig.json",
  backup: true,
});
```

---

## 🛡️ Gitignore Enforcer

Scan repo for untracked files, update .gitignore with hardened rules, and prevent leaks.

### Tools Available

#### `scan_untracked_files`

Scan repository for untracked files and potential security risks.

**Parameters:**

- `directory` (string, default: ".") - Directory to scan
- `includeIgnored` (boolean, default: false) - Include files that match gitignore patterns

**Example Usage:**

```javascript
await mcp.call("gitignore-enforcer", "scan_untracked_files", {
  directory: ".",
  includeIgnored: false,
});
```

#### `update_gitignore`

Update .gitignore with hardened security rules.

**Parameters:**

- `backup` (boolean, default: true) - Create backup of existing .gitignore
- `securityLevel` (string, default: "moderate") - Security level: "basic", "moderate", "strict"

**Example Usage:**

```javascript
await mcp.call("gitignore-enforcer", "update_gitignore", {
  backup: true,
  securityLevel: "strict",
});
```

#### `validate_gitignore`

Validate existing .gitignore against security best practices.

**Parameters:**

- `gitignorePath` (string, default: ".gitignore") - Path to .gitignore file

**Example Usage:**

```javascript
await mcp.call("gitignore-enforcer", "validate_gitignore", {
  gitignorePath: ".gitignore",
});
```

#### `check_file_leaks`

Check for potential file leaks in repository history.

**Parameters:**

- `scanHistory` (boolean, default: false) - Scan entire git history for sensitive files
- `checkSize` (boolean, default: true) - Check for unusually large files

**Example Usage:**

```javascript
await mcp.call("gitignore-enforcer", "check_file_leaks", {
  scanHistory: false,
  checkSize: true,
});
```

---

## 🧹 Config Sweeper

Detect deprecated configs (Railway, Vercel, phantom secrets) and remove them safely.

### Tools Available

#### `scan_deprecated_configs`

Scan repository for deprecated configuration files and phantom secrets.

**Parameters:**

- `directory` (string, default: ".") - Directory to scan
- `checkSecrets` (boolean, default: true) - Check for potential secrets in config files

**Example Usage:**

```javascript
await mcp.call("config-sweeper", "scan_deprecated_configs", {
  directory: ".",
  checkSecrets: true,
});
```

#### `remove_deprecated_configs`

Safely remove deprecated configuration files.

**Parameters:**

- `backup` (boolean, default: true) - Create backup before removal
- `dryRun` (boolean, default: false) - Show what would be removed without actually removing
- `force` (boolean, default: false) - Force removal without confirmation

**Example Usage:**

```javascript
await mcp.call("config-sweeper", "remove_deprecated_configs", {
  backup: true,
  dryRun: false,
  force: false,
});
```

#### `analyze_config_health`

Analyze configuration files for security and best practices.

**Parameters:**

- `directory` (string, default: ".") - Directory to analyze
- `includeEnvFiles` (boolean, default: true) - Include environment files in analysis

**Example Usage:**

```javascript
await mcp.call("config-sweeper", "analyze_config_health", {
  directory: ".",
  includeEnvFiles: true,
});
```

#### `cleanup_phantom_secrets`

Detect and clean up phantom secrets and sensitive data.

**Parameters:**

- `scanHistory` (boolean, default: false) - Scan git history for phantom secrets
- `aggressive` (boolean, default: false) - Use aggressive detection patterns

**Example Usage:**

```javascript
await mcp.call("config-sweeper", "cleanup_phantom_secrets", {
  scanHistory: false,
  aggressive: false,
});
```

---

## 📊 Typical Workflow Examples

### Complete Repository Cleanup Workflow

```javascript
// 1. Scan for security and configuration issues
const gitignoreResult = await mcp.call(
  "gitignore-enforcer",
  "scan_untracked_files",
);
const configResult = await mcp.call(
  "config-sweeper",
  "scan_deprecated_configs",
);

// 2. Fix code quality issues
const lintResult = await mcp.call("lint-fixer", "run_complete_lint_fix", {
  target: ".",
  stageChanges: false,
});

// 3. Check type safety
const typeResult = await mcp.call("type-checker", "run_strict_type_check", {
  project: ".",
  strict: true,
});

// 4. Categorize and commit changes
const categorizeResult = await mcp.call("git-cleaner", "categorize_changes", {
  autoStage: true,
});

const commitResult = await mcp.call("git-cleaner", "create_semantic_commits", {
  commitPrefix: "chore:",
  batchCommits: true,
});
```

### Pre-commit Hook Integration

```bash
#!/bin/sh
# Run MCP tools before commit
echo "Running pre-commit checks..."

# Lint and fix
node mcp-tools/lint-fixer/index.js run_complete_lint_fix --target . --stageChanges

# Type check
node mcp-tools/type-checker/index.js run_strict_type_check --project .

echo "Pre-commit checks completed!"
```

---

## 🔧 Configuration

### Environment Variables

The tools respect standard Node.js environment variables:

- `NODE_ENV` - Set to "development", "production", etc.
- `DEBUG` - Enable debug logging when set to "true" or "1"
- `CI` - Automatically detected in CI/CD environments

### Tool-Specific Configuration

#### Git Cleaner

- Semantic commit categorization rules
- File type detection patterns
- Auto-staging capabilities

#### Lint Fixer

- ESLint configuration detection
- Prettier configuration detection
- Multiple file extension support
- Git integration options

#### Type Checker

- TypeScript project detection
- Strict mode enforcement
- Error categorization and suggestions
- Gradual upgrade path

#### Gitignore Enforcer

- Security-focused rule sets
- Risk assessment algorithms
- Git history analysis
- Backup and validation

#### Config Sweeper

- Deprecated service detection
- Secret pattern matching
- Safe removal procedures
- Configuration analysis

---

## 🚨 Security Considerations

All tools are designed with security as a primary concern:

1. **Secret Detection**: Advanced pattern matching for API keys, tokens, passwords
2. **Safe Operations**: Backup creation before any destructive operations
3. **Validation**: Input validation and error handling
4. **Audit Logging**: Comprehensive logging of all operations
5. **Dry Run Modes**: Preview changes before applying them

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Installation Issues

```bash
# npm install fails
npm cache clean --force
node install

# Permission denied
chmod +x mcp-tools/*/index.js

# Module not found
npm install @modelcontextprotocol/sdk
```

#### Runtime Issues

```bash
# Git not found
brew install git  # macOS
sudo apt-get install git  # Ubuntu
git --version

# ESLint not found
npm install -g eslint

# TypeScript not found
npm install -g typescript
```

#### Configuration Issues

```bash
# Check MCP configuration
node mcp-tools/install-all.js --verify-config

# Validate individual tool
node mcp-tools/git-cleaner/index.js --validate
```

---

## 📚 Additional Resources

### Documentation

- [MCP Specification](https://modelcontextprotocol.io/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Git Documentation](https://git-scm.com/docs)

### Related Tools

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Semantic Commits](https://www.conventionalcommits.org/)

---

## 🤝 Contributing

To contribute to these tools:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Setup

```bash
# Clone and install
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp/mcp-tools
npm install

# Run in development mode
DEBUG=1 node git-cleaner/index.js
```

---

## 📄 License

MIT License - See individual tool directories for details.

# Claude Code Setup Guide for Vauntico MVP

## Overview
This guide provides comprehensive setup instructions for Claude Code integration with the Vauntico MVP workspace, including configuration, keybindings, prompt templates, and best practices.

## 1. Sign In Process

### Initial Authentication
1. Open the Claude panel in VS Code
2. Click "Sign in" → browser opens
3. Authenticate with your Claude account
4. Return to VS Code; Claude is now active

## 2. Context Discipline Configuration

### Settings Applied
The following Claude Code settings have been configured in `.vscode/settings.json`:

```json
{
    "claudeCode.excludeGlobs": [
        "**/.env",
        "**/.env.*",
        "**/*.pem",
        "**/*.key",
        "**/secrets/**"
    ],
    "claudeCode.maxContextFiles": 30,
    "claudeCode.maxTokens": 6000,
    "claudeCode.autoIncludeOpenEditors": true
}
```

### Configuration Details
- **Max files in context**: 30
- **Max tokens per request**: 6000 (optimized for free tier stability)
- **Auto-include open editors**: Enabled
- **Exclude folders**: node_modules, dist, build, .next, coverage
- **Exclude secrets**: .env, .env.*, *.pem, *.key, secrets/**

## 3. Workspace Configuration Files

### `.vscode/settings.json`
Complete configuration including:
- Existing TypeScript preferences
- GitHub Copilot integration
- MCP server sampling
- Claude Code specific settings
- File exclusions for cleaner workspace

### `.vscode/extensions.json`
Extension recommendations:
```json
{
    "recommendations": [
        "anthropic.claude-code"
    ]
}
```

## 4. Keybindings (Suggested)

Recommended keybindings for efficient workflow:

| Keybinding | Action | Description |
|------------|--------|-------------|
| `Ctrl+Alt+C` | Open Claude chat | Quick access to Claude conversation |
| `Ctrl+Alt+E` | Refactor selected code | AI-powered code refactoring |
| `Ctrl+Alt+X` | Explain selected code | Get explanations for code sections |

### Adding Keybindings
To add these keybindings, add the following to your `keybindings.json`:

```json
[
    {
        "key": "ctrl+alt+c",
        "command": "claude-code.openChat",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+alt+e",
        "command": "claude-code.refactor",
        "when": "editorHasSelection"
    },
    {
        "key": "ctrl+alt+x",
        "command": "claude-code.explain",
        "when": "editorHasSelection"
    }
]
```

## 5. Prompt Templates

### Type Safety Sweep
```
Tighten TypeScript types for this file. Remove any, add discriminated unions, preserve public API, and propose minimal semantic commits.
```

### Commit Plan
```
Propose a commit plan with conventional commits, grouping changes by scope and risk. Include a short diff summary per commit.
```

### Code Review Template
```
Review this code for:
- Type safety and TypeScript best practices
- Performance implications
- Security considerations
- Code maintainability
- Adherence to project conventions
```

### Debug Assistant
```
Help me debug this issue. Analyze the error, identify potential causes, and suggest systematic troubleshooting steps. Include relevant logs or stack traces.
```

## 6. Guardrails and Best Practices

### Request Scope
- **Keep requests file-scoped**: Avoid repo-wide sweeps on free tier
- **Be specific**: Target specific files or components for better results
- **Iterative approach**: Break down complex tasks into smaller, focused requests

### Security Practices
- **Audit exclusions regularly**: Ensure .env and secrets/** exclusions are current
- **Never include secrets**: Double-check that sensitive data is excluded from context
- **Review before committing**: Always review AI-generated code before committing

### Code Quality
- **Split large refactors**: Break into semantic commits
- **Maintain type safety**: Prefer explicit types over any
- **Follow project conventions**: Maintain consistency with existing codebase
- **Test thoroughly**: Ensure AI-generated code passes all tests

### Performance Optimization
- **Monitor token usage**: Stay within free tier limits
- **Use focused prompts**: More specific prompts yield better results
- **Leverage caching**: Reuse successful prompt patterns

## 7. Project-Specific Considerations for Vauntico MVP

### Architecture Awareness
- **Multi-repo structure**: Be aware of server-v2, widget, and fulfillment-engine components
- **TypeScript strict mode**: Maintain strict type checking
- **Enterprise compliance**: Consider compliance requirements for changes

### Development Workflow
- **Feature flags**: Understand and respect feature flag usage
- **Database schemas**: Be cautious with schema modifications
- **API contracts**: Maintain backward compatibility

### Testing Strategy
- **Integration tests**: Ensure new code passes integration tests
- **Type checking**: Verify TypeScript compilation
- **Security scans**: Run security checks for code changes

## 8. Troubleshooting

### Common Issues
- **Extension not loading**: Check VS Code version compatibility
- **Authentication failures**: Clear browser cache and retry
- **Context limit exceeded**: Reduce max files or tokens in settings
- **Slow responses**: Check network connectivity and token usage

### Performance Tips
- **Regular maintenance**: Clean up unused dependencies and files
- **Optimize imports**: Remove unnecessary imports to reduce context
- **Use .gitignore**: Ensure build artifacts are properly excluded

## 9. Monitoring and Maintenance

### Regular Tasks
- [ ] Review and update exclusion patterns
- [ ] Monitor token usage patterns
- [ ] Audit prompt effectiveness
- [ ] Update keybindings as needed
- [ ] Validate extension updates

### Quarterly Reviews
- [ ] Assess prompt template effectiveness
- [ ] Review guardrail compliance
- [ ] Update configuration based on usage patterns
- [ ] Document successful workflows

## 10. Resources

### Official Documentation
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)

### Community Resources
- [Claude Code Community](https://github.com/anthropics/claude-code)
- [VS Code Extension Development](https://code.visualstudio.com/api)

## 11. MCP Integration for Vauntico

### MCP Configuration
The project includes a ready-to-use MCP configuration at `config/mcp.json`:

```json
{
  "servers": [
    {
      "name": "docs",
      "type": "filesystem",
      "path": "./docs"
    },
    {
      "name": "postgres",
      "type": "database",
      "connectionString": "${DB_URL}"
    },
    {
      "name": "api",
      "type": "http",
      "baseUrl": "https://api.vauntico.com/v1"
    }
  ]
}
```

### MCP Server Capabilities

#### docs (filesystem)
- Access contributor documentation and API specs
- Query architecture patterns and coding standards
- Review configuration examples and deployment procedures

#### postgres (database)
- Schema introspection and data validation
- Test data management and migration verification
- **Security**: Uses `${DB_URL}` environment variable (never hardcode secrets)

#### api (http)
- Public endpoint testing and contract validation
- Integration verification and response format checking
- API contract compliance testing

### Cline Workflow Integration
Use the workflow prompt at `config/cline-workflow-prompt.md` for:

1. **Context Gathering**: Query documentation server first
2. **Schema Validation**: Understand current data structures
3. **API Testing**: Validate integration points
4. **Implementation**: Apply proper project patterns
5. **Validation**: Test against all MCP servers

### Security Best Practices for MCP
- Database connections use environment variables only
- API access is read-only for validation purposes
- Documentation access respects file system permissions
- No sensitive data exposed through MCP configuration

## Conclusion

This setup provides a comprehensive foundation for integrating Claude Code into the Vauntico MVP development workflow. By following these guidelines, you can leverage AI assistance while maintaining code quality, security, and performance standards.

Regular review and maintenance of these configurations will ensure optimal performance and alignment with project evolution.

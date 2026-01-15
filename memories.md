# Vauntico Project Memories

## Durable Memory Facts

### Tyrone's Vauntico Comprehensive Overview

- **Storage Location**: J:\Tyrone\vauntico_comprehensive_overview.md
- **Purpose**: Stores comprehensive overview of Vauntico project architecture, components, and development guidelines
- **Access Pattern**: Pointer fact stored here to avoid consuming tokens with full file contents
- **Usage**: Reference this location when needing Vauntico project context or architectural decisions

## Project Context Facts

### Architecture Components

- Multi-repo structure: server-v2, widget, fulfillment-engine
- TypeScript strict mode enforced
- Enterprise compliance requirements integrated
- Database: PostgreSQL with schema migrations
- API: RESTful with OpenAPI documentation

### Development Standards

- Conventional commits required
- Security exclusions: .env, secrets, credentials
- MCP integration for docs, database, and API access
- Claude Code configured with context discipline

### Key Resources

- Documentation: ./docs directory
- API Endpoints: https://api.vauntico.com/v1
- Database: Uses ${DB_URL} environment variable
- MCP Config: config/mcp.json

## ES Module Migration Guide

### Migration Status

- **Primary Backend (server-v2)**: ✅ Fully migrated to ES modules
- **Frontend (src/)**: ✅ Using ES modules with Vite
- **Fulfillment Engine**: ⚠️ Still using CommonJS (needs migration)
- **Widget**: ✅ Using ES modules with Rollup
- **Scripts**: 🔄 Mixed - some still use CommonJS

### ES Module Benefits Achieved

- **Tree Shaking**: Better bundle optimization
- **Import/Export Consistency**: Modern syntax across codebase
- **TypeScript Integration**: Improved type checking
- **Future Compatibility**: Ready for modern Node.js features
- **Structured Logging**: Integrated Sentry and Prometheus for observability

### Migration Rules (Enforced by ESLint)

- **Import Syntax**: Use `import/export` instead of `require/module.exports`
- **Console Usage**: Forbidden globally - use logger instead
- **Type Safety**: Strict mode enforced with TypeScript
- **Type Imports**: Enforce consistent type imports with `import type`
- **Import Ordering**: Group and alphabetize imports for consistency

### CommonJS Migration Checklist

For files still using CommonJS:

1. Change `require()` to `import` statements
2. Change `module.exports` to `export` statements
3. Update `package.json` to include `"type": "module"`
4. Handle conditional requires with dynamic imports
5. Update any `__dirname`/`__filename` usage with `import.meta.url`
6. Replace `console.*` calls with structured logger methods

### ESLint Configuration Updates

- Added `@typescript-eslint/no-require-imports: "error"`
- Added `no-console: "error"` (with test file exceptions)
- Added consistent import/export type rules
- Enhanced code quality rules
- Added import ordering and spacing rules
- Forbid `require()` imports with `@typescript-eslint/no-var-requires: "error"`

### Structured Logging Integration

- **Sentry**: Error tracking with environment-aware filtering
- **Prometheus**: Metrics for logs, errors, and requests
- **Winston**: JSON structured logging with metadata
- **Graceful Degradation**: Continue without Sentry if unavailable

### Contributor Checklist

For new contributors:

1. ✅ Use ES module syntax (`import/export`)
2. ✅ Use structured logger instead of `console.*`
3. ✅ Follow ESLint rules for imports and types
4. ✅ Add appropriate metadata to log entries
5. ✅ Handle errors with Sentry integration in production
6. ✅ Follow import ordering conventions

## Memory Usage Guidelines

- **Store pointers**: Reference file locations, not full contents
- **Token Efficiency**: Avoid loading large files repeatedly
- **Context Preservation**: Use MCP servers for structured data access
- **Security First**: Never include secrets or credentials in context

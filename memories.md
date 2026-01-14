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

## Memory Usage Guidelines

- **Store pointers**: Reference file locations, not full contents
- **Token Efficiency**: Avoid loading large files repeatedly
- **Context Preservation**: Use MCP servers for structured data access
- **Security First**: Never include secrets or credentials in context

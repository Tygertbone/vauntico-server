# Vauntico MCP Integration Workflow Prompt

## Instructions for Cline/Claude Workflow

When working with Vauntico MVP project, use this MCP configuration to access project resources:

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

## Usage Guidelines

### Documentation Access
- Use `docs` server to access contributor documentation, API specs, and project guides
- Query documentation for: architecture patterns, coding standards, deployment procedures
- Reference docs before making structural changes

### Database Operations
- Use `postgres` server for schema queries, data validation, and testing
- **Never hardcode connection strings** - always use `${DB_URL}` environment variable
- Validate data models against actual schema before implementing

### API Integration
- Use `api` server to query public endpoints, test integrations, validate contracts
- Check API documentation in `docs` before implementing new endpoints
- Use for integration testing and contract validation

## Execution Flow

**Before running any refactor or code generation task:**

1. **Load MCP Configuration**: Load config from `config/mcp.json`
2. **Consult Documentation**: Use `docs` server for contributor guidelines and type conventions
3. **Validate Schema**: Query `postgres` server for schema validation before generating TypeScript types
4. **Reference API**: Use `api` server for endpoint references when scaffolding client code
5. **Security Check**: Respect exclusions - never include `.env`, secrets, or raw credentials in context

**Standard Implementation Flow:**

1. **Context Gathering**: Query `docs` server for relevant documentation
2. **Schema Validation**: Use `postgres` to understand current data structures
3. **API Testing**: Validate against `api` server for integration points
4. **Implementation**: Apply insights using proper project patterns
5. **Validation**: Test changes against all three MCP servers

## Security Notes

- Database connections use environment variables only
- API access is read-only for validation
- Documentation access respects file system permissions
- No sensitive data is exposed through MCP configuration
- **Critical**: Never include `.env`, secrets, or raw credentials in context

## MCP Server Capabilities

### docs (filesystem)
- Read project documentation
- Access API specifications
- Review configuration examples
- Query architecture guides
- **Primary Use**: Contributor guidelines and type conventions

### postgres (database)
- Schema introspection
- Data validation queries
- Test data management
- Migration verification
- **Primary Use**: Schema validation before TypeScript type generation

### api (http)
- Public endpoint testing
- Contract validation
- Integration verification
- Response format checking
- **Primary Use**: Endpoint references when scaffolding client code

## Pre-Task Checklist

Before any refactor or code generation:

- [ ] Load MCP configuration from `config/mcp.json`
- [ ] Query `docs` server for contributor guidelines and type conventions
- [ ] Validate schema with `postgres` server before generating TypeScript types
- [ ] Reference `api` server for endpoint scaffolding when needed
- [ ] Verify no `.env`, secrets, or credentials included in context

Always validate your approach against these resources before implementing changes to ensure consistency with Vauntico's architecture and standards.

# Vauntico Dual Project Strategy Analysis

## Executive Summary

Vauntico appears to be operating a dual frontend strategy with multiple deployments serving different purposes:

1. **Main Production Site**: `www.vauntico.com` (primary brand presence)
2. **Vault Landing Page**: `vault.vauntico.com` (prompt vault product)
3. **Trust Score Backend**: `trust-score.vauntico.com` (API service)
4. **Alternative Frontend**: `homepage-redesign` (experimental/testing)

## Current Project Structure Analysis

### Active Domains Identified

| Domain                         | Purpose              | Platform | Status     |
| ------------------------------ | -------------------- | -------- | ---------- |
| `www.vauntico.com`             | Main brand site      | Vercel   | ✅ Active  |
| `vault.vauntico.com`           | Prompt vault landing | Vercel   | ✅ Active  |
| `trust-score.vauntico.com`     | Trust score API      | Backend  | ✅ Active  |
| `vauntico-server.vauntico.com` | Alternative API      | Backend  | ❓ Unclear |
| `fulfillment.vauntico.com`     | Fulfillment service  | Backend  | ❓ Unclear |

### Project Codebases Found

1. **Root Project** (`/src/`) - Main Vite React application
2. **Homepage Redesign** (`/homepage-redesign/`) - Next.js alternative frontend
3. **Vault Landing** (`/vault-landing/`) - Dedicated vault page
4. **Server V2** (`/server-v2/`) - Express.js backend

## Investigation Tasks

### Phase 1: Current State Assessment

- [ ] Analyze deployment configurations for each project
- [ ] Map domains to their respective codebases
- [ ] Identify which projects are actively maintained
- [ ] Check for duplicate functionality between projects
- [ ] Review environment variables and deployment scripts

### Phase 2: Strategic Analysis

- [ ] Determine purpose of each frontend (A/B testing, feature separation, etc.)
- [ ] Analyze traffic routing and domain strategy
- [ ] Identify resource duplication and optimization opportunities
- [ ] Review CI/CD pipelines for each project
- [ ] Assess maintenance overhead of multiple frontends

### Phase 3: Technical Deep Dive

- [ ] Compare feature sets between root project and homepage-redesign
- [ ] Analyze shared components and dependencies
- [ ] Review API endpoints and backend integrations
- [ ] Check for conflicting configurations
- [ ] Assess performance implications of multiple deployments

### Phase 4: Recommendations

- [ ] Propose consolidation strategy if applicable
- [ ] Document best practices for multi-project management
- [ ] Create migration plan if consolidation is recommended
- [ ] Establish clear project ownership and maintenance guidelines
- [ ] Define domain and routing strategy going forward

## Key Questions to Answer

1. **Purpose**: Why maintain multiple frontends instead of a single unified application?
2. **Traffic**: How is traffic distributed between different frontends?
3. **Features**: Are there feature differences between projects, or is this for testing?
4. **Resources**: What is the additional cost and complexity of maintaining multiple deployments?
5. **Strategy**: Is this temporary (A/B testing) or a long-term architectural decision?

## Next Steps

1. **Immediate**: Complete Phase 1 assessment to understand current state
2. **Short-term**: Analyze deployment configurations and domain mappings
3. **Medium-term**: Conduct strategic analysis and prepare recommendations
4. **Long-term**: Implement optimization strategy based on findings

## Risk Assessment

- **High**: Resource duplication and maintenance overhead
- **Medium**: User experience inconsistency across domains
- **Low**: Technical debt from multiple codebases
- **Unknown**: Strategic rationale behind dual project approach

---

_This analysis will be updated as investigation progresses through each phase._

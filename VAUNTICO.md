# VAUNTICO.md

Living Memory File for Vauntico Engineering

This file records recurring issues, fixes, and best practices so contributors and automation agents learn from past mistakes. **Every mistake becomes a rule.**

---

## Rules

### Rule 1: Node.js Version

Always use **Node.js v24** in workflows. Never downgrade to v18.

### Rule 2: Submodules

Do not add orphaned or broken submodules. Remove unused references immediately.

### Rule 3: Package-Lock Consistency

Regenerate `package-lock.json` whenever dependencies change. Commit the lockfile to ensure CI consistency.

### Rule 4: Workspace Configuration

Only include existing workspaces in `package.json`. Do not reference non-existent packages.

### Rule 5: Semantic Commits

Use semantic commit prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`, `scripts:`, `security:`). Group changes logically.

### Rule 6: CI/CD Verification

All pull requests must pass:

- Unit tests
- Integration tests
- Security scans (Trivy, Snyk)
- Browser-based smoke tests

### Rule 7: Slash Commands

Use project scripts (`npm run deploy`, `npm run validate`, `npm run cleanup`) instead of manual commands.

### Rule 8: Documentation Discipline

Update `CONTRIBUTOR_ONBOARDING.md` whenever workflows or scripts change. Keep onboarding time <30 minutes.

### Rule 9: Workflow Parallelization

CI/CD pipelines must run jobs in parallel (test, lint, security, build) to maximize efficiency.

### Rule 10: Verification Loops

Every automated agent or CI job must verify its own output (tests, scans, browser checks) before merging.

### Rule 11: Test Implementation

All workspaces must have working test suites before merging. Missing test scripts cause CI failures.

### Rule 12: Lint Configuration

ESLint configuration must be valid for all workspaces. Lint failures block deployment.

### Rule 13: Script Dependencies

All npm scripts referenced in workflows must exist in package.json. Missing scripts cause CI failures.

---

## Standards Enforcement System

### Overview

Vauntico implements a comprehensive standards enforcement system that ensures code quality, security, and governance compliance across all contributions. The system operates at multiple levels:

1. **Local Development**: Pre-commit hooks and CLI tools
2. **CI/CD Integration**: GitHub Actions validation on PRs and pushes
3. **Scheduled Scans**: Weekly comprehensive compliance scans
4. **Real-time Monitoring**: Continuous validation and reporting

### Enforcement Categories

#### 1. Lint & Hygiene Enforcement

**Implementation:**

- **ESLint Configuration**: `server-v2/.eslintrc.cjs` with critical rules set to `error`
  - `no-console`: Blocks `console.log` usage in production code
  - `@typescript-eslint/no-require-imports`: Enforces ES module imports
  - `@typescript-eslint/consistent-type-imports`: Consistent `import type` syntax
  - `@typescript-eslint/no-var-requires`: Blocks `require()` in TypeScript

**Validation Points:**

- Pre-commit hooks run ESLint validation
- GitHub Actions enforce lint compliance
- Automated fixing available via `npm run lint:fix`

#### 2. Logger Discipline

**Implementation:**

- **Centralized Logger**: `server-v2/src/utils/logger.ts` as single source
- **Structured JSON Logging**: Winston with `winston.format.json()`
- **Sentry Integration**: Production errors routed to Sentry
- **Prometheus Metrics**: Application metrics exposed for monitoring

**Required Pattern:**

```typescript
import { logger } from "../utils/logger";

logger.info("User action", {
  userId: user.id,
  component: "auth",
  action: "login",
  timestamp: new Date().toISOString(),
});
```

#### 3. Security Guardrails

**Implementation:**

- **CodeQL Analysis**: Weekly scans + PR triggers
  - Workflow: `.github/workflows/codeql-analysis.yml`
  - Languages: JavaScript, TypeScript
  - Weekly schedule: Sundays at 01:30 UTC

- **Secret Scanning**: Blocks merges on detected secrets
  - Workflow: `.github/workflows/secret-scan.yml`
  - Patterns: AWS keys, Stripe keys, database URLs
  - Merge blocking: `exit 1` on detection

- **Action Version Security**: Deprecated versions fail builds
  - Workflow: `server-v2/.github/workflows/action-version-check.yml`
  - Weekly checks for deprecated actions
  - Node.js version validation (18+)

#### 4. Documentation & Onboarding

**Implementation:**

- **Canonical Governance**: VAUNTICO.md as authoritative source
- **ES Module Migration**: Complete documentation in contributor guide
- **Migration Checklist**: Step-by-step process
- **Auto-notify**: Governance failures trigger notifications

**Documentation Hierarchy:**

```
📁 Documentation Structure
├── VAUNTICO.md                    # Canonical governance
├── CONTRIBUTOR_GUIDE.md           # Enhanced with standards
├── CONTRIBUTOR_ONBOARDING.md      # New contributor setup
├── SECURITY_OPERATIONS.md          # Security procedures
└── DEPLOYMENT_GUIDE.md           # Deployment instructions
```

#### 5. Workflow Discipline

**Implementation:**

- **Semantic Commits**: Enforced format `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Workflow: `.github/workflows/semantic-commits.yml`
  - Pre-commit validation

- **Hygiene Batching**: Grouped fixes for efficiency
- **Optimized CI/CD**: Caching for long-running jobs

---

## Available Scripts & Tools

### Standards Enforcement Scripts

```bash
# Run all standards checks
npm run standards

# Category-specific checks
npm run standards:lint          # Lint & hygiene
npm run standards:security       # Security guardrails
npm run standards:logger         # Logger discipline
npm run standards:docs           # Documentation
npm run standards:workflow       # Workflow discipline

# Enhanced operations
npm run standards:quick          # Quick scan for critical issues
npm run standards:comprehensive  # Full comprehensive scan
npm run standards:fix            # Auto-fix common issues
npm run standards:report         # Generate compliance report
```

### Security Scripts

```bash
# Security scanning
npm run security:scan             # Comprehensive security scan
npm run security:audit            # Dependency vulnerability audit
npm run security:secrets          # Secret detection scan
```

### Compliance Scripts

```bash
# Compliance operations
npm run compliance:weekly         # Weekly compliance scan
npm run compliance:report         # Generate compliance report
```

### Quality Assurance Scripts

```bash
# Quality checks
npm run quality:check            # Full quality check
npm run quality:fix              # Auto-fix quality issues
```

---

## Enforcement Flow

### 1. Local Development

1. **Pre-Commit Hook**: `.husky/pre-commit`
   - Validates standards enforcement
   - Runs ESLint and type checks
   - Blocks commit on critical failures

2. **Manual Validation**:

   ```bash
   # Before committing
   npm run standards:quick

   # Fix issues
   npm run standards:fix

   # Full validation
   npm run standards
   ```

### 2. CI/CD Integration

1. **Pull Request Triggers**:
   - Standards enforcement workflow runs
   - Matrix-based validation across categories
   - Critical failures block merge

2. **Push Validation**:
   - Comprehensive standards check
   - Security scanning integration
   - Automated reporting

### 3. Scheduled Compliance

1. **Weekly Scans**: Every Monday at 9:00 AM UTC
   - Security analysis with CodeQL
   - Standards compliance validation
   - Performance metrics review
   - Dependency audit
   - Governance review

2. **Comprehensive Reporting**:
   - Executive summaries
   - Category-specific reports
   - Action items and recommendations
   - Trend analysis

---

## Compliance Matrix

| Category                | Local CLI                    | Pre-commit | PR  | Weekly | Critical Issues |
| ----------------------- | ---------------------------- | ---------- | --- | ------ | --------------- |
| **Lint & Hygiene**      | `npm run standards:lint`     | ✅         | ✅  | ✅     | Blocks merge    |
| **Logger Discipline**   | `npm run standards:logger`   | ✅         | ✅  | ✅     | Blocks merge    |
| **Security Guardrails** | `npm run standards:security` | ✅         | ✅  | ✅     | Blocks merge    |
| **Documentation**       | `npm run standards:docs`     | ✅         | ✅  | ✅     | Warning only    |
| **Workflow Discipline** | `npm run standards:workflow` | ✅         | ✅  | ✅     | Blocks merge    |

---

## Automated Enforcement Status

### Currently Active

- ✅ **ESLint rule violations**: Blocked at commit/PR
- ✅ **Console.log usage**: Blocked in production code
- ✅ **CommonJS require()**: Blocked in TypeScript files
- ✅ **Secret detection**: Blocked at commit/PR
- ✅ **Semantic commit format**: Enforced via CI/CD
- ✅ **Deprecated GitHub Actions**: Fail builds
- ✅ **Missing documentation**: Warning system
- ✅ **Logger requirements**: Validated automatically

### Monitoring & Alerting

- **Sentry Integration**: Production error tracking
- **Prometheus Metrics**: Application performance monitoring
- **GitHub Actions Artifacts**: Detailed compliance reports
- **Weekly Email Summaries**: Compliance status updates

---

## Governance Compliance

### ES Module Migration ✅

- All TypeScript files use ES module imports
- CommonJS require() statements blocked
- Consistent type imports enforced

### Logger Integration ✅

- Structured JSON logging with metadata
- Sentry integration for production errors
- Prometheus/Grafana metrics routing
- No console.log usage in production code

### Security Implementation ✅

- CodeQL analysis on every PR and weekly
- Secret scanning blocks merges on leaks
- Deprecated action versions fail builds
- Hardcoded secrets detection active

### Documentation Standards ✅

- VAUNTICO.md as canonical governance source
- Migration checklist in contributor guide
- Auto-notify on governance failures

### Workflow Discipline ✅

- Semantic commit messages enforced
- Hygiene fixes batched appropriately
- Long-running jobs optimized with caching

---

## Troubleshooting

### Common Issues & Solutions

1. **ESLint Errors**:

   ```bash
   npm run lint:fix           # Auto-fix common issues
   npm run standards:lint      # Detailed lint validation
   ```

2. **Console Usage**:

   ```bash
   # Replace console.log with logger
   import { logger } from "../utils/logger";
   logger.info("message", { metadata });
   ```

3. **require() Statements**:

   ```bash
   # Convert to ES module imports
   # Before: const module = require('module')
   # After: import module from 'module'
   ```

4. **Secret Exposure**:
   ```bash
   # Use environment variables
   # Before: const apiKey = "sk_live_..."
   # After: const apiKey = process.env.STRIPE_API_KEY
   ```

### Getting Help

1. **Run diagnostics**:

   ```bash
   npm run standards:comprehensive
   ```

2. **Check artifacts**:
   - GitHub Actions artifacts for detailed reports
   - Weekly compliance reports in CI/CD

3. **Review documentation**:
   - `STANDARDS_ENFORCEMENT_SUMMARY.md` for detailed implementation
   - `CONTRIBUTOR_GUIDE.md` for development workflows
   - `SECURITY_OPERATIONS.md` for security procedures

---

## Maintenance

### Regular Tasks

- **Weekly**: Review standards compliance reports
- **Monthly**: Update GitHub Actions versions
- **Quarterly**: Audit and update standards requirements
- **As needed**: Update documentation and migration guides

### Monitoring

- GitHub Actions success/failure rates
- CodeQL security findings
- Secret scanning alerts
- Documentation coverage metrics

---

**Last Updated**: 2026-01-15
**Version**: 2.0.0
**Status**: ✅ FULLY IMPLEMENTED WITH COMPREHENSIVE ENFORCEMENT

**Enforcement System Status**: 🚀 OPERATIONAL

- Local CLI tools: ✅ Active
- Pre-commit hooks: ✅ Active
- CI/CD integration: ✅ Active
- Weekly scans: ✅ Active
- Monitoring: ✅ Active

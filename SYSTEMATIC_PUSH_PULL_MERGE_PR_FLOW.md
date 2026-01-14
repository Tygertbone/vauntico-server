# Systematic Push–Pull–Merge–PR Flow

This document outlines the comprehensive systematic workflow for Vauntico development, ensuring code quality, security, and deployment reliability.

## Overview

The systematic flow is designed to:

- Prevent CI/CD false negatives through local hygiene
- Maintain clean Git history with semantic commits
- Ensure thorough testing and validation
- Provide clear merge strategies for different scenarios
- Enable reliable go-live deployments

## 1. Local Hygiene Before Push

### Pre-Push Checklist

Before any push to remote branches, run this complete hygiene routine:

```bash
#!/bin/bash
# scripts/pre-push-hygiene.sh

echo "🧹 Starting local hygiene checks..."

# 1. Clean working directory
echo "📁 Cleaning working directory..."
git clean -fd
git reset --hard HEAD

# 2. Install fresh dependencies
echo "📦 Installing fresh dependencies..."
rm -rf node_modules package-lock.json
npm ci

# 3. Run complete test suite
echo "🧪 Running complete test suite..."
npm run test                    # Unit tests
npm run test:integration       # Integration tests
npm run test:coverage          # Coverage reports
npm run test:throughput         # Performance tests

# 4. Lint and format validation
echo "🔍 Running lint and format checks..."
npm run lint
npm run format:check

# 5. TypeScript strict validation
echo "📋 TypeScript validation..."
npm run tsc:check

# 6. Security scan
echo "🔒 Running security scan..."
npm audit --audit-level moderate
scripts/secret-scan.sh

# 7. Sacred features validation
echo "⚡ Validating sacred features..."
npm run test:sacred

# 8. Environment validation
echo "🌍 Validating environment configurations..."
scripts/validate-env.sh

echo "✅ Local hygiene complete!"
```

### Manual Verification Steps

- [ ] **Secrets scrubbed**: Confirm no API keys, tokens, or sensitive data in commits
- [ ] **Gitignore validation**: Ensure .gitignore covers all sensitive patterns
- [ ] **Environment files**: Verify .env files are not committed
- [ ] **Log files**: Ensure no sensitive data in logs
- [ ] **Build artifacts**: Confirm dist/ and build/ are properly ignored

### Quick Hygiene Script

For rapid iteration during development:

```bash
#!/bin/bash
# scripts/quick-hygiene.sh

echo "⚡ Quick hygiene check..."

git status --porcelain
npm run lint
npm run tsc:check
npm test -- --passWithNoTests

echo "✅ Quick hygiene complete!"
```

## 2. Batch & Semantic Commits

### Commit Message Convention

Follow strict semantic commit format:

```bash
type(scope): description

[optional body]

[optional footer]
```

#### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `security`: Security fixes

#### Scope Guidelines

- `api`: Backend API changes
- `ui`: Frontend component changes
- `widget`: Trust widget changes
- `auth`: Authentication/authorization
- `payment`: Payment processing
- `infra`: Infrastructure/DevOps
- `docs`: Documentation
- `test`: Testing infrastructure

### Commit Examples

```bash
# Feature with clear scope
feat(api): implement customer-facing endpoints
- Add POST /api/customers
- Add GET /api/customers/:id
- Implement input validation

# Bug fix
fix(payment): resolve Stripe webhook signature validation
- Correct signature verification logic
- Add error handling for malformed webhooks

# Documentation
docs(api): update OpenAPI specification for v3
- Add new enterprise compliance endpoints
- Document authentication requirements

# Performance improvement
perf(database): optimize customer query performance
- Add database indexes
- Implement query result caching
```

### Batching Strategy

Group related changes into semantic batches:

```bash
# Batch 1: Core functionality
feat(api): implement customer CRUD operations
fix(auth): resolve JWT token refresh issue
test(api): add integration tests for customer endpoints

# Batch 2: UI updates
feat(ui): add customer management dashboard
fix(ui): resolve responsive layout issues
style(ui): improve component styling consistency

# Batch 3: Documentation
docs(api): update customer API documentation
docs(ui): add dashboard user guide
```

### Branch Creation and Push

```bash
# Create feature branch from latest main
git checkout main
git pull --rebase origin main
git checkout -b feature/customer-facing

# Make changes following semantic commit patterns
# ...development work...

# Push each semantic batch
git add .
git commit -m "feat(api): implement customer-facing endpoints"
git push origin feature/customer-facing

# Continue with next batch
# ...more changes...
git add .
git commit -m "feat(ui): add customer management dashboard"
git push origin feature/customer-facing
```

## 3. Pull & Sync Discipline

### Sync Before Work

Always start with clean, up-to-date branches:

```bash
#!/bin/bash
# scripts/sync-branches.sh

echo "🔄 Syncing branches..."

# Update main
git checkout main
git pull --rebase origin main

# Update develop if it exists
if git show-ref --verify --quiet refs/heads/develop; then
    git checkout develop
    git pull --rebase origin develop
fi

# Return to feature branch and rebase
if [ "$(git branch --show-current)" != "main" ]; then
    git checkout $(git branch --show-current)
    git rebase main
fi

echo "✅ Branch sync complete!"
```

### Conflict Resolution Protocol

1. **Never resolve conflicts in GitHub UI**
2. **Always resolve locally** before pushing
3. **Use rebase for clean history**

```bash
# When merge conflicts occur during rebase
git rebase --abort  # Start over if needed
git rebase main    # Try again

# Resolve conflicts manually in IDE
git add .
git rebase --continue

# If complex, use merge strategy instead
git merge main --no-ff
# Resolve conflicts
git commit
```

### Pre-PR Sync Checklist

Before creating PR:

```bash
#!/bin/bash
# scripts/pre-pr-sync.sh

echo "🔍 Pre-PR sync validation..."

# Ensure main is up-to-date
git fetch origin main
git rebase origin/main

# Run full test suite
npm run test:integration
npm run lint
npm run tsc:check

# Check for merge conflicts
git merge-base --is-ancestor origin/main HEAD
if [ $? -ne 0 ]; then
    echo "❌ Branch is not based on latest main"
    exit 1
fi

echo "✅ Pre-PR sync complete!"
```

## 4. Merge Strategy

### Merge Decision Tree

#### Small Fixes (< 50 lines, single file)

- **Strategy**: Squash merge
- **When**: Typo fixes, small bug fixes, documentation updates
- **PR Template**: Simple fix template

```bash
# GitHub UI: "Squash and merge"
# Commit message becomes: fix(scope): brief description
```

#### Feature Branches (Multiple related commits)

- **Strategy**: Rebase merge
- **When**: Features, refactoring, complex changes
- **PR Template**: Full feature template

```bash
# GitHub UI: "Rebase and merge"
# Preserves individual commits with clean history
```

#### Hotfix Branches (Production issues)

- **Strategy**: Create release branch, merge to both main and develop
- **When**: Critical production fixes
- **PR Template**: Hotfix template

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue
# ...fix issue...
git checkout main
git merge --no-ff hotfix/critical-issue
git checkout develop
git merge --no-ff hotfix/critical-issue
git branch -d hotfix/critical-issue
```

### Post-Merge Validation

After each merge, validate:

```bash
#!/bin/bash
# scripts/post-merge-validation.sh

echo "🔍 Post-merge validation..."

# 1. CI/CD Pipeline Status
echo "📊 Checking CI/CD status..."
gh run list --branch main --limit 5
gh run view --branch main

# 2. Deployment Jobs
echo "🚀 Validating deployment jobs..."
# Check OCI deployment
# Check Vercel deployment
# Check GitHub Actions

# 3. Monitoring Hooks
echo "📈 Validating monitoring..."
# Check Prometheus metrics
# Verify Grafana dashboards
# Confirm Sentry error tracking

# 4. Sacred Features Health
echo "⚡ Sacred features health check..."
curl -f https://api.vauntico.com/health/sacred || exit 1

echo "✅ Post-merge validation complete!"
```

## 5. Pull Requests

### PR Templates

#### Feature PR Template

```markdown
## 🎯 Feature Overview

**Phase**: [Phase 1/2/3/4/5]
**Target**: [Description of what this accomplishes]

## 📋 Changes Summary

### What's Included

- [ ] New functionality
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Tests added/updated

## 🧪 Testing

- [ ] Unit tests pass locally
- [ ] Integration tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## 🔒 Security Review

- [ ] No sensitive data exposed
- [ ] Environment variables handled properly
- [ ] Input validation implemented
- [ ] Authentication/authorization considered

## 📊 Performance Impact

- [ ] No performance degradation
- [ ] Database queries optimized
- [ ] Memory usage within limits
- [ ] Load testing completed (if applicable)

## 🚀 Deployment Notes

- [ ] Requires database migration
- [ ] Requires environment variable changes
- [ ] Requires cache invalidation
- [ ] Rollback procedure documented

## ✅ Pre-Merge Checklist

- [ ] Tests passed locally
- [ ] CI/CD pipeline green
- [ ] Secrets scrubbed
- [ ] Documentation updated
- [ ] Code review completed
```

#### Hotfix PR Template

```markdown
## 🚨 Hotfix - Critical Issue

**Issue**: [Link to issue or description]
**Severity**: [Critical/High/Medium]
**Impact**: [Description of user impact]

## 🔧 Fix Details

### Root Cause

[Brief description of what caused the issue]

### Solution Implemented

[Description of the fix]

## 🧪 Validation

- [ ] Fix verified in staging
- [ ] Regression tests passed
- [ ] Production impact assessed
- [ ] Rollback plan ready

## 📦 Deployment

- [ ] Hotfix deployed to staging
- [ ] Production deployment approved
- [ ] Monitoring post-deployment
- [ ] Communication sent to stakeholders
```

### PR Review Process

#### Automated Checks

- CI/CD pipeline must pass
- Code coverage threshold met (>80%)
- Security scans pass
- Semantic commit validation
- Sacred features tests pass

#### Manual Review Requirements

- **Code Review**: At least one maintainer approval
- **Security Review**: For auth, payment, or data changes
- **Performance Review**: For database or API changes
- **UX Review**: For frontend changes

#### Review Checklist

```bash
#!/bin/bash
# scripts/pr-review-checklist.sh

echo "🔍 PR Review Checklist"

# Code Quality
echo "📝 Code Quality..."
npm run lint -- --max-warnings=0
npm run tsc:check

# Test Coverage
echo "🧪 Test Coverage..."
npm run test:coverage

# Security
echo "🔒 Security Check..."
npm audit --audit-level moderate

# Performance
echo "📊 Performance Check..."
npm run test:throughput

echo "✅ PR review checks complete!"
```

## 6. Final Pre-Go-Live Checklist

### Staging Environment Validation

```bash
#!/bin/bash
# scripts/staging-smoke-test.sh

echo "🌍 Staging smoke test..."

# 1. Basic functionality
curl -f https://staging.vauntico.com/health || exit 1
curl -f https://staging.vauntico.com/api/health || exit 1

# 2. Customer-facing flows
echo "🛒 Testing customer flows..."
# Test registration flow
# Test login flow
# Test payment flow
# Test dashboard access

# 3. Paystack integration
echo "💳 Testing Paystack integration..."
# Test payment initialization
# Test webhook handling
# Test refund process

# 4. Sacred Features APIs
echo "⚡ Testing sacred features..."
curl -f https://staging.vauntico.com/api/sacred/health || exit 1
curl -f https://staging.vauntico.com/api/sacred/trust-score || exit 1

echo "✅ Staging smoke test complete!"
```

### Monitoring Validation

```bash
#!/bin/bash
# scripts/monitoring-validation.sh

echo "📈 Monitoring validation..."

# 1. Prometheus Metrics
curl -f http://prometheus.vauntico.com/-/healthy || exit 1

# 2. Grafana Dashboards
curl -f https://grafana.vauntico.com/api/health || exit 1

# 3. Sentry Error Tracking
curl -f https://sentry.vauntico.com/api/0/health/ || exit 1

# 4. Log Aggregation
# Verify logs are flowing to centralized logging

echo "✅ Monitoring validation complete!"
```

### Release Tagging

```bash
#!/bin/bash
# scripts/tag-release.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 v1.0.0"
    exit 1
fi

echo "🏷️ Tagging release $VERSION..."

# Create annotated tag
git tag -a $VERSION -m "Release $VERSION - $(date +'%Y-%m-%d')"

# Push tag to remote
git push origin $VERSION

# Create GitHub release
gh release create $VERSION \
    --title "Release $VERSION" \
    --notes "Automated release for version $VERSION" \
    --latest

echo "✅ Release $VERSION tagged successfully!"
```

### Go-Live Deployment

```bash
#!/bin/bash
# scripts/go-live.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 v1.0.0"
    exit 1
fi

echo "🚀 Starting go-live for $VERSION..."

# 1. Final staging validation
./scripts/staging-smoke-test.sh

# 2. Backup production data
./scripts/backup-production.sh

# 3. Deploy to production
./scripts/deploy-production.sh

# 4. Post-deployment validation
./scripts/post-deploy-validation.sh

# 5. Monitoring verification
./scripts/monitoring-validation.sh

echo "✅ Go-live for $VERSION complete!"
```

## Automation Scripts

### Complete Flow Script

```bash
#!/bin/bash
# scripts/complete-flow.sh

# Master script for complete systematic flow

set -e  # Exit on any error

echo "🚀 Starting systematic Push-Pull-Merge-PR flow..."

# 1. Local hygiene
echo "Step 1: Local hygiene"
./scripts/pre-push-hygiene.sh

# 2. Sync branches
echo "Step 2: Sync branches"
./scripts/sync-branches.sh

# 3. Pre-PR validation
echo "Step 3: Pre-PR validation"
./scripts/pre-pr-sync.sh

echo "✅ Systematic flow preparation complete!"
echo "📝 Next steps:"
echo "   1. Create PR with appropriate template"
echo "   2. Wait for code review"
echo "   3. Merge using appropriate strategy"
echo "   4. Run post-merge validation"
```

### Quick Development Iteration

```bash
#!/bin/bash
# scripts/dev-iteration.sh

# For rapid development iterations

echo "⚡ Quick development iteration..."

./scripts/quick-hygiene.sh
git add .
git commit -m "$1"
git push

echo "✅ Development iteration complete!"
```

## Troubleshooting

### Common Issues

#### CI/CD Failures

```bash
# Check recent runs
gh run list --limit 10

# Debug specific run
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id>
```

#### Merge Conflicts

```bash
# Start fresh
git checkout main
git pull --rebase origin main
git checkout feature-branch
git rebase main

# Resolve conflicts manually
# Then continue
git add .
git rebase --continue
```

#### Test Failures

```bash
# Run specific failing test
npm test -- --testNamePattern="failing-test"

# Run with coverage
npm run test:coverage

# Debug with console output
npm test -- --verbose
```

### Emergency Procedures

#### Rollback

```bash
# Quick rollback to previous tag
git checkout v1.0.0-previous
git tag -a v1.0.1-rollback -m "Emergency rollback"
git push origin v1.0.1-rollback

# Deploy rollback version
./scripts/emergency-rollback.sh
```

#### Hot Release

```bash
# Skip normal flow for critical fixes
git checkout main
git checkout -b hotfix/critical-issue
# ...make fix...
git add .
git commit -m "hotfix: critical security issue"
git push origin hotfix/critical-issue
# Create PR and merge immediately
```

## Integration with Existing Tools

### MCP Tools Integration

The systematic flow integrates with existing MCP tools:

- **mcp-git-cleaner**: Pre-push cleanup
- **mcp-lint-fixer**: Automated lint fixes
- **mcp-type-checker**: TypeScript validation
- **mcp-gitignore-enforcer**: Gitignore validation
- **mcp-config-sweeper**: Configuration validation

### GitHub Actions Integration

The flow enhances existing GitHub Actions:

- **ci.yml**: Enhanced with additional validation steps
- **governance-validation.yml**: Integrated with semantic commit validation
- **secret-scan.yml**: Enhanced pre-push secret detection

### Monitoring Integration

Post-merge validation includes:

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard visualization
- **Sentry**: Error tracking and reporting

## Best Practices

### Daily Development

1. **Start with sync**: Always sync main before starting work
2. **Frequent commits**: Small, semantic commits throughout the day
3. **Regular hygiene**: Run quick hygiene between major changes
4. **Test early**: Write tests alongside code

### Weekly Maintenance

1. **Full hygiene**: Run complete pre-push hygiene weekly
2. **Dependency updates**: Update and test dependencies
3. **Security audit**: Run comprehensive security scans
4. **Performance review**: Analyze and optimize bottlenecks

### Release Preparation

1. **Staging validation**: Complete staging smoke tests
2. **Documentation**: Update all relevant documentation
3. **Backup**: Create production data backups
4. **Communication**: Prepare release announcements

## Conclusion

This systematic Push-Pull-Merge-PR flow ensures:

- **Code Quality**: Through comprehensive local hygiene and automated checks
- **Git History**: Clean, semantic, and maintainable commit history
- **Deployment Reliability**: Thorough testing and validation at every stage
- **Security**: Continuous security scanning and validation
- **Performance**: Regular performance testing and monitoring
- **Collaboration**: Clear processes for team coordination

By following this systematic approach, Vauntico maintains high code quality standards while enabling rapid, reliable development and deployment cycles.

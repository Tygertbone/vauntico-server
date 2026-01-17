# 🚀 Git Discipline Guide for Vauntico MVP + Server

## 📋 Overview

This guide establishes Git discipline practices for the Vauntico project to ensure clean development history, proper collaboration, and reliable deployments across both MVP (frontend) and Server (backend) repositories.

## 🌳 Repository Structure

```
vauntico-mvp/                 # Frontend (Vercel deployment)
├── src/                     # React components
├── assets/                    # Static assets
├── public/                     # Build output
└── package.json               # Dependencies

vauntico-server/               # Backend (OCI deployment)
├── server-v2/                 # API services
├── api/                       # API endpoints
├── .github/workflows/         # CI/CD pipelines
└── Dockerfile.vauntico-server   # Container build
```

## 🔄 Branching Strategy

### Main Branches

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`release/x.x.x`** - Release preparation branches

### Feature Branches

- **`feature/description`** - New features
- **`fix/description`** - Bug fixes
- **`hotfix/description`** - Critical production fixes

### Environment Branches

- **`frontend/staging`** - MVP staging (Vercel)
- **`backend/staging`** - Server staging (OCI)

## 📝 Semantic Commit Messages

### Format

```
<type>(<scope>): <description>

<body>

<footer>
```

### Types

- **`feat`**: New feature or enhancement
- **`fix`**: Bug fix
- **`docs`**: Documentation changes
- **`style`**: Code formatting, linting
- **`refactor`**: Code refactoring
- **`test`**: Adding or updating tests
- **`chore`**: Maintenance tasks, dependency updates
- **`ci`**: CI/CD configuration changes

### Scopes

- **`dashboard`**: Dashboard-related changes
- **`auth`**: Authentication system
- **`api`**: API endpoints and services
- **`deploy`**: Deployment configuration
- **`trust`**: Trust score system
- **`widget`**: Embeddable widgets
- **`oci`**: Oracle Cloud Infrastructure
- **`docker`**: Container configuration

### Examples

```bash
# Frontend component
git commit -m "feat(dashboard): add TrustScoreCard component with real-time updates"

# Backend API
git commit -m "fix(api): resolve authentication token expiration issue"

# Deployment config
git commit -m "ci(oci): update health check endpoints for production validation"

# Documentation
git commit -m "docs(readme): update deployment instructions with new branching strategy"
```

## 🚀 Workflow Processes

### 🔄 Development Workflow

#### 1. Start New Work

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/trust-score-enhancement

# Keep branches synced
git submodule update --init --recursive
```

#### 2. Development Cycle

```bash
# Regular commits with semantic messages
git add .
git commit -m "feat(dashboard): implement trust score trend analysis"

# Push to feature branch
git push origin feature/trust-score-enhancement

# Sync with main periodically
git checkout main
git pull origin main
git checkout feature/trust-score-enhancement
git rebase main
```

#### 3. Feature Completion

```bash
# Ready for integration
git checkout develop
git pull origin develop
git merge feature/trust-score-enhancement --no-ff
git push origin develop

# Delete feature branch
git branch -d feature/trust-score-enhancement
git push origin --delete feature/trust-score-enhancement
```

### 🔄 Pull Request Process

#### 1. Create Pull Request

```bash
# From feature branch to main
gh pr create --title "feat(dashboard): Add trust score trend analysis" \
             --body "## Changes
- Added TrustScoreTrend component
- Implemented real-time data fetching
- Added responsive design

## Testing
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing complete

## Checklist
- [x] Code follows style guidelines
- [x] Documentation updated
- [x] No breaking changes" \
             --base main \
             --head feature/trust-score-enhancement
```

#### 2. PR Requirements

- **All CI checks must pass**
- **At least 1 approval required**
- **Semantic version bump if breaking changes**
- **Update documentation**

#### 3. Review Process

- **Code review mandatory**
- **Test coverage verification**
- **Security scan validation**
- **Performance impact assessment**

### 🔄 Continuous Integration

#### Frontend (MVP)

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI/CD
on:
  push:
    branches: [main, develop, "feature/*", "fix/*"]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: npx vercel --prod
```

#### Backend (Server)

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI/CD
on:
  push:
    branches: [main, develop, "feature/*", "fix/*"]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: python -m pytest
      - name: Build and Deploy to OCI
        if: github.ref == 'refs/heads/main'
        run: |
          # Trigger MCP OCI Connector workflow
          gh workflow run mcp-oci-connector.yml \
            --field oci_action=build-push \
            --field image_tag=v$(date +'%Y%m%d-%H%M')
```

### 🔄 Continuous Deployment

#### Automated Deployment Triggers

```yaml
# .github/workflows/deploy.yml
name: Automated Deployment
on:
  push:
    branches: [main]
jobs:
  deploy:
    needs: [test, security-scan, performance-test]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend
        run: |
          # Deploy MVP to Vercel
          npx vercel --prod --confirm
      - name: Deploy Backend
        run: |
          # Deploy Server to OCI
          gh workflow run mcp-oci-connector.yml \
            --field oci_action=build-push \
            --field image_tag=v$(date +'%Y%m%d-%H%M')
      - name: Health Check
        run: |
          # Wait for deployment
          sleep 60
          # Verify endpoints
          curl -f https://api.vauntico.com/health
          curl -f https://vauntico.vercel.app/
```

## 📊 Branch Protection Rules

### Main Branch Protection

```yaml
# GitHub branch protection settings
main:
  required_status_checks:
    - "CI/CD Pipeline"
    - "CodeQL Analysis"
    - "Security Scan"
    - "Performance Tests"
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  enforce_admins: true
  required_linear_history: true
  allow_force_pushes: false
  required_conversation_resolution: true
```

### Commit Requirements

- **All commits must be signed**
- **No direct pushes to main** (except releases)
- **Pull requests required** for all changes
- **Semantic versioning** for releases

## 🏷️ Repository Synchronization

### Cross-Repo Coordination

```bash
# Script to keep repositories in sync
#!/bin/bash
# sync-repos.sh

echo "🔄 Syncing Vauntico repositories..."

# Update submodules
git submodule update --init --recursive

# Sync shared configurations
cp ../vauntico-server/.github/workflows/*.yml .github/workflows/
cp ../vauntico-server/docs/shared/* docs/

# Commit synchronization
git add .github/workflows/ docs/
git commit -m "chore(sync): update shared CI/CD configurations"

# Push updates
git push origin main

echo "✅ Repository synchronization complete"
```

### Shared Configuration

```yaml
# .github/shared/versioning.yml
versioning:
  scheme: semantic
  major_increment: breaking_changes
  minor_increment: new_features
  patch_increment: bug_fixes

# .github/shared/release-checklist.yml
release_checklist:
  - version_bumped: true
  changelog_updated: true
  tests_passing: true
  security_scan_clean: true
  documentation_updated: true
  deployment_tested: true
```

## 📋 Development Checklists

### Pre-Commit Checklist

```markdown
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Documentation updated
- [ ] No sensitive data committed
- [ ] Semantic commit message format used
- [ ] Changes reviewed by team member
```

### Pre-Push Checklist

```markdown
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] CI pipeline would pass
- [ ] Security scan clean
- [ ] Performance impact acceptable
```

### Pre-Merge Checklist

```markdown
- [ ] All CI checks pass
- [ ] Code reviews completed
- [ ] Tests coverage adequate (>80%)
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Rollback plan prepared
```

## 🚨 Emergency Procedures

### Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-patch

# 2. Implement fix
# ... make changes ...

# 3. Test and validate
npm test
# ... or pytest for backend

# 4. Merge to main with special handling
git checkout main
git merge --no-ff hotfix/critical-security-patch
git tag -a v1.2.1-hotfix -m "Hotfix: Critical security patch"

# 5. Deploy immediately
git push origin main --tags
gh workflow run mcp-oci-connector.yml --field oci_action=build-push

# 6. Merge hotfix back to develop
git checkout develop
git merge --no-ff hotfix/critical-security-patch
git push origin develop

# 7. Clean up
git branch -d hotfix/critical-security-patch
```

### Rollback Procedure

```bash
# 1. Identify last stable version
git tag --sort=-version:refname | grep 'v' | tail -1

# 2. Create rollback branch
git checkout -b rollback/to-v1.1.0

# 3. Revert to stable tag
git reset --hard v1.1.0

# 4. Force push rollback
git push --force-with-lease origin rollback/to-v1.1.0

# 5. Deploy rollback version
gh workflow run mcp-oci-connector.yml \
  --field oci_action=rollback \
  --field image_tag=v1.1.0

# 6. Communicate to team
# ... send notification ...
```

## 📈 Performance Guidelines

### Commit Frequency

- **Feature branches**: At least once daily
- **Main integration**: As needed, with proper testing
- **Release branches**: Only when ready for production

### Branch Hygiene

- **Delete merged branches** within 1 week
- **Clean up stale PRs** older than 2 weeks
- **Archive closed issues** monthly

### Code Quality Gates

- **Test coverage**: Minimum 80% for new code
- **Performance**: No regressions in key metrics
- **Security**: Zero high-severity vulnerabilities
- **Documentation**: Updated for all public APIs

## 🛠️ Tooling Configuration

### Git Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Pre-commit validation
echo "🔍 Running pre-commit checks..."

# Run linters
npm run lint
# Run tests
npm run test -- --watchAll=false

# Check for sensitive data
if git diff --cached --name-only | grep -E "(password|secret|key)"; then
    echo "❌ Sensitive data detected!"
    exit 1
fi

echo "✅ Pre-commit checks passed"
```

### Git Aliases

```bash
# .gitconfig aliases
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    sync = "!sh -c 'git pull origin main && git submodule update --init --recursive'"
    deploy = "!sh -c 'gh workflow run mcp-oci-connector.yml --field oci_action=build-push'"
    feature = "!sh -c 'git checkout main && git pull && git checkout -b feature/\"$1\"'"
    hotfix = "!sh -c 'git checkout main && git pull && git checkout -b hotfix/\"$1\"'"
```

## 📚 Documentation Standards

### README Updates

- **Installation instructions** kept current
- **API documentation** updated with each release
- **Deployment guides** include troubleshooting
- **Contributing guidelines** reflect current workflow

### Changelog Maintenance

```markdown
# CHANGELOG.md format

## [1.2.0] - 2024-01-17

### Added

- Trust score trend analysis
- Enhanced health check system
- OCI deployment automation

### Fixed

- Authentication token expiration bug
- Container build optimization

### Changed

- Updated Git workflow configuration
- Improved CI/CD pipeline reliability

### Security

- Updated dependencies for CVE fixes
- Enhanced input validation
```

## 🔄 Training & Onboarding

### New Developer Setup

```bash
# onboarding script
#!/bin/bash
echo "👋 Welcome to Vauntico development!"

# Clone repositories
git clone https://github.com/Tygertbone/vauntico-mvp.git
git clone https://github.com/Tygertbone/vauntico-server.git

# Setup Git configuration
git config --global user.name "Developer Name"
git config --global user.email "developer@vauntico.com"

# Install hooks
cp .githooks/* .git/hooks/
chmod +x .git/hooks/*

echo "🚀 Development environment ready!"
```

### Regular Training Schedule

- **Weekly**: Git best practices review
- **Monthly**: Workflow optimization workshop
- **Quarterly**: Security and performance audit

## 📊 Monitoring & Metrics

### Development Metrics

- **Commit frequency**: Track commits per developer
- **PR cycle time**: Average time from open to merge
- **Test coverage**: Trend analysis over time
- **Deployment success rate**: CI/CD effectiveness

### Quality Gates

- **Zero security issues** in production
- **<5 minute** deployment time
- **<1%** test failure rate
- **100%** branch protection compliance

## 🎯 Success Criteria

### Healthy Repository Indicators

- ✅ Main branch always deployable
- ✅ All commits follow semantic format
- ✅ CI/CD pipeline reliability >95%
- ✅ Zero security vulnerabilities in prod
- ✅ Documentation matches implementation
- ✅ Team follows branching strategy
- ✅ Regular integration between repos

### Performance Targets

- **Feature branches**: 2-3 days average lifetime
- **PR merge time**: <24 hours
- **Deployment frequency**: Multiple times per week
- **Test coverage**: >85% average
- **Rollback time**: <15 minutes for hotfixes

This Git discipline guide ensures reliable development practices, clean repository history, and confident deployments across the Vauntico ecosystem.

# Contributing to Vauntico v2.0.0

Welcome to Vauntico! This guide will help you get started and understand our **Systematic Push-Pull-Merge-PR Flow**.

## 🚀 Quick Start

For experienced contributors, here's the essential workflow:

```bash
# 1. Sync and clean
./scripts/pre-push-hygiene.sh

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes with semantic commits
git add .
git commit -m "feat(api): implement customer authentication"

# 4. Run validation before PR
./scripts/validate-semantic-commits.sh

# 5. Push and create PR
git push origin feature/your-feature-name
```

For complete guidance, read the systematic flow documentation: [SYSTEMATIC_PUSH_PULL_MERGE_PR_FLOW.md](SYSTEMATIC_PUSH_PULL_MERGE_PR_FLOW.md)

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git and GitHub account
- VS Code (recommended) with these extensions:
  - ESLint
  - Prettier
  - GitLens

### Initial Setup

```bash
# Clone repository
git clone https://github.com/vauntico/mvp.git
cd mvp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Update with your keys in .env.local
```

## Project Structure

```
mvp/
├── src/                    # Main frontend (React)
├── server-v2/              # Backend API (Node.js/TypeScript)
├── vauntico-fulfillment-engine/  # Fulfillment service
├── widget/                 # Trust widget (TypeScript)
├── tools/                   # Development tools
└── docs/                   # Documentation
```

## Code Quality & Linting

We maintain strict code quality standards. ESLint is configured to catch common issues:

### ESLint Configuration

Our `.eslintrc.json` includes:

- **Base rules**: `eslint:recommended`
- **TypeScript support**: `@typescript-eslint/parser` with type-checking
- **React rules**: `plugin:react/recommended`
- **Special overrides**: For tools, scripts, and TypeScript files

### Common Rules Enforced

- `no-console`: Warns against console.log statements
- `prefer-const`: Enforces const for immutable variables
- `no-unused-vars`: Detects unused variables
- `no-case-declarations`: Prevents lexical declarations in case blocks

### Running Lint

```bash
# Check all files
npm run lint

# Auto-fix common issues
npm run lint:fix

# Check specific files
npm run lint src/utils/stripe.js
npm run lint server-v2/src/
```

## 🧹 Lint Sweep Checklist

Before declaring lint stabilization complete, contributors must run through this checklist:

- [ ] **Case block audit**  
       Search all `switch` statements for `case` blocks with lexical declarations (`const`, `let`, `class`, `function`).  
       Wrap each offending case in braces.  
       Commit with:
  ```bash
  git commit -m "fix(stripe): wrap all case block lexical declarations in braces"
  ```

### Manual Fixes Required

Some ESLint issues require manual intervention:

#### Case Block Declarations

When using lexical declarations in switch cases, wrap in braces:

```javascript
// ❌ WRONG (causes no-case-declarations error)
switch (product) {
  case "creator_pass":
    const prices = { starter: 17, pro: 59, legacy: 170 };
    // ...rest of case
    break;
}

// ✅ CORRECT (wrapped in braces)
switch (product) {
  case "creator_pass": {
    const prices = { starter: 17, pro: 59, legacy: 170 };
    // ...rest of case
    break;
  }
}
```

#### TypeScript ESLint Rules

TypeScript files use special rules in `.eslintrc.json`:

- `@typescript-eslint/no-console`: Console warnings in TS files
- `@typescript-eslint/prefer-const`: Const enforcement in TS files
- `@typescript-eslint/no-explicit-any`: Avoid `any` types

If TypeScript ESLint rules aren't loading, verify:

1. `@typescript-eslint/eslint-plugin` is installed
2. Parser version matches: `npm ls @typescript-eslint/parser @typescript-eslint/eslint-plugin`

#### Stress Test Globals

Files in `tools/` directory have special globals for k6 testing:

- `__VU`: Virtual user count (readonly)
- `__ITER`: Iteration number (readonly)

#### TypeScript ESLint Version Alignment

Ensure TypeScript ESLint packages have matching versions:

```bash
# Check versions match
npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser

# If versions don't match, align them:
npm install @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
```

Common issues when versions are misaligned:

- Rule definition not found errors
- Type-aware rules not working
- Parser configuration errors

### Commit Standards

Use semantic commit messages:

```bash
# Lint fixes
git commit -m "fix(stripe): wrap case block declarations in braces"

# ESLint configuration updates
git commit -m "chore(lint): update TypeScript ESLint rules and configuration"

# Auto-fixes
git commit -m "chore(lint): resolve remaining lint warnings and auto-fixable issues"
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following our style guidelines
- Run lint frequently: `npm run lint`
- Fix any lint issues before committing
- Write tests for new functionality

### 3. Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test lint rules
npm run lint
```

### 4. Pull Request

- Ensure all tests pass
- Ensure lint is clean (or only warnings)
- Create descriptive PR with:
  - Clear title and description
  - Link to any relevant issues
  - Request review from maintainers

## Code Style Guidelines

### JavaScript/TypeScript

- Use modern ES6+ syntax
- Prefer `const` over `let` when possible
- Use arrow functions for callbacks
- Destructure objects and arrays
- Use template literals for strings
- Add JSDoc comments for functions
- Enable TypeScript strict mode for all projects
- Use explicit type annotations for function parameters and return types
- Avoid `any` type - use specific types or generics

### React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript interfaces for prop typing (preferred over PropTypes)
- Avoid inline styles, use CSS modules
- Ensure consistent prop typing across all components

### File Organization

- Group related files together
- Use clear, descriptive names
- Keep components focused and reusable
- Separate business logic from UI components

## Git Workflow

### Branch Strategy

We follow a strict branching discipline to reduce config drift and ensure stable deployments:

#### **Primary Branches**

- `main`: Production-ready code, always deployable
- `develop`: Integration branch for feature aggregation
- `staging`: Pre-production testing environment

#### **Feature Branches**

- Format: `feature/descriptive-name`
- Branch from: `develop`
- Target: Merge back to `develop` via PR
- Examples: `feature/oauth-login`, `feature/kpi-dashboard`, `feature/widget-integration`

#### **Hotfix Branches**

- Format: `hotfix/urgent-description`
- Branch from: `main` (for production issues)
- Target: Merge to both `main` and `develop`
- Examples: `hotfix/security-patch`, `hotfix/payment-bug`

#### **Release Branches**

- Format: `release/vX.Y.Z`
- Branch from: `develop`
- Target: Merge to `main` after testing
- Examples: `release/v2.1.0`, `release/v2.1.1`

#### **Branch Protection Rules**

- `main` requires PR review and CI/CD completion
- `develop` requires at least 1 reviewer approval
- Force pushes disabled on protected branches
- Semantic commit messages enforced via CI/CD

#### **Workflow Integration**

1. **Development Flow**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   # ...make changes...
   git add .
   git commit -m "feat(scope): implement new feature"
   git push origin feature/your-feature
   # Create PR to develop
   ```

2. **Release Flow**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v2.1.0
   # ...version bump and final prep...
   git push origin release/v2.1.0
   # Merge to main after CI/CD validation
   ```

3. **Hotfix Flow**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   # ...fix issue...
   git push origin hotfix/critical-bug
   # Merge to main and develop
   ```

### Commit Message Format

``bash
type(scope): description

# Examples:

feat(auth): add OAuth login flow
fix(stripe): wrap case block declarations in braces  
chore(lint): update TypeScript ESLint rules and configuration
docs(readme): update API documentation
refactor(api): optimize database queries
test(widget): add unit tests for trust score calculator

````

## Testing

### Unit Tests
- Located alongside source files
- Use `.test.js` or `.test.ts` suffix
- Run with: `npm test`
- Use React Testing Library for component tests
- Ensure test stability with consistent API key patterns and metric validation

### Integration Tests
- Located in `tests/integration/` directory
- Test API endpoints and workflows
- Use consistent mocking patterns for API keys and authentication
- Validate response schemas and error handling

### Integration Tests
- Located in `tests/integration/`
- Test API endpoints and workflows
- Run with: `npm run test:integration`

### E2E Tests
- End-to-end testing for critical flows
- Configure environment variables in `.env.test`
- Run with: `npm run test:e2e`

## Environment Variables

### Required Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
````

### Environment-Specific Files

- `.env.development`: Dev overrides
- `.env.test`: Test configuration
- `.env.production`: Production settings

### Security

- Never commit real API keys or secrets
- Use environment variables for all sensitive data
- Follow principle of least privilege

## Deployment

### Development Deployment

```bash
# Start development server
npm run dev

# Run with test environment
npm run dev:test
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to staging/production
npm run deploy:staging
npm run deploy:production
```

## Getting Help

### Discord Community

Join our Discord for real-time help:

- [Link to Discord server]
- Ask questions in `#dev-help` channel
- Share progress and get feedback

### GitHub Issues

- Search existing issues before creating new ones
- Provide detailed reproduction steps
- Include environment information
- Tag maintainers for review

### Code Review

Request code review for:

- Complex features
- Security-related changes
- Performance optimizations
- Major refactorings

## Contribution Guidelines

### Before Contributing

1. Read this guide thoroughly
2. Set up your local development environment
3. Run existing tests to ensure everything works
4. Check open issues for similar work

### Making Changes

1. Follow coding standards outlined above
2. Ensure all tests pass
3. Keep changes focused and atomic
4. Update documentation as needed

### After Contributing

1. Ensure your PR is mergeable
2. Respond to feedback promptly
3. Help with testing if needed
4. Celebrate your contribution! 🎉

## 🧹 Lint Sweep Checklist

When performing lint stabilization, follow this systematic approach:

- [ ] **Case block audit**: Wrap all lexical declarations (`const`, `let`, `class`, `function`) in case blocks with braces

  ```javascript
  // ❌ WRONG
  switch (product) {
    case "creator_pass":
      const prices = { starter: 17, pro: 59 };
      break;
  }

  // ✅ CORRECT
  switch (product) {
    case "creator_pass": {
      const prices = { starter: 17, pro: 59 };
      break;
    }
  }
  ```

- [ ] **ESLint plugin verification**: Ensure `parserOptions.project` points to correct tsconfig.json files and versions align

  ```bash
  # Check versions match
  npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser

  # Align versions if needed
  npm install @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
  ```

- [ ] **Contributor documentation**: Update guide with lint setup and semantic commit examples
  - Document case block fixes
  - Include version alignment procedures
  - Add common rule explanations

- [ ] **Final verification**: Run `npm run lint` and confirm remaining warnings are acceptable
  - Console statements in development files (acceptable)
  - Unused variables in test files (acceptable)
  - k6 globals in tools directory (acceptable)

- [ ] **GitHub Actions rerun**: Push changes and rerun all workflows to ensure CI/CD stability
  ```bash
  git push origin main
  # Monitor GitHub Actions for any lint-related failures
  ```

## 🚨 Phase 2: TypeScript Error Triage Plan

### Error Categories for Quick vs Structural Fixes

Based on current lint analysis (391 errors), we categorize as:

#### 🟢 Quick Fixes (~50 errors - Immediate)

- **Unused variables** (`no-unused-vars`): Remove unused imports and declarations
- **Console statements** (`no-console`): Acceptable in dev files, fix critical ones
- **Simple type issues**: Add missing types for function parameters
- **Escape characters** (`no-useless-escape`): Fix unnecessary escapes

#### 🟡 Must-Fix Errors (~20 errors - Blockers)

- **Widget rule definitions**: TypeScript ESLint rules not loading in widget
- **Type mismatches**: Critical type errors preventing compilation
- **Missing imports**: Required imports not found

#### 🟠 Structural Refactors (~320 errors - Deferred)

- **Widget `any` types**: Replace all `any` with proper TypeScript types
- **Complex type inference**: Improve type safety throughout codebase
- **Rule enforcement gaps**: Missing ESLint rules for stricter type checking

### Quick Fix Strategy

**Priority 1**: Remove unused variables in tools and test files
**Priority 2**: Add simple type annotations to reduce implicit any
**Priority 3**: Fix console statements in critical production code

### Structural Refactor Roadmap

**Widget Modernization**:

1. Create proper TypeScript interfaces for all widget props
2. Implement strict typing for event handlers
3. Replace `any` types with union types and interfaces
4. Set up proper ESLint configuration for widget

**Type Safety Enhancement**:

1. Implement proper error handling with typed responses
2. Add type guards for runtime type checking
3. Improve type inference for complex objects
4. Standardize type naming conventions

### Fix Commit Guidelines

#### Quick Fixes

```bash
# Example commit for quick fixes
git commit -m "fix(ts): resolve quick TypeScript lint errors (unused vars, implicit any)"
```

#### Structural Documentation

```bash
# Example commit for roadmap
git commit -m "docs(contrib): add roadmap for TypeScript strictness hardening"
```

### Verification Checklist

- [ ] Quick fixes reduce error count by 30-50 errors
- [ ] Structural roadmap documented with clear milestones
- [ ] Widget type safety plan established
- [ ] Final lint run shows significant error reduction
- [ ] All changes pushed and GitHub Actions rerun successfully

---

Thank you for contributing to Vauntico!

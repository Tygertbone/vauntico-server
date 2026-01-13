# Contributing to Vauntico v2.0.0

Welcome to Vauntico! This guide will help you get started and understand our development workflow.

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

### Manual Fixes Required
Some ESLint issues require manual intervention:

#### Case Block Declarations
When using lexical declarations in switch cases, wrap in braces:
```javascript
// ❌ WRONG (causes no-case-declarations error)
switch (product) {
  case 'creator_pass':
    const prices = { starter: 17, pro: 59, legacy: 170 }
    // ...rest of case
  break
}

// ✅ CORRECT (wrapped in braces)
switch (product) {
  case 'creator_pass': {
    const prices = { starter: 17, pro: 59, legacy: 170 }
    // ...rest of case
  break
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

### React
- Use functional components with hooks
- Follow React best practices
- Use PropTypes or TypeScript interfaces
- Avoid inline styles, use CSS modules

### File Organization
- Group related files together
- Use clear, descriptive names
- Keep components focused and reusable
- Separate business logic from UI components

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Active development
- Feature branches: `feature/feature-name`

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
```

## Testing

### Unit Tests
- Located alongside source files
- Use `.test.js` or `.test.ts` suffix
- Run with: `npm test`

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
```

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
1. Follow the coding standards outlined above
2. Ensure all tests pass
3. Keep changes focused and atomic
4. Update documentation as needed

### After Contributing
1. Ensure your PR is mergeable
2. Respond to feedback promptly
3. Help with testing if needed
4. Celebrate your contribution! 🎉

Thank you for contributing to Vauntico!

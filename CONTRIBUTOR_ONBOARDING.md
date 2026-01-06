# Vauntico MVP - Contributor Onboarding Guide

## 🎯 Welcome to Vauntico!

This guide helps new contributors get started quickly and effectively with the Vauntico MVP project.

---

## 🏗️ Project Overview

### What is Vauntico?
Vauntico is an AI-powered content creation platform that helps creators:
- Generate high-quality content using AI
- Manage distribution across multiple platforms
- Analyze performance metrics
- Monetize their content effectively

### Technology Stack
- **Frontend**: React 18 + Vite 5 + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel (Frontend) + OCI (Backend)
- **Monitoring**: Custom health checks + PM2

---

## 🚀 Quick Start (15 Minutes)

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp

# Install dependencies
npm install

# Install workspace dependencies
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env.local
cp server-v2/.env.example server-v2/.env.local

# Configure your local environment
# See Environment Variables section below
```

### 3. Start Development Servers
```bash
# Start all services (workspace)
npm run dev

# Or start individually:
# Frontend (port 5173)
cd src && npm run dev

# Backend (port 3000)
cd server-v2 && npm run dev

# Payment engine (port 3001)
cd vauntico-fulfillment-engine && npm run dev
```

### 4. Verify Setup
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/health
- Payment Engine: http://localhost:3001/health

---

## 🔧 Development Workflow

### Code Organization
```
vauntico-mvp/
├── src/                           # Frontend React application
├── server-v2/                      # Backend API service
├── vauntico-fulfillment-engine/    # Payment processing service
├── docs/                           # Documentation
├── scripts/                         # Deployment scripts
└── configs/                         # Configuration files
```

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `hotfix/*`: Critical fixes

### Commit Convention
```bash
# Format: type: description

feat: add user authentication feature
fix: resolve login validation issue
docs: update API documentation
refactor: optimize database queries
test: add unit tests for payment service
```

---

## 📝 Environment Variables

### Frontend (.env.local)
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173

# Authentication
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key

# Development
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### Backend (server-v2/.env.local)
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vauntico_dev

# Authentication
JWT_SECRET=your-jwt-secret-for-development
SESSION_SECRET=your-session-secret-for-development

# External Services
RESEND_API_KEY=your-resend-test-key
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key

# Development
DEBUG=true
LOG_LEVEL=debug
```

### Payment Engine (vauntico-fulfillment-engine/.env.local)
```bash
# Server
NODE_ENV=development
PORT=3001

# Stripe (for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vauntico_payments
```

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test:frontend
npm run test:backend
npm run test:payments

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure
```
src/
├── __tests__/           # Frontend tests
└── components/          # Component tests

server-v2/
├── __tests__/           # Backend tests
├── integration/          # Integration tests
└── unit/               # Unit tests

vauntico-fulfillment-engine/
├── __tests__/           # Payment tests
└── fixtures/           # Test data
```

### Writing Tests
```javascript
// Example: Frontend component test
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

// Example: Backend API test
import request from 'supertest';
import app from '../app';

test('GET /health returns 200', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
});
```

---

## 🎨 Frontend Development

### Component Structure
```jsx
// Example component structure
import React from 'react';
import { useState, useEffect } from 'react';
import './Component.css';

const Component = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="component">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Styling Guidelines
- Use Tailwind CSS for styling
- Follow component-based architecture
- Use CSS modules for complex styles
- Ensure responsive design

### State Management
- Use React hooks for local state
- Use React Query for server state
- Context API for global state
- Avoid prop drilling

---

## 🔙 Backend Development

### API Structure
```javascript
// Example route structure
import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateInput } from '../middleware/validation';

const router = express.Router();

router.get('/endpoint', authenticate, async (req, res) => {
  try {
    // Validate input
    const validated = validateInput(req.query);
    
    // Business logic
    const result = await someService.process(validated);
    
    // Response
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### Database Operations
```javascript
// Example database service
import { Pool } from 'pg';

class SomeService {
  constructor(pool) {
    this.pool = pool;
  }

  async getById(id) {
    const query = 'SELECT * FROM table WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async create(data) {
    const query = `
      INSERT INTO table (field1, field2) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await this.pool.query(query, [data.field1, data.field2]);
    return result.rows[0];
  }
}
```

### Error Handling
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};
```

---

## 🔄 Development Tools

### Linting & Formatting
```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Build Commands
```bash
# Build all services
npm run build

# Build specific service
npm run build:frontend
npm run build:backend
npm run build:payments
```

### Development Scripts
```bash
# Clean all node_modules
npm run clean

# Reset development environment
npm run reset

# Setup fresh development environment
npm run setup
```

---

## 🚀 Deployment

### Local Deployment Testing
```bash
# Test deployment locally
npm run deploy:local

# Test production build locally
npm run build:prod
npm run start:prod
```

### CI/CD Pipeline
- **Branch**: `main` triggers production deployment
- **Branch**: `develop` triggers staging deployment
- **Pull Requests**: Run tests and build validation
- **Merge**: Automatic deployment to staging

### Environment Promotion
1. **Development** → Feature branches
2. **Staging** → `develop` branch
3. **Production** → `main` branch

---

## 🔄 VAUNTICO.md Memory File

The `VAUNTICO.md` file is our living memory file that records recurring issues, fixes, and best practices. Every mistake becomes a rule to prevent future occurrences.

### Key Rules from VAUNTICO.md:
- **Rule 1**: Always use Node.js v24 in workflows
- **Rule 5**: Use semantic commit prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`, `scripts:`, `security:`)
- **Rule 6**: All PRs must pass unit tests, integration tests, security scans, and browser smoke tests
- **Rule 7**: Use project scripts (`npm run deploy`, `npm run validate`, `npm run cleanup`) instead of manual commands
- **Rule 9**: CI/CD pipelines must run jobs in parallel for maximum efficiency

**Always check VAUNTICO.md before coding to avoid repeating past mistakes.**

---

## ⚡ Slash Commands

Use these npm scripts instead of manual commands for consistency and automation:

```bash
# Deployment Commands
npm run deploy              # Deploy using backend-deploy.sh
npm run validate            # Validate deployment using validate-deployment.sh
npm run cleanup             # Clean up resources using cleanup.sh

# Development Commands
npm run test               # Run all tests
npm run test:integration   # Run integration tests
npm run test:smoke         # Run browser smoke tests
npm run lint               # Run linting
npm run format:check       # Check code formatting
npm run format:fix         # Fix code formatting

# Git Commands
npm run commit-pr          # Git add, commit with message, and push to main
```

---

## 🏆 CI/CD Victory Checklist

Follow this checklist to ensure successful deployments:

## CI/CD Victory Checklist
1. ✅ Push commits with semantic messages
2. ✅ Pipeline runs parallel jobs (test, lint, security, build)
3. ✅ Always use Node.js v24
4. ✅ Check VAUNTICO.md before coding
5. ✅ Use npm scripts instead of manual commands
6. ✅ Merge only when all verification checks pass

### Verification Requirements:
- **Unit Tests**: All unit tests must pass
- **Integration Tests**: All integration tests must pass
- **Security Scans**: Trivy and Snyk scans must complete
- **Browser Smoke Tests**: End-to-end browser tests must pass
- **Code Quality**: Linting and formatting checks must pass
- **Build**: Application must build successfully

### Parallel Job Structure:
Our CI/CD runs jobs in parallel for efficiency:
- `test`: Unit tests
- `integration`: Integration tests
- `lint`: Code quality and formatting
- `security-scan`: Vulnerability scanning (Trivy, Snyk)
- `build`: Application build verification
- `browser-smoke`: End-to-end browser tests

### Before Merging:
1. All parallel jobs must pass successfully
2. Security scans must not have critical vulnerabilities
3. Build must complete without errors
4. Browser smoke tests must validate core functionality

---

## 📊 Monitoring & Debugging

### Health Checks
```bash
# Frontend health
curl http://localhost:5173

# Backend health
curl http://localhost:3000/health

# Payment engine health
curl http://localhost:3001/health
```

### Logging
```bash
# View development logs
npm run logs

# View production logs
pm2 logs vauntico-backend

# View error logs
tail -f logs/error.log
```

### Performance Monitoring
- Frontend: React DevTools
- Backend: PM2 monitoring
- Database: Query performance logs
- Network: Browser network tab

---

## 🤝 Contributing Guidelines

### Code Review Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Submit pull request to `develop`
4. Code review by maintainers
5. Address feedback
6. Merge to `develop`
7. Deploy to staging for testing
8. Merge to `main` for production

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Code Standards
- Use TypeScript for new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📞 Getting Help

### Resources
- **Documentation**: `/docs` directory
- **API Reference**: Backend `/api/docs` endpoint
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

### Team Communication
- **Technical Questions**: Create GitHub Discussion
- **Bug Reports**: Create GitHub Issue
- **Feature Requests**: Create GitHub Issue with "enhancement" label

### Development Support
```bash
# Get help with commands
npm run help

# Check project status
npm run status

# Validate development setup
npm run check
```

---

## 🏆 Best Practices

### Security
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all inputs
- Implement proper authentication
- Use HTTPS in production

### Performance
- Optimize images and assets
- Use code splitting
- Implement caching strategies
- Monitor bundle size
- Optimize database queries

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Provide alt text for images

---

## 🎓 Learning Resources

### Internal Documentation
- Architecture Guide: `/docs/architecture.md`
- API Documentation: Backend service
- Component Library: Frontend Storybook
- Deployment Guide: `/DEPLOYMENT_GUIDE.md`

### External Resources
- React Documentation: https://react.dev
- Node.js Guide: https://nodejs.org/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs
- Vite Documentation: https://vitejs.dev

---

## 🚀 Quick Start Templates

### Environment Setup Templates

#### Local Development Environment
```bash
# 1. Clone and setup
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp
npm install

# 2. Environment templates
cp .env.template .env.local
cp server-v2/.env.example server-v2/.env.local
cp vauntico-fulfillment-engine/.env.example vauntico-fulfillment-engine/.env.local

# 3. Start all services
npm run dev
```

#### Frontend Environment (.env.local)
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173

# Payment Processing
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here

# Development
VITE_DEV_MODE=true
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=YOUR_SENTRY_DSN
```

#### Backend Environment (server-v2/.env.local)
```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vauntico_dev
DATABASE_SSL=false

# Authentication
JWT_SECRET=your-super-secret-jwt-key-for-development
SESSION_SECRET=your-super-secret-session-key-for-development
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# External Services
RESEND_API_KEY=re_your_resend_api_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# Development
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

#### Payment Engine Environment (vauntico-fulfillment-engine/.env.local)
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SUCCESS_URL=http://localhost:5173/success
STRIPE_CANCEL_URL=http://localhost:5173/cancel

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vauntico_payments
DATABASE_SSL=false

# Development
DEBUG=true
LOG_LEVEL=debug
ENABLE_WEBHOOK_LOGGING=true

# Security
WEBHOOK_SIGNATURE_TOLERANCE=300
```

### Docker Development Environment
```bash
# Development Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Individual services
docker-compose -f docker-compose.dev.yml up frontend
docker-compose -f docker-compose.dev.yml up backend
docker-compose -f docker-compose.dev.yml up payments
```

### IDE Configuration Templates

#### VS Code (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### VS Code Extensions (.vscode/extensions.json)
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-gitlens"
  ]
}
```

---

## 🛠️ Development Scripts Reference

### Available Scripts
```bash
# Development
npm run dev              # Start all services
npm run dev:frontend    # Start frontend only
npm run dev:backend     # Start backend only
npm run dev:payments    # Start payment engine only

# Building
npm run build            # Build all services
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only
npm run build:payments   # Build payment engine only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests
npm run test:payments    # Run payment engine tests
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Lint all services
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
npm run deploy:validate   # Validate deployment
```

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
netstat -tulpn | grep :3001

# Kill processes
sudo lsof -ti:3000 | xargs kill -9
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Reset database
npm run db:reset
npm run db:migrate
npm run db:seed
```

#### Dependency Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### Environment Variable Issues
```bash
# Check loaded environment variables
npm run env:check

# Validate required variables
node -e "
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter(env => !process.env[env]);
if (missing.length > 0) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
}
console.log('All required variables present');
"
```

---

## 🎯 Development Best Practices

### Code Organization
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── services/            # API service functions
└── styles/              # Global styles and Tailwind

server-v2/
├── routes/              # API route handlers
├── middleware/          # Express middleware
├── models/              # Database models
├── services/            # Business logic
├── utils/               # Utility functions
├── config/              # Configuration
└── __tests__/           # Test files
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature-name
# Make changes...
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name
# Create pull request

# Hotfix development
git checkout -b hotfix/urgent-fix-name
# Make fixes...
git add .
git commit -m "fix: resolve urgent issue description"
git push origin hotfix/urgent-fix-name
# Create pull request with priority label
```

### Environment Management
```bash
# Use environment-specific configs
export NODE_ENV=development
export DATABASE_URL=postgresql://localhost:5432/vauntico_dev

# Use direnv for automatic loading
echo "export NODE_ENV=development" > .envrc
echo "export DATABASE_URL=postgresql://localhost:5432/vauntico_dev" >> .envrc
```

---

## 📊 Performance Guidelines

### Frontend Performance
- Use React.memo for expensive components
- Implement code splitting with React.lazy()
- Optimize images with WebP format
- Use intersection observer for lazy loading
- Minimize re-renders with useCallback/useMemo

### Backend Performance
- Implement database connection pooling
- Use Redis for session storage
- Add compression middleware
- Implement API response caching
- Use database indexes effectively

### Database Performance
- Add appropriate indexes
- Use EXPLAIN ANALYZE for query optimization
- Implement connection pooling
- Monitor slow queries
- Regular vacuum and analyze operations

---

**Welcome aboard!** 🎉

We're excited to have you contribute to Vauntico. If you need help getting started, don't hesitate to reach out through GitHub Discussions or Issues.

**Quick Start Commands:**
```bash
# Clone and setup
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp
npm install
cp .env.template .env.local
npm run dev

# Or use our scripts
./scripts/backend-deploy.sh --help
./scripts/validate-deployment.sh --help
```

**Last Updated**: January 6, 2026  
**Version**: 3.0.0  
**Status**: Production Ready with Templates

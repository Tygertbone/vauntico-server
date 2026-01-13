# Vauntico MVP - Contributor Onboarding Guide

## 🎯 Welcome to Vauntico!

This guide helps new contributors get started quickly and effectively with the Vauntico MVP project.

---

## 🏗️ Project Overview

### What is Vauntico?

Vauntico is positioned as **trust infrastructure for the creator economy** - our distinctive opportunity as "Stripe for creator credibility" with moats in AI trust scoring, sacred features, Ubuntu philosophy, and African market focus.

### Technology Stack

- **Frontend**: React 18 + Vite 5 + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel (Frontend) + OCI (Backend)
- **Monitoring**: Custom health checks + PM2

---

## 🎯 Monetization Roadmap Alignment

**📖 memories.md is the authoritative source** - All features must align with the canonical monetization roadmap.

### Phase-Based Development

All new features, branches, and PRs must be tagged with their monetization phase:

#### Phase 1: Foundation (Months 1-6)

- **Target**: $100K MRR from creators
- **KPIs**: Pro subscriptions, Score Insurance signups, Trust Calculator usage
- **Features**: Free trust score calculator, $49/month Pro subscription, $19/month Score Insurance
- **Blind Spots**: Data privacy, Platform dependency

#### Phase 2: B2B API Licensing (Months 7-12)

- **Target**: $500K MRR from businesses
- **KPIs**: API calls, License tier upgrades, White-label integrations
- **Features**: Trust Score API tiers ($99-$2,999/month), White-label widgets, Brand partnerships
- **Blind Spots**: Commoditization, Platform dependency

#### Phase 3: Enterprise Compliance (Months 13-18)

- **Target**: $300K MRR from enterprise
- **KPIs**: Compliance suite sales, Slack/Notion integrations, Agency white-labels
- **Features**: African compliance suite ($2K-$10K/month), Enterprise integrations
- **Blind Spots**: Data privacy, Platform dependency

#### Phase 4: Creator Economy (Months 19-24)

- **Target**: $200K MRR from creator features
- **KPIs**: Ubuntu Council commissions, Legacy sponsorships, Marketplace transactions
- **Features**: Ubuntu Council, Native advertising, Sacred feature marketplace
- **Blind Spots**: Algorithm gaming, Commoditization

#### Phase 5: Vauntico Credits (Months 25-30)

- **Target**: $100K MRR from credits
- **KPIs**: Credits earned, Credits redeemed, Bundle sales, Gift transactions
- **Features**: Credit system (earned through trust actions), Bundles (100 credits for $79), Gifting
- **Blind Spots**: Algorithm gaming, Commoditization

### Branch Naming Convention

```bash
# Phase-specific branch naming
feature/phase1-trust-calculator-enhancement
feature/phase2-api-licensing-tier-upgrade
feature/phase3-enterprise-compliance-dashboard
feature/phase4-ubuntu-council-integration
feature/phase5-credit-redemption-system

# Always include phase in PR description
phase: 1 - Enhanced trust calculator with export features
phase: 2 - API licensing tier upgrade workflow
```

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

### Monetization-Aligned Code Organization

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
- `feature/*`: Feature branches (must include phase tag)
- `hotfix/*`: Critical fixes

### Monetization-Aware Commit Convention

```bash
# Format: phase: type: description

phase1: feat: add user authentication feature
phase2: fix: resolve API licensing tier issue
phase3: docs: update compliance documentation
phase4: refactor: optimize Ubuntu Council integration
phase5: test: add credit redemption tests

# Always reference the monetization phase in commits
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

# Monetization Phase (for development)
VITE_MONETIZATION_PHASE=Phase 1: Foundation

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

# Monetization Configuration
MONETIZATION_PHASE=Phase 1: Foundation
MRR_TARGET=100000
KPI_METRICS=pro_subscriptions,score_insurance_signups,trust_calculator_usage

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

# Monetization
MONETIZATION_PHASE=Phase 1: Foundation
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

### Monetization-Aware Test Structure

```
src/
├── __tests__/           # Frontend tests
│   ├── phase1/         # Phase 1 specific tests
│   ├── phase2/         # Phase 2 specific tests
│   └── phase3/         # Phase 3 specific tests
└── components/          # Component tests

server-v2/
├── __tests__/           # Backend tests
│   ├── phase1/         # Phase 1 API tests
│   ├── phase2/         # Phase 2 API tests
│   └── integration/     # Integration tests
├── unit/               # Unit tests
└── kpi/               # KPI monitoring tests

vauntico-fulfillment-engine/
├── __tests__/           # Payment tests
│   ├── phase1/         # Phase 1 payment tests
│   └── phase5/         # Phase 5 credit tests
└── fixtures/           # Test data
```

### Writing Monetization-Aware Tests

```javascript
// Example: Phase 1 Pro Subscription Test
import { render, screen } from "@testing-library/react";
import { ProSubscription } from "../ProSubscription";

test("Phase 1: Pro subscription processes $49/month correctly", async () => {
  render(<ProSubscription phase="Phase 1: Foundation" />);

  expect(screen.getByText("$49/month")).toBeInTheDocument();
  expect(screen.getByText("Sacred Features Access")).toBeInTheDocument();
});

// Example: Phase 2 API Licensing Test
import request from "supertest";
import app from "../app";

test("Phase 2: API licensing tier pricing works correctly", async () => {
  const response = await request(app)
    .get("/api/v1/api-licenses/tiers")
    .expect(200);

  expect(response.body).toHaveProperty("tiers");
  expect(response.body.tiers[0].price).toBe(99);
  expect(response.body.tiers[2].price).toBe(2999);
});
```

---

## 🎨 Frontend Development

### Monetization-Aligned Component Structure

```jsx
// Example component with phase awareness
import React from "react";
import { useState, useEffect } from "react";
import "./Component.css";

const Component = ({ phase, monetizationData }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Phase-specific initialization
    switch (phase) {
      case "Phase 1: Foundation":
        // Initialize Phase 1 features (Pro subscription, Score Insurance)
        break;
      case "Phase 2: B2B API Licensing":
        // Initialize Phase 2 features (API licensing, White-label)
        break;
      // ... other phases
    }
  }, [phase]);

  return (
    <div className="component">
      {/* Phase-specific rendering */}
      {phase === "Phase 1: Foundation" && <ProSubscriptionCard />}
      {phase === "Phase 2: B2B API Licensing" && <APILicensingTiers />}
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
- Consider phase-specific UI variations

### State Management

- Use React hooks for local state
- Use React Query for server state
- Context API for global state
- Include monetization phase context

---

## 🔙 Backend Development

### Monetization-Aligned API Structure

```javascript
// Example: Phase-aware route structure
import express from "express";
import { authenticate } from "../middleware/auth";
import { validateInput } from "../middleware/validation";

const router = express.Router();

// Phase 1: Foundation routes
router.get("/api/v1/subscriptions/plans", authenticate, async (req, res) => {
  try {
    const plans = [
      { id: "pro", name: "Pro", price: 49, features: ["sacred_features"] },
      {
        id: "insurance",
        name: "Score Insurance",
        price: 19,
        features: ["alerts", "smoothing"],
      },
    ];

    res.json({ success: true, data: plans, phase: "Phase 1: Foundation" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Phase 2: B2B API Licensing routes
router.get("/api/v1/api-licenses/tiers", authenticate, async (req, res) => {
  try {
    const tiers = [
      { id: "starter", price: 99, calls_limit: 10000 },
      { id: "business", price: 999, calls_limit: 100000 },
      { id: "enterprise", price: 2999, calls_limit: "unlimited" },
    ];

    res.json({
      success: true,
      data: tiers,
      phase: "Phase 2: B2B API Licensing",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### Database Operations

```javascript
// Example: Phase-aware service
import { Pool } from "pg";

class MonetizationService {
  constructor(pool) {
    this.pool = pool;
  }

  async trackKPIMetric(phase, metric, value) {
    const query = `
      INSERT INTO kpi_metrics (phase, metric, value, timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [phase, metric, value]);
    return result.rows[0];
  }

  async getPhaseTarget(phase) {
    const targets = {
      "Phase 1: Foundation": 100000,
      "Phase 2: B2B API Licensing": 500000,
      "Phase 3: Enterprise Compliance": 300000,
      "Phase 4: Creator Economy": 200000,
      "Phase 5: Vauntico Credits": 100000,
    };

    return targets[phase] || 0;
  }
}
```

### Error Handling

```javascript
// Global error handler with phase awareness
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Log to KPI tracking
  if (req.monetization_phase) {
    kpiService.trackKPIMetric(req.monetization_phase, "error_count", 1);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.status(500).json({ error: "Internal server error" });
};
```

---

## 🔄 Development Tools

### Monetization-Aware Scripts

```bash
# Phase-specific development commands
npm run dev:phase1          # Start with Phase 1 features enabled
npm run dev:phase2          # Start with Phase 2 features enabled
npm run dev:phase3          # Start with Phase 3 features enabled

# Monetization testing
npm run test:phase1         # Run Phase 1 specific tests
npm run test:phase2         # Run Phase 2 specific tests
npm run test:kpi           # Run KPI tracking tests

# Monetization deployment
npm run deploy:phase1       # Deploy Phase 1 features
npm run deploy:phase2       # Deploy Phase 2 features
```

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

# Phase-specific builds
npm run build:phase1
npm run build:phase2
```

---

## 🚀 Deployment

### Monetization-Aware Deployment

```bash
# Phase-specific deployment commands
npm run deploy:phase1      # Deploy Phase 1: Foundation
npm run deploy:phase2      # Deploy Phase 2: B2B API Licensing
npm run deploy:phase3      # Deploy Phase 3: Enterprise Compliance
npm run deploy:phase4      # Deploy Phase 4: Creator Economy
npm run deploy:phase5      # Deploy Phase 5: Vauntico Credits

# Manual deployment with phase specification
npm run deploy -- --phase="Phase 2: B2B API Licensing" --feature="API licensing tier upgrade"
```

### CI/CD Pipeline

- **Branch**: `main` triggers production deployment
- **Branch**: `develop` triggers staging deployment
- **Pull Requests**: Run tests and build validation
- **Merge**: Automatic deployment to staging
- **Phase Alignment**: All deployments must specify monetization phase

### Environment Promotion

1. **Development** → Feature branches (phase-aware)
2. **Staging** → `develop` branch
3. **Production** → `main` branch

---

## 🔄 VAUNTICO.md Memory File

The `memories.md` file is our living memory file that records the **canonical monetization roadmap** and governance principles. Every mistake becomes a rule to prevent future occurrences.

### Key Monetization Rules from memories.md:

- **Rule 1**: All features must align with one of the 5 monetization phases
- **Rule 2**: Every PR must specify which phase it supports and its revenue target
- **Rule 3**: KPI tracking must be implemented for all monetization features
- **Rule 4**: Blind spot mitigations must be considered for each phase
- **Rule 5**: Deployment workflows must include phase-specific validation
- **Rule 6**: All monetization features must respect the blind spot mitigations

**Always check memories.md before coding to ensure monetization alignment.**

---

## ⚡ Monetization-Aware Slash Commands

Use these npm scripts for monetization-aligned development:

```bash
# Phase-specific development
npm run dev:phase1         # Phase 1: Foundation development
npm run dev:phase2         # Phase 2: B2B API Licensing development
npm run dev:phase3         # Phase 3: Enterprise Compliance development
npm run dev:phase4         # Phase 4: Creator Economy development
npm run dev:phase5         # Phase 5: Vauntico Credits development

# Phase-specific testing
npm run test:phase1        # Test Phase 1 features
npm run test:phase2        # Test Phase 2 features
npm run test:kpi          # Test KPI tracking functionality

# Phase-specific deployment
npm run deploy:phase1      # Deploy Phase 1 features
npm run deploy:phase2      # Deploy Phase 2 features

# Monetization governance
npm run check:alignment     # Check feature alignment with memories.md
npm run validate:kpi       # Validate KPI tracking implementation
```

---

## 🏆 Monetization-Aware CI/CD Victory Checklist

Follow this checklist to ensure successful deployments:

## Monetization-Aware CI/CD Victory Checklist

1. ✅ Feature tagged with correct monetization phase
2. ✅ PR description includes phase alignment and revenue target
3. ✅ KPI tracking implemented for monetization features
4. ✅ Blind spot mitigations considered and documented
5. ✅ Pipeline runs phase-specific validation
6. ✅ Phase-specific tests pass
7. ✅ Always use Node.js v24
8. ✅ Check memories.md before coding
9. ✅ Use npm scripts instead of manual commands

### Monetization Verification Requirements:

- **Phase Alignment**: Feature must clearly align with memories.md phase
- **KPI Tracking**: All monetization features must have KPI tracking
- **Blind Spot Mitigations**: Document how blind spots are addressed
- **Revenue Target**: Clear connection to phase revenue goals
- **Unit Tests**: Phase-specific tests must pass
- **Integration Tests**: Monetization workflows must pass
- **Security Scans**: Trivy and Snyk scans must complete
- **Browser Smoke Tests**: End-to-end monetization flows must pass
- **Code Quality**: Linting and formatting checks must pass
- **Build**: Application must build successfully

### Phase-Specific Job Structure:

Our CI/CD runs phase-aware jobs:

- `test`: Phase-specific unit tests
- `integration`: Phase-specific integration tests
- `kpi-validation`: KPI tracking validation
- `blind-spot-check`: Blind spot mitigation verification
- `security-scan`: Vulnerability scanning (Trivy, Snyk)
- `build`: Phase-aware application build
- `browser-smoke`: End-to-end phase-specific tests

### Before Merging:

1. All phase-specific jobs must pass successfully
2. KPI tracking must be implemented and validated
3. Blind spot mitigations must be documented
4. Security scans must not have critical vulnerabilities
5. Build must complete without errors
6. Browser smoke tests must validate monetization flows

---

## 📊 Monitoring & Debugging

### Monetization Health Checks

```bash
# Frontend health with phase info
curl http://localhost:5173/health?phase=Phase1

# Backend health with KPI endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/metrics/kpi

# Payment engine health
curl http://localhost:3001/health

# Phase-specific KPI tracking
curl http://localhost:3000/api/v1/metrics/phase/Phase1
```

### Logging

```bash
# View development logs with phase context
npm run logs

# View production logs
pm2 logs vauntico-backend

# View monetization-specific logs
npm run logs:kpi

# View error logs
tail -f logs/error.log
```

### Performance Monitoring

- Frontend: React DevTools with phase indicators
- Backend: PM2 monitoring with KPI dashboards
- Database: Query performance logs by phase
- Network: Browser network tab with monetization flow tracking

---

## 🤝 Contributing Guidelines

### Monetization-Aligned Code Review Process

1. Create feature branch with phase tag
2. Implement phase-specific features with KPI tracking
3. Document blind spot mitigations
4. Submit pull request with phase alignment
5. Code review includes monetization validation
6. Address feedback including KPI requirements
7. Merge to `develop`
8. Deploy to staging for phase validation
9. Merge to `main` for production

### Monetization-Aware Pull Request Template

```markdown
## Description

Brief description of changes

## Monetization Phase Alignment

- [ ] Phase 1: Foundation (Target: $100K MRR)
- [ ] Phase 2: B2B API Licensing (Target: $500K MRR)
- [ ] Phase 3: Enterprise Compliance (Target: $300K MRR)
- [ ] Phase 4: Creator Economy (Target: $200K MRR)
- [ ] Phase 5: Vauntico Credits (Target: $100K MRR)

## KPI Implementation

- [ ] KPI tracking implemented
- [ ] Metrics dashboard updated
- [ ] Revenue impact calculated

## Blind Spot Mitigations

- [ ] Data privacy: Transparent scoring, opt-in scores, right to explanation
- [ ] Platform dependency: Multi-platform scoring, fallback scores, manual verification
- [ ] Algorithm gaming: Anomaly detection, decay functions, manual audits
- [ ] Commoditization: Sacred features, Ubuntu Echo community, predictions

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing

- [ ] Phase-specific unit tests pass
- [ ] Integration tests pass
- [ ] KPI tracking tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] memories.md alignment verified
```

### Code Standards

- Use TypeScript for new code
- Follow ESLint configuration
- Write meaningful commit messages with phase tags
- Add tests for new features
- Update documentation
- Include KPI tracking for monetization features

---

## 📞 Getting Help

### Resources

- **Documentation**: `/docs` directory
- **API Reference**: Backend `/api/docs` endpoint
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Monetization Guide**: `memories.md` (authoritative source)

### Team Communication

- **Technical Questions**: Create GitHub Discussion (include phase tag)
- **Bug Reports**: Create GitHub Issue (include phase context)
- **Feature Requests**: Create GitHub Issue with phase alignment and "enhancement" label
- **Monetization Questions**: Reference memories.md first, then create Discussion

### Development Support

```bash
# Get help with commands
npm run help

# Check project status
npm run status

# Validate development setup
npm run check

# Check monetization alignment
npm run check:alignment
```

---

## 🛠️ Development Scripts Reference

### Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:phase1       # Start Phase 1 features
npm run dev:phase2       # Start Phase 2 features
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:payments     # Start payment engine only

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
npm run test:kpi         # Run KPI tracking tests

# Code Quality
npm run lint             # Lint all services
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Monetization
npm run check:alignment  # Check memories.md alignment
npm run validate:kpi      # Validate KPI implementation
npm run track:mrr        # Track current MRR progress

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
npm run deploy:phase1    # Deploy Phase 1 features
npm run deploy:phase2    # Deploy Phase 2 features
npm run deploy:validate   # Validate deployment
```

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Monetization Phase Conflicts

```bash
# Check phase alignment
npm run check:alignment

# Resolve phase conflicts
git checkout -b feature/phase1-correct-implementation
```

#### KPI Tracking Issues

```bash
# Test KPI endpoints
curl http://localhost:3000/api/v1/metrics/kpi

# Check KPI configuration
npm run validate:kpi
```

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
const required = ['DATABASE_URL', 'JWT_SECRET', 'MONETIZATION_PHASE'];
const missing = required.filter(env => !process.env[env]);
if (missing.length > 0) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
}
console.log('All required variables present');
"
```

---

## 🎯 Monetization Best Practices

### Phase-Aware Code Organization

```
src/
├── components/          # Reusable UI components
│   ├── phase1/         # Phase 1 specific components
│   ├── phase2/         # Phase 2 specific components
│   └── common/         # Phase-agnostic components
├── pages/              # Page components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── services/            # API service functions
├── kpi/                # KPI tracking utilities
└── styles/              # Global styles and Tailwind

server-v2/
├── routes/              # API route handlers
│   ├── phase1/         # Phase 1 specific routes
│   ├── phase2/         # Phase 2 specific routes
│   └── common/         # Phase-agnostic routes
├── middleware/          # Express middleware
├── models/              # Database models
├── services/            # Business logic
├── utils/               # Utility functions
├── config/              # Configuration
├── kpi/                # KPI tracking services
└── __tests__/           # Test files
```

### Git Workflow

```bash
# Phase-aware feature development
git checkout -b feature/phase1-trust-calculator-enhancement
# Make changes...
git add .
git commit -m "phase1: feat: enhance trust calculator with export features"
git push origin feature/phase1-trust-calculator-enhancement
# Create pull request with phase alignment

# Phase-aware hotfix development
git checkout -b hotfix/phase2-api-licensing-bug-fix
# Make fixes...
git add .
git commit -m "phase2: fix: resolve API licensing tier calculation issue"
git push origin hotfix/phase2-api-licensing-bug-fix
# Create pull request with priority and phase tags
```

### Environment Management

```bash
# Use phase-specific configs
export MONETIZATION_PHASE="Phase 1: Foundation"
export DATABASE_URL=postgresql://localhost:5432/vauntico_dev

# Use direnv for automatic loading
echo "export MONETIZATION_PHASE=Phase 1: Foundation" > .envrc
echo "export DATABASE_URL=postgresql://localhost:5432/vauntico_dev" >> .envrc
```

---

## 📊 Monetization Performance Guidelines

### Phase-Specific Performance

- **Phase 1**: Optimize trust score calculation (< 2s)
- **Phase 2**: API response time < 100ms for licensing calls
- **Phase 3**: Compliance validation < 5s
- **Phase 4**: Creator economy transactions < 1s
- **Phase 5**: Credit redemption < 500ms

### KPI Tracking Performance

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

## 🔒 Monetization Security Guidelines

### Phase-Specific Security

- **Phase 1**: Secure subscription billing data
- **Phase 2**: Protect API licensing keys and usage limits
- **Phase 3**: Enterprise compliance data protection
- **Phase 4**: Creator economy transaction security
- **Phase 5**: Credit system fraud prevention

### General Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all inputs
- Implement proper authentication
- Use HTTPS in production

### Compliance Requirements

- **Data Privacy**: Transparent scoring algorithm, opt-in public scores, right to explanation
- **Platform Dependency**: Multi-platform scoring, fallback scores, manual verification
- **Algorithm Gaming**: Anomaly detection, decay functions, manual audits ($99 review)
- **Commoditization**: Sacred features + Ubuntu Echo community, move to predictions

---

## 🎓 Learning Resources

### Internal Documentation

- **Monetization Guide**: `memories.md` (authoritative source)
- **Architecture Guide**: `/docs/architecture.md`
- **API Documentation**: Backend service
- **Component Library**: Frontend Storybook
- **Deployment Guide**: `/DEPLOYMENT_GUIDE.md`

### Phase-Specific Resources

- **Phase 1**: Trust score calculation algorithms, subscription management
- **Phase 2**: API licensing models, white-label integration
- **Phase 3**: Enterprise compliance frameworks, African regulations
- **Phase 4**: Creator economy platforms, Ubuntu philosophy
- **Phase 5**: Credit systems, gamification, redemption flows

### External Resources

- React Documentation: https://react.dev
- Node.js Guide: https://nodejs.org/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs
- Vite Documentation: https://vitejs.dev

---

## 🚀 Monetization Quick Start Templates

### Phase 1: Foundation Environment Setup

```bash
# 1. Clone and setup
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp
npm install

# 2. Environment templates
cp .env.template .env.local
cp server-v2/.env.example server-v2/.env.local
cp vauntico-fulfillment-engine/.env.example vauntico-fulfillment-engine/.env.local

# 3. Phase 1 configuration
echo "MONETIZATION_PHASE=Phase 1: Foundation" >> .env.local
echo "MRR_TARGET=100000" >> server-v2/.env.local

# 4. Start Phase 1 services
npm run dev:phase1
```

### Phase 2: B2B API Licensing Environment

```bash
# Phase 2 Frontend Environment (.env.local)
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173

# Phase 2 Specific
VITE_MONETIZATION_PHASE=Phase 2: B2B API Licensing
VITE_ENABLE_API_LICENSING=true

# Backend Environment (server-v2/.env.local)
# Server Configuration
NODE_ENV=development
PORT=3000

# Phase 2 Configuration
MONETIZATION_PHASE=Phase 2: B2B API Licensing
MRR_TARGET=500000
KPI_METRICS=api_calls,license_tier_upgrades,white_label_integrations

# API Licensing
ENABLE_API_LICENSING=true
API_LICENSE_MIN_PRICE=99
API_LICENSE_MAX_PRICE=2999
```

### Docker Development Environment

```bash
# Phase-specific Docker Compose
docker-compose -f docker-compose.phase1.yml up -d
docker-compose -f docker-compose.phase2.yml up -d

# Individual services
docker-compose -f docker-compose.phase1.yml up frontend
docker-compose -f docker-compose.phase2.yml up backend
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
  },
  "vauntico.monetizationPhase": "Phase 1: Foundation"
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

**Welcome aboard!** 🎉

We're excited to have you contribute to Vauntico's monetization journey. If you need help getting started, don't hesitate to reach out through GitHub Discussions or Issues.

**Quick Monetization Commands:**

```bash
# Clone and setup with phase alignment
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-mvp
npm install
cp .env.template .env.local
npm run check:alignment  # Verify memories.md alignment
npm run dev:phase1       # Start Phase 1 development
```

**Last Updated**: January 7, 2026  
**Version**: 4.0.0  
**Status**: Monetization-Aligned Development Ready  
**Authoritative Source**: memories.md (canonical monetization roadmap)

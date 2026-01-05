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

**Welcome aboard!** 🎉

We're excited to have you contribute to Vauntico. If you need help getting started, don't hesitate to reach out through GitHub Discussions or Issues.

**Last Updated**: January 5, 2025  
**Version**: 2.0.0  
**Status**: Contributor Ready

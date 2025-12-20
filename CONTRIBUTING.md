# Contributing to Vauntico MVP

Welcome! We're thrilled you want to contribute to Vauntico. This document outlines our development process and guidelines.

## 🚀 Quick Start

### Frontend (React/Vite)
```bash
pnpm install
pnpm dev
```

### Backend (server-v2)
```bash
cd server-v2
pnpm install
pnpm run migrate
pnpm dev
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Set your environment variables (see README for details)
3. Generate new JWT secrets for production:
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   ```

## 📋 Development Guidelines

### Code Quality
- Use TypeScript for all new backend code
- Follow ESLint rules (`pnpm lint` to check)
- Write tests for new features (`pnpm test`)
- Keep commits atomic and descriptive

### Security
- Never commit environment variables or secrets
- JWT secrets should be rotated regularly in production
- Validate all inputs server-side
- Use prepared statements for database queries

### Git Workflow
- Create feature branches from main
- Use conventional commit messages:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation
  - `style:` - Code style changes
  - `refactor:` - Code refactoring
- Keep PRs focused and reviewable

## 🔧 API Development

### Adding New Endpoints
1. Create route in `server-v2/src/routes/`
2. Add validation with express-validator
3. Include proper error handling
4. Update this documentation
5. Add integration tests

### Database Changes
1. Add migration files in `server-v2/migrations/`
2. Test migration with `pnpm run migrate`
3. Update schema documentation
4. Don't modify existing migrations

## 🌐 Deployment

### Vercel (Frontend + API)
- Automatic deployments on main branch
- Preview deployments for all PRs
- Environment variables must be set in Vercel dashboard

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - 32-byte base64 encoded secret
- `NODE_ENV` - production/development
- `RESEND_API_KEY` - Email service API key

## 🧪 Testing

```bash
# Frontend tests
pnpm test

# Backend development
cd server-v2 && pnpm test

# End-to-end testing
pnpm test:e2e
```

## 📚 Resources

- [API Documentation](./server-v2/README.md)
- [Frontend Architecture](./docs/frontend.md)
- [Database Schema](./server-v2/migrations/)

## 🙋 Questions?

- Create an issue for bugs/features
- Join our Discord for discussions
- Email hello@vauntico.com for sensitive matters

Thank you for contributing to Vauntico! 🎉

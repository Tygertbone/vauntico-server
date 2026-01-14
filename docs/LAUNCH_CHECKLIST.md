# Vauntico Production Launch Checklist

## Pre-Launch Preparation (Week -2)

### Service Procurement & Configuration

#### Claude AI Setup

- [x] Business account created at console.anthropic.com
- [x] Claude API key generated: `sk-ant-[REDACTED]`
- [x] Billing enabled and $50 credit applied for initial testing
- [x] Production usage limits reviewed: 50K tokens/minute
- [x] Cost awareness: $1.10 per 1M input tokens

#### Airtable Configuration

- [x] Pro account activated (1,200 requests/hour, 5GB attachments)
- [x] Product fulfillment base created with UUID: `app3qM8xHJzBqJLQK`
- [x] Tables configured: Products, Orders, Customers
- [x] Personal access token: `pat[REDACTED]`
- [x] Webhook endpoint configured: `api.vauntico.com/webhook/airtable`

#### Resend Email Service

- [x] Business account verified: 3,000 emails free/month
- [x] Domain ownership confirmed: vauntico.com
- [x] SMTP credentials generated
- [x] Webhook signature secret: `whsec_[REDACTED]`
- [x] Email templates approved for transactional use

#### PayStack Payment Processing

- [x] Live account activated with business documentation
- [x] API keys generated and safely stored
- [x] Webhook endpoints configured for payment notifications
- [x] Regional compliance verified for South Africa, Nigeria, Kenya
- [x] Test payments processed successfully

#### Vercel Infrastructure

- [x] Pro account with custom domains enabled
- [x] vauntico.com DNS configured
- [x] api.vauntico.com subdomain pointing to Vercel
- [x] SSL certificates auto-provisioned

#### Database & Cache

- [x] Neon PostgreSQL (512MB free tier, scales to 4GB paid)
- [x] Upstash Redis (10MB free tier) for sessions
- [x] Connection strings validated
- [x] Backup procedures confirmed

### Security Configuration

#### API Key Management

- [x] SERVICE_API_KEY generated (32-char cryptographically secure)
- [x] SENTRY_DSN configured for error monitoring
- [x] SLACK_WEBHOOK_URL for alerts configured
- [x] JWT_SECRET rotated for production (min 32 characters)

#### Environment Variables

```bash
# Backend Secrets (Vercel Encrypted)
DATABASE_URL=postgresql://... (Neon connection)
UPSTASH_REDIS_URL=redis://... (Upstash)
JWT_SECRET=[32-char secure secret]
ENCRYPTION_KEY=[32-char AES key]

# Service Integrations
CLAUDE_API_KEY=sk-ant-[PRODUCTION_KEY]
SERVICE_API_KEY=[SECURE_SERVICE_KEY]
PAYSTACK_PUBLIC_KEY=pk_live_[PAYSTACK_PK]
PAYSTACK_SECRET_KEY=sk_live_[PAYSTACK_SK]
AIRTABLE_API_KEY=pat[PRODUCTION_PAT]
AIRTABLE_BASE_ID=app[PRODUCTION_BASE]

# Monitoring
SENTRY_DSN=https://[PRODUCTION_SENTRY_DSN]
SLACK_WEBHOOK_URL=https://[PRODUCTION_SLACK_WEBHOOK]
```

## Launch Day Execution (H-Hour)

### GitHub Actions Deployment Pipeline

#### Backend Deployment (server-v2)

```yaml
# .github/workflows/production-deploy.yml
name: Production Deploy
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Deploy environment"
        required: true
        default: "production"
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: cd server-v2 && npm ci --only=production

      - name: Run database migrations
        run: cd server-v2 && node scripts/migrate.js
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Vercel
        run: npx vercel --prod --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_BACKEND_PROJECT_ID }}

      - name: Run health validation
        run: node docs/scripts/validate-health-endpoints.js
        env:
          API_BASE_URL: https://api.vauntico.com
```

#### Frontend Deployment

```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend Production Deploy
on:
  workflow_dispatch:
    inputs:
      confirm:
        description: "Confirm production deployment?"
        required: true
        type: boolean

jobs:
  deploy-frontend:
    if: inputs.confirm == true
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build

      - name: Deploy to Vercel
        run: npx vercel --prod --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_FRONTEND_PROJECT_ID }}
```

### Deployment Sequence

#### Step 1: Pre-Deployment Validation (T-2 Hours)

```bash
# Run comprehensive validation suite
npm run validate:all

# Check all environment variables are set
node scripts/check-env-vars.js

# Validate API keys have proper permissions
node scripts/test-api-keys.js
```

#### Step 2: Database Migration (T-1 Hour)

```bash
# Connect to Neon and run migrations
psql "$DATABASE_URL" -f server-v2/migrations/001_create_schema.sql
# ... run all 17 migration files ...

# Validate schema
node server-v2/scripts/validate-schema.js
```

#### Step 3: Backend Deployment (T-30 Minutes)

```bash
# Trigger GitHub Actions deployment
gh workflow run production-deploy.yml -f environment=production

# Monitor deployment logs
gh run watch [RUN_ID]

# DNS propagation check
curl -I https://api.vauntico.com/health
```

#### Step 4: Frontend Deployment (T-0 Minutes)

```bash
# Deploy frontend after backend is stable
gh workflow run frontend-deploy.yml -f confirm=true

# Final health check
curl -s https://vauntico.com | grep -q "<!DOCTYPE html>" && echo "✅ Frontend live"
```

## Post-Launch Validation (H+0 to H+24)

### Immediate Health Checks

```bash
# Health endpoint validation
curl -f https://api.vauntico.com/health || exit 1
curl -f https://vauntico.com/health || exit 1

# Core API functionality
curl -f "https://api.vauntico.com/api/plans" || exit 1

# CORS validation
curl -H "Origin: https://malicious.com" https://vauntico.com/ | grep -q "Access-Control-Allow-Origin" && echo "❌ CORS leak detected" || echo "✅ CORS secure"
```

### Load Testing (H+1 Hour)

```bash
# Install artillery globally for testing
npm install -g artillery

# Run sustained 10 RPS test for 5 minutes
npx artillery run tests/load-test.yml --target https://api.vauntico.com --output results.json

# Check results
node scripts/analyze-load-test.js results.json
```

Expected Results:

- Response time: <500ms (95th percentile)
- Error rate: <1%
- Throughput: 8-12 RPS sustained
- No 5xx errors

### Security Validation

```bash
# Test authentication protection
curl -s -o /dev/null -w "%{http_code}" "https://api-fulfillment.vauntico.com/api/claude/complete" -d '{"prompt":"test"}'
# Should return 401 Unauthorized

# Test valid API key authentication
curl -H "Authorization: Bearer $SERVICE_API_KEY" "https://api-fulfillment.vauntico.com/api/claude/complete" -d '{"model":"claude-3-5-sonnet-20241022","prompt":"Hello","maxTokens":10}'
# Should return 200 OK with AI response
```

### Integration Testing

```bash
# Test automated payment flow
# Test trust score calculation
# Test email delivery via Resend
# Test Airtable data sync
# Test error boundaries and Sentry reporting
```

## Success Criteria

### All validations must pass:

- ✅ **100% uptime** during first 24 hours
- ✅ **All health checks** return 200 status codes
- ✅ **<1% error rate** on all endpoints
- ✅ **<500ms response time** for 95th percentile
- ✅ **Zero security incidents** in logs
- ✅ **All integrations functional** (payments, email, AI, database)
- ✅ **CORS properly restricted** to vauntico domains only
- ✅ **API authentication enforced** on all protected routes

## Rollback Procedures

### Emergency Rollback (Required within 5 minutes)

```bash
# Immediate rollback via Vercel dashboard or CLI
npx vercel rollback [deployment-id]

# Restore previous working version
# Monitor health endpoints return to normal

# Alert all stakeholders of rollback
slack-alert "#platform-alerts" "🚨 PRODUCTION ROLLBACK EXECUTED - Monitoring closely"
```

### Controlled Rollback (< 15 minutes)

```bash
# Tag current state as broken
git tag "production-broken-$(date +%Y%m%d_%H%M%S)"

# Deploy known-good previous version
gh workflow run production-deploy.yml -f version=last-stable

# Bootstrap essential data if needed
node scripts/bootstrap-production.js
```

## Monitoring & Alerting

### Critical Alerts (Page immediately)

- 5xx error rate > 5%
- Database connection failures
- Payment processing failures
- Security incidents (failed auth rate spikes)

### Warning Alerts (Review within 1 hour)

- 4xx error rate > 10%
- Response time > 2 seconds
- Database query timeouts
- Cache misses > 50%

### Info Alerts (Monitor trends)

- User registration events
- Payment successful events
- Email delivery confirmations
- Trust score calculations

---

_Launch Checklist Version: 2.0_
_Last Updated: December 2025_
_Prepared by: Senior Launch Orchestrator_

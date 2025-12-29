# Vauntico Production Deployment Guide

## Overview
This guide covers the production deployment requirements and configuration for Vauntico's secure multi-service architecture.

## Prerequisites

### Infrastructure Requirements
- Vercel Pro account (serverless functions)
- Neon PostgreSQL database (512MB free tier)
- Upstash Redis (10MB free tier)
- GitHub repository access

### External Service Configuration

#### Claude AI Service
- **Service**: Anthropic Claude API
- **Cost**: $1.10 per 1M input tokens, $4.40 per 1M output tokens
- **Setup Steps**:
  1. Visit [Anthropic Console](https://console.anthropic.com/)
  2. Create new API key
  3. Enable billing if needed
  4. **Environment Variable**: `CLAUDE_API_KEY`

#### Airtable Integration
- **Service**: Airtable API for product inventory
- **Cost**: Free tier (1,200 requests per hour, 5GB attachments)
- **Setup Steps**:
  1. Sign up for Airtable account
  2. Create "Products" base with fulfillment schema
  3. Generate personal access token
  4. **Environment Variables**:
     - `AIRTABLE_API_KEY`
     - `AIRTABLE_BASE_ID`
     - `AIRTABLE_TABLE_NAME=Products`

#### Resend Email Service
- **Service**: Resend transactional email
- **Cost**: 3,000 emails/month free, then $0.00058/email
- **Setup Steps**:
  1. Sign up at [Resend](https://resend.com)
  2. Verify domain ownership (vauntico.com)
  3. Create webhook endpoint for delivery tracking
  4. **Environment Variables**:
     - `RESEND_API_KEY`
     - `RESEND_WEBHOOK_SECRET` (from webhook configuration)

#### Payment Providers
- **Primary**: PayStack (Africa-focused)
- **Secondary**: Stripe (global fallback)
- **Setup Steps**:
  1. PayStack: Register business account and generate live keys
  2. Stripe: Create restricted API key with minimal permissions
  3. **Environment Variables**:
     - PayStack: `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
     - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Configuration Deployment

### Step 1: Fulfillment Engine Secrets
```bash
# In Vauntico fulfillment engine deployment
SERVICE_API_KEY=your_secure_32_char_api_key_here
CLAUDE_API_KEY=sk-ant-your_claude_key_here
AIRTABLE_API_KEY=pat_your_airtable_key_here
AIRTABLE_BASE_ID=app_your_base_id
AIRTABLE_TABLE_NAME=Products
RESEND_API_KEY=re_your_resend_key_here
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SENDER_EMAIL=support@vauntico.com
```

### Step 2: Backend API Secrets
```bash
# In Vauntico main backend deployment
DATABASE_URL=postgresql://neon_db_url
UPSTASH_REDIS_URL=redis://upstash_url
JWT_SECRET=your_secure_jwt_secret_32_chars_min
ENCRYPTION_KEY=your_aes_256_encryption_key_32_chars

# Payments
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# External Services
RESEND_API_KEY=re_your_resend_key
SENTRY_DSN=https://sentry_dsn_here
SLACK_WEBHOOK_URL=https://hooks.slack.com/your_webhook
```

### Step 3: Frontend Environment
```bash
# In Vercel frontend deployment (already configured)
VITE_API_BASE_URL=https://api.vauntico.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
VITE_CURRENCY_ABSTRACTION_ENABLED=true
```

### Step 4: GitHub Actions Secrets
Add to repository settings under "Secrets and variables > Actions":
```
CLAUDE_API_KEY=sk-ant-your_key
PAYSTACK_SECRET_KEY=sk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
AIRTABLE_API_KEY=pat_your_key
AIRTABLE_BASE_ID=app_your_base_id
RESEND_API_KEY=re_your_key
SERVICE_API_KEY=your_service_api_key
DATABASE_URL=postgresql://neon_url
UPSTASH_REDIS_URL=redis://upstash_url
RESEND_WEBHOOK_SECRET=whsec_webhook_secret
STRIPE_WEBHOOK_SECRET=whsec_stripe_webhook
```

## Deployment Validation

### Health Checks
- Frontend: `https://vauntico.com/health` (returns build info)
- Backend: `https://api.vauntico.com/health` (returns service health)
- Fulfillment: Fulfillment service health endpoint

### Service Validation
1. **Authentication**: Verify Claude API endpoints require SERVICE_API_KEY
2. **Payments**: Test PayStack public key loads correctly in frontend
3. **Webhooks**: Confirm Resend webhook signature verification works
4. **Database**: Validate connection to Neon pgSQL instance
5. **Redis**: Confirm Upstash caching functionality

## Security Considerations

### Key Rotation
- Rotate API keys quarterly through service dashboards
- Update environment variables before removing old keys
- Monitor for authentication failures during rotation

### Access Control
- GitHub Actions deploy only from main branch
- Environment secrets encrypted at rest
- Vercel production only accessible to authorized team members

### Monitoring
- Sentry error tracking active in production
- Slack alerts configured for service failures
- Database monitoring enabled in Neon dashboard

## Disaster Recovery

### Rollback Procedures
1. Vercel deployments allow instant rollback to previous version
2. Database: Point-in-time recovery available in Neon
3. Redis: Automatic failover in Upstash
4. External services: API keys can be regenerated if compromised

### Backup Strategy
- Database: Daily automated backups in Neon (7-day retention)
- Code: Git history provides complete version control
- Config: Environment secrets documented in encrypted repository

## Cost Optimization

### Free Tier Limits
- Neon: 512MB database (sufficient for 10K+ users)
- Upstash: 10MB Redis (adequate for session/caching)
- Vercel: 100GB bandwidth, 3000 hours serverless compute
- Resend: 3000 emails/month

### Scaling Triggers
- Database growth beyond 400MB: Upgrade Neon plan
- Email volume over 2000/month: Monitor Resend costs
- API traffic spikes: Optimize queries and implement caching

---

*Last Updated: December 2025*
*Version: 2.0.0*

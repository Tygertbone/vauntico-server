# Vauntico MVP Emergency Revenue Features - Production Rollout Plan

## Overview
This document provides a comprehensive step-by-step guide for deploying the Vauntico MVP emergency revenue features to production. The rollout involves three critical phases: Database Migration, Backend Deployment, and Frontend Deployment.

---

## Database Migration (Neon Dashboard)

### Prerequisites
- PostgreSQL client (psql) installed locally
- Access to Neon Dashboard with appropriate permissions
- Database connection string available in `.env` file

### Step-by-Step Migration Checklist

#### 1. Pre-Migration Preparation
```bash
# Navigate to project directory
cd c:\Users\admin\vauntico-mvp\server-v2

# Backup current database (recommended)
pg_dump $DATABASE_URL > backup_before_emergency_revenue_$(date +%Y%m%d_%H%M%S).sql

# Verify migration file exists
ls migrations/019_create_emergency_revenue_tables.sql
```

#### 2. Run Migration Script
```powershell
# Option 1: Use existing PowerShell script
.\run-migration.ps1

# Option 2: Manual execution
psql "$DATABASE_URL" -f migrations/019_create_emergency_revenue_tables.sql
```

#### 3. SQL Verification Queries
```sql
-- Verify 3 new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases')
ORDER BY table_name;

-- Verify indexes and constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases')
ORDER BY tc.table_name, tc.constraint_type;

-- Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases')
ORDER BY tablename, indexname;

-- Verify row counts (should be 0 initially)
SELECT 
    'creator_payment_requests' as table_name,
    COUNT(*) as row_count
FROM creator_payment_requests
UNION ALL
SELECT 
    'creator_verifications' as table_name,
    COUNT(*) as row_count
FROM creator_verifications
UNION ALL
SELECT 
    'content_recovery_cases' as table_name,
    COUNT(*) as row_count
FROM content_recovery_cases;

-- Verify triggers and functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('generate_case_number', 'set_case_number', 'update_trust_score_on_verification');

-- Verify views
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'VIEW'
AND table_name IN ('creator_verification_summary', 'active_recovery_cases', 'payment_request_summary');
```

#### 4. Post-Migration Validation
```sql
-- Test case number generation
SELECT generate_case_number();

-- Test insert with auto-generated case number
INSERT INTO content_recovery_cases (user_id, content_owner_id, title, description, content_platform)
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Test Case', 'Test Description', 'instagram')
RETURNING case_number, created_at;

-- Rollback test insert
DELETE FROM content_recovery_cases WHERE title = 'Test Case';
```

### Rollback Strategy
If migration fails:
```sql
-- Drop created objects in reverse order
DROP VIEW IF EXISTS payment_request_summary;
DROP VIEW IF EXISTS active_recovery_cases;
DROP VIEW IF EXISTS creator_verification_summary;

DROP TRIGGER IF EXISTS update_content_recovery_cases_updated_at ON content_recovery_cases;
DROP TRIGGER IF EXISTS update_creator_verifications_updated_at ON creator_verifications;
DROP TRIGGER IF EXISTS update_creator_payment_requests_updated_at ON creator_payment_requests;
DROP TRIGGER IF EXISTS update_trust_on_verification ON creator_verifications;
DROP TRIGGER IF EXISTS set_content_recovery_case_number ON content_recovery_cases;

DROP FUNCTION IF EXISTS update_trust_score_on_verification();
DROP FUNCTION IF EXISTS set_case_number();
DROP FUNCTION IF EXISTS generate_case_number();

DROP TABLE IF EXISTS content_recovery_cases;
DROP TABLE IF EXISTS creator_verifications;
DROP TABLE IF EXISTS creator_payment_requests;
```

---

## Backend Deployment (OCI Server)

### Prerequisites
- SSH access to OCI server
- Node.js 18+ installed on server
- PM2 process manager installed
- Git configured on server

### SSH Deployment Instructions

#### 1. SSH Connection Setup
```bash
# Connect to OCI server
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip

# Navigate to deployment directory
cd /var/www/vauntico-server
```

#### 2. Code Deployment
```bash
# Pull latest code
git pull origin main

# Or if fresh deployment:
git clone https://github.com/your-username/vauntico-mvp.git .
cd server-v2
```

#### 3. Install Dependencies
```bash
# Install Node.js dependencies
npm ci --production

# Verify installation
npm list --depth=0
```

#### 4. Environment Configuration
```bash
# Copy environment file (if not exists)
cp .env.example .env

# Edit environment variables
nano .env
```

**Critical Environment Variables for Emergency Revenue Features:**
```env
# Database
DATABASE_URL=postgresql://neondb_owner:your-password@ep-sparkling-bush-ahi9wjg6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Emergency Revenue Features
ENABLE_PAYMENT_BRIDGE=true
ENABLE_VERIFICATION=true
ENABLE_CONTENT_RECOVERY=true
PAYMENT_BRIDGE_FEE_PERCENTAGE=10
VERIFICATION_BRAND_PRICE=99
CONTENT_RECOVERY_FEE_PERCENTAGE=30

# Payment Processing
PAYSTACK_SECRET_KEY=sk_test_2bea0078ea794be853a7bbecc1e13b866837ff8b
PAYSTACK_PUBLIC_KEY=pk_test_07d44998c884b4d12e9b8524c72b9dbddb6263c9

# JWT & Security
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# Frontend URL
FRONTEND_URL=https://vauntico-mvp.vercel.app

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/REDACTED
```

#### 5. Build and Start Application
```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Or start manually
pm2 start dist/index.js --name "vauntico-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 6. Health Check Validation
```bash
# Test health endpoint
curl -I http://localhost:3000/health

# Should return: HTTP/1.1 200 OK

# Test emergency revenue endpoints
curl -X GET http://localhost:3000/api/v1/payment-bridge/status
curl -X GET http://localhost:3000/api/v1/verify/status
curl -X GET http://localhost:3000/api/v1/recovery/status
```

### PM2 Configuration File (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'vauntico-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/vauntico/error.log',
    out_file: '/var/log/vauntico/out.log',
    log_file: '/var/log/vauntico/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Rollback Strategy
If deployment fails:
```bash
# Rollback to previous commit
git checkout previous-commit-hash
npm run build
pm2 restart vauntico-backend

# Or restore from backup
pm2 stop vauntico-backend
cp -r /var/www/vauntico-server-backup/* .
npm run build
pm2 start vauntico-backend
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account with project access
- Vercel CLI installed locally
- Frontend build configured correctly

### Deployment Instructions

#### Option 1: Vercel CLI Deployment
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Navigate to frontend directory
cd c:\Users\admin\vauntico-mvp

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure project settings
```

#### Option 2: Vercel Dashboard Deployment
1. Push code to GitHub repository
2. Connect Vercel project to GitHub repo
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### Environment Variables Configuration
In Vercel Dashboard → Settings → Environment Variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.vauntico.com

# Payment Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_07d44998c884b4d12e9b8524c72b9dbddb6263c9

# Feature Flags
NEXT_PUBLIC_ENABLE_PAYMENT_BRIDGE=true
NEXT_PUBLIC_ENABLE_VERIFICATION=true
NEXT_PUBLIC_ENABLE_CONTENT_RECOVERY=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

### Verification Steps
```bash
# Test new routes after deployment
curl -I https://vauntico-mvp.vercel.app/payment-bridge
curl -I https://vauntico-mvp.vercel.app/services/verification

# Should return: HTTP/2 200 OK
```

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/payment-bridge",
      "dest": "/payment-bridge.html"
    },
    {
      "src": "/services/verification",
      "dest": "/services/verification.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

### Rollback Strategy
If deployment fails:
```bash
# Rollback to previous deployment via Vercel CLI
vercel rollback [deployment-url]

# Or via Vercel Dashboard:
# 1. Go to Deployments tab
# 2. Find previous successful deployment
# 3. Click "..." → "Promote to Production"
```

---

## Git Remote Setup

### Add Remotes for Frontend and Backend
```bash
# Navigate to project root
cd c:\Users\admin\vauntico-mvp

# Add frontend remote (main repository)
git remote add origin https://github.com/your-username/vauntico-mvp.git

# Add backend remote (if separate repo)
git remote add backend https://github.com/your-username/vauntico-backend.git

# Verify remotes
git remote -v
```

### Initial Commit/Push Workflow
```bash
# Stage all changes
git add .

# Commit changes
git commit -m "feat: Add emergency revenue features - payment bridge, verification, content recovery"

# Push to main repository
git push -u origin main

# If separate backend repo
git subtree push --prefix server-v2 backend main
```

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/emergency-revenue

# Work on features...

# Merge to main
git checkout main
git merge feature/emergency-revenue
git push origin main

# Delete feature branch
git branch -d feature/emergency-revenue
git push origin --delete feature/emergency-revenue
```

---

## Verification Checklist

### Backend API Testing
```bash
# Test payment bridge endpoint
curl -X POST https://api.vauntico.com/api/v1/payment-bridge/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{
    "amount": 10000,
    "currency": "NGN",
    "requestType": "payout",
    "bankAccount": {
      "accountName": "Test Account",
      "accountNumber": "1234567890",
      "bankName": "Test Bank",
      "bankCode": "057"
    }
  }'

# Expected Response: 201 Created with request details

# Test verification endpoint
curl -X POST https://api.vauntico.com/api/v1/verify/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{
    "platform": "tiktok",
    "platformUsername": "testuser",
    "verificationMethod": "api"
  }'

# Expected Response: 201 Created with verification request
```

### Frontend Form Testing
1. **Payment Bridge Form:**
   - Navigate to `/payment-bridge`
   - Fill in all required fields
   - Submit form
   - Verify loading state and success/error handling
   - Check request appears in recent requests list

2. **Verification Form:**
   - Navigate to `/services/verification`
   - Select platform and enter username
   - Submit verification request
   - Verify confirmation message

3. **Content Recovery Form:**
   - Navigate to `/services/recovery`
   - Fill case details and evidence
   - Submit recovery request
   - Verify case number generation

### Database Verification
```sql
-- Check test data in payment requests
SELECT 
    id, 
    creator_id, 
    amount_cents, 
    status, 
    created_at
FROM creator_payment_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Check test data in verifications
SELECT 
    id, 
    creator_id, 
    platform, 
    platform_username, 
    verification_status, 
    created_at
FROM creator_verifications 
ORDER BY created_at DESC 
LIMIT 5;

-- Check test data in recovery cases
SELECT 
    id, 
    user_id, 
    case_number, 
    title, 
    status, 
    created_at
FROM content_recovery_cases 
ORDER BY created_at DESC 
LIMIT 5;
```

### Slack Alerts Verification
```bash
# Test Slack webhook
curl -X POST https://hooks.slack.com/services/REDACTED \
  -H 'Content-type: application/json' \
  --data '{"text":"Test emergency revenue deployment alert"}'

# Expected Response: 200 OK with "ok"
```

### End-to-End Testing
1. Create test user account
2. Submit payment bridge request
3. Submit verification request
4. Submit content recovery case
5. Verify all data appears in database
6. Verify email notifications are sent
7. Verify Slack alerts are triggered
8. Test error scenarios (invalid data, missing fields)

---

## Error Handling

### Common SQL Constraint Violations
```sql
-- Error: Check constraint violation on amount
-- Fix: Ensure amount_cents > processing_fee_cents
INSERT INTO creator_payment_requests (creator_id, amount_cents, processing_fee_cents)
VALUES ('user-id', 10000, 15000); -- ERROR: amount must be greater than fee

-- Fix: Correct the values
INSERT INTO creator_payment_requests (creator_id, amount_cents, processing_fee_cents)
VALUES ('user-id', 15000, 1000); -- OK
```

### SSH Permission Denied
```bash
# Issue: SSH permission denied
# Solution: Check key permissions and user

# Fix SSH key permissions
chmod 600 ~/.ssh/your-oci-key.pem

# Test SSH connection
ssh -i ~/.ssh/your-oci-key.pem ubuntu@your-oci-server-ip

# If still fails, check security groups in OCI console
```

### Missing Environment Variables
```bash
# Check missing env vars
grep -r "process\.env\." server-v2/dist/ | grep -v "undefined"

# Add missing vars to .env file
echo "MISSING_VAR=your-value" >> .env

# Restart application
pm2 restart vauntico-backend
```

### Build Failures
```bash
# Common build issues and solutions

# TypeScript compilation errors
npm run tsc:check
# Fix type errors in .ts files

# Dependency installation issues
rm -rf node_modules package-lock.json
npm install

# Memory issues during build
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Payment Processing Errors
```bash
# Paystack API errors
curl -H "Authorization: Bearer sk_test_2bea0078ea794be853a7bbecc1e13b866837ff8b" \
     https://api.paystack.co/transferrecipient

# Check Paystack dashboard for API key status
# Verify webhook endpoints are accessible
```

### Frontend Build Errors
```bash
# Vite build issues
npm run build

# Common fixes:
# - Check environment variable references
# - Verify import paths
# - Check for missing dependencies

# Test build locally before deployment
npm run preview
```

---

## Success Criteria

### Database Migration Success
- [ ] All 3 tables created without errors
- [ ] All indexes and constraints applied
- [ ] All triggers and functions created
- [ ] All views created successfully
- [ ] Row counts return 0 (clean state)
- [ ] Verification queries return expected results

### Backend Deployment Success
- [ ] Application starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] All new API endpoints respond correctly
- [ ] PM2 processes running stable
- [ ] Logs show no critical errors
- [ ] Database connections established

### Frontend Deployment Success
- [ ] Build completes without errors
- [ ] New routes accessible (200 OK)
- [ ] Forms render correctly
- [ ] API calls work from frontend
- [ ] Environment variables properly configured
- [ ] No console errors in browser

### Integration Success
- [ ] Payment bridge form submits successfully
- [ ] Verification form processes requests
- [ ] Content recovery form creates cases
- [ ] Test data appears in database
- [ ] Email notifications sent
- [ ] Slack alerts triggered
- [ ] Error handling works as expected

### Performance Success
- [ ] API response times < 2 seconds
- [ ] Frontend load time < 3 seconds
- [ ] Database queries optimized
- [ ] No memory leaks in PM2 processes
- [ ] Vercel deployment < 5 minutes

---

## Emergency Contacts and Resources

### Team Contacts
- **Database Administrator:** [Contact Info]
- **Backend Developer:** [Contact Info]
- **Frontend Developer:** [Contact Info]
- **DevOps Engineer:** [Contact Info]

### Critical Links
- **Neon Dashboard:** https://console.neon.tech/
- **OCI Console:** https://console.oracle-cloud.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Paystack Dashboard:** https://dashboard.paystack.co/
- **GitHub Repository:** https://github.com/your-username/vauntico-mvp

### Monitoring and Alerts
- **Sentry Error Tracking:** https://sentry.io/
- **Slack Channel:** #vauntico-deployments
- **Status Page:** https://status.vauntico.com/

---

## Post-Deployment Monitoring

### First 24 Hours Checklist
- [ ] Monitor error rates in Sentry
- [ ] Check PM2 process stability
- [ ] Verify database performance
- [ ] Monitor Vercel build logs
- [ ] Check Slack alert frequency
- [ ] Review user feedback channels

### Ongoing Monitoring
- Daily error report review
- Weekly performance metrics
- Monthly security scans
- Quarterly backup verification

---

## Appendices

### A. Complete Migration SQL Validation Script
```sql
-- Full validation script for migration 019
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
    view_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases');
    
    RAISE NOTICE 'Tables created: %/3', table_count;
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases');
    
    RAISE NOTICE 'Indexes created: %', index_count;
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE 'Triggers created: %', trigger_count;
    
    -- Count views
    SELECT COUNT(*) INTO view_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'VIEW'
    AND table_name IN ('creator_verification_summary', 'active_recovery_cases', 'payment_request_summary');
    
    RAISE NOTICE 'Views created: %/3', view_count;
    
    IF table_count = 3 AND view_count = 3 THEN
        RAISE NOTICE '✅ Migration validation successful!';
    ELSE
        RAISE NOTICE '❌ Migration validation failed!';
    END IF;
END $$;
```

### B. Emergency Rollback Commands
```bash
# Database rollback
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Backend rollback
pm2 stop vauntico-backend
git checkout previous-stable-commit
npm run build
pm2 start vauntico-backend

# Frontend rollback
vercel rollback [previous-deployment-url]
```

### C. Performance Testing Script
```bash
# API load test
ab -n 100 -c 10 https://api.vauntico.com/health

# Database performance test
psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT * FROM creator_payment_requests ORDER BY created_at DESC LIMIT 100;"

# Frontend performance test
lighthouse https://vauntico-mvp.vercel.app --output=json --output-path=./lighthouse-report.json
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-06  
**Next Review Date:** 2025-02-06

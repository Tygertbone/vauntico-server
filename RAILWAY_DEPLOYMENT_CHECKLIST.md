# Railway Deployment Checklist for Vauntico Project

## 🚀 Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] All lockfiles have been regenerated and pushed to repository
- [ ] You have access to Railway dashboard (https://railway.app)
- [ ] Git repository is up to date with latest changes
- [ ] Environment variables are configured in Railway for each service

### ✅ Service Configuration Verification
- [ ] `server-v2/railway.toml` exists and is correctly configured
- [ ] `src/railway.toml` exists and is correctly configured ✅ **(Created)**
- [ ] `homepage-redesign/railway.toml` exists and is correctly configured ✅ **(Created)**
- [ ] `vault-landing/railway.toml` exists and is correctly configured ✅ **(Created)**

### ✅ Health Endpoints Verification
- [ ] server-v2: `/health` returns `{"status": "ok"}`
- [ ] src: `/health.json` returns `{"status": "ok"}`
- [ ] homepage-redesign: `/api/health` returns JSON with status, timestamp, uptime, environment
- [ ] vault-landing: `/health.json` returns `{"status": "ok"}`

### ✅ Build Scripts Verification
- [ ] server-v2: `npm run build` works (TypeScript compilation)
- [ ] src: `npm run build` works (Vite build)
- [ ] homepage-redesign: `npm run build` works (Next.js build)
- [ ] vault-landing: `npm run build` works (Next.js build)
- [ ] **CRITICAL**: Verify package.json scripts do not self-reference (e.g., 'build': 'npm run build')
- [ ] **TypeScript Sanity Check**: Run `npm run tsc:check` in server-v2 to verify TypeScript type resolution before deployment
- [ ] **Code Quality Check**: Run `npm run lint` to ensure ESLint passes across all projects
- [ ] **Code Formatting**: Run `npm run format` to verify Prettier formatting consistency
- [ ] **Pre-deployment Validation**: Run `npm run predeploy` to execute all checks before deployment
- [ ] **Pre-commit Hook**: Husky configured to run lint and type checks on every commit

---

## 🔄 Redeployment Process

### 1. server-v2 Service
- [ ] Go to Railway dashboard → server-v2 service
- [ ] Click "Deployments" tab
- [ ] Find latest deployment
- [ ] Click "Actions" → "Redeploy"
- [ ] Monitor build logs:
  - [ ] `npm ci` (or `npm install`) succeeds
  - [ ] `npm run build` succeeds
  - [ ] No critical errors or warnings
- [ ] Verify health check passes (status becomes "Healthy")
- [ ] Note the Railway URL: `_________________________`

### 2. src Service (React App)
- [ ] Go to Railway dashboard → src service
- [ ] Click "Deployments" tab
- [ ] Find latest deployment
- [ ] Click "Actions" → "Redeploy"
- [ ] Monitor build logs:
  - [ ] `npm ci` (or `npm install`) succeeds
  - [ ] `npm run build` succeeds
  - [ ] No critical errors or warnings
- [ ] Verify health check passes (status becomes "Healthy")
- [ ] Note the Railway URL: `_________________________`

### 3. homepage-redesign Service (Next.js)
- [ ] Go to Railway dashboard → homepage-redesign service
- [ ] Click "Deployments" tab
- [ ] Find latest deployment
- [ ] Click "Actions" → "Redeploy"
- [ ] Monitor build logs:
  - [ ] `npm ci` (or `npm install`) succeeds
  - [ ] `npm run build` succeeds
  - [ ] No critical errors or warnings
- [ ] Verify health check passes (status becomes "Healthy")
- [ ] Note the Railway URL: `_________________________`

### 4. vault-landing Service
- [ ] Go to Railway dashboard → vault-landing service
- [ ] Click "Deployments" tab
- [ ] Find latest deployment
- [ ] Click "Actions" → "Redeploy"
- [ ] Monitor build logs:
  - [ ] `npm ci` (or `npm install`) succeeds
  - [ ] `npm run build` succeeds
  - [ ] No critical errors or warnings
- [ ] Verify health check passes (status becomes "Healthy")
- [ ] Note the Railway URL: `_________________________`

---

## 🧪 Smoke Testing

### Using Bash Script
```bash
# Update URLs with your actual Railway URLs
export SERVER_V2_URL="https://your-server-v2-url.railway.app"
export SRC_URL="https://your-src-url.railway.app"
export HOMEPAGE_REDESIGN_URL="https://your-homepage-redesign-url.railway.app"
export VAULT_LANDING_URL="https://your-vault-landing-url.railway.app"

# Run smoke tests
./scripts/railway-smoke-test.sh
```

### Using PowerShell Script
```powershell
# Update URLs with your actual Railway URLs
.\scripts\railway-smoke-test.ps1 `
  -ServerV2Url "https://your-server-v2-url.railway.app" `
  -SrcUrl "https://your-src-url.railway.app" `
  -HomepageRedesignUrl "https://your-homepage-redesign-url.railway.app" `
  -VaultLandingUrl "https://your-vault-landing-url.railway.app"
```

### Manual Smoke Tests
- [ ] `curl https://<server-v2-url>/health` → HTTP 200 + JSON response
- [ ] `curl https://<src-url>/health.json` → HTTP 200 + `{"status": "ok"}`
- [ ] `curl https://<homepage-redesign-url>/api/health` → HTTP 200 + JSON response
- [ ] `curl https://<vault-landing-url>/health.json` → HTTP 200 + `{"status": "ok"}`

---

## 🔍 Post-Deployment Verification

### Health Check Results
- [ ] server-v2 health endpoint: ✅ PASS / ❌ FAIL
- [ ] src health endpoint: ✅ PASS / ❌ FAIL
- [ ] homepage-redesign health endpoint: ✅ PASS / ❌ FAIL
- [ ] vault-landing health endpoint: ✅ PASS / ❌ FAIL

### Service Status
- [ ] All services show "Healthy" status in Railway dashboard
- [ ] No service restart loops occurring
- [ ] No error messages in service logs
- [ ] Build logs show successful deployments

### Functionality Tests
- [ ] Applications load properly in browser
- [ ] No JavaScript errors in browser console
- [ ] Static assets load correctly
- [ ] API endpoints respond correctly

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Build Failures
- **Issue**: `npm ci` fails
  - **Solution**: Check package-lock.json integrity, clear npm cache
- **Issue**: `npm run build` fails
  - **Solution**: Check build dependencies, verify TypeScript/Next.js configuration

#### Health Check Failures
- **Issue**: Health endpoint not accessible
  - **Solution**: Verify health check path in railway.toml matches actual endpoint
- **Issue**: Health endpoint returns wrong response
  - **Solution**: Check health endpoint implementation, ensure proper JSON response

#### Runtime Errors
- **Issue**: Service crashes on startup
  - **Solution**: Check environment variables, verify start command in railway.toml
- **Issue**: Database connection errors
  - **Solution**: Verify DATABASE_URL environment variable, check network connectivity

### Rollback Procedure
If any service fails after redeployment:
1. Go to Railway dashboard
2. Navigate to the problematic service
3. Go to "Deployments" tab
4. Find the previous successful deployment
5. Click "Actions" → "Promote to Production"
6. Verify service health after rollback

---

## 📋 Final Validation

### ✅ Success Criteria
- [ ] All 4 services redeployed successfully
- [ ] All health checks pass
- [ ] Smoke tests return HTTP 200 status
- [ ] No critical errors in logs
- [ ] Applications function correctly

### 📝 Documentation
- [ ] Update any documentation with new service URLs
- [ ] Record deployment notes for future reference
- [ ] Update monitoring dashboards if needed

---

## 📞 Support Contacts

- **Railway Documentation**: https://docs.railway.app/
- **Project Repository**: https://github.com/Tygertbone/vauntico-mvp
- **Rollback Instructions**: See `ROLLBACK_INSTRUCTIONS.md`

---

## 🕐 Timestamps

- **Deployment Started**: _________________________
- **Deployment Completed**: _________________________
- **Smoke Tests Completed**: _________________________
- **All Services Healthy**: _________________________

---

**Deployment Status**: 
- [ ] 🟢 SUCCESS - All services deployed and healthy
- [ ] 🟡 PARTIAL - Some services need attention
- [ ] 🔴 FAILED - Critical issues requiring rollback

**Notes/Comments**: 
________________________________________________________________
________________________________________________________________
________________________________________________________________

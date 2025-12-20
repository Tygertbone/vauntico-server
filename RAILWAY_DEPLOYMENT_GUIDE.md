# Railway Deployment Guide for Vauntico Project

## Overview
This guide provides step-by-step instructions for redeploying the 4 Vauntico services on Railway after lockfile regeneration.

## Services to Redeploy

### 1. server-v2
- **Health Endpoint**: `/health` (returns JSON with status: "ok")
- **Railway Config**: `server-v2/railway.toml` ✅
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Port**: 8080

### 2. src (React App)
- **Health Endpoint**: `/health.json` (static file returns {"status": "ok"})
- **Railway Config**: ❌ Missing railway.toml
- **Build Command**: `npm run build`
- **Start Command**: Needs configuration
- **Health Check Path**: `/health.json`

### 3. homepage-redesign (Next.js)
- **Health Endpoint**: `/api/health` (returns JSON with status, timestamp, uptime, environment)
- **Railway Config**: ❌ Missing railway.toml
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

### 4. vault-landing
- **Health Endpoint**: `/health.json` (static file returns {"status": "ok"})
- **Railway Config**: ❌ Missing railway.toml
- **Build Command**: Needs verification
- **Start Command**: Needs configuration
- **Health Check Path**: `/health.json`

## Redeployment Steps

### For Each Service:

1. **Access Railway Dashboard**
   - Go to https://railway.app
   - Navigate to your Vauntico project

2. **Trigger Redeploy**
   - Go to the service (server-v2, src, homepage-redesign, vault-landing)
   - Click on "Deployments" tab
   - Find the latest deployment
   - Click "Actions" → "Redeploy"

3. **Monitor Build Logs**
   - Watch the build process in real-time
   - Confirm `npm ci` (or `npm install`) succeeds
   - Confirm `npm run build` succeeds
   - Look for any errors or warnings

4. **Verify Health Checks**
   - Railway will automatically run health checks
   - Confirm the service passes health checks
   - Check that the service status becomes "Healthy"

## Critical Issues Found

### Missing Railway Configuration Files
The following services need `railway.toml` files created:
- ❌ `src/` (React app)
- ❌ `homepage-redesign/` (Next.js app) 
- ❌ `vault-landing/` (Static site)

### Recommended railway.toml Configurations

#### For src/ (React App):
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health.json"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
NODE_ENV = "production"
PORT = "8080"
```

#### For homepage-redesign/ (Next.js):
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
NODE_ENV = "production"
PORT = "8080"
```

#### For vault-landing/ (Static Site):
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health.json"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
NODE_ENV = "production"
PORT = "8080"
```

## Smoke Testing

After all services are redeployed and healthy, run the smoke tests:

```bash
# Replace with your actual Railway URLs
curl https://server-v2-url.railway.app/health
curl https://src-url.railway.app/health.json  
curl https://homepage-redesign-url.railway.app/api/health
curl https://vault-landing-url.railway.app/health.json
```

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check package.json for correct build scripts
2. **Health Check Failures**: Verify health endpoints exist and return proper responses
3. **Missing Dependencies**: Ensure all dependencies are in package.json
4. **Port Conflicts**: Make sure services use different ports internally

### Getting URLs:
- Railway URLs can be found in the service dashboard
- Format: `https://service-name-project-name.railway.app`

## Validation Checklist

- [ ] All 4 services redeployed successfully
- [ ] Build logs show no critical errors
- [ ] All services pass Railway health checks
- [ ] Smoke tests return HTTP 200 status
- [ ] All services respond with correct health check format
- [ ] No service restart loops occurring

## Rollback Plan

If any service fails after redeployment:
1. Go to Railway dashboard
2. Navigate to the problematic service
3. Go to Deployments tab
4. Find the previous successful deployment
5. Click "Actions" → "Promote to Production"

See `ROLLBACK_INSTRUCTIONS.md` for detailed rollback procedures.

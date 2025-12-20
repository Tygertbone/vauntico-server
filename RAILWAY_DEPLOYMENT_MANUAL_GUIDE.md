# Railway Deployment Manual Guide for vauntico-server-v2

## Status Summary

✅ **Dependencies**: Code updated and pushed to GitHub  
✅ **Repository**: Latest backend code from Tygertbone/vauntico-mvp committed  
⚠️ **Deployment**: Manual steps required due to CLI interactive issues  

## Manual Deployment Steps

### 1. Access Railway Dashboard
- Go to: https://railway.app
- Login with tyatjamesd@gmail.com

### 2. Select/Create vauntico-server-v2 Project
- Look for existing `vauntico-server-v2` project in your dashboard
- If not found, create new project named `vauntico-server-v2`

### 3. Connect GitHub Repository
- Click "New Project" → "Deploy from GitHub repo"
- Select: `Tygertbone/vauntico-mvp`
- Set deployment root to: `server-v2/`
- Configure build settings from `railway.toml`

### 4. Environment Variables
Set these environment variables in Railway dashboard:

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=your_neon_db_url
REDIS_URL=your_upstash_redis_url
STRIPE_SECRET_KEY=your_stripe_key
RESEND_API_KEY=your_resend_key
JWT_SECRET=your_jwt_secret
# Add other required env vars from .env.example
```

### 5. Deploy
- Click "Deploy" to start the deployment
- Railway will automatically:
  - Install dependencies from package.json
  - Build using `npm run build` (TypeScript compilation)
  - Start using `npm start`
  - Run health checks on `/health`

## Domain Configuration Steps

### 1. Add Custom Domain
- In Railway project → Settings → Domains
- Add custom domain: `api.vauntico.com`

### 2. Get DNS Verification Record
- Railway will provide a TXT record like:
  ```
  _railway.api.vauntico.com TXT: railway-verification=xxxxx
  ```

### 3. Configure Namecheap DNS
- Log into Namecheap
- Go to Domain: vauntico.com
- Add TXT record:
  - Host: `_railway.api`
  - Value: `railway-verification=xxxxx` (from Railway)
  - TTL: 1 hour

### 4. Wait for Propagation
- DNS changes may take 5-30 minutes to propagate
- Railway will automatically issue SSL certificate once verified

## Health Endpoint Verification

Once deployed, test the health endpoint:

```bash
curl https://api.vauntico.com/health
# Expected: {"status":"ok"} with HTTP 200
```

## Troubleshooting

### Build Issues
- Check Railway build logs for dependency installation errors
- Verify `railway.toml` configuration
- Ensure all environment variables are set

### Health Check Failures
- Verify `/health` route exists and returns proper response
- Check if PORT=8080 matches application configuration
- Review application logs for startup errors

### Domain Issues
- Verify TXT record is correctly set in Namecheap
- Use DNS lookup tools to confirm record propagation
- Check Railway domain status for verification progress

## Current Configuration

### server-v2/railway.toml
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
NODE_ENV = "production"
PORT = "8080"
```

### Health Endpoint
- Path: `/health`
- Method: GET
- Response: `{"status": "ok"}`
- Status Code: 200

## Next Steps After Deployment

1. **Monitor Logs**: Check Railway logs for any runtime issues
2. **Test Endpoints**: Verify all API endpoints work correctly
3. **Set Monitoring**: Configure uptime monitoring for `api.vauntico.com`
4. **Update Documentation**: Update API documentation with new endpoint URLs

## Contact Support

If you encounter issues:
- Railway support: https://railway.app/support
- Check build logs in Railway dashboard
- Review this guide for common configuration issues

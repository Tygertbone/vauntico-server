# Vauntico Production Rollback Instructions

## Emergency Rollback Procedures

### Railway Rollback
1. **Access Railway Dashboard**
   - Log into https://railway.app
   - Navigate to your projects

2. **Server-v2 (API) Rollback**
   - Open vauntico-server project
   - Go to Deployments tab
   - Identify the last successful deployment ID before current rollout
   - Click "Redeploy" on the previous successful deployment
   - Monitor build logs to ensure `npm ci` succeeds
   - Verify health endpoint: `curl https://vauntico-server-production.up.railway.app/health`

3. **Vauntico-Fulfillment-Engine Rollback**
   - Open vauntico-fulfillment project
   - Go to Deployments tab
   - Identify the last successful deployment ID before current rollout
   - Click "Redeploy" on the previous successful deployment
   - Monitor build logs to ensure `npm ci` succeeds
   - Verify health endpoint: `curl https://vauntico-fulfillment-engine-production.up.railway.app/health`

### Namecheap DNS Rollback
1. **Access Namecheap Dashboard**
   - Log into https://namecheap.com
   - Go to Domain List → vauntico.com → Manage → Advanced DNS

2. **Revert CNAME Records**
   - Change `api` CNAME back to previous Railway domain or cname.vercel-dns.com
   - Change `fulfillment-sys` CNAME back to previous Railway domain or cname.vercel-dns.com
   - Save changes

3. **Verify DNS Propagation**
   ```
   nslookup api.vauntico.com
   nslookup fulfillment-sys.vauntico.com
   ```

### Vercel Rollback
1. **Access Vercel Dashboard**
   - Log into https://vercel.com
   - Navigate to your projects

2. **Homepage-Redesign Rollback**
   - Open homepage-redesign project
   - Go to Deployments tab
   - Find the last successful production deployment before current rollout
   - Click "Promote to Production"
   - Verify: https://www.vauntico.com/health.json

3. **Vault-Landing Rollback**
   - Open vault-landing project
   - Go to Deployments tab
   - Find the last successful production deployment before current rollout
   - Click "Promote to Production"
   - Verify: https://fulfillment.vauntico.com/health.json

### Verification Steps
Run these smoke tests after rollback:
```
curl https://api.vauntico.com/health
curl https://fulfillment-sys.vauntico.com/health
curl https://www.vauntico.com/health.json
curl https://fulfillment.vauntico.com/health.json
```

All should return: `{"status": "ok"}`

## Rollback Changelog
- **Date:** [Insert date]
- **Previous API Deployment ID:** [Insert Railway deployment ID]
- **Previous Fulfillment Deployment ID:** [Insert Railway deployment ID]
- **Previous Homepage Deployment:** [Insert Vercel deployment URL/commit]
- **Previous Vault Deployment:** [Insert Vercel deployment URL/commit]
- **DNS Records Reverted:** [Document what was changed back]
- **Rollback Reason:** [Document why rollback was needed]
- **Rollback Performed By:** [Your name]
- **Verification Results:** [Pass/Fail with details]

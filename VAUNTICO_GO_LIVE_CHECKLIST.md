# Vauntico Go-Live Checklist

## 1. Railway Builds
Confirm all three backend services show **Running** in Railway dashboard:
- vauntico-server-v2 → https://vauntico-server-v2.up.railway.app/health
- vauntico-fulfillment-engine → https://vauntico-fulfillment-engine.up.railway.app/health
- vauntico-vault-landing → https://vauntico-vault-landing.up.railway.app/health.json

## 2. DNS Verification
Check Namecheap records:
- api.vauntico.com → server-v2
- fulfillment.vauntico.com → fulfillment-engine
- vault.vauntico.com → vault-landing
- app.vauntico.com → Vercel app
- homepage.vauntico.com → Vercel homepage

## 3. Health Tests
Run:
.\scripts\railway-backend-health-test.ps1

Expect `200 OK` responses.

## 4. CI/CD Confirmation
- Push a test commit to GitHub
- Verify Railway auto-deploy triggers
- Confirm logs show successful build

## 5. Production Readiness
Once all checks pass, Vauntico is live and contributors can proceed with confidence.

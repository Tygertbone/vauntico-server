#!/bin/bash

# 🚀 CONFIGURE GITHUB SECRETS FOR VAUNTICO 🚀
# Execute this script to configure all required GitHub secrets

set -euo pipefail

echo "🔐 Configuring GitHub Secrets for Vauntico Production"
echo "=================================================="
echo "Account: $(gh api user --jq '.login')"
echo "Repository: $(git remote get-url origin | sed 's/.*github.com[:/]\///' | sed 's/\.git$//')"
echo ""

# Function to set secret with error handling
set_secret() {
    local secret_name="$1"
    local secret_value="$2"
    local description="$3"
    
    echo "🔧 Setting $secret_name..."
    if gh secret set "$secret_name" --body "$secret_value"; then
        echo "✅ $secret_name configured successfully"
    else
        echo "❌ Failed to set $secret_name"
        return 1
    fi
}

# === Vauntico Production Secrets ===

# Anthropic Claude
set_secret "CLAUDE_API_KEY" "sk-ant-api03-..." "Anthropic Claude API key"

# Airtable
set_secret "AIRTABLE_API_KEY" "patbRChi2d5XRnMgU..." "Airtable API key"

# Resend
set_secret "RESEND_WEBHOOK_SECRET" "whsec_G0FLhUjj1Gky..." "Resend webhook secret"
set_secret "RESEND_API_KEY" "re_ZWNrjxiz_KaY7..." "Resend API key"

# Paystack
set_secret "PAYSTACK_SECRET_KEY" "sk_live_f1afbe03..." "Paystack secret key"
set_secret "PAYSTACK_PUBLIC_KEY" "pk_test_07d44998..." "Paystack public key"
set_secret "PAYSTACK_CREATOR_PASS_PLAN_CODE" "PPLN_5gdhigqb1xmtkru" "Paystack creator pass plan code"
set_secret "PAYSTACK_ENTERPRISE_PLAN_CODE" "PLN_a0vfo9bgyfongok" "Paystack enterprise plan code"

# Stripe
set_secret "STRIPE_ENABLED" "false" "Stripe enabled flag"
set_secret "STRIPE_SECRET_KEY" "sk_test_your-stripe-secret-key" "Stripe secret key"
set_secret "STRIPE_WEBHOOK_SECRET" "whsec_your-webhook-secret" "Stripe webhook secret"
set_secret "STRIPE_CREATOR_PASS_PRICE_ID" "price_your-creator-pass-price-id" "Stripe creator pass price ID"
set_secret "STRIPE_ENTERPRISE_PRICE_ID" "price_your-enterprise-price-id" "Stripe enterprise price ID"

# Database (Neon Postgres)
set_secret "DATABASE_URL" "postgresql://neondb_owner:..." "Neon PostgreSQL database URL"

# JWT
set_secret "JWT_SECRET" "gkCyFAk4ady5Rz61..." "JWT secret"
set_secret "JWT_REFRESH_SECRET" "jvvs1ZFEl2ah49dC..." "JWT refresh secret"
set_secret "CRON_SECRET" "0vQdITV8+1zZbsX5..." "Cron job secret"

# OAuth
set_secret "OAUTH_ENCRYPTION_KEY" "8f2b420f6fc226fc..." "OAuth encryption key"
set_secret "OAUTH_ENCRYPTION_SALT" "oauthtrustscore" "OAuth encryption salt"

# Redis (Upstash)
set_secret "UPSTASH_REDIS_REST_URL" "https://wired-bulldog-44103.upstash.io" "Upstash Redis REST URL"
set_secret "UPSTASH_REDIS_REST_TOKEN" "AaxHAAIncDJkMGM0..." "Upstash Redis REST token"

# Google OAuth
set_secret "GOOGLE_CLIENT_ID" "1062114027930-..." "Google OAuth client ID"
set_secret "GOOGLE_CLIENT_SECRET" "GOCSPX-pn8NoFD14..." "Google OAuth client secret"

# Sentry
set_secret "SENTRY_DSN" "https://5d94454f..." "Sentry DSN"

# Slack
set_secret "SLACK_WEBHOOK_URL" "https://hooks.slack.com/services/..." "Slack webhook URL"

# Service API
set_secret "SERVICE_API_KEY" "43d9655a0a7a4c8c..." "Service API key"

# Admin
set_secret "ADMIN_ACCESS_KEY" "23c8d2967d16271c..." "Admin access key"

# Session
set_secret "SESSION_SECRET" "17219aaeab702b96..." "Session secret"

echo ""
echo "🔍 Verifying configured secrets..."
echo "=================================="

# List all secrets to verify
echo "📋 Current GitHub Secrets:"
gh secret list --repo $(git remote get-url origin | sed 's/.*github.com[:/]\///' | sed 's/\.git$//') | jq -r '.[].name'

echo ""
echo "✅ GitHub Secrets Configuration Complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Verify all secrets are correctly configured above"
echo "2. Trigger CI/CD pipeline: gh workflow run build-verification"
echo "3. Monitor deployment progress in GitHub Actions"
echo ""
echo "📊 After deployment, check:"
echo "- Production endpoints: https://api.vauntico.com/health"
echo "- Monitoring dashboards: Grafana/Prometheus"
echo "- Error tracking: Sentry"

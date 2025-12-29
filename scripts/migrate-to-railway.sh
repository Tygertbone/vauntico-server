#!/bin/bash

# Vauntico Migration to Railway Script
# Prepares backend services for Railway deployment

echo "🚂 Vauntico Railway Migration Preparation"
echo "========================================="

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (interactive)
echo "🔑 Logging into Railway..."
railway login

# Create Railway project
echo "📦 Creating Railway project..."
railway init vauntico-backend

# Navigate to server-v2 for backend deployment
echo "🔧 Preparing server-v2 for Railway..."
cd server-v2

# Create railway.toml configuration
cat > railway.toml << EOF
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production.variables]
NODE_ENV = "production"
PORT = "8080"
EOF

# Set environment variables (from .env)
echo "🔐 Setting environment variables..."
if [ -f ".env" ]; then
    # Extract and set production environment variables
    railway variables set NODE_ENV=production
    railway variables set DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
    railway variables set UPSTASH_REDIS_REST_URL=$(grep UPSTASH_REDIS_REST_URL .env | cut -d '=' -f2-)
    railway variables set UPSTASH_REDIS_REST_TOKEN=$(grep UPSTASH_REDIS_REST_TOKEN .env | cut -d '=' -f2-)
    railway variables set STRIPE_SECRET_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d '=' -f2-)
    railway variables set RESEND_API_KEY=$(grep RESEND_API_KEY .env | cut -d '=' -f2-)
    railway variables set SENTRY_DSN=$(grep SENTRY_DSN .env | cut -d '=' -f2-)
    railway variables set JWT_SECRET=$(grep JWT_SECRET .env | cut -d '=' -f2-)
    echo "✅ Environment variables set"
else
    echo "⚠️  No .env file found - set environment variables manually in Railway dashboard"
fi

# Deploy to Railway
echo "🚀 Deploying server-v2 to Railway..."
railway up

# Get Railway domain
echo "🌐 Getting Railway domain..."
railway domain

echo ""
echo "✅ Server-v2 migration to Railway complete!"
echo "📋 Next steps:"
echo "   1. Update DNS: api.vauntico.com CNAME → [Railway domain]"
echo "   2. Test health endpoint: curl https://[Railway domain]/health"
echo "   3. Repeat process for vauntico-fulfillment-engine"

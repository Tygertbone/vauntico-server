#!/bin/bash

# Vauntico Migration to Render Script
# Alternative contingency deployment to Render

echo "🎨 Vauntico Render Migration Preparation"
echo "======================================="

# Check if Render CLI is available (if exists)
if command -v render &> /dev/null; then
    echo "🔑 Render CLI found - using CLI deployment"
    render login
else
    echo "ℹ️  Render CLI not found - manual deployment required"
    echo "   Visit: https://dashboard.render.com/"
fi

echo "📋 Render Deployment Checklist:"
echo "=================================="
echo "1. Create new Web Service in Render dashboard"
echo "2. Connect GitHub repository: Tygertbone/vauntico-mvp"
echo "3. Configure build settings:"
echo "   - Build Command: npm run build (for each service)"
echo "   - Start Command: npm start"
echo "   - Node Version: 18+"
echo "4. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=[your_db_url]"
echo "   - UPSTASH_REDIS_REST_URL=[redis_url]"
echo "   - UPSTASH_REDIS_REST_TOKEN=[redis_token]"
echo "   - STRIPE_SECRET_KEY=[stripe_key]"
echo "   - And all other variables from .env files"
echo "5. Configure health checks:"
echo "   - Health Check Path: /health"
echo "6. Set custom domains:"
echo "   - api.vauntico.com → server-v2 service"
echo "   - vauntico-fulfillment-sys.vercel.app → fulfillment-engine service"
echo ""

# Check for Dockerfiles (optional enhancement)
echo "🔍 Checking for Docker configuration..."
if [ -f "server-v2/Dockerfile" ]; then
    echo "✅ Dockerfile found in server-v2"
else
    echo "ℹ️  Consider adding Dockerfile for faster deployments"
fi

if [ -f "vauntico-fulfillment-engine/Dockerfile" ]; then
    echo "✅ Dockerfile found in vauntico-fulfillment-engine"
else
    echo "ℹ️  Consider adding Dockerfile for faster deployments"
fi

echo ""
echo "🚀 Deployment URLs (after setup):"
echo "   API: https://[render-app-name].onrender.com"
echo "   Health: https://[render-app-name].onrender.com/health"
echo ""
echo "📝 DNS Configuration:"
echo "   api.vauntico.com CNAME → [render-app-name].onrender.com"
echo "   vauntico-fulfillment-sys.vercel.app CNAME → [render-app-name].onrender.com"

#!/bin/bash

# 🚨 EMERGENCY SECURITY RESPONSE SCRIPT 🚨
# Immediate response for exposed credentials
# Use this script when secrets are accidentally exposed

set -euo pipefail

echo "🚨 STARTING EMERGENCY SECURITY RESPONSE 🚨"
echo "Timestamp: $(date)"
echo "=========================================="

# Function to generate secure random passwords
generate_secure_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to validate PostgreSQL connection
validate_postgres_connection() {
    local db_url="$1"
    echo "Validating PostgreSQL connection..."
    if command -v psql &> /dev/null; then
        psql "$db_url" -c "SELECT 1;" > /dev/null 2>&1
        return $?
    else
        echo "⚠️  psql not found, skipping connection validation"
        return 0
    fi
}

# Step 1: Backup current credentials for recovery
echo "📋 Step 1: Creating credential backup..."
BACKUP_DIR="emergency-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup .env files if they exist
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/env-backup"
    echo "✅ Backed up .env"
fi

if [ -f ".env.local" ]; then
    cp .env.local "$BACKUP_DIR/env-local-backup"
    echo "✅ Backed up .env.local"
fi

if [ -f "server-v2/.env" ]; then
    cp server-v2/.env "$BACKUP_DIR/server-env-backup"
    echo "✅ Backed up server-v2/.env"
fi

# Step 2: Generate new secure credentials
echo "🔐 Step 2: Generating new secure credentials..."

NEW_DB_PASSWORD=$(generate_secure_password)
NEW_API_KEY=$(generate_secure_password)

echo "Generated new PostgreSQL password: ${NEW_DB_PASSWORD:0:8}..."
echo "Generated new API key: ${NEW_API_KEY:0:8}..."

# Step 3: Create rotation scripts
echo "📝 Step 3: Creating credential rotation scripts..."

cat > "$BACKUP_DIR/rotate-neon-credentials.sql" << EOF
-- PostgreSQL Credential Rotation Script
-- Execute this in your Neon dashboard or directly via psql

-- 1. Connect as superuser and create new user
CREATE USER neondb_owner_new WITH PASSWORD '$NEW_DB_PASSWORD';

-- 2. Grant all privileges on database to new user
GRANT ALL PRIVILEGES ON DATABASE neondb TO neondb_owner_new;

-- 3. Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner_new;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner_new;

-- 4. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neondb_owner_new;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neondb_owner_new;

-- 5. Test connection with new user (optional)
-- \c postgresql://neondb_owner_new:$NEW_DB_PASSWORD@ep-sparkling-bush-ahi9wjg6-pooler.c-3.us-east-1.aws.neon.tech/neondb

-- 6. After confirming new user works, drop old user
-- DROP USER neondb_owner;

EOF

# Step 4: Create new secure .env templates
echo "📄 Step 4: Creating new secure environment templates..."

cat > "$BACKUP_DIR/new-env-template" << EOF
# 🔒 SECURE ENVIRONMENT CONFIGURATION 🔒
# Generated: $(date)
# WARNING: Replace placeholder values with actual secrets from secure source

# Database Configuration (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://neondb_owner_new:${NEW_DB_PASSWORD}@YOUR_NEON_HOST/neondb?sslmode=require"

# API Keys (Store in AWS Secrets Manager or GitHub Actions secrets)
RESEND_API_KEY="re_NEW_SECURE_API_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_NEW_STRIPE_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_NEW_WEBHOOK_SECRET_HERE"

# Application Secrets
JWT_SECRET="${NEW_API_KEY}"
SESSION_SECRET="${NEW_API_KEY}"

# Environment
NODE_ENV="production"
PORT=3000

# Monitoring
SENTRY_DSN="YOUR_SENTRY_DSN_HERE"
EOF

# Step 5: Create security hardening checklist
echo "✅ Step 5: Creating security hardening checklist..."

cat > "$BACKUP_DIR/security-hardening-checklist.md" << EOF
# 🛡️ Security Hardening Checklist

## Immediate Actions Required
- [ ] **ROTATE POSTGRESQL CREDENTIALS**: Execute \`rotate-neon-credentials.sql\` in Neon dashboard
- [ ] **ROTATE RESEND API KEY**: Generate new key in Resend dashboard
- [ ] **ROTATE STRIPE KEYS**: Generate new keys in Stripe dashboard
- [ ] **UPDATE CI/CD SECRETS**: Update GitHub Actions secrets with new values
- [ ] **UPDATE ENVIRONMENT FILES**: Replace .env files with new secure values

## Verification Steps
- [ ] Test database connection with new credentials
- [ ] Test API endpoints with new API keys
- [ ] Verify all services start successfully
- [ ] Run smoke tests to ensure functionality

## Git History Cleanup
- [ ] Use BFG Repo-Cleaner to remove secrets from commit history
- [ ] Force push cleaned history
- [ ] Notify team of credential changes

## Preventive Measures
- [ ] Set up pre-commit hooks for secret detection
- [ ] Enable GitGuardian scanning
- [ ] Implement secrets management (AWS Secrets Manager/Vault)
- [ ] Review and enhance .gitignore rules
- [ ] Train team on secret management best practices

## Timeline
- **Immediate**: Rotate all exposed credentials
- **Within 1 hour**: Update all environment files and CI/CD
- **Within 2 hours**: Complete git history cleanup
- **Within 24 hours**: Implement all preventive measures

EOF

# Step 6: Create immediate .gitignore enhancements
echo "🚫 Step 6: Creating enhanced .gitignore rules..."

cat >> "$BACKUP_DIR/gitignore-additions" << EOF

# 🔒 ENHANCED SECURITY RULES 🔒
# Added during emergency security response $(date)

# All environment files (even more aggressive)
*.env*
!.env.example
!.env.template
!.env.test

# Secret files with common patterns
*secret*
*credential*
*key*
*password*
*token*
*.pem
*.key
*.crt
*.p12
*.pfx
*.jks
*.keystore

# Configuration files that might contain secrets
config.json
secrets.json
credentials.json
aws.json
azure.json
gcp.json

# Database connection files
database.json
db-config.json
connection.json

# API key files
api-keys.json
keys.json
tokens.json

# Backup and temporary files with sensitive data
*.backup
*.bak
*.tmp
*.temp
*.old
*.orig
*.rej

# IDE workspace files that might contain credentials
*.code-workspace
.vscode/settings.json
.idea/
*.swp
*.swo

# Cloud provider specific
.aws/
.azure/
.gcp/
.google/
kubeconfig
*.kubeconfig

# Build artifacts that might contain embedded secrets
dist/
build/
*.jar
*.war
*.egg
*.whl

# Logs that might contain sensitive information
*.log
logs/

# Docker compose override files with secrets
docker-compose.override.yml
docker-compose.prod.yml
docker-compose.staging.yml

# Terraform state files (might contain sensitive data)
*.tfstate
*.tfstate.*
.terraform.lock.hcl
terraform.tfstate.d/

# CI/CD files with hardcoded secrets
.github/workflows/*.yml
.github/workflows/*.yaml
.gitlab-ci.yml
.travis.yml
.circleci/
bitbucket-pipelines.yml

# Package manager lock files (might contain embedded secrets)
package-lock.json
yarn.lock
pnpm-lock.yaml
Pipfile.lock
Cargo.lock

# Mobile app configuration files
google-services.json
GoogleService-Info.plist
AdMob-Info.plist

# Server configuration files
nginx.conf
apache.conf
httpd.conf

# Environment-specific directories
.env.local/
.env.development/
.env.production/
.env.staging/

# Secret management tool files
vault.json
consul.json
etcd.json

# Monitoring and analytics configuration
datadog.json
newrelic.json
splunk.json
sumologic.json

# Security tool configurations
sonar-project.properties
bandit.yaml
safety.yml

# Database migration files that might contain credentials
migrations/*secret*
migrations/*password*
migrations/*key*

# Test configuration files with test credentials
jest.config.js
cypress.json
playwright.config.js

# Documentation files that might accidentally contain secrets
README.md
CHANGELOG.md
CONTRIBUTING.md

# Script files that might contain embedded secrets
*.sh
*.bat
*.ps1
*.py
*.js
*.ts

EOF

echo "✅ Emergency security response completed!"
echo "📁 All files saved to: $BACKUP_DIR"
echo ""
echo "🚨 IMMEDIATE ACTIONS REQUIRED:"
echo "1. Execute PostgreSQL credential rotation"
echo "2. Rotate all exposed API keys"
echo "3. Update environment files"
echo "4. Clean git history"
echo "5. Implement preventive measures"
echo ""
echo "📋 Full checklist available in: $BACKUP_DIR/security-hardening-checklist.md"
echo "🔧 Enhanced .gitignore rules in: $BACKUP_DIR/gitignore-additions"

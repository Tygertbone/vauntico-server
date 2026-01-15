# 🚨 EMERGENCY SECURITY RESPONSE SCRIPT 🚨
# Immediate response for exposed credentials
# Use this script when secrets are accidentally exposed

param(
    [switch]$SkipBackup,
    [switch]$Force
)

Write-Host "🚨 STARTING EMERGENCY SECURITY RESPONSE 🚨" -ForegroundColor Red
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Red

# Function to generate secure random passwords
function New-SecurePassword {
    param([int]$Length = 25)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    -join ($chars.ToCharArray() | Get-Random -Count $Length)
}

# Function to validate PostgreSQL connection
function Test-PostgresConnection {
    param([string]$ConnectionString)
    Write-Host "Validating PostgreSQL connection..." -ForegroundColor Yellow
    try {
        # Check if psql is available
        $psql = Get-Command psql -ErrorAction SilentlyContinue
        if ($psql) {
            $result = & psql $ConnectionString -c "SELECT 1;" 2>$null
            return $LASTEXITCODE -eq 0
        } else {
            Write-Warning "psql not found, skipping connection validation"
            return $true
        }
    } catch {
        Write-Warning "Could not validate PostgreSQL connection: $_"
        return $true
    }
}

# Step 1: Backup current credentials for recovery
if (-not $SkipBackup) {
    Write-Host "📋 Step 1: Creating credential backup..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupDir = "emergency-backup-$timestamp"
    
    if (Test-Path $BackupDir) {
        if (-not $Force) {
            Write-Error "Backup directory $BackupDir already exists. Use -Force to overwrite."
            exit 1
        }
        Remove-Item -Recurse -Force $BackupDir
    }
    
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    
    # Backup .env files if they exist
    $envFiles = @(
        ".env",
        ".env.local", 
        ".env.production",
        "server-v2\.env",
        "server-v2\.env.test",
        ".vercel\.env.development.local"
    )
    
    foreach ($file in $envFiles) {
        if (Test-Path $file) {
            $backupName = $file -replace '[\\:]', '_' -replace '\.', '_'
            Copy-Item $file "$BackupDir\$backupName-backup"
            Write-Host "✅ Backed up $file" -ForegroundColor Green
        }
    }
}

# Step 2: Generate new secure credentials
Write-Host "🔐 Step 2: Generating new secure credentials..." -ForegroundColor Cyan

$NewDbPassword = New-SecurePassword
$NewApiKey = New-SecurePassword
$NewJwtSecret = New-SecurePassword

Write-Host "Generated new PostgreSQL password: $($NewDbPassword.Substring(0,8))..." -ForegroundColor Green
Write-Host "Generated new API key: $($NewApiKey.Substring(0,8))..." -ForegroundColor Green
Write-Host "Generated new JWT secret: $($NewJwtSecret.Substring(0,8))..." -ForegroundColor Green

# Step 3: Create rotation scripts
Write-Host "📝 Step 3: Creating credential rotation scripts..." -ForegroundColor Cyan

$rotationScript = @"
-- PostgreSQL Credential Rotation Script
-- Execute this in your Neon dashboard or directly via psql
-- Generated: $(Get-Date)

-- 1. Connect as superuser and create new user
CREATE USER neondb_owner_new WITH PASSWORD '$NewDbPassword';

-- 2. Grant all privileges on database to new user
GRANT ALL PRIVILEGES ON DATABASE neondb TO neondb_owner_new;

-- 3. Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner_new;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner_new;

-- 4. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neondb_owner_new;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neondb_owner_new;

-- 5. Test connection with new user (optional)
-- \c postgresql://neondb_owner_new:$NewDbPassword@YOUR_NEON_HOST/neondb

-- 6. After confirming new user works, drop old user
-- DROP USER neondb_owner;

-- 7. Update application to use new user
-- DATABASE_URL="postgresql://neondb_owner_new:$NewDbPassword@ep-sparkling-bush-ahi9wjg6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
"@

$rotationScript | Out-File -FilePath "$BackupDir\rotate-neon-credentials.sql" -Encoding UTF8
Write-Host "✅ Created PostgreSQL rotation script" -ForegroundColor Green

# Step 4: Create new secure .env templates
Write-Host "📄 Step 4: Creating new secure environment templates..." -ForegroundColor Cyan

$envTemplate = @"
# 🔒 SECURE ENVIRONMENT CONFIGURATION 🔒
# Generated: $(Get-Date)
# WARNING: Replace placeholder values with actual secrets from secure source

# Database Configuration (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://neondb_owner_new:$NewDbPassword@YOUR_NEON_HOST/neondb?sslmode=require"

# API Keys (Store in AWS Secrets Manager or GitHub Actions secrets)
RESEND_API_KEY="re_NEW_SECURE_API_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_NEW_STRIPE_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_NEW_WEBHOOK_SECRET_HERE"

# Application Secrets
JWT_SECRET="$NewJwtSecret"
SESSION_SECRET="$NewJwtSecret"

# Environment
NODE_ENV="production"
PORT=3000

# Monitoring
SENTRY_DSN="YOUR_SENTRY_DSN_HERE"

# Additional Security Headers
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration (if used)
REDIS_URL="redis://localhost:6379"

# Email Configuration
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_REPLY_TO="support@yourdomain.com"

# File Upload Security
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES="jpg,jpeg,png,pdf,doc,docx"

# Analytics
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
MIXPANEL_TOKEN="YOUR_MIXPANEL_TOKEN"

# Logging
LOG_LEVEL="info"
LOG_FORMAT="json"

# Security
BCRYPT_ROUNDS=12
SESSION_MAX_AGE_MS=86400000

# API Rate Limiting
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=1000
"@

$envTemplate | Out-File -FilePath "$BackupDir\new-secure-env-template" -Encoding UTF8
Write-Host "✅ Created secure environment template" -ForegroundColor Green

# Step 5: Create security hardening checklist
Write-Host "✅ Step 5: Creating security hardening checklist..." -ForegroundColor Cyan

$checklist = @"
# 🛡️ Security Hardening Checklist

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Database Security
- [ ] **ROTATE POSTGRESQL CREDENTIALS**: Execute \`rotate-neon-credentials.sql\` in Neon dashboard
- [ ] **TEST NEW DATABASE CONNECTION**: Verify application can connect with new credentials
- [ ] **REMOVE OLD DATABASE USER**: After confirming new user works, drop the old user

### API Key Rotation
- [ ] **ROTATE RESEND API KEY**: Generate new key in Resend dashboard
- [ ] **ROTATE STRIPE KEYS**: Generate new keys in Stripe dashboard (test and live)
- [ ] **ROTATE JWT SECRET**: Update JWT secret in all environments
- [ ] **ROTATE SESSION SECRET**: Update session secret in all environments

### Environment Updates
- [ ] **UPDATE LOCAL ENV FILES**: Replace .env files with new secure values
- [ ] **UPDATE CI/CD SECRETS**: Update GitHub Actions secrets with new values
- [ ] **UPDATE STAGING ENVIRONMENT**: Deploy new secrets to staging first
- [ ] **UPDATE PRODUCTION ENVIRONMENT**: Deploy new secrets to production after staging verification

### Verification Steps
- [ ] **TEST DATABASE CONNECTION**: Verify all database operations work
- [ ] **TEST API ENDPOINTS**: Verify all API endpoints function correctly
- [ ] **TEST AUTHENTICATION**: Verify login/logout flows work
- [ ] **TEST EMAIL SERVICES**: Verify email sending functionality
- [ ] **TEST PAYMENT PROCESSING**: Verify Stripe integration works
- [ ] **RUN SMOKE TESTS**: Execute full application test suite
- [ ] **MONITOR ERROR LOGS**: Check for any authentication/connection errors

## 🧹 Git History Cleanup

### Immediate Cleanup
- [ ] **INSTALL BFG REPO-CLEANER**: Download from rtyley.github.io
- [ ] **CREATE PASSWORDS FILE**: List all exposed passwords/secrets
- [ ] **RUN BFG CLEANUP**: \`bfg --replace-text passwords.txt\`
- [ ] **REMOVE ENV FILES**: \`bfg --delete-files "*.env"\`
- [ ] **FORCE PUSH**: \`git push --force\`

### Validation
- [ ] **SCAN REPO HISTORY**: Use GitGuardian or similar tool
- [ ] **VERIFY NO SECRETS REMAIN**: Confirm clean history
- [ ] **NOTIFY TEAM**: Inform all developers about credential changes

## 🔒 Preventive Measures

### Secret Management
- [ ] **SET UP AWS SECRETS MANAGER**: Store all secrets securely
- [ ] **CONFIGURE VAULT**: Implement HashiCorp Vault if preferred
- [ ] **ENABLE GITHUB SECRETS**: Use GitHub Actions secrets for CI/CD
- [ ] **IMPLEMENT ENVIRONMENT INJECTION**: Use environment variables in deployment

### Git Security
- [ ] **INSTALL GIT-SECRETS**: \`git-secrets --install\`
- [ ] **CONFIGURE PRE-COMMIT HOOKS**: \`git-secrets --register-aws\`
- [ ] **ENABLE GITGUARDIAN**: Set up GitGuardian scanning
- [ ] **CONFIGURE BRANCH PROTECTION**: Require PR reviews and checks

### Development Practices
- [ ] **REMOVE .ENV FILES**: Ensure no .env files are committed
- [ ] **USE .ENV.EXAMPLE**: Provide template for developers
- [ ] **IMPLEMENT LOCAL DEV SETUP**: Document secure local development
- [ ] **TRAIN TEAM**: Educate on secret management best practices

### Monitoring
- [ ] **SET UP SECRET SCANNING**: Enable automated secret detection
- [ ] **CONFIGURE ALERTS**: Notify on potential secret leaks
- [ ] **REGULAR AUDITS**: Schedule periodic security reviews
- [ ] **INCIDENT RESPONSE**: Create security incident procedures

## 📅 Timeline

### First Hour (Critical)
- [ ] Rotate all database credentials
- [ ] Rotate all API keys
- [ ] Update environment files
- [ ] Test basic functionality

### First 2 Hours (Important)
- [ ] Complete git history cleanup
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Update documentation

### First 24 Hours (Complete)
- [ ] Deploy to production
- [ ] Implement all preventive measures
- [ ] Train team on new procedures
- [ ] Schedule follow-up security review

## 📞 Emergency Contacts

- **Security Team**: security@yourcompany.com
- **Database Admin**: dba@yourcompany.com
- **DevOps Team**: devops@yourcompany.com
- **Project Lead**: lead@yourcompany.com

## 📋 Recovery Information

### Backup Location
- All original files backed up to: $BackupDir
- PostgreSQL rotation script: rotate-neon-credentials.sql
- New environment template: new-secure-env-template

### Generated Credentials
- Database Password: $($NewDbPassword.Substring(0,8))...
- API Key: $($NewApiKey.Substring(0,8))...
- JWT Secret: $($NewJwtSecret.Substring(0,8))...

### Important Notes
- Store this checklist securely
- Update all team members on new procedures
- Monitor systems closely for 48 hours after changes
- Schedule security review within 1 week
"@

$checklist | Out-File -FilePath "$BackupDir\security-hardening-checklist.md" -Encoding UTF8
Write-Host "✅ Created comprehensive security checklist" -ForegroundColor Green

# Step 6: Create enhanced .gitignore
Write-Host "🚫 Step 6: Creating enhanced .gitignore rules..." -ForegroundColor Cyan

$gitignoreAdditions = @"

# 🔒 ENHANCED SECURITY RULES 🔒
# Added during emergency security response $(Get-Date)

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
"@

$gitignoreAdditions | Out-File -FilePath "$BackupDir\gitignore-additions" -Encoding UTF8
Write-Host "✅ Created enhanced .gitignore rules" -ForegroundColor Green

# Step 7: Create immediate remediation script
Write-Host "🔧 Step 7: Creating immediate remediation script..." -ForegroundColor Cyan

$remediationScript = @"
# 🚨 IMMEDIATE REMEDIATION ACTIONS
# Execute these commands immediately after credential rotation

# 1. Remove all .env files from the repository
Get-ChildItem -Path . -Recurse -Name "*.env*" -File | ForEach-Object {
    Write-Host "Removing: \`$_"
    Remove-Item -Force \`$_
}

# 2. Add enhanced .gitignore rules
Add-Content -Path .gitignore -Value (Get-Content "$BackupDir\gitignore-additions")

# 3. Remove files from git tracking if they were accidentally committed
git rm --cached *.env* 2>`$null
git rm --cached --cached server-v2/.env 2>`$null
git rm --cached .vercel/.env.development.local 2>`$null

# 4. Create secure .env.example file
@"
# 🔒 SECURE ENVIRONMENT TEMPLATE 🔒
# Copy this file to .env and fill in your actual secrets
# NEVER commit the actual .env file with real values

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# API Keys
RESEND_API_KEY="re_your_resend_api_key_here"
STRIPE_SECRET_KEY="sk_test_your_stripe_test_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Application Secrets
JWT_SECRET="your_jwt_secret_minimum_32_characters"
SESSION_SECRET="your_session_secret_minimum_32_characters"

# Environment
NODE_ENV="development"
PORT=3000

# Monitoring (Optional)
SENTRY_DSN="your_sentry_dsn_here"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
"@

Set-Content -Path .env.example -Value `$envTemplate

# 5. Commit the security improvements
git add .gitignore .env.example
git commit -m "infra(security): harden gitignore and add secure environment template"

Write-Host "✅ Immediate remediation completed!" -ForegroundColor Green
"@

$remediationScript | Out-File -FilePath "$BackupDir\immediate-remediation.ps1" -Encoding UTF8
Write-Host "✅ Created immediate remediation script" -ForegroundColor Green

# Step 8: Create BFG Repo-Cleaner instructions
Write-Host "🧹 Step 8: Creating BFG Repo-Cleaner instructions..." -ForegroundColor Cyan

$bfgInstructions = @"
# 🧹 BFG Repo-Cleaner Instructions

## Prerequisites
1. Download BFG Repo-Cleaner from: https://rtyley.github.io/bfg-repo-cleaner/
2. Ensure Java is installed (required for BFG)

## Step-by-Step Cleanup

### 1. Create Passwords File
Create a file named \`passwords.txt\` with the following content:
```
npg_BNyQzvI6EZ5i
npg_laWfvsB7Rb1y
re_ZWNrjxiz_KaY7DmQL7H6RMUeenhFCUKLB
neondb_owner
```

### 2. Run BFG Commands
```bash
# Remove all .env files from history
bfg --delete-files "*.env"

# Replace all passwords in repository history
bfg --replace-text passwords.txt

# Remove specific commit if needed (replace HASH with actual commit hash)
# bfg --delete-commits HASH
```

### 3. Clean Up and Force Push
```bash
# Clean up residual files
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push the cleaned repository
git push --force
```

### 4. Verify Cleanup
```bash
# Search for any remaining secrets
git log --all --full-history -- "*env*"
git log --all --full-history | grep -i "password\|secret\|key"
```

## Alternative: git-filter-repo
If you prefer git-filter-repo (more modern tool):

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Remove .env files
git-filter-repo --path .env --invert-paths

# Replace text in files
echo "npg_BNyQzvI6EZ5i==>REMOVED" > replacements.txt
echo "npg_laWfvsB7Rb1y==>REMOVED" >> replacements.txt
echo "re_ZWNrjxiz_KaY7DmQL7H6RMUeenhFCUKLB==>REMOVED" >> replacements.txt
git-filter-repo --replace-text replacements.txt
```

## Important Notes
- This will permanently rewrite git history
- All team members will need to re-clone the repository
- Coordinate with your team before running these commands
- Test on a separate branch first if possible
"@

$bfgInstructions | Out-File -FilePath "$BackupDir\bfg-cleanup-instructions.md" -Encoding UTF8
Write-Host "✅ Created BFG cleanup instructions" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Emergency security response completed!" -ForegroundColor Green
Write-Host "📁 All files saved to: $BackupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚨 IMMEDIATE ACTIONS REQUIRED:" -ForegroundColor Red
Write-Host "1. Execute PostgreSQL credential rotation: $BackupDir\rotate-neon-credentials.sql" -ForegroundColor Yellow
Write-Host "2. Rotate all exposed API keys (Resend, Stripe, etc.)" -ForegroundColor Yellow
Write-Host "3. Run immediate remediation: $BackupDir\immediate-remediation.ps1" -ForegroundColor Yellow
Write-Host "4. Clean git history: $BackupDir\bfg-cleanup-instructions.md" -ForegroundColor Yellow
Write-Host "5. Implement preventive measures: $BackupDir\security-hardening-checklist.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Full checklist available: $BackupDir\security-hardening-checklist.md" -ForegroundColor Cyan
Write-Host "🔧 Enhanced .gitignore rules: $BackupDir\gitignore-additions" -ForegroundColor Cyan
Write-Host "🧹 Git cleanup instructions: $BackupDir\bfg-cleanup-instructions.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛡️ Remember: Store all new credentials in AWS Secrets Manager or GitHub Actions secrets!" -ForegroundColor Magenta

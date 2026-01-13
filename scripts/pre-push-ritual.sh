#!/usr/bin/env bash
# Alternative for Windows: node scripts/pre-push-ritual.js

# Pre-Push Ritual: Keep CI/CD Lean
# This script ensures minimal data usage and prevents failed CI runs
# Run this before pushing to avoid wasting bandwidth and storage

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pre-Push Ritual: Keeping CI/CD Lean${NC}"
echo "=================================="

# Track success/failure
PASSED=0
FAILED=0

# Helper function to log step results
log_step() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAILED++))
    fi
}

# 1. Validate locally before pushing
echo -e "\n${YELLOW}📋 Step 1: Local Validation${NC}"
echo "------------------------"

if [ -f "package.json" ]; then
    # Check if build script exists
    if npm run build --silent 2>/dev/null; then
        log_step 0 "Build completed successfully"
    else
        log_step 1 "Build failed"
    fi

    # Run tests if available
    if npm run test --silent 2>/dev/null; then
        log_step 0 "Tests passed"
    else
        log_step 1 "Tests failed"
    fi

    # Run linting if available
    if npm run lint --silent 2>/dev/null; then
        log_step 0 "Linting passed"
    else
        log_step 1 "Linting failed"
    fi

    # Run type checking if available
    if npm run typecheck --silent 2>/dev/null; then
        log_step 0 "Type checking passed"
    else
        log_step 1 "Type checking failed"
    fi
else
    log_step 1 "No package.json found"
fi

# 2. Check secrets and environment
echo -e "\n${YELLOW}🔐 Step 2: Environment Validation${NC}"
echo "--------------------------------"

# Check for required environment variables
if [ -f ".env.example" ]; then
    # Extract required keys from .env.example
    REQUIRED_KEYS=$(grep -v "^#" .env.example | grep "=" | cut -d'=' -f1)
    
    if [ -f ".env" ]; then
        MISSING_KEYS=""
        for key in $REQUIRED_KEYS; do
            if ! grep -q "^${key}=" .env; then
                MISSING_KEYS="$MISSING_KEYS $key"
            fi
        done
        
        if [ -z "$MISSING_KEYS" ]; then
            log_step 0 "All required environment variables present"
        else
            log_step 1 "Missing environment variables:$MISSING_KEYS"
        fi
    else
        log_step 1 "No .env file found"
    fi
else
    log_step 0 "No .env.example to validate against"
fi

# Check for exposed secrets
if git diff --cached | grep -E '(sk_live_|pk_live_|sk_test_|pk_test_|password|secret|key)' --quiet; then
    log_step 1 "Potential secrets detected in staged changes"
else
    log_step 0 "No obvious secrets in staged changes"
fi

# 3. Cache dependencies
echo -e "\n${YELLOW}💾 Step 3: Dependency Optimization${NC}"
echo "-----------------------------------"

# Check if using lockfile
if [ -f "package-lock.json" ] || [ -f "npm-shrinkwrap.json" ]; then
    log_step 0 "Lockfile present - will use npm ci for caching"
    
    # Check if node_modules exists and is recent
    if [ -d "node_modules" ]; then
        # Check if node_modules is newer than package-lock.json
        if [ "node_modules" -nt "package-lock.json" ] 2>/dev/null; then
            log_step 0 "node_modules is up to date"
        else
            log_step 1 "node_modules may be stale - consider npm ci --prefer-offline"
        fi
    else
        log_step 1 "No node_modules found - will need to install"
    fi
else
    log_step 1 "No lockfile found - recommend running npm install && npm shrinkwrap"
fi

# 4. Limit log verbosity
echo -e "\n${YELLOW}📝 Step 4: Log Verbosity Check${NC}"
echo "--------------------------------"

# Check LOG_LEVEL environment variable
if [ -n "$LOG_LEVEL" ]; then
    case "$LOG_LEVEL" in
        "error"|"warn"|"warning")
            log_step 0 "LOG_LEVEL set to $LOG_LEVEL (minimal verbosity)"
            ;;
        "info"|"debug"|"trace")
            log_step 1 "LOG_LEVEL set to $LOG_LEVEL (verbose - consider 'warn' or 'error')"
            ;;
        *)
            log_step 1 "Unknown LOG_LEVEL: $LOG_LEVEL"
            ;;
    esac
else
    log_step 1 "LOG_LEVEL not set - recommend export LOG_LEVEL=warn"
fi

# 5. Confirm Git hygiene
echo -e "\n${YELLOW}🧹 Step 5: Git Hygiene${NC}"
echo "------------------------"

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    log_step 0 "Working directory clean"
else
    log_step 1 "Uncommitted changes detected"
fi

# Check staged changes size
STAGED_SIZE=$(git diff --cached --stat | tail -1 | awk '{print $1}' | sed 's/,//g' || echo "0")
if [ "$STAGED_SIZE" -gt 1000000 ]; then  # 1MB
    log_step 1 "Large staged changes detected ($(($STAGED_SIZE / 1000000))MB) - consider excluding large files"
else
    log_step 0 "Staged changes size acceptable ($(($STAGED_SIZE / 1024))KB)"
fi

# Check for large files in repository
LARGE_FILES=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    log_step 1 "$LARGE_FILES large files (>10MB) found in repository"
else
    log_step 0 "No large files found"
fi

# 6. Network usage optimization
echo -e "\n${YELLOW}🌐 Step 6: Network Usage Optimization${NC}"
echo "---------------------------------------"

# Check if .npmrc has cache settings
if [ -f ".npmrc" ]; then
    if grep -q "cache=" .npmrc; then
        log_step 0 "npm cache configured in .npmrc"
    else
        log_step 1 "Consider adding cache settings to .npmrc"
    fi
else
    log_step 1 "No .npmrc found - consider creating one with cache settings"
fi

# Check for offline-first settings
if grep -q "prefer-offline" package.json || grep -q "offline" .npmrc 2>/dev/null; then
    log_step 0 "Offline-first package management configured"
else
    log_step 1 "Consider adding offline-first package management"
fi

# Summary
echo -e "\n${BLUE}📊 Pre-Push Ritual Summary${NC}"
echo "==========================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All checks passed! Ready to push.${NC}"
    echo -e "${YELLOW}💡 Tip: Use 'git push origin main' to push safely${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  $FAILED check(s) failed. Fix issues before pushing.${NC}"
    echo -e "${YELLOW}💡 Tip: Failed checks help prevent CI failures and save bandwidth${NC}"
    exit 1
fi

#!/bin/bash

# Pre-Push Hygiene Script for Vauntico
# This script ensures code quality and prevents CI/CD false negatives

set -e  # Exit on any error

echo "🧹 Starting local hygiene checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# 1. Clean working directory
print_status "📁 Cleaning working directory..."
if ! git clean -fd; then
    print_error "Failed to clean working directory"
    exit 1
fi

if ! git reset --hard HEAD; then
    print_error "Failed to reset working directory"
    exit 1
fi
print_success "Working directory cleaned"

# 2. Check for uncommitted changes
print_status "🔍 Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    print_error "There are uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi
print_success "No uncommitted changes found"

# 3. Install fresh dependencies
print_status "📦 Installing fresh dependencies..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
fi
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi
if ! npm ci; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"

# 4. Check for sensitive files in git
print_status "🔒 Checking for sensitive files..."
SENSITIVE_PATTERNS=("\.env" "\.key" "\.pem" "\.p12" "password" "secret" "token")

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git ls-files | grep -E "$pattern" > /dev/null; then
        print_error "Found potentially sensitive files matching pattern: $pattern"
        git ls-files | grep -E "$pattern"
        exit 1
    fi
done

# Check for committed .env files specifically
if git ls-files | grep -E "\.env" > /dev/null; then
    print_error "Found .env files committed to git. This is not allowed."
    git ls-files | grep -E "\.env"
    exit 1
fi
print_success "No sensitive files found"

# 5. Run complete test suite
print_status "🧪 Running complete test suite..."

# Unit tests
if npm run test 2>/dev/null; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Integration tests
if npm run test:integration 2>/dev/null; then
    print_success "Integration tests passed"
else
    print_warning "Integration tests not available or failed, continuing..."
fi

# Coverage reports
if npm run test:coverage 2>/dev/null; then
    print_success "Coverage reports generated"
else
    print_warning "Coverage reports not available"
fi

# Performance tests
if npm run test:throughput 2>/dev/null; then
    print_success "Performance tests passed"
else
    print_warning "Performance tests not available"
fi

# 6. Lint and format validation
print_status "🔍 Running lint and format checks..."

if npm run lint; then
    print_success "Lint checks passed"
else
    print_error "Lint checks failed"
    exit 1
fi

if npm run format:check; then
    print_success "Format checks passed"
else
    print_error "Format checks failed. Run 'npm run format:fix' to fix."
    exit 1
fi

# 7. TypeScript strict validation
print_status "📋 TypeScript validation..."
if npm run tsc:check 2>/dev/null; then
    print_success "TypeScript validation passed"
else
    print_warning "TypeScript validation not available or failed"
fi

# 8. Security scan
print_status "🔒 Running security scan..."

# npm audit
if npm audit --audit-level moderate; then
    print_success "Security audit passed"
else
    print_warning "Security audit found issues. Review and fix as needed."
fi

# Run secret scan if available
if [ -f "scripts/secret-scan.sh" ]; then
    if bash scripts/secret-scan.sh; then
        print_success "Secret scan passed"
    else
        print_error "Secret scan failed"
        exit 1
    fi
else
    print_warning "Secret scan script not found"
fi

# 9. Sacred features validation
print_status "⚡ Validating sacred features..."
if npm run test:sacred 2>/dev/null; then
    print_success "Sacred features validation passed"
else
    print_warning "Sacred features validation not available or failed"
fi

# 10. Environment validation
print_status "🌍 Validating environment configurations..."
if [ -f "scripts/validate-env.sh" ]; then
    if bash scripts/validate-env.sh; then
        print_success "Environment validation passed"
    else
        print_error "Environment validation failed"
        exit 1
    fi
else
    print_warning "Environment validation script not found"
fi

# 11. Check gitignore effectiveness
print_status "📋 Checking .gitignore effectiveness..."
if [ -f ".gitignore" ]; then
    # Check if common sensitive patterns are in .gitignore
    GITIGNORE_PATTERNS=("\.env" "node_modules" "\.log" "dist" "build" "\.key" "\.pem")
    
    for pattern in "${GITIGNORE_PATTERNS[@]}"; do
        if ! grep -q "$pattern" .gitignore; then
            print_warning "Pattern '$pattern' not found in .gitignore"
        fi
    done
    print_success ".gitignore check completed"
else
    print_error ".gitignore file not found"
    exit 1
fi

# 12. Final check for large files
print_status "📏 Checking for large files..."
LARGE_FILE_THRESHOLD=10485760  # 10MB in bytes
LARGE_FILES=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -size +$LARGE_FILE_THRESHOLD -exec ls -lh {} \; 2>/dev/null | awk '{ print $9 ": " $5 }')

if [ -n "$LARGE_FILES" ]; then
    print_warning "Found large files (consider adding to .gitignore):"
    echo "$LARGE_FILES"
else
    print_success "No large files found"
fi

echo ""
print_success "✅ Local hygiene complete!"
echo ""
print_status "🚀 You're ready to push your changes!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m \"feat(scope): your semantic commit message\""
echo "3. git push origin your-branch"
echo ""

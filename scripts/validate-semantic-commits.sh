#!/bin/bash

# Semantic Commit Validation Script for Vauntico
# Ensures all commits follow the conventional commit format

set -e

echo "🔍 Validating semantic commits..."

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

# Valid commit types
VALID_TYPES=(
    "feat" "fix" "docs" "style" "refactor" 
    "test" "chore" "perf" "security" "build" "ci"
)

# Valid scopes
VALID_SCOPES=(
    "api" "ui" "widget" "auth" "payment" "infra" 
    "docs" "test" "config" "deploy" "monitoring"
)

# Function to validate commit message format
validate_commit_message() {
    local commit_message="$1"
    local commit_hash="$2"
    
    # Skip merge commits and revert commits
    if [[ "$commit_message" =~ ^(Merge|Revert) ]]; then
        return 0
    fi
    
    # Extract type, scope, and description
    if [[ "$commit_message" =~ ^([a-z]+)(\(([^)]+)\))?:\s+(.+)$ ]]; then
        local type="${BASH_REMATCH[1]}"
        local scope="${BASH_REMATCH[3]}"
        local description="${BASH_REMATCH[4]}"
        
        # Validate type
        local valid_type=false
        for valid_type_item in "${VALID_TYPES[@]}"; do
            if [[ "$type" == "$valid_type_item" ]]; then
                valid_type=true
                break
            fi
        done
        
        if [[ "$valid_type" == false ]]; then
            print_error "Invalid commit type: $type"
            print_error "Valid types: ${VALID_TYPES[*]}"
            return 1
        fi
        
        # Validate scope if provided
        if [[ -n "$scope" ]]; then
            local valid_scope=false
            for valid_scope_item in "${VALID_SCOPES[@]}"; do
                if [[ "$scope" == "$valid_scope_item" ]]; then
                    valid_scope=true
                    break
                fi
            done
            
            if [[ "$valid_scope" == false ]]; then
                print_warning "Unknown scope: $scope (Valid scopes: ${VALID_SCOPES[*]})"
            fi
        fi
        
        # Validate description (should not start with uppercase and should not end with period)
        if [[ "$description" =~ ^[A-Z] ]]; then
            print_error "Description should not start with uppercase letter"
            return 1
        fi
        
        if [[ "$description" =~ \.$ ]]; then
            print_error "Description should not end with a period"
            return 1
        fi
        
        if [[ ${#description} -lt 10 ]]; then
            print_error "Description should be at least 10 characters long"
            return 1
        fi
        
        print_success "✓ $commit_hash: $commit_message"
        return 0
    else
        print_error "Invalid commit message format: $commit_message"
        print_error "Expected format: type(scope): description"
        print_error "Example: feat(api): add customer authentication endpoint"
        return 1
    fi
}

# Function to check commits against rules
check_commit_rules() {
    local commit_message="$1"
    
    # Check for common issues
    if [[ "$commit_message" =~ \b(fix|fixed|fixes)\s+ ]]; then
        print_warning "Consider using 'fix' type instead of 'fixes' in description"
    fi
    
    if [[ "$commit_message" =~ \b(add|adds|added)\s+ ]]; then
        print_warning "Consider using 'feat' type instead of 'add' in description"
    fi
    
    if [[ "$commit_message" =~ \b(update|updates|updated)\s+ ]]; then
        print_warning "Consider being more specific than 'update' in description"
    fi
    
    # Check for WIP commits
    if [[ "$commit_message" =~ \b[Ww][Ii][Pp]\b ]]; then
        print_error "WIP commits should not be pushed to shared branches"
        return 1
    fi
    
    return 0
}

# Get commits to validate
if [ $# -eq 0 ]; then
    # Validate commits since last merge with main
    BASE_BRANCH="origin/main"
    if ! git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
        BASE_BRANCH="main"
    fi
    
    COMMITS=$(git log --oneline "$BASE_BRANCH..HEAD" | cut -d' ' -f1)
    COMMIT_RANGE="$BASE_BRANCH..HEAD"
else
    # Validate specific commit range
    COMMIT_RANGE="$1"
    COMMITS=$(git log --oneline "$COMMIT_RANGE" | cut -d' ' -f1)
fi

if [ -z "$COMMITS" ]; then
    print_warning "No commits to validate"
    exit 0
fi

print_status "Validating commits in range: $COMMIT_RANGE"

# Track validation results
VALID_COMMITS=0
INVALID_COMMITS=0
TOTAL_COMMITS=$(echo "$COMMITS" | wc -l)

# Validate each commit
for commit_hash in $COMMITS; do
    commit_message=$(git log --format="%s" -n 1 "$commit_hash")
    
    if validate_commit_message "$commit_message" "$commit_hash" && check_commit_rules "$commit_message"; then
        ((VALID_COMMITS++))
    else
        ((INVALID_COMMITS++))
        print_error "Commit $commit_hash failed validation"
    fi
done

echo ""
print_status "Validation Summary:"
echo "Total commits: $TOTAL_COMMITS"
echo "Valid commits: $VALID_COMMITS"
echo "Invalid commits: $INVALID_COMMITS"

if [ $INVALID_COMMITS -gt 0 ]; then
    echo ""
    print_error "Semantic commit validation failed!"
    echo ""
    print_status "Please fix the invalid commits and try again."
    echo ""
    print_status "Commit format guidelines:"
    echo "  type(scope): description"
    echo ""
    print_status "Valid types:"
    echo "  feat:     New feature"
    echo "  fix:      Bug fix"
    echo "  docs:     Documentation only changes"
    echo "  style:    Code style changes (formatting, etc.)"
    echo "  refactor: Code refactoring"
    echo "  test:     Test additions or changes"
    echo "  chore:    Maintenance tasks"
    echo "  perf:     Performance improvements"
    echo "  security: Security fixes"
    echo "  build:    Build system changes"
    echo "  ci:       CI configuration changes"
    echo ""
    print_status "Valid scopes:"
    echo "  api:       Backend API changes"
    echo "  ui:        Frontend component changes"
    echo "  widget:    Trust widget changes"
    echo "  auth:      Authentication/authorization"
    echo "  payment:   Payment processing"
    echo "  infra:     Infrastructure/DevOps"
    echo "  docs:      Documentation"
    echo "  test:      Testing infrastructure"
    echo "  config:    Configuration changes"
    echo "  deploy:    Deployment changes"
    echo "  monitoring: Monitoring and observability"
    echo ""
    print_status "Examples:"
    echo "  feat(api): add customer authentication endpoint"
    echo "  fix(ui): resolve responsive layout issues on mobile"
    echo "  docs(api): update OpenAPI specification"
    echo "  test(widget): add unit tests for trust calculator"
    echo ""
    exit 1
else
    print_success "✅ All commits passed semantic validation!"
    echo ""
    print_status "Commit hygiene tips:"
    echo "  • Keep descriptions under 72 characters"
    echo "  • Use imperative mood (add, fix, update, not added, fixed, updated)"
    echo "  • Reference issues in commit body if needed"
    echo "  • BREAKING CHANGE: in footer for breaking changes"
    echo ""
    exit 0
fi

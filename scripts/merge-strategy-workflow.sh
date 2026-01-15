#!/bin/bash

# Merge Strategy Workflow for Vauntico
# Automates merge decisions based on PR characteristics

set -e

echo "🔄 Merge Strategy Workflow"
echo "========================"

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

# Get PR information
get_pr_info() {
    local branch_name="$1"
    
    # Get commit count
    COMMIT_COUNT=$(git rev-list --count HEAD~$COMMIT_COUNT..HEAD 2>/dev/null || echo "1")
    
    # Get files changed
    FILES_CHANGED=$(git diff --name-only HEAD~$COMMIT_COUNT..HEAD 2>/dev/null | wc -l || echo "1")
    
    # Get lines added/removed
    LINES_CHANGED=$(git diff --stat HEAD~$COMMIT_COUNT..HEAD 2>/dev/null | tail -1 | awk '{print $4}' | sed 's/[^0-9]//g' || echo "0")
    
    # Check if it's a hotfix branch
    if [[ "$branch_name" =~ ^hotfix/ ]]; then
        PR_TYPE="hotfix"
    elif [[ "$branch_name" =~ ^release/ ]]; then
        PR_TYPE="release"
    elif [[ "$branch_name" =~ ^feature/ ]]; then
        PR_TYPE="feature"
    else
        PR_TYPE="unknown"
    fi
    
    echo "$PR_TYPE:$COMMIT_COUNT:$FILES_CHANGED:$LINES_CHANGED"
}

# Determine merge strategy
determine_strategy() {
    local pr_info="$1"
    
    IFS=':' read -r pr_type commit_count files_changed lines_changed <<< "$pr_info"
    
    print_status "Analyzing PR characteristics:"
    echo "  Type: $pr_type"
    echo "  Commits: $commit_count"
    echo "  Files changed: $files_changed"
    echo "  Lines changed: $lines_changed"
    echo ""
    
    case "$pr_type" in
        "hotfix")
            print_status "🚨 Hotfix detected"
            echo "Strategy: Hotfix workflow"
            echo "Steps:"
            echo "  1. Merge to main immediately"
            echo "  2. Merge to develop"
            echo "  3. Delete hotfix branch"
            echo "  4. Tag release if needed"
            STRATEGY="hotfix"
            ;;
        "release")
            print_status "📦 Release branch detected"
            echo "Strategy: Release workflow"
            echo "Steps:"
            echo "  1. Complete final testing"
            echo "  2. Merge to main with --no-ff"
            echo "  3. Tag release"
            echo "  4. Merge back to develop"
            echo "  5. Delete release branch"
            STRATEGY="release"
            ;;
        "feature")
            # Analyze size and complexity
            if [ "$files_changed" -le 3 ] && [ "$lines_changed" -le 50 ]; then
                print_status "🔧 Small feature detected"
                echo "Strategy: Squash merge"
                echo "Reason: Small, focused change"
                STRATEGY="squash"
            elif [ "$commit_count" -eq 1 ] && [ "$files_changed" -le 5 ]; then
                print_status "📝 Single-commit feature"
                echo "Strategy: Squash merge"
                echo "Reason: Single logical change"
                STRATEGY="squash"
            else
                print_status "🚀 Complex feature detected"
                echo "Strategy: Rebase merge"
                echo "Reason: Multiple commits or complex changes"
                STRATEGY="rebase"
            fi
            ;;
        *)
            print_warning "⚠️ Unknown branch type"
            echo "Defaulting to rebase merge"
            STRATEGY="rebase"
            ;;
    esac
    
    echo ""
}

# Execute merge strategy
execute_merge() {
    local strategy="$1"
    local branch_name="$2"
    local target_branch="${3:-main}"
    
    print_status "🔄 Executing $strategy merge to $target_branch"
    
    case "$strategy" in
        "hotfix")
            # Hotfix workflow
            print_status "Merging hotfix to main..."
            git checkout "$target_branch"
            git pull origin "$target_branch"
            git merge --no-ff "$branch_name" -m "hotfix: $(git log --format=%s -n 1 $branch_name)"
            git push origin "$target_branch"
            
            # Tag if environment variable set
            if [ -n "$HOTFIX_VERSION" ]; then
                git tag -a "$HOTFIX_VERSION" -m "Hotfix release $HOTFIX_VERSION"
                git push origin "$HOTFIX_VERSION"
            fi
            
            # Merge to develop if it exists
            if git rev-parse --verify origin/develop >/dev/null 2>&1; then
                print_status "Merging hotfix to develop..."
                git checkout develop
                git pull origin develop
                git merge --no-ff "$branch_name" -m "hotfix: $(git log --format=%s -n 1 $branch_name)"
                git push origin develop
            fi
            
            # Delete hotfix branch
            git branch -d "$branch_name"
            git push origin --delete "$branch_name"
            ;;
            
        "release")
            # Release workflow
            print_status "Completing release workflow..."
            git checkout "$target_branch"
            git pull origin "$target_branch"
            git merge --no-ff "$branch_name" -m "release: $(git basename $branch_name)"
            git push origin "$target_branch"
            
            # Tag release
            RELEASE_VERSION=$(basename "$branch_name")
            git tag -a "$RELEASE_VERSION" -m "Release $RELEASE_VERSION"
            git push origin "$RELEASE_VERSION"
            
            # Merge back to develop
            if git rev-parse --verify origin/develop >/dev/null 2>&1; then
                print_status "Merging release back to develop..."
                git checkout develop
                git pull origin develop
                git merge --no-ff "$target_branch" -m "merge: release $RELEASE_VERSION to develop"
                git push origin develop
            fi
            
            # Delete release branch
            git branch -d "$branch_name"
            git push origin --delete "$branch_name"
            ;;
            
        "squash")
            # Squash merge (typically done via GitHub UI)
            print_status "Ready for squash merge via GitHub UI"
            print_warning "Please use 'Squash and merge' in GitHub"
            echo "Recommended commit message:"
            echo "  $(git log --format=%s -n 1 $branch_name)"
            ;;
            
        "rebase")
            # Rebase merge (typically done via GitHub UI)
            print_status "Ready for rebase merge via GitHub UI"
            print_warning "Please use 'Rebase and merge' in GitHub"
            echo "This will preserve individual commits"
            ;;
    esac
}

# Post-merge validation
post_merge_validation() {
    local strategy="$1"
    
    print_status "🔍 Running post-merge validation..."
    
    # Check CI/CD status
    print_status "Checking CI/CD pipeline status..."
    if command -v gh >/dev/null 2>&1; then
        gh run list --branch main --limit 3
    else
        print_warning "GitHub CLI not found, skipping CI/CD status check"
    fi
    
    # Check deployment status
    print_status "Verifying deployment health..."
    if curl -f https://api.vauntico.com/health >/dev/null 2>&1; then
        print_success "✅ API health check passed"
    else
        print_warning "⚠️ API health check failed"
    fi
    
    # Check sacred features
    print_status "Validating sacred features..."
    if curl -f https://api.vauntico.com/api/sacred/health >/dev/null 2>&1; then
        print_success "✅ Sacred features healthy"
    else
        print_warning "⚠️ Sacred features health check failed"
    fi
    
    print_success "✅ Post-merge validation complete"
}

# Main execution
main() {
    local branch_name="${1:-$(git branch --show-current)}"
    local target_branch="${2:-main}"
    
    print_status "🔄 Merge Strategy Analysis for: $branch_name → $target_branch"
    echo ""
    
    # Get PR info and determine strategy
    pr_info=$(get_pr_info "$branch_name")
    determine_strategy "$pr_info"
    
    # Execute merge if requested
    if [ "$3" = "--execute" ]; then
        execute_merge "$STRATEGY" "$branch_name" "$target_branch"
        post_merge_validation "$STRATEGY"
    else
        print_status "💡 To execute this merge strategy, run:"
        echo "  $0 $branch_name $target_branch --execute"
        echo ""
        print_status "📋 Merge Strategy Summary:"
        echo "  Strategy: $STRATEGY"
        echo "  Target: $target_branch"
        echo "  Source: $branch_name"
    fi
}

# Help function
show_help() {
    echo "Merge Strategy Workflow for Vauntico"
    echo ""
    echo "Usage:"
    echo "  $0 [branch] [target] [--execute]"
    echo ""
    echo "Arguments:"
    echo "  branch    Source branch name (default: current branch)"
    echo "  target    Target branch name (default: main)"
    echo "  --execute Execute the merge strategy"
    echo ""
    echo "Examples:"
    echo "  $0 feature/auth                 # Analyze feature branch"
    echo "  $0 hotfix/critical-bug main --execute  # Execute hotfix merge"
    echo "  $0 release/v1.2.0 main --execute     # Execute release merge"
    echo ""
    echo "Merge Strategies:"
    echo "  squash    - For small, focused changes"
    echo "  rebase    - For complex features with multiple commits"
    echo "  hotfix    - For emergency production fixes"
    echo "  release   - For release branches"
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"

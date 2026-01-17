#!/bin/bash

# Rollback Script for Failed Vauntico SDK Releases
# This script handles rollback procedures for failed npm and PyPI releases

set -euo pipefail

# Configuration
ROLLBACK_VERSION="${ROLLBACK_VERSION:-}"
ROLLBACK_REASON="${ROLLBACK_REASON:-Failed release}"
DRY_RUN="${DRY_RUN:-false}"
SKIP_GITHUB="${SKIP_GITHUB:-false}"
SKIP_NPM="${SKIP_NPM:-false}"
SKIP_PYPI="${SKIP_PYPI:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_dry() {
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} $1"
    else
        echo "$1"
    fi
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v pip &> /dev/null; then
        missing_deps+=("pip")
    fi
    
    if ! command -v gh &> /dev/null; then
        missing_deps+=("gh")
    fi
    
    if ! command -v twine &> /dev/null; then
        missing_deps+=("twine")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install: npm install -g npm pip install twine gh"
        exit 1
    fi
    
    log_success "All dependencies available"
}

# Get version information
get_version_info() {
    if [ -z "$ROLLBACK_VERSION" ]; then
        log_info "No version specified, getting latest version..."
        
        # Try to get from package.json
        if [ -f "sdk/typescript/package.json" ]; then
            ROLLBACK_VERSION=$(node -p "console.log(require('./sdk/typescript/package.json').version)" 2>/dev/null)
        fi
        
        # Fallback to git tag
        if [ -z "$ROLLBACK_VERSION" ]; then
            ROLLBACK_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
        fi
    fi
    
    if [ -z "$ROLLBACK_VERSION" ]; then
        log_error "Could not determine version to rollback"
        exit 1
    fi
    
    log_info "Rolling back version: $ROLLBACK_VERSION"
}

# Rollback npm package
rollback_npm() {
    if [ "$SKIP_NPM" = "true" ]; then
        log_warning "Skipping npm rollback as requested"
        return 0
    fi
    
    log_info "Rolling back npm package..."
    
    # Check if package exists
    if ! npm view @vauntico/sdk@$ROLLBACK_VERSION &> /dev/null; then
        log_warning "npm package @vauntico/sdk@$ROLLBACK_VERSION not found"
        return 0
    fi
    
    if [ "$DRY_RUN" = "false" ]; then
        # Unpublish the version
        log_dry "npm unpublish @vauntico/sdk@$ROLLBACK_VERSION --force"
        npm unpublish @vauntico/sdk@$ROLLBACK_VERSION --force
        
        if [ $? -eq 0 ]; then
            log_success "npm package unpublished successfully"
        else
            log_error "Failed to unpublish npm package"
            return 1
        fi
    else
        log_dry "Would unpublish: npm unpublish @vauntico/sdk@$ROLLBACK_VERSION --force"
    fi
}

# Rollback PyPI package
rollback_pypi() {
    if [ "$SKIP_PYPI" = "true" ]; then
        log_warning "Skipping PyPI rollback as requested"
        return 0
    fi
    
    log_info "Rolling back PyPI package..."
    
    # Check if package exists
    if ! pip show vauntico-sdk==$ROLLBACK_VERSION &> /dev/null; then
        log_warning "PyPI package vauntico-sdk==$ROLLBACK_VERSION not found"
        return 0
    fi
    
    if [ "$DRY_RUN" = "false" ]; then
        # Yank the version
        log_dry "twine yank vauntico-sdk==$ROLLBACK_VERSION --repository pypi"
        twine yank vauntico-sdk==$ROLLBACK_VERSION --repository pypi
        
        if [ $? -eq 0 ]; then
            log_success "PyPI package yanked successfully"
        else
            log_error "Failed to yank PyPI package"
            return 1
        fi
    else
        log_dry "Would yank: twine yank vauntico-sdk==$ROLLBACK_VERSION --repository pypi"
    fi
}

# Rollback GitHub release
rollback_github() {
    if [ "$SKIP_GITHUB" = "true" ]; then
        log_warning "Skipping GitHub rollback as requested"
        return 0
    fi
    
    log_info "Rolling back GitHub release..."
    
    # Check if release exists
    RELEASE_TAG="v$ROLLBACK_VERSION"
    
    if ! gh release view $RELEASE_TAG &> /dev/null; then
        log_warning "GitHub release $RELEASE_TAG not found"
        return 0
    fi
    
    if [ "$DRY_RUN" = "false" ]; then
        # Delete the release
        log_dry "gh release delete $RELEASE_TAG"
        gh release delete $RELEASE_TAG
        
        if [ $? -eq 0 ]; then
            log_success "GitHub release deleted successfully"
        else
            log_error "Failed to delete GitHub release"
            return 1
        fi
        
        # Delete the tag
        log_dry "git tag -d $RELEASE_TAG"
        git tag -d $RELEASE_TAG
        
        log_dry "git push origin :refs/tags/$RELEASE_TAG"
        git push origin :refs/tags/$RELEASE_TAG
        
        if [ $? -eq 0 ]; then
            log_success "Git tag deleted successfully"
        else
            log_error "Failed to delete git tag"
            return 1
        fi
    else
        log_dry "Would delete: gh release delete $RELEASE_TAG"
        log_dry "Would delete: git tag -d $RELEASE_TAG && git push origin :refs/tags/$RELEASE_TAG"
    fi
}

# Rollback GitHub Packages
rollback_github_packages() {
    if [ "$SKIP_GITHUB" = "true" ]; then
        log_warning "Skipping GitHub Packages rollback as requested"
        return 0
    fi
    
    log_info "Rolling back GitHub Packages..."
    
    if [ "$DRY_RUN" = "false" ]; then
        # Delete from GitHub Packages
        log_dry "gh api --method DELETE /packages/npm/@vauntico/sdk/$ROLLBACK_VERSION"
        RESPONSE=$(gh api --method DELETE /packages/npm/@vauntico/sdk/$ROLLBACK_VERSION 2>/dev/null || echo "")
        
        if echo "$RESPONSE" | grep -q '"message": "Package deleted successfully"'; then
            log_success "GitHub Packages package deleted successfully"
        else
            log_error "Failed to delete from GitHub Packages"
            return 1
        fi
    else
        log_dry "Would delete: gh api --method DELETE /packages/npm/@vauntico/sdk/$ROLLBACK_VERSION"
    fi
}

# Create rollback report
create_rollback_report() {
    local report_file="rollback-report-$ROLLBACK_VERSION-$(date +%Y%m%d-%H%M%S).md"
    
    log_info "Creating rollback report: $report_file"
    
    cat > "$report_file" << EOF
    # Rollback Report - Version $ROLLBACK_VERSION
    
    **Rollback Date**: $(date)
    **Reason**: $ROLLBACK_REASON
    **Mode**: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "EXECUTE")
    
    ## Actions Performed
    
    $([ "$SKIP_NPM" != "true" ] && echo "- npm rollback: $([ "$DRY_RUN" = "true" ] && echo "Would unpublish" || echo "Executed")")")
    $([ "$SKIP_PYPI" != "true" ] && echo "- PyPI rollback: $([ "$DRY_RUN" = "true" ] && echo "Would yank" || echo "Executed")")")
    $([ "$SKIP_GITHUB" != "true" ] && echo "- GitHub release rollback: $([ "$DRY_RUN" = "true" ] && echo "Would delete" || echo "Executed")")")
    $([ "$SKIP_GITHUB" != "true" ] && echo "- GitHub Packages rollback: $([ "$DRY_RUN" = "true" ] && echo "Would delete" || echo "Executed")")")
    
    ## Verification Status
    
    EOF
    
    log_success "Rollback report created: $report_file"
}

# Send notification
send_notification() {
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        log_info "Sending Slack notification..."
        
        local color="good"
        if [ "$DRY_RUN" = "false" ]; then
            color="warning"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"🔄 Vauntico SDK Rollback\",
                    \"text\": \"Version $ROLLBACK_VERSION rollback $([ "$DRY_RUN" = "true" ] && echo "simulated" || echo "executed")\",
                    \"fields\": [
                        {\"title\": \"Version\", \"value\": \"$ROLLBACK_VERSION\", \"short\": true},
                        {\"title\": \"Reason\", \"value\": \"$ROLLBACK_REASON\", \"short\": true}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK" 2>/dev/null || log_warning "Failed to send Slack notification"
    fi
}

# Main execution
main() {
    log_info "Starting Vauntico SDK rollback procedures..."
    
    check_dependencies
    get_version_info
    
    # Create rollback plan
    log_info "Rollback plan:"
    log_info "- Version: $ROLLBACK_VERSION"
    log_info "- Reason: $ROLLBACK_REASON"
    log_info "- Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "EXECUTE")"
    log_info "- Skip npm: $SKIP_NPM"
    log_info "- Skip PyPI: $SKIP_PYPI"
    log_info "- Skip GitHub: $SKIP_GITHUB"
    echo ""
    
    # Execute rollbacks
    local rollback_failed=false
    
    if ! rollback_npm; then
        rollback_failed=true
    fi
    
    if ! rollback_pypi; then
        rollback_failed=true
    fi
    
    if ! rollback_github; then
        rollback_failed=true
    fi
    
    if ! rollback_github_packages; then
        rollback_failed=true
    fi
    
    # Create report
    create_rollback_report
    
    # Send notification
    send_notification
    
    # Final status
    if [ "$rollback_failed" = "true" ] && [ "$DRY_RUN" = "false" ]; then
        log_error "Rollback completed with errors"
        exit 1
    else
        log_success "Rollback completed successfully"
        exit 0
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --version VERSION    Version to rollback"
    echo "  --reason REASON     Rollback reason"
    echo "  --dry-run           Simulate rollback without executing"
    echo "  --skip-npm          Skip npm rollback"
    echo "  --skip-pypi         Skip PyPI rollback"
    echo "  --skip-github       Skip GitHub rollback"
    echo "  --help              Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SLACK_WEBHOOK       Slack webhook URL for notifications"
    echo ""
    echo "Examples:"
    echo "  # Rollback specific version"
    echo "  $0 --version 1.0.0 --reason 'Failed release'"
    echo ""
    echo "  # Dry run"
    echo "  $0 --version 1.0.0 --dry-run"
    echo ""
    echo "  # Skip npm"
    echo "  $0 --version 1.0.0 --skip-npm"
    echo ""
    echo "  # Complete rollback"
    echo "  SLACK_WEBHOOK=https://hooks.slack.com/... $0 --version 1.0.0 --reason 'Critical failure'"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            ROLLBACK_VERSION="$2"
            shift 2
            ;;
        --reason)
            ROLLBACK_REASON="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --skip-npm)
            SKIP_NPM="true"
            shift
            ;;
        --skip-pypi)
            SKIP_PYPI="true"
            shift
            ;;
        --skip-github)
            SKIP_GITHUB="true"
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
    shift
done

main

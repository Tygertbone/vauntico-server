#!/bin/bash

# ============================================================================
# Vauntico MVP - Railway Cleanup Script
# ============================================================================
# This script removes all Railway configurations and artifacts
# as part of the migration to OCI infrastructure
#
# This will permanently remove:
# - All railway.toml files
# - Railway-specific scripts
# - Railway documentation
# - Railway deployment configurations
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Dry run mode (set to false to actually delete files)
DRY_RUN="${DRY_RUN:-true}"

# Files and directories to remove
RAILWAY_FILES=(
    "railway.toml"
    "railway.json"
    ".railwayignore"
    "railpack-plan.json"
    "RAILWAY_MULTI_SERVICE_GUIDE.md"
    "RAILWAY_TO_VPS_MIGRATION.md"
    "VAUNTICO_SERVER_V2_DEPLOYMENT_SUMMARY.md"
)

RAILWAY_SCRIPTS=(
    "scripts/railway-deploy-all.sh"
    "scripts/railway-deploy-all.ps1"
    "scripts/railway-deploy-simple.ps1"
    "scripts/railway-create-and-deploy.ps1"
    "scripts/railway-smoke-test.sh"
    "scripts/railway-smoke-test.ps1"
    "scripts/railway-health-test.ps1"
    "scripts/railway-health-test-v2.ps1"
    "scripts/railway-backend-health-test.ps1"
    "scripts/validate-railway-multi-service.sh"
    "scripts/migrate-to-railway.sh"
)

RAILWAY_SERVICE_CONFIGS=(
    "server-v2/railway.toml"
    "src/railway.toml"
    "homepage-redesign/railway.toml"
    "vault-landing/railway.toml"
    "vauntico-fulfillment-engine/railway.toml"
    "vauntico-server/railway.toml"
)

RAILWAY_DOCS=(
    "docs/archive/railway"
    "docs/archive/railway/RAILWAY_DEPLOYMENT_CHECKLIST_FINAL.md"
    "docs/archive/railway/RAILWAY_DEPLOYMENT_SUMMARY.md"
    "docs/archive/railway/VAUNTICO_SERVER_V2_DEPLOYMENT_SUMMARY.md"
    "docs/archive/railway/RAILWAY_DEPLOYMENT_MANUAL_GUIDE.md"
    "docs/archive/railway/RAILWAY_DEPLOYMENT_CHECKLIST.md"
    "docs/archive/railway/RAILWAY_DEPLOYMENT_GUIDE.md"
    "docs/archive/railway/railway-deploy-all.sh"
    "docs/archive/railway/railway-deploy-simple.ps1"
    "docs/archive/railway/railway-create-and-deploy.ps1"
)

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Confirm cleanup
confirm_cleanup() {
    log "🚨 RAILWAY CLEANUP CONFIRMATION 🚨"
    echo ""
    echo "This script will permanently remove ALL Railway-related files and configurations."
    echo "This action cannot be undone!"
    echo ""
    echo "Files to be removed:"
    echo "  - All railway.toml configuration files"
    echo "  - Railway deployment scripts"
    echo "  - Railway documentation"
    echo "  - Railway-specific configurations"
    echo ""
    echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN (no files will be deleted)" || echo "LIVE DELETION")"
    echo ""
    
    if [[ "$DRY_RUN" = "true" ]]; then
        read -p "Type 'DELETE RAILWAY' to confirm dry run simulation: " confirm
    else
        read -p "Type 'DELETE RAILWAY' to confirm permanent deletion: " confirm
    fi
    
    if [[ "$confirm" != "DELETE RAILWAY" ]]; then
        error "Cleanup cancelled by user"
    fi
    
    success "Cleanup confirmed"
}

# Remove file or directory
remove_item() {
    local item="$1"
    
    if [[ -e "$item" ]]; then
        if [[ "$DRY_RUN" = "true" ]]; then
            warning "[DRY RUN] Would remove: $item"
        else
            if [[ -d "$item" ]]; then
                rm -rf "$item"
                log "Removed directory: $item"
            else
                rm -f "$item"
                log "Removed file: $item"
            fi
        fi
    else
        log "Item not found: $item"
    fi
}

# Remove Railway files
remove_railway_files() {
    log "Removing Railway configuration files..."
    
    for file in "${RAILWAY_FILES[@]}"; do
        remove_item "$file"
    done
    
    success "Railway configuration files processed"
}

# Remove Railway scripts
remove_railway_scripts() {
    log "Removing Railway deployment scripts..."
    
    for script in "${RAILWAY_SCRIPTS[@]}"; do
        remove_item "$script"
    done
    
    success "Railway scripts processed"
}

# Remove Railway service configurations
remove_railway_service_configs() {
    log "Removing Railway service configurations..."
    
    for config in "${RAILWAY_SERVICE_CONFIGS[@]}"; do
        remove_item "$config"
    done
    
    success "Railway service configurations processed"
}

# Remove Railway documentation
remove_railway_docs() {
    log "Removing Railway documentation..."
    
    for doc in "${RAILWAY_DOCS[@]}"; do
        remove_item "$doc"
    done
    
    success "Railway documentation processed"
}

# Clean up git history references
cleanup_git_references() {
    log "Cleaning up git references to Railway files..."
    
    if [[ "$DRY_RUN" = "false" ]]; then
        # Remove files from git tracking if they exist
        for file in "${RAILWAY_FILES[@]}" "${RAILWAY_SCRIPTS[@]}" "${RAILWAY_SERVICE_CONFIGS[@]}"; do
            if [[ -e "$file" ]]; then
                git rm -f "$file" 2>/dev/null || true
            fi
        done
        
        # Remove directories from git tracking if they exist
        for dir in "${RAILWAY_DOCS[@]}"; do
            if [[ -d "$dir" ]]; then
                git rm -rf "$dir" 2>/dev/null || true
            fi
        done
    else
        warning "[DRY RUN] Would remove Railway files from git tracking"
    fi
    
    success "Git references cleaned up"
}

# Update remaining files to remove Railway references
update_file_references() {
    log "Updating files to remove Railway references..."
    
    if [[ "$DRY_RUN" = "false" ]]; then
        # Update README.md
        if [[ -f "README.md" ]]; then
            log "Updating README.md..."
            sed -i '/Railway/d' README.md
            sed -i '/railway/d' README.md
            sed -i '/RAILWAY/d' README.md
        fi
        
        # Update package.json if it contains Railway references
        if [[ -f "package.json" ]]; then
            log "Checking package.json for Railway references..."
            if grep -q "railway" package.json; then
                warning "Found Railway references in package.json - manual review may be needed"
            fi
        fi
        
        # Update .gitignore
        if [[ -f ".gitignore" ]]; then
            log "Updating .gitignore..."
            sed -i '/railway/d' .gitignore
            sed -i '/Railway/d' .gitignore
        fi
    else
        warning "[DRY RUN] Would update README.md, package.json, and .gitignore to remove Railway references"
    fi
    
    success "File references updated"
}

# Generate cleanup report
generate_report() {
    log "Generating cleanup report..."
    
    REPORT_FILE="railway-cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
 ============================================================================
 Vauntico MVP - Railway Cleanup Report
 ============================================================================
 Generated on: $(date)
 Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE DELETION")
 
 REMOVED FILES:
 ---------------
 EOF

    for file in "${RAILWAY_FILES[@]}" "${RAILWAY_SCRIPTS[@]}" "${RAILWAY_SERVICE_CONFIGS[@]}"; do
        if [[ -e "$file" ]]; then
            echo "- $file" >> "$REPORT_FILE"
        fi
    done
    
    cat >> "$REPORT_FILE" << EOF

 REMOVED DIRECTORIES:
 --------------------
 EOF

    for dir in "${RAILWAY_DOCS[@]}"; do
        if [[ -d "$dir" ]]; then
            echo "- $dir" >> "$REPORT_FILE"
        fi
    done
    
    cat >> "$REPORT_FILE" << EOF

 CLEANUP ACTIONS:
 ----------------
 - Removed Railway configuration files
 - Removed Railway deployment scripts
 - Removed Railway service configurations
 - Removed Railway documentation
 - Cleaned up git references
 - Updated file references
 
 NEXT STEPS:
 ------------
 1. Commit the changes to git
 2. Verify all Railway references are removed
 3. Update deployment documentation
 4. Update team onboarding guides
 5. Test OCI deployment process
 
 ROLLBACK INFORMATION:
 --------------------
 If you need to restore any files, they can be recovered from git history:
   git log --name-only --grep="railway" --oneline
   git checkout <commit-hash> -- <file-to-restore>
 ============================================================================
EOF
    
    success "Cleanup report saved to: $REPORT_FILE"
}

# Create migration confirmation file
create_migration_confirmation() {
    if [[ "$DRY_RUN" = "false" ]]; then
        log "Creating migration confirmation file..."
        
        cat > "RAILWAY_TO_OCI_MIGRATION_COMPLETE.md" << EOF
# Railway to OCI Migration Complete

## Migration Details
- **Date**: $(date)
- **Status**: Complete
- **Previous Infrastructure**: Railway
- **New Infrastructure**: Oracle Cloud Infrastructure (OCI)

## Changes Made
- ✅ Removed all Railway configuration files
- ✅ Removed Railway deployment scripts
- ✅ Removed Railway documentation
- ✅ Updated service configurations for OCI
- ✅ Updated monitoring for OCI endpoints
- ✅ Created OCI deployment workflows

## New Infrastructure
- **Backend Services**: OCI Compute with Docker Compose
- **Load Balancer**: OCI Load Balancer
- **Monitoring**: Prometheus/Grafana on OCI
- **Database**: OCI Autonomous Database
- **Container Registry**: OCI Container Registry

## Service Endpoints
- **server-v2**: https://api.vauntico.com/server-v2
- **fulfillment-engine**: https://api.vauntico.com/fulfillment-engine
- **vault-landing**: https://api.vauntico.com/vault-landing
- **Frontend**: https://vauntico.com (Vercel - unchanged)

## Deployment Process
1. Use \`scripts/oci-deploy-all.sh\` for manual deployments
2. Use GitHub Actions workflow "OCI Deployment" for automated deployments
3. Monitoring is configured for OCI endpoints
4. Health checks are updated for new infrastructure

## Next Steps
1. Update DNS records to point to OCI Load Balancer
2. Configure SSL certificates
3. Test all service endpoints
4. Update team documentation
5. Archive old Railway projects

## Support
For issues with the new OCI infrastructure, refer to:
- \`docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md\`
- \`docs/OCI_QUICK_REFERENCE.md\`
- \`scripts/oci-deploy-all.sh\`

---
**Migration completed successfully! 🎉**
EOF
        
        success "Migration confirmation file created: RAILWAY_TO_OCI_MIGRATION_COMPLETE.md"
    fi
}

# Main execution
main() {
    log "Starting Railway cleanup process..."
    echo ""
    
    confirm_cleanup
    remove_railway_files
    remove_railway_scripts
    remove_railway_service_configs
    remove_railway_docs
    cleanup_git_references
    update_file_references
    generate_report
    create_migration_confirmation
    
    if [[ "$DRY_RUN" = "true" ]]; then
        success "🔍 Railway cleanup dry run completed!"
        echo ""
        log "To perform actual deletion, run:"
        echo "  DRY_RUN=false ./scripts/cleanup-railway.sh"
    else
        success "🗑️ Railway cleanup completed successfully!"
        echo ""
        log "Next steps:"
        echo "  1. Commit the changes to git"
        echo "  2. Review the cleanup report"
        echo "  3. Test OCI deployment process"
        echo "  4. Update team documentation"
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Infrastructure Verification Script
# ============================================================================
# This script verifies that your OCI infrastructure is up and running properly
# including compute instances, databases, network components, vaults, and monitoring
#
# Prerequisites:
# - OCI CLI installed and configured
# - Valid OCI credentials with appropriate permissions
# - Compartment OCID for Vauntico-MVP
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration variables
COMPARTMENT_ID=""
OUTPUT_FILE=""
VERBOSE=false
FAIL_ON_WARNING=false

# Status counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    ((FAILED_CHECKS++))
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
    ((PASSED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    ((WARNING_CHECKS++))
    if [[ "$FAIL_ON_WARNING" == "true" ]]; then
        ((FAILED_CHECKS++))
    fi
}

info() {
    echo -e "${CYAN}[INFO] $1${NC}"
}

# Increment total checks counter
increment_check() {
    ((TOTAL_CHECKS++))
}

# Check if OCI CLI is installed and configured
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v oci &> /dev/null; then
        error "OCI CLI is not installed. Please install it first: https://docs.oracle.com/en/learn/getting-started-cli/"
        return 1
    fi
    
    # Check if OCI is configured
    if ! oci iam compartment list --max-items 1 &> /dev/null; then
        error "OCI CLI is not configured. Please run 'oci setup config' first."
        return 1
    fi
    
    success "Prerequisites check passed"
    return 0
}

# Get user input for compartment ID
get_user_input() {
    if [[ -z "$COMPARTMENT_ID" ]]; then
        echo "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        
        read -p "Enter your Vauntico-MVP Compartment OCID: " COMPARTMENT_ID
        
        if [[ -z "$COMPARTMENT_ID" ]]; then
            error "Compartment ID is required"
            exit 1
        fi
    fi
    
    # Validate compartment ID format
    if [[ ! "$COMPARTMENT_ID" =~ ^ocid1\.compartment\. ]]; then
        error "Invalid compartment ID format. Expected format: ocid1.compartment.oc1..."
        exit 1
    fi
    
    # Set output file if not specified
    if [[ -z "$OUTPUT_FILE" ]]; then
        OUTPUT_FILE="oci-infrastructure-verification-$(date +%Y%m%d-%H%M%S).txt"
    fi
    
    success "Using compartment: $COMPARTMENT_ID"
}

# Check Compute Instances Status
check_compute_instances() {
    log "Checking Compute Instances Status..."
    increment_check
    
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci compute instance list --compartment-id $COMPARTMENT_ID --query \"data[].{Name:\\\"display-name\\\", State:\\\"lifecycle-state\\\"}\""
    fi
    
    COMPUTE_OUTPUT=$(oci compute instance list --compartment-id "$COMPARTMENT_ID" --query "data[].{Name:\"display-name\", State:\"lifecycle-state\"}" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list compute instances: $COMPUTE_OUTPUT"
        return 1
    fi
    
    if [[ "$COMPUTE_OUTPUT" == "[]" ]]; then
        warning "No compute instances found in compartment"
        return 0
    fi
    
    echo "$COMPUTE_OUTPUT" | jq -r '.[] | "Instance: \(.Name) - State: \(.State)"' | while read -r line; do
        increment_check
        if echo "$line" | grep -q "State: RUNNING"; then
            success "$line"
        elif echo "$line" | grep -q "State: STARTING\|State: STOPPING\|State: PROVISIONING"; then
            warning "$line (transitioning)"
        else
            error "$line (not running)"
        fi
    done
}

# Check Autonomous Database Status
check_autonomous_databases() {
    log "Checking Autonomous Database Status..."
    increment_check
    
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci db autonomous-database list --compartment-id $COMPARTMENT_ID --query \"data[].{Name:\\\"display-name\\\", State:\\\"lifecycle-state\\\"}\""
    fi
    
    DB_OUTPUT=$(oci db autonomous-database list --compartment-id "$COMPARTMENT_ID" --query "data[].{Name:\"display-name\", State:\"lifecycle-state\"}" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list autonomous databases: $DB_OUTPUT"
        return 1
    fi
    
    if [[ "$DB_OUTPUT" == "[]" ]]; then
        warning "No autonomous databases found in compartment"
        return 0
    fi
    
    echo "$DB_OUTPUT" | jq -r '.[] | "Database: \(.Name) - State: \(.State)"' | while read -r line; do
        increment_check
        if echo "$line" | grep -q "State: AVAILABLE"; then
            success "$line"
        elif echo "$line" | grep -q "State: UPDATING\|State: PROVISIONING\|State: STARTING\|State: STOPPING"; then
            warning "$line (transitioning)"
        else
            error "$line (not available)"
        fi
    done
}

# Check Network Components (VCNs and Subnets)
check_network_components() {
    log "Checking Network Components..."
    
    # Check VCNs
    increment_check
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci network vcn list --compartment-id $COMPARTMENT_ID"
    fi
    
    VCN_OUTPUT=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list VCNs: $VCN_OUTPUT"
        return 1
    fi
    
    if [[ "$VCN_OUTPUT" == "[]" ]]; then
        warning "No VCNs found in compartment"
    else
        success "VCNs found:"
        echo "$VCN_OUTPUT" | jq -r '.[] | "  VCN: \(.\"display-name\") - CIDR: \(.\"cidr-block\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
    
    # Check Subnets
    increment_check
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci network subnet list --compartment-id $COMPARTMENT_ID"
    fi
    
    SUBNET_OUTPUT=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list subnets: $SUBNET_OUTPUT"
        return 1
    fi
    
    if [[ "$SUBNET_OUTPUT" == "[]" ]]; then
        warning "No subnets found in compartment"
    else
        success "Subnets found:"
        echo "$SUBNET_OUTPUT" | jq -r '.[] | "  Subnet: \(.\"display-name\") - CIDR: \(.\"cidr-block\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Check Vault and Secrets
check_vault_and_secrets() {
    log "Checking Vault and Secrets..."
    
    # Check Vaults
    increment_check
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci kms vault list --compartment-id $COMPARTMENT_ID"
    fi
    
    VAULT_OUTPUT=$(oci kms vault list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list vaults: $VAULT_OUTPUT"
        return 1
    fi
    
    if [[ "$VAULT_OUTPUT" == "[]" ]]; then
        warning "No vaults found in compartment"
    else
        success "Vaults found:"
        echo "$VAULT_OUTPUT" | jq -r '.[] | "  Vault: \(.\"display-name\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
    
    # Check Secrets
    increment_check
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci secrets secret list --compartment-id $COMPARTMENT_ID"
    fi
    
    SECRETS_OUTPUT=$(oci secrets secret list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list secrets: $SECRETS_OUTPUT"
        return 1
    fi
    
    if [[ "$SECRETS_OUTPUT" == "[]" ]]; then
        warning "No secrets found in compartment"
    else
        success "Secrets found:"
        echo "$SECRETS_OUTPUT" | jq -r '.[] | "  Secret: \(.\"secret-name\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Check Monitoring and Alerts
check_monitoring_and_alerts() {
    log "Checking Monitoring and Alerts..."
    
    increment_check
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci monitoring alarm list --compartment-id $COMPARTMENT_ID"
    fi
    
    ALARM_OUTPUT=$(oci monitoring alarm list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list alarms: $ALARM_OUTPUT"
        return 1
    fi
    
    if [[ "$ALARM_OUTPUT" == "[]" ]]; then
        warning "No alarms found in compartment"
    else
        success "Alarms found:"
        echo "$ALARM_OUTPUT" | jq -r '.[] | "  Alarm: \(.\"display-name\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Check Load Balancers
check_load_balancers() {
    log "Checking Load Balancers..."
    increment_check
    
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci lb load-balancer list --compartment-id $COMPARTMENT_ID"
    fi
    
    LB_OUTPUT=$(oci lb load-balancer list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list load balancers: $LB_OUTPUT"
        return 1
    fi
    
    if [[ "$LB_OUTPUT" == "[]" ]]; then
        warning "No load balancers found in compartment"
    else
        success "Load balancers found:"
        echo "$LB_OUTPUT" | jq -r '.[] | "  Load Balancer: \(.\"display-name\") - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Check Block Storage
check_block_storage() {
    log "Checking Block Storage..."
    increment_check
    
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci bv volume list --compartment-id $COMPARTMENT_ID"
    fi
    
    VOLUME_OUTPUT=$(oci bv volume list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list block volumes: $VOLUME_OUTPUT"
        return 1
    fi
    
    if [[ "$VOLUME_OUTPUT" == "[]" ]]; then
        warning "No block volumes found in compartment"
    else
        success "Block volumes found:"
        echo "$VOLUME_OUTPUT" | jq -r '.[] | "  Volume: \(.\"display-name\") - Size: \(.\"size-in-gbs\")GB - State: \(.\"lifecycle-state\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Check Object Storage Buckets
check_object_storage() {
    log "Checking Object Storage..."
    increment_check
    
    if [[ "$VERBOSE" == "true" ]]; then
        info "Running: oci os bucket list --compartment-id $COMPARTMENT_ID"
    fi
    
    BUCKET_OUTPUT=$(oci os bucket list --compartment-id "$COMPARTMENT_ID" --output json 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to list object storage buckets: $BUCKET_OUTPUT"
        return 1
    fi
    
    if [[ "$BUCKET_OUTPUT" == "[]" ]]; then
        warning "No object storage buckets found in compartment"
    else
        success "Object storage buckets found:"
        echo "$BUCKET_OUTPUT" | jq -r '.[] | "  Bucket: \(.\"name\") - Created: \(.\"time-created\")"' | while read -r line; do
            echo "$line"
        done
    fi
}

# Generate comprehensive report
generate_report() {
    log "Generating verification report..."
    
    REPORT_FILE="$OUTPUT_FILE"
    
    cat > "$REPORT_FILE" << EOF
 ============================================================================
 Vauntico MVP - OCI Infrastructure Verification Report
 ============================================================================
 Verification Date: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 VERIFICATION SUMMARY:
 --------------------
 Total Checks: $TOTAL_CHECKS
 Passed: $PASSED_CHECKS
 Failed: $FAILED_CHECKS
 Warnings: $WARNING_CHECKS
 
 Overall Status: $([[ $FAILED_CHECKS -eq 0 ]] && echo "✅ HEALTHY" || echo "❌ ISSUES FOUND")
 
 COMPONENT STATUS:
 ---------------
$(if [[ $FAILED_CHECKS -gt 0 ]]; then echo "❌ Some components have issues that need attention"; elif [[ $WARNING_CHECKS -gt 0 ]]; then echo "⚠️  Some components are in transitional states"; else echo "✅ All components are running normally"; fi)
 
 RECOMMENDATIONS:
 ---------------
$(if [[ $FAILED_CHECKS -gt 0 ]]; then echo "1. Investigate failed components immediately"; fi)
$(if [[ $WARNING_CHECKS -gt 0 ]]; then echo "2. Monitor transitional components"; fi)
$(if [[ $PASSED_CHECKS -eq $TOTAL_CHECKS ]]; then echo "1. All systems operational - continue monitoring"; fi)
3. Set up automated monitoring and alerting
4. Regularly verify infrastructure health
5. Implement backup and disaster recovery procedures
 
 NEXT STEPS:
 -----------
$(if [[ $FAILED_CHECKS -gt 0 ]]; then echo "1. Address failed components immediately"; echo "2. Re-run verification after fixes"; else echo "1. Continue with deployment tasks"; echo "2. Schedule regular health checks"; fi)
3. Monitor system performance
4. Update documentation as needed
 
 VERIFICATION COMMANDS:
 ---------------------
 # Re-run this verification:
 ./scripts/verify-oci-infrastructure.sh --compartment-id $COMPARTMENT_ID
 
 # Check specific components:
 oci compute instance list --compartment-id $COMPARTMENT_ID
 oci db autonomous-database list --compartment-id $COMPARTMENT_ID
 oci network vcn list --compartment-id $COMPARTMENT_ID
 oci kms vault list --compartment-id $COMPARTMENT_ID
 oci monitoring alarm list --compartment-id $COMPARTMENT_ID
 ============================================================================
EOF
    
    success "Verification report saved to: $REPORT_FILE"
}

# Display final summary
display_summary() {
    echo ""
    log "VERIFICATION SUMMARY"
    echo "===================="
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNING_CHECKS"
    echo ""
    
    if [[ $FAILED_CHECKS -gt 0 ]]; then
        error "❌ INFRASTRUCTURE HAS ISSUES - $FAILED_CHECKS checks failed"
        echo ""
        echo "Recommendations:"
        echo "1. Review the failed components above"
        echo "2. Take corrective action immediately"
        echo "3. Re-run verification after fixes"
    elif [[ $WARNING_CHECKS -gt 0 ]]; then
        warning "⚠️  INFRASTRUCTURE HAS WARNINGS - $WARNING_CHECKS checks have warnings"
        echo ""
        echo "Recommendations:"
        echo "1. Monitor transitional components"
        echo "2. Investigate if warnings persist"
    else
        success "✅ INFRASTRUCTURE IS HEALTHY - All checks passed"
        echo ""
        echo "Recommendations:"
        echo "1. Continue with deployment tasks"
        echo "2. Schedule regular health checks"
    fi
    
    echo ""
    echo "Full report saved to: $OUTPUT_FILE"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -c, --compartment-id    Compartment OCID (required if not set)"
    echo "  -o, --output-file       Output file for the report (default: auto-generated)"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -w, --fail-on-warning   Treat warnings as failures"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --compartment-id ocid1.compartment.oc1..example"
    echo "  $0 -c ocid1.compartment.oc1..example -v -o my-report.txt"
    echo "  $0 --compartment-id ocid1.compartment.oc1..example --fail-on-warning"
}

# Main execution function
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--compartment-id)
                COMPARTMENT_ID="$2"
                shift 2
                ;;
            -o|--output-file)
                OUTPUT_FILE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -w|--fail-on-warning)
                FAIL_ON_WARNING=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    log "Starting Vauntico MVP OCI Infrastructure Verification..."
    echo ""
    
    check_prerequisites || exit 1
    get_user_input
    
    # Run all verification checks
    check_compute_instances
    check_autonomous_databases
    check_network_components
    check_vault_and_secrets
    check_monitoring_and_alerts
    check_load_balancers
    check_block_storage
    check_object_storage
    
    # Generate report and display summary
    generate_report
    display_summary
    
    # Exit with appropriate code
    if [[ $FAILED_CHECKS -gt 0 ]]; then
        exit 1
    elif [[ $FAIL_ON_WARNING == "true" && $WARNING_CHECKS -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

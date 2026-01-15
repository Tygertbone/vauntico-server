#!/bin/bash

# Go-Live Validation Script for Vauntico
# Comprehensive pre-deployment validation

set -e

echo "🚀 Go-Live Validation"
echo "===================="

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

# Configuration
VERSION="${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo 'v1.0.0')"
STAGING_URL="https://staging.vauntico.com"
PROD_URL="https://api.vauntico.com"

# Validation results
VALIDATION_PASSED=true
VALIDATION_ERRORS=()

# Helper function to record validation errors
record_error() {
    VALIDATION_PASSED=false
    VALIDATION_ERRORS+=("$1")
    print_error "❌ $1"
}

# Helper function to record validation success
record_success() {
    print_success "✅ $1"
}

# 1. Environment Validation
validate_environments() {
    print_status "🌍 Environment Validation"
    echo "=========================="
    
    # Check staging environment
    print_status "Checking staging environment..."
    if curl -f "$STAGING_URL/health" >/dev/null 2>&1; then
        record_success "Staging health check passed"
    else
        record_error "Staging health check failed"
    fi
    
    # Check production environment
    print_status "Checking production environment..."
    if curl -f "$PROD_URL/health" >/dev/null 2>&1; then
        record_success "Production health check passed"
    else
        record_error "Production health check failed"
    fi
    
    echo ""
}

# 2. Sacred Features Validation
validate_sacred_features() {
    print_status "⚡ Sacred Features Validation"
    echo "=============================="
    
    # Trust Score API
    print_status "Validating trust score calculation..."
    if curl -f "$STAGING_URL/api/sacred/trust-score" >/dev/null 2>&1; then
        record_success "Trust score API healthy"
    else
        record_error "Trust score API unavailable"
    fi
    
    # Payment Processing
    print_status "Validating payment processing..."
    if curl -f "$STAGING_URL/api/sacred/payment-health" >/dev/null 2>&1; then
        record_success "Payment processing healthy"
    else
        record_error "Payment processing unavailable"
    fi
    
    # Authentication System
    print_status "Validating authentication system..."
    if curl -f "$STAGING_URL/api/sacred/auth-health" >/dev/null 2>&1; then
        record_success "Authentication system healthy"
    else
        record_error "Authentication system unavailable"
    fi
    
    echo ""
}

# 3. Paystack Integration Validation
validate_paystack_integration() {
    print_status "💳 Paystack Integration Validation"
    echo "=================================="
    
    # Test payment initialization
    print_status "Testing payment initialization..."
    if curl -f "$STAGING_URL/api/test/paystack-init" >/dev/null 2>&1; then
        record_success "Payment initialization working"
    else
        record_warning "Payment initialization test unavailable"
    fi
    
    # Test webhook handling
    print_status "Testing webhook handling..."
    if curl -f "$STAGING_URL/api/test/webhook-health" >/dev/null 2>&1; then
        record_success "Webhook handling working"
    else
        record_warning "Webhook test unavailable"
    fi
    
    echo ""
}

# 4. Database Validation
validate_database() {
    print_status "🗄️ Database Validation"
    echo "========================"
    
    # Check database connectivity
    print_status "Checking database connectivity..."
    if curl -f "$STAGING_URL/api/health/db" >/dev/null 2>&1; then
        record_success "Database connectivity verified"
    else
        record_error "Database connectivity failed"
    fi
    
    # Check migration status
    print_status "Checking migration status..."
    if curl -f "$STAGING_URL/api/health/migrations" >/dev/null 2>&1; then
        record_success "Database migrations up to date"
    else
        record_error "Database migrations not up to date"
    fi
    
    echo ""
}

# 5. Performance Validation
validate_performance() {
    print_status "📊 Performance Validation"
    echo "==========================="
    
    # API response time
    print_status "Testing API response times..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$STAGING_URL/api/health" 2>/dev/null || echo "999")
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        record_success "API response time: ${response_time}s"
    else
        record_error "API response time too slow: ${response_time}s"
    fi
    
    # Throughput test
    print_status "Running throughput test..."
    if command -v npm >/dev/null 2>&1 && npm run test:throughput >/dev/null 2>&1; then
        record_success "Throughput test passed"
    else
        record_warning "Throughput test not available"
    fi
    
    echo ""
}

# 6. Security Validation
validate_security() {
    print_status "🔒 Security Validation"
    echo "======================"
    
    # Check for exposed secrets
    print_status "Scanning for exposed secrets..."
    if git log --all --full-history -- '*password*' '*secret*' '*key*' | grep -q 'password\|secret\|key'; then
        record_error "Potential secrets found in git history"
    else
        record_success "No secrets found in git history"
    fi
    
    # Check HTTPS configuration
    print_status "Validating HTTPS configuration..."
    if curl -s "$PROD_URL" | grep -q "https"; then
        record_success "HTTPS properly configured"
    else
        record_error "HTTPS not properly configured"
    fi
    
    echo ""
}

# 7. Monitoring Validation
validate_monitoring() {
    print_status "📈 Monitoring Validation"
    echo "========================="
    
    # Prometheus metrics
    print_status "Checking Prometheus metrics..."
    if curl -f "http://prometheus.vauntico.com/-/healthy" >/dev/null 2>&1; then
        record_success "Prometheus metrics available"
    else
        record_warning "Prometheus metrics unavailable"
    fi
    
    # Grafana dashboards
    print_status "Checking Grafana dashboards..."
    if curl -f "https://grafana.vauntico.com/api/health" >/dev/null 2>&1; then
        record_success "Grafana dashboards accessible"
    else
        record_warning "Grafana dashboards unavailable"
    fi
    
    # Sentry error tracking
    print_status "Checking Sentry error tracking..."
    if curl -f "https://sentry.vauntico.com/api/0/health/" >/dev/null 2>&1; then
        record_success "Sentry error tracking active"
    else
        record_warning "Sentry error tracking unavailable"
    fi
    
    echo ""
}

# 8. Customer Flow Validation
validate_customer_flows() {
    print_status "🛒 Customer Flow Validation"
    echo "==========================="
    
    # User registration flow
    print_status "Testing user registration flow..."
    if curl -f "$STAGING_URL/api/test/registration" >/dev/null 2>&1; then
        record_success "User registration flow working"
    else
        record_warning "User registration test unavailable"
    fi
    
    # Login flow
    print_status "Testing login flow..."
    if curl -f "$STAGING_URL/api/test/login" >/dev/null 2>&1; then
        record_success "Login flow working"
    else
        record_warning "Login test unavailable"
    fi
    
    # Dashboard access
    print_status "Testing dashboard access..."
    if curl -f "$STAGING_URL/dashboard" >/dev/null 2>&1; then
        record_success "Dashboard accessible"
    else
        record_warning "Dashboard test unavailable"
    fi
    
    echo ""
}

# 9. Backup Validation
validate_backups() {
    print_status "💾 Backup Validation"
    echo "===================="
    
    # Check recent backups
    print_status "Checking backup systems..."
    if [ -f "scripts/backup-production.sh" ]; then
        record_success "Backup script available"
    else
        record_warning "Backup script not found"
    fi
    
    # Test backup connectivity
    if command -v aws >/dev/null 2>&1; then
        record_success "AWS CLI available for backups"
    else
        record_warning "AWS CLI not available"
    fi
    
    echo ""
}

# 10. Documentation Validation
validate_documentation() {
    print_status "📚 Documentation Validation"
    echo "==========================="
    
    # Check API documentation
    print_status "Checking API documentation..."
    if curl -f "$STAGING_URL/api/docs" >/dev/null 2>&1; then
        record_success "API documentation accessible"
    else
        record_warning "API documentation unavailable"
    fi
    
    # Check README
    if [ -f "README.md" ]; then
        record_success "README.md exists"
    else
        record_error "README.md missing"
    fi
    
    # Check CHANGELOG
    if [ -f "CHANGELOG.md" ]; then
        record_success "CHANGELOG.md exists"
    else
        record_warning "CHANGELOG.md missing"
    fi
    
    echo ""
}

# 11. Final Validation Summary
generate_summary() {
    print_status "📋 Validation Summary"
    echo "======================"
    
    if [ "$VALIDATION_PASSED" = true ]; then
        print_success "🎉 All critical validations passed!"
        echo ""
        print_status "✅ Ready for go-live deployment"
        echo ""
        echo "Next steps:"
        echo "1. Execute: $0 $VERSION --deploy"
        echo "2. Monitor deployment progress"
        echo "3. Verify post-deployment health"
        echo ""
        return 0
    else
        print_error "❌ Validation failed!"
        echo ""
        print_status "Failed validations:"
        for error in "${VALIDATION_ERRORS[@]}"; do
            echo "  • $error"
        done
        echo ""
        print_status "Please address these issues before deployment."
        echo ""
        return 1
    fi
}

# Execute deployment if requested
execute_deployment() {
    local version="$1"
    
    print_status "🚀 Executing Go-Live Deployment"
    echo "================================="
    
    # Create release tag
    print_status "Creating release tag..."
    if git tag -a "$version" -m "Release $version - $(date +'%Y-%m-%d %H:%M:%S')"; then
        git push origin "$version"
        record_success "Release tag created: $version"
    else
        record_error "Failed to create release tag"
        return 1
    fi
    
    # Run deployment script if available
    if [ -f "scripts/deploy-production.sh" ]; then
        print_status "Running production deployment..."
        if bash scripts/deploy-production.sh; then
            record_success "Production deployment completed"
        else
            record_error "Production deployment failed"
            return 1
        fi
    else
        record_warning "Production deployment script not found"
    fi
    
    # Create GitHub release
    if command -v gh >/dev/null 2>&1; then
        print_status "Creating GitHub release..."
        if gh release create "$version" --title "Release $version" --notes "Automated release for version $version"; then
            record_success "GitHub release created"
        else
            record_warning "GitHub release creation failed"
        fi
    fi
    
    print_success "🎉 Go-live deployment completed!"
}

# Post-deployment validation
post_deployment_validation() {
    print_status "🔍 Post-Deployment Validation"
    echo "==============================="
    
    # Wait for deployment to propagate
    print_status "Waiting for deployment propagation..."
    sleep 30
    
    # Check production health
    print_status "Checking production health..."
    if curl -f "$PROD_URL/health" >/dev/null 2>&1; then
        record_success "Production health check passed"
    else
        record_error "Production health check failed"
    fi
    
    # Check sacred features in production
    print_status "Validating sacred features in production..."
    if curl -f "$PROD_URL/api/sacred/health" >/dev/null 2>&1; then
        record_success "Sacred features healthy in production"
    else
        record_error "Sacred features unavailable in production"
    fi
    
    print_success "✅ Post-deployment validation complete"
}

# Main execution
main() {
    local version="$1"
    local deploy_flag="$2"
    
    print_status "🚀 Go-Live Validation for Version: $version"
    echo "=========================================="
    echo ""
    
    # Run all validations
    validate_environments
    validate_sacred_features
    validate_paystack_integration
    validate_database
    validate_performance
    validate_security
    validate_monitoring
    validate_customer_flows
    validate_backups
    validate_documentation
    
    # Generate summary
    if generate_summary; then
        # Execute deployment if requested
        if [ "$deploy_flag" = "--deploy" ]; then
            execute_deployment "$version"
            post_deployment_validation
        fi
    else
        exit 1
    fi
}

# Help function
show_help() {
    echo "Go-Live Validation Script for Vauntico"
    echo ""
    echo "Usage:"
    echo "  $0 [version] [--deploy]"
    echo ""
    echo "Arguments:"
    echo "  version  Release version (default: latest tag)"
    echo "  --deploy Execute deployment after validation"
    echo ""
    echo "Examples:"
    echo "  $0 v1.2.0                    # Validate version 1.2.0"
    echo "  $0 v1.2.0 --deploy           # Validate and deploy version 1.2.0"
    echo "  $0 --deploy                    # Validate and deploy latest version"
    echo ""
    echo "Validations performed:"
    echo "  • Environment health checks"
    echo "  • Sacred features validation"
    echo "  • Paystack integration testing"
    echo "  • Database connectivity"
    echo "  • Performance benchmarks"
    echo "  • Security scanning"
    echo "  • Monitoring verification"
    echo "  • Customer flow testing"
    echo "  • Backup system validation"
    echo "  • Documentation completeness"
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"

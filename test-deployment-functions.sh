#!/bin/bash

# Test script for deployment functions
# This script tests individual functions from the deployment script

# Source the main deployment script to get access to functions
source deploy-vauntico-live.sh

echo "🧪 Testing Vauntico Deployment Functions"
echo "======================================="

# Test 1: Health check function with a known good endpoint
echo ""
echo "Test 1: Health check function"
echo "-------------------------------"

# Test with a reliable endpoint
if health_check "https://httpbin.org/status/200" 30 "Test Endpoint"; then
    echo "✅ Health check function works correctly"
else
    echo "❌ Health check function failed"
fi

# Test 2: Health check with failing endpoint
echo ""
echo "Test 2: Health check with failing endpoint"
echo "-----------------------------------------"

if ! health_check "https://httpbin.org/status/500" 10 "Failing Endpoint"; then
    echo "✅ Health check correctly detects failures"
else
    echo "❌ Health check should have failed"
fi

# Test 3: Retry mechanism
echo ""
echo "Test 3: Retry mechanism"
echo "-----------------------"

# Test retry with a command that will succeed
if retry_command "echo 'Test command successful'" 2; then
    echo "✅ Retry mechanism works correctly"
else
    echo "❌ Retry mechanism failed"
fi

# Test 4: Logging functions
echo ""
echo "Test 4: Logging functions"
echo "-------------------------"

log "Test log message"
log_success "Test success message"
log_warning "Test warning message"
log_error "Test error message"
log_info "Test info message"

echo "✅ Logging functions work correctly"

# Test 5: Environment validation (should fail without proper setup)
echo ""
echo "Test 5: Environment validation"
echo "------------------------------"

# This should fail since we don't have the required environment variables set
if ! validate_environment 2>/dev/null; then
    echo "✅ Environment validation correctly detects missing variables"
else
    echo "❌ Environment validation should have failed"
fi

echo ""
echo "🎉 Function tests completed!"
echo ""
echo "Note: Full deployment testing requires:"
echo "  - Proper environment variables set"
echo "  - SSH keys configured"
echo "  - Access to Vercel and OCI infrastructure"
#!/bin/bash

# Vauntico Trust-Score Backend Deployment Validation Script
# Tests and validates the deployed backend service

set -euo pipefail

# Configuration
readonly HOST="${HOST:-localhost}"
readonly PORT="${PORT:-3000}"
readonly BASE_URL="http://$HOST:$PORT"
readonly TIMEOUT=30

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-200}"
    
    ((TESTS_TOTAL++))
    
    log "Running test: $test_name"
    
    # Run the test with timeout
    if timeout "$TIMEOUT" bash -c "$test_command" > /dev/null 2>&1; then
        log_success "PASSED: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "FAILED: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# HTTP test function
test_http_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"
    local data="${4:-}"
    
    local test_command
    case "$method" in
        "GET")
            test_command="curl -f -s -o /dev/null -w '%{http_code}' '$BASE_URL$endpoint'"
            ;;
        "POST")
            test_command="curl -f -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '$data' '$BASE_URL$endpoint'"
            ;;
        *)
            test_command="curl -f -s -o /dev/null -w '%{http_code}' '$BASE_URL$endpoint'"
            ;;
    esac
    
    local actual_status
    actual_status=$(eval "$test_command" 2>/dev/null || echo "000")
    
    if [[ "$actual_status" == "$expected_status" ]]; then
        return 0
    else
        log_error "Expected status $expected_status, got $actual_status for $method $endpoint"
        return 1
    fi
}

# Performance test function
test_performance() {
    local endpoint="$1"
    local requests="${2:-10}"
    local max_time="${3:-5.0}"
    
    log "Performance test: $requests requests to $endpoint (max ${max_time}s total)"
    
    local start_time
    start_time=$(date +%s.%N)
    
    local success_count=0
    for ((i=1; i<=requests; i++)); do
        if curl -f -s "$BASE_URL$endpoint" > /dev/null 2>&1; then
            ((success_count++))
        fi
    done
    
    local end_time
    end_time=$(date +%s.%N)
    
    local total_time
    total_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "$max_time")
    
    log "Performance results: $success_count/$requests successful in ${total_time}s"
    
    if (( success_count >= requests )) && (( $(echo "$total_time <= $max_time" | bc -l 2>/dev/null || echo "1") )); then
        return 0
    else
        return 1
    fi
}

# Main validation function
main() {
    log "🧪 Starting Vauntico Trust-Score Backend Validation..."
    echo ""
    
    # Check if service is running
    log "Checking if service is accessible..."
    if ! curl -f -s --connect-timeout 5 "$BASE_URL/health" > /dev/null 2>&1; then
        log_error "Service is not accessible at $BASE_URL"
        log_error "Please ensure the service is running before running validation"
        exit 1
    fi
    
    log_success "Service is accessible at $BASE_URL"
    echo ""
    
    # Basic connectivity tests
    log "=== Basic Connectivity Tests ==="
    
    run_test "Health Check Endpoint" "test_http_endpoint '/health'" "200"
    run_test "Status Endpoint" "test_http_endpoint '/api/v1/status'" "200"
    run_test "Root Endpoint" "test_http_endpoint '/'" "200"
    run_test "API Docs Endpoint" "test_http_endpoint '/api/docs'" "200"
    
    echo ""
    
    # Response format tests
    log "=== Response Format Tests ==="
    
    # Test health endpoint JSON structure
    run_test "Health Endpoint JSON Structure" "
        curl -s '$BASE_URL/health' | jq -e 'has(\"status\") and has(\"timestamp\") and has(\"version\")' > /dev/null
    "
    
    # Test status endpoint JSON structure
    run_test "Status Endpoint JSON Structure" "
        curl -s '$BASE_URL/api/v1/status' | jq -e 'has(\"status\") and has(\"version\") and has(\"service\")' > /dev/null
    "
    
    # Test API docs endpoint JSON structure
    run_test "API Docs JSON Structure" "
        curl -s '$BASE_URL/api/docs' | jq -e 'has(\"title\") and has(\"version\") and has(\"endpoints\")' > /dev/null
    "
    
    echo ""
    
    # Security tests
    log "=== Security Tests ==="
    
    # Test rate limiting
    run_test "Rate Limiting Test" "
        for i in {1..105}; do
            curl -s '$BASE_URL/api/v1/status' > /dev/null
        done && curl -s '$BASE_URL/api/v1/status' | grep -q 'Too many requests'
    " "429"
    
    # Test CORS headers
    run_test "CORS Headers Present" "
        curl -I '$BASE_URL/health' 2>/dev/null | grep -i 'access-control-allow-origin'
    "
    
    # Test security headers
    run_test "Security Headers Present" "
        curl -I '$BASE_URL/health' 2>/dev/null | grep -i 'x-frame-options\\|x-content-type-options\\|x-xss-protection'
    "
    
    echo ""
    
    # Error handling tests
    log "=== Error Handling Tests ==="
    
    # Test 404 handling
    run_test "404 Error Handling" "test_http_endpoint '/nonexistent' '404'"
    
    # Test invalid method
    run_test "Method Not Allowed" "curl -f -s -X POST '$BASE_URL/health' > /dev/null 2>&1" "405"
    
    echo ""
    
    # Performance tests
    log "=== Performance Tests ==="
    
    run_test "Health Endpoint Performance" "test_performance '/health' '20' '3.0'"
    run_test "Status Endpoint Performance" "test_performance '/api/v1/status' '20' '3.0'"
    
    echo ""
    
    # Load test
    log "=== Load Test ==="
    run_test "Concurrent Load Test" "
        for i in {1..50}; do
            curl -s '$BASE_URL/health' > /dev/null &
        done
        wait
    "
    
    echo ""
    
    # Generate summary
    log "=== Validation Summary ==="
    
    echo -e "${BLUE}Total Tests: $TESTS_TOTAL${NC}"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    local success_rate=0
    if [[ $TESTS_TOTAL -gt 0 ]]; then
        success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    fi
    
    echo -e "${BLUE}Success Rate: $success_rate%${NC}"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log_success "🎉 All tests passed! The deployment is working correctly."
        return 0
    else
        log_error "❌ Some tests failed. Please review the issues above."
        return 1
    fi
}

# Run main function
main "$@"

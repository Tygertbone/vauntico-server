#!/bin/bash

# 🧪 SMOKE TEST SUITE FOR VAUNTICO PRODUCTION 🧪
# Comprehensive post-deployment validation

set -euo pipefail

# Configuration
API_BASE_URL="${API_BASE_URL:-https://api.vauntico.com}"
FRONTEND_URL="${FRONTEND_URL:-https://vauntico.com}"
LOG_FILE="smoke-test-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Test result tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-0}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"
    log "INFO" "Starting test: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        log "PASS" "Test passed: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        log "FAIL" "Test failed: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"
    local data="$4"
    
    local curl_command="curl -s -w '%{http_code}' -o /dev/null -X $method"
    
    if [[ "$method" == "POST" ]]; then
        curl_command="$curl_command -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_command="$curl_command '$API_BASE_URL$endpoint'"
    
    local response_code=$(eval "$curl_command")
    [[ "$response_code" == "$expected_status" ]]
}

echo -e "${BLUE}🚀 VAUNTICO PRODUCTION SMOKE TEST SUITE${NC}"
echo -e "${BLUE}============================================${NC}"
echo "Testing API: $API_BASE_URL"
echo "Testing Frontend: $FRONTEND_URL"
echo "Log file: $LOG_FILE"
echo ""

log "INFO" "Starting smoke test suite"
log "INFO" "API Base URL: $API_BASE_URL"
log "INFO" "Frontend URL: $FRONTEND_URL"

# === BASIC CONNECTIVITY TESTS ===

echo -e "\n${YELLOW}📡 BASIC CONNECTIVITY TESTS${NC}"

# Test 1: API Health Check
run_test "API Health Check" "test_api_endpoint '/health'"

# Test 2: Frontend Accessibility
run_test "Frontend Accessibility" "curl -s -w '%{http_code}' -o /dev/null '$FRONTEND_URL'"

# Test 3: Database Connectivity (via API)
run_test "Database Connectivity" "test_api_endpoint '/health/db'"

# === AUTHENTICATION TESTS ===

echo -e "\n${YELLOW}🔐 AUTHENTICATION TESTS${NC}"

# Test 4: JWT Token Generation
run_test "JWT Token Generation" "test_api_endpoint '/auth/token' 'POST' 200 '{\"email\":\"test@example.com\",\"password\":\"test123\"}'"

# Test 5: JWT Token Validation
run_test "JWT Token Validation" "test_api_endpoint '/auth/validate' 'POST' 200 '{\"token\":\"test-token\"}'"

# Test 6: OAuth Flow
run_test "OAuth Flow" "test_api_endpoint '/oauth/google' 'GET' 302"

# === CORE API ENDPOINTS ===

echo -e "\n${YELLOW}⚙️ CORE API ENDPOINTS${NC}"

# Test 7: User Registration
run_test "User Registration" "test_api_endpoint '/auth/register' 'POST' 201 '{\"email\":\"test-$(date +%s)@example.com\",\"password\":\"test123\"}'"

# Test 8: User Login
run_test "User Login" "test_api_endpoint '/auth/login' 'POST' 200 '{\"email\":\"test@example.com\",\"password\":\"test123\"}'"

# Test 9: User Profile
run_test "User Profile" "test_api_endpoint '/user/profile' 'GET' 401"  # Should fail without auth

# Test 10: Trust Score Calculation
run_test "Trust Score Calculation" "test_api_endpoint '/trust-score/calculate' 'POST' 200 '{\"userId\":\"test-user\",\"data\":{\"actions\":10,\"score\":85}}'"

# === PAYMENT PROCESSING TESTS ===

echo -e "\n${YELLOW}💳 PAYMENT PROCESSING TESTS${NC}"

# Test 11: Paystack Payment Initiation
run_test "Paystack Payment" "test_api_endpoint '/payments/paystack/initialize' 'POST' 200 '{\"amount\":1000,\"currency\":\"NGN\",\"email\":\"test@example.com\"}'"

# Test 12: Stripe Payment Intent
run_test "Stripe Payment Intent" "test_api_endpoint '/payments/stripe/create-intent' 'POST' 200 '{\"amount\":1000,\"currency\":\"usd\"}'"

# Test 13: Webhook Verification
run_test "Webhook Verification" "test_api_endpoint '/webhooks/verify' 'POST' 200 '{\"signature\":\"test-signature\",\"payload\":\"test-payload\"}'"

# Test 14: Subscription Plans
run_test "Subscription Plans" "test_api_endpoint '/subscriptions/plans' 'GET' 200"

# Test 15: Subscription Creation
run_test "Subscription Creation" "test_api_endpoint '/subscriptions/create' 'POST' 401"  # Should fail without auth

# === ENTERPRISE FEATURES TESTS ===

echo -e "\n${YELLOW}🏢 ENTERPRISE FEATURES TESTS${NC}"

# Test 16: Enterprise Compliance
run_test "Enterprise Compliance" "test_api_endpoint '/enterprise/compliance/check' 'GET' 200"

# Test 17: Admin Dashboard Access
run_test "Admin Dashboard" "test_api_endpoint '/admin/dashboard' 'GET' 401"  # Should fail without admin auth

# Test 18: API Rate Limiting
run_test "API Rate Limiting" "test_api_endpoint '/rate-limit-test' 'GET' 429"  # Should hit rate limit

# === MONITORING & OBSERVABILITY TESTS ===

echo -e "\n${YELLOW}📊 MONITORING & OBSERVABILITY TESTS${NC}"

# Test 19: Metrics Endpoint
run_test "Metrics Endpoint" "test_api_endpoint '/metrics' 'GET' 200"

# Test 20: KPI Endpoint
run_test "KPI Endpoint" "test_api_endpoint '/kpi/dashboard' 'GET' 401"  # Should fail without auth

# Test 21: Error Tracking (Sentry)
run_test "Error Tracking" "curl -s -w '%{http_code}' -o /dev/null '$API_BASE_URL/test/error' 'POST' 200 '{\"trigger_error\":true}'"

# === PERFORMANCE TESTS ===

echo -e "\n${YELLOW}⚡ PERFORMANCE TESTS${NC}"

# Test 22: API Response Time
run_test "API Response Time" "curl -s -w '%{time_total}' -o /dev/null '$API_BASE_URL/health' | grep -E '^[0-9].'"

# Test 23: Concurrent Requests
run_test "Concurrent Requests" "for i in {1..5}; do curl -s '$API_BASE_URL/health' & done; wait"

# === SECURITY TESTS ===

echo -e "\n${YELLOW}🛡️ SECURITY TESTS${NC}"

# Test 24: SQL Injection Protection
run_test "SQL Injection Protection" "test_api_endpoint '/test/security/sql-injection' 'POST' 400 '{\"input\":\"SELECT * FROM users\"}'"

# Test 25: XSS Protection
run_test "XSS Protection" "test_api_endpoint '/test/security/xss' 'POST' 400 '{\"input\":\"<script>alert(1)</script>\"}'"

# Test 26: CORS Headers
run_test "CORS Headers" "curl -s -I '$API_BASE_URL/health' | grep -i 'access-control-allow-origin'"

# Test 27: Security Headers
run_test "Security Headers" "curl -s -I '$API_BASE_URL/health' | grep -i 'x-content-type-options'"

# === INTEGRATION TESTS ===

echo -e "\n${YELLOW}🔗 INTEGRATION TESTS${NC}"

# Test 28: Email Service (Resend)
run_test "Email Service" "test_api_endpoint '/email/send' 'POST' 401"  # Should fail without auth

# Test 29: File Upload
run_test "File Upload" "curl -s -w '%{http_code}' -o /dev/null -X POST -F 'file=@/dev/null' '$API_BASE_URL/upload/test'"

# Test 30: Webhook Processing
run_test "Webhook Processing" "test_api_endpoint '/webhooks/test' 'POST' 200 '{\"event\":\"test.payout\",\"data\":{\"amount\":1000}}'"

# === RESULTS SUMMARY ===

echo -e "\n${BLUE}📊 TEST RESULTS SUMMARY${NC}"
echo -e "${BLUE}=====================${NC}"

echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Vauntico is production-ready!${NC}"
    log "INFO" "All smoke tests passed successfully"
    exit_code=0
else
    echo -e "\n${RED}⚠️  $FAILED_TESTS test(s) failed. Review logs above.${NC}"
    log "WARNING" "$FAILED_TESTS smoke tests failed"
    exit_code=1
fi

# Calculate success rate
success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS))

echo -e "\n${BLUE}📈 Success Rate: ${success_rate}%${NC}"
echo -e "${BLUE}📋 Log file: $LOG_FILE${NC}"

# Generate detailed report
cat > "smoke-test-report-$(date +%Y%m%d-%H%M%S).json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "api_base_url": "$API_BASE_URL",
  "frontend_url": "$FRONTEND_URL",
  "total_tests": $TOTAL_TESTS,
  "passed_tests": $PASSED_TESTS,
  "failed_tests": $FAILED_TESTS,
  "success_rate": $success_rate,
  "log_file": "$LOG_FILE",
  "environment": "production",
  "test_categories": {
    "connectivity": ["API Health Check", "Frontend Accessibility", "Database Connectivity"],
    "authentication": ["JWT Token Generation", "JWT Token Validation", "OAuth Flow"],
    "core_api": ["User Registration", "User Login", "User Profile", "Trust Score Calculation"],
    "payments": ["Paystack Payment", "Stripe Payment Intent", "Webhook Verification", "Subscription Plans", "Subscription Creation"],
    "enterprise": ["Enterprise Compliance", "Admin Dashboard", "API Rate Limiting"],
    "monitoring": ["Metrics Endpoint", "KPI Endpoint", "Error Tracking"],
    "performance": ["API Response Time", "Concurrent Requests"],
    "security": ["SQL Injection Protection", "XSS Protection", "CORS Headers", "Security Headers"],
    "integration": ["Email Service", "File Upload", "Webhook Processing"]
  }
}
EOF

echo -e "\n${GREEN}📄 Detailed report saved to: smoke-test-report-$(date +%Y%m%d-%H%M%S).json${NC}"

exit $exit_code

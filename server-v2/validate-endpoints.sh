#!/bin/bash

# Enhanced endpoint validation script for server-v2 after vercel v3 migration
# Run with: ./validate-endpoints.sh <deployment-url> [env-name]
# Examples:
# ./validate-endpoints.sh https://server-v2-abcdef.vercel.app
# ./validate-endpoints.sh https://server-v2-staging.vercel.app staging

if [ $# -eq 0 ]; then
  echo "Usage: $0 <deployment-url> [environment-name]"
  echo "Examples:"
  echo "  $0 https://server-v2-abcdef.vercel.app"
  echo "  $0 https://server-v2-staging.vercel.app staging"
  exit 1
fi

DEPLOYMENT_URL="$1"
ENV_NAME="${2:-production}"
LOG_FILE="${ENV_NAME}-validation-$(date +%Y%m%d-%H%M%S).log"
ALL_CHECKS_PASSED=true

echo "Validating endpoints at: $DEPLOYMENT_URL (Environment: $ENV_NAME)"
echo "Logging to: $LOG_FILE"
echo

# Function to run test and return results
run_test() {
  local test_name="$1"
  local cmd="$2"

  echo "$test_name:" | tee -a "$LOG_FILE"
  local start_time=$(date +%s.%3N)

  # Capture response
  local response=$(eval "$cmd" 2>/dev/null)
  local end_time=$(date +%s.%3N)
  local latency=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "N/A")

  local http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  local time_total=$(echo "$response" | grep "TIME_TOTAL:" | cut -d: -f2)
  local body=$(echo "$response" | sed -n '/HTTP_STATUS:/,/TIME_TOTAL:/p' | grep -v "HTTP_STATUS:" | grep -v "TIME_TOTAL:")

  echo "Latency: ${latency}s (curl: ${time_total}s)" | tee -a "$LOG_FILE"
  echo "HTTP Status: $http_status" | tee -a "$LOG_FILE"
  echo "Response Body: $body" | tee -a "$LOG_FILE"
  echo | tee -a "$LOG_FILE"

  # Return values for caller
  echo "$http_status|$body|$time_total"
}

# Test health endpoint (should return 200 with JSON)
result=$(run_test "1. Testing health endpoint (/)" \
  'curl -s -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "200" ] && echo "$body" | grep -q '"ok":true'; then
  echo "✅ Health check passed: HTTP 200 with valid JSON (latency: ${time_total}s)" | tee -a "$LOG_FILE"
else
  echo "❌ Health check failed: Expected 200 with JSON containing 'ok':true" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test 404 for invalid endpoint
result=$(run_test "2. Testing 404 handling (/nonexistent)" \
  'curl -s -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/nonexistent"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "404" ]; then
  echo "✅ 404 handling correct: HTTP 404 for nonexistent endpoint" | tee -a "$LOG_FILE"
else
  echo "❌ 404 test failed: Expected 404, got $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test auth endpoint validation
result=$(run_test "3. Testing auth validation (/auth/register with invalid data)" \
  'curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"invalid\"}" -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/auth/register"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "400" ]; then
  echo "✅ Validation works: HTTP 400 for invalid registration data" | tee -a "$LOG_FILE"
else
  echo "❌ Validation failed: Expected 400 for malformed request, got $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test trust-score endpoint (critical route)
result=$(run_test "4. Testing trust-score endpoint (/trust-score)" \
  'curl -s -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/trust-score"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "401" ]; then
  echo "✅ Trust-score endpoint returns 401 (unauthorized) as expected" | tee -a "$LOG_FILE"
elif [ "$http_status" = "200" ]; then
  echo "✅ Trust-score endpoint accessible (may not require auth)" | tee -a "$LOG_FILE"
else
  echo "❌ Trust-score endpoint unexpected response: $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test admin endpoint (critical route)
result=$(run_test "5. Testing admin endpoint (/admin)" \
  'curl -s -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/admin"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "401" ] || [ "$http_status" = "403" ]; then
  echo "✅ Admin endpoint properly protected: HTTP ${http_status}" | tee -a "$LOG_FILE"
else
  echo "❌ Admin endpoint security check failed: Expected 401/403, got $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test subscriptions endpoint (critical route)
result=$(run_test "6. Testing subscriptions endpoint (/subscriptions)" \
  'curl -s -X GET -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/subscriptions"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "401" ] || [ "$http_status" = "200" ]; then
  echo "✅ Subscriptions endpoint responds: HTTP ${http_status}" | tee -a "$LOG_FILE"
else
  echo "❌ Subscriptions endpoint failed: HTTP $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

# Test monitoring endpoint (should be accessible)
result=$(run_test "7. Testing monitoring endpoint (/monitoring)" \
  'curl -s -w "HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n" "$DEPLOYMENT_URL/monitoring"')
IFS='|' read -r http_status body time_total <<< "$result"

if [ "$http_status" = "200" ]; then
  echo "✅ Monitoring endpoint accessible" | tee -a "$LOG_FILE"
elif [ "$http_status" = "401" ]; then
  echo "✅ Monitoring endpoint properly protected" | tee -a "$LOG_FILE"
else
  echo "❌ Monitoring endpoint unexpected response: $http_status" | tee -a "$LOG_FILE"
  ALL_CHECKS_PASSED=false
fi

echo | tee -a "$LOG_FILE"
echo "=== VALIDATION SUMMARY ===" | tee -a "$LOG_FILE"
if [ "$ALL_CHECKS_PASSED" = true ]; then
  echo "✅ ALL CHECKS PASSED - Migration appears successful!" | tee -a "$LOG_FILE"
  echo "ℹ️  Check $LOG_FILE for full details and check Vercel console logs." | tee -a "$LOG_FILE"
  exit 0
else
  echo "❌ SOME CHECKS FAILED - Investigate issues before proceeding." | tee -a "$LOG_FILE"
  echo "ℹ️  Check $LOG_FILE for full details and consult Vercel console logs." | tee -a "$LOG_FILE"
  exit 1
fi

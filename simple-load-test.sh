#!/bin/bash

# Simple load testing script for vauntico-mvp backend using curl
# Tests: 50, 100, 250 concurrent connections with 2-minute duration

API_URL="https://api.vauntico.com"
TEST_DURATION=30  # 2 minutes in seconds
PAYLOAD_FILE=$(mktemp)
REPORT_FILE="load-test-results-$(date +%Y%m%d-%H%M%S).txt"

# Create sample payload for trust score calculations
cat > "$PAYLOAD_FILE" << 'EOF'
{
  "userId": "test_user_%RANDOM%",
  "platform": "youtube",
  "metrics": {
    "followers": 100000,
    "engagement": 0.05,
    "likes": 50000,
    "comments": 5000,
    "shares": 1000
  }
}
EOF

# Function to make a single health check request
health_check() {
    local start_time=$(date +%s%N)
    local response_code=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/health")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    echo "$response_code|$duration|HEALTH" >> "${REPORT_FILE}.tmp"
}

# Function to make auth endpoint test
auth_test() {
    local start_time=$(date +%s%N)
    local response_code=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test123"}' \
        "$API_URL/auth/login")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    echo "$response_code|$duration|AUTH" >> "${REPORT_FILE}.tmp"
}

# Function to make trust score calculation test
trust_score_test() {
    local start_time=$(date +%s%N)
    local response_code=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test_token" \
        -d @"$PAYLOAD_FILE" \
        "$API_URL/trustscore/calculate")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    echo "$response_code|$duration|TRUSTSCORE" >> "${REPORT_FILE}.tmp"
}

# Function to run requests from a single virtual user
run_virtual_user() {
    local user_id=$1
    local end_time=$(( $(date +%s) + TEST_DURATION ))

    echo "Virtual user $user_id started"

    while [ $(date +%s) -lt $end_time ]; do
        # Random sleep between 0.5-1 seconds to simulate real user behavior
        sleep $(awk -v min=0.5 -v max=1.5 'BEGIN{srand(); print min+rand()*(max-min)}')

        # Choose random endpoint (weighted towards health checks)
        local rand=$((RANDOM % 10))
        if [ $rand -lt 6 ]; then
            health_check
        elif [ $rand -lt 8 ]; then
            auth_test
        else
            trust_score_test
        fi
    done

    echo "Virtual user $user_id completed"
}

# Function to analyze results
analyze_results() {
    local tmp_file="${REPORT_FILE}.tmp"
    local results_file="$REPORT_FILE"

    echo "=== Load Test Results for $API_URL ===" > "$results_file"
    echo "Test Date: $(date)" >> "$results_file"
    echo "Test Duration: ${TEST_DURATION} seconds" >> "$results_file"
    echo "" >> "$results_file"

    # Count total requests
    local total_requests=$(wc -l < "$tmp_file")
    echo "Total Requests: $total_requests" >> "$results_file"

    # Calculate average response rate
    local avg_requests_per_sec=$(echo "scale=2; $total_requests / $TEST_DURATION" | bc)
    echo "Average Requests/Second: $avg_requests_per_sec" >> "$results_file"
    echo "" >> "$results_file"

    # Analyze by status code
    echo "=== Status Code Breakdown ===" >> "$results_file"
    awk -F'|' '{print $1}' "$tmp_file" | sort | uniq -c | sort -nr >> "$results_file"
    echo "" >> "$results_file"

    # Calculate error rate
    local error_responses=$(awk -F'|' '$1 >= 400' "$tmp_file" | wc -l)
    local error_rate=$(echo "scale=4; ($error_responses * 100) / $total_requests" | bc -l)
    echo "Error Rate: ${error_rate}%" >> "$results_file"
    echo "" >> "$results_file"

    # Analyze response times
    echo "=== Response Time Analysis ===" >> "$results_file"

    # Overall timing statistics
    awk -F'|' '{
        if($2 != "NaN" && $2 > 0) {
            print $2
        }
    }' "$tmp_file" | sort -n > /tmp/response_times.tmp

    if [ -s /tmp/response_times.tmp ]; then
        local count=$(wc -l < /tmp/response_times.tmp)
        local median_pos=$((count / 2))
        local p95_pos=$((count * 95 / 100))
        local p99_pos=$((count * 99 / 100))

        echo "Median response time: $(sed -n "${median_pos}p" /tmp/response_times.tmp) ms" >> "$results_file"
        echo "95th percentile: $(sed -n "${p95_pos}p" /tmp/response_times.tmp) ms" >> "$results_file"
        echo "99th percentile: $(sed -n "${p99_pos}p" /tmp/response_times.tmp) ms" >> "$results_file"
    fi

    echo "" >> "$results_file"

    # Per-endpoint analysis
    echo "=== Per-Endpoint Performance ===" >> "$results_file"
    for endpoint in "HEALTH" "AUTH" "TRUSTSCORE"; do
        echo "Endpoint: $endpoint" >> "$results_file"
        awk -F'|' -v ep="$endpoint" '$3 == ep {print $2}' "$tmp_file" | sort -n > /tmp/endpoint_times.tmp

        if [ -s /tmp/endpoint_times.tmp ]; then
            local ep_count=$(wc -l < /tmp/endpoint_times.tmp)
            if [ $ep_count -gt 0 ]; then
                local ep_median_pos=$((ep_count / 2))
                echo "  Count: $ep_count" >> "$results_file"
                echo "  Median: $(sed -n "${ep_median_pos}p" /tmp/endpoint_times.tmp) ms" >> "$results_file"
            fi
        fi
        echo "" >> "$results_file"
    done

    # Recommendations
    echo "=== Recommendations ===" >> "$results_file"
    if (( $(echo "$error_rate > 5" | bc -l) )); then
        echo "⚠️  High error rate ($error_rate%). Check backend logs and resource limits." >> "$results_file"
    else
        echo "✅ Error rate acceptable at $error_rate%" >> "$results_file"
    fi

    local avg_response_time=$(awk -F'|' '{sum+=$2; count++} END {print sum/count}' "$tmp_file" 2>/dev/null || echo "NaN")
    if (( $(echo "$avg_response_time > 2000" | bc -l 2>/dev/null || echo 0) )); then
        echo "⚠️  High average response time ($avg_response_time ms). Consider optimization." >> "$results_file"
    else
        echo "✅ Response times within acceptable range" >> "$results_file"
    fi

    if (( $(echo "$avg_requests_per_sec < 10" | bc -l) )); then
        echo "⚠️  Low throughput. Check connection pooling and concurrent limits." >> "$results_file"
    else
        echo "✅ Throughput acceptable" >> "$results_file"
    fi

    echo "" >> "$results_file"
    echo "=== Raw Data Download ===" >> "$results_file"
    echo "Full results saved to: ${tmp_file}" >> "$results_file"

    # Clean up temp file
    rm -f /tmp/response_times.tmp /tmp/endpoint_times.tmp

    echo "Load test completed! Results saved to: $results_file"
    cat "$results_file"
}

# Function to run load test with specified concurrency
run_load_test() {
    local concurrency=$1
    local start_time=$(date +%s)

    echo "Starting load test with $concurrency concurrent users for ${TEST_DURATION} seconds..."
    echo "Target: $API_URL"

    # Initialize results file
    echo "timestamp|status_code|response_time_ms|endpoint" > "${REPORT_FILE}.tmp"

    # Start virtual users in background
    for i in $(seq 1 $concurrency); do
        run_virtual_user "$i" &
    done

    # Wait for test duration
    sleep $TEST_DURATION

    # Stop all background processes
    pkill -f "run_virtual_user" 2>/dev/null || true

    # Wait a bit more for processes to finish writing
    sleep 2

    local end_time=$(date +%s)
    local actual_duration=$((end_time - start_time))

    echo "Test completed in $actual_duration seconds (target: $TEST_DURATION seconds)"

    analyze_results
}

# Run tests with different concurrency levels
echo "=== Vauntico Backend Stress Test ==="
echo "Testing endpoints: /health, /auth/login, /trustscore/calculate"
echo ""

# Test with 50 concurrent users
echo "Phase 1: Testing with 50 concurrent users..."
run_load_test 50

echo ""
echo "Waiting 30 seconds before next phase..."
sleep 30

# Test with 100 concurrent users
echo "Phase 2: Testing with 100 concurrent users..."
run_load_test 100

echo ""
echo "Waiting 30 seconds before next phase..."
sleep 30

# Test with 250 concurrent users
echo "Phase 3: Testing with 250 concurrent users..."
run_load_test 250

# Clean up
rm -f "$PAYLOAD_FILE"

echo ""
echo "=== All Load Tests Completed ==="
echo "Check the generated report files for detailed results."
echo "Summary files: load-test-results-*.txt"

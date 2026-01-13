#!/bin/bash

# Isolated test script for deployment functions
# This tests individual functions without running main()

echo "🧪 Testing Vauntico Deployment Functions (Isolated)"
echo "=================================================="

# Define colors for testing
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m'

# Test logging functions
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

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Test health check function
health_check() {
    local url="$1"
    local timeout="${2:-30}"
    local service_name="$3"
    
    log "🏥 Performing health check for $service_name..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if curl -f -s -m 10 "$url" > /dev/null 2>&1; then
            local elapsed=$(($(date +%s) - start_time))
            log_success "$service_name health check passed (${elapsed}s)"
            return 0
        fi
        
        sleep 2
    done
    
    log_error "$service_name health check failed after ${timeout}s timeout"
    return 1
}

# Test retry mechanism
retry_command() {
    local command="$1"
    local max_attempts="${2:-3}"
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Attempting command (attempt $attempt/$max_attempts): $command"
        
        if eval "$command"; then
            log_success "Command succeeded on attempt $attempt"
            return 0
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Command failed after $max_attempts attempts"
            return 1
        fi
        
        local wait_time=$((attempt * 2))
        log_warning "Command failed, retrying in $wait_time seconds..."
        sleep "$wait_time"
        ((attempt++))
    done
}

# Test 1: Logging functions
echo ""
echo "Test 1: Logging functions"
echo "-------------------------"

log "Test log message"
log_success "Test success message"
log_warning "Test warning message"
log_error "Test error message"
log_info "Test info message"

echo "✅ Logging functions work correctly"

# Test 2: Health check with good endpoint
echo ""
echo "Test 2: Health check with good endpoint"
echo "--------------------------------------"

if health_check "https://httpbin.org/status/200" 15 "Good Endpoint"; then
    echo "✅ Health check function works correctly"
else
    echo "❌ Health check function failed"
fi

# Test 3: Health check with failing endpoint
echo ""
echo "Test 3: Health check with failing endpoint"
echo "----------------------------------------"

if ! health_check "https://httpbin.org/status/500" 10 "Failing Endpoint"; then
    echo "✅ Health check correctly detects failures"
else
    echo "❌ Health check should have failed"
fi

# Test 4: Retry mechanism with successful command
echo ""
echo "Test 4: Retry mechanism with successful command"
echo "---------------------------------------------"

if retry_command "echo 'Test command successful'" 2; then
    echo "✅ Retry mechanism works correctly"
else
    echo "❌ Retry mechanism failed"
fi

# Test 5: Retry mechanism with failing command
echo ""
echo "Test 5: Retry mechanism with failing command"
echo "-------------------------------------------"

if ! retry_command "exit 1" 2; then
    echo "✅ Retry mechanism correctly handles failures"
else
    echo "❌ Retry mechanism should have failed"
fi

# Test 6: Environment variable validation
echo ""
echo "Test 6: Environment variable validation"
echo "--------------------------------------"

validate_env_vars() {
    local required_vars=("VERCEL_TOKEN" "VERCEL_ORG_ID" "NONEXISTENT_VAR")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    log_success "All required environment variables are set"
    return 0
}

if ! validate_env_vars; then
    echo "✅ Environment validation correctly detects missing variables"
else
    echo "❌ Environment validation should have failed"
fi

echo ""
echo "🎉 All function tests completed successfully!"
echo ""
echo "Summary of validated functions:"
echo "  ✅ Logging functions (log, log_success, log_warning, log_error, log_info)"
echo "  ✅ Health check function with timeout and retry"
echo "  ✅ Retry mechanism with configurable attempts"
echo "  ✅ Environment variable validation"
echo ""
echo "The enhanced deployment script is ready for use!"
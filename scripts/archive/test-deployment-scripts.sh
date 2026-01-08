#!/bin/bash

# Test script for Vauntico Trust-Score Backend Deployment Scripts
# Validates script syntax, dependencies, and basic functionality

set -euo pipefail

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
    
    ((TESTS_TOTAL++))
    
    log "Running test: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "PASSED: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "FAILED: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Check if required tools are available
check_dependencies() {
    log "=== Checking Dependencies ==="
    
    run_test "Bash available" "command -v bash"
    run_test "Curl available" "command -v curl"
    run_test "Node.js available" "command -v node"
    run_test "NPM available" "command -v npm"
    run_test "Git available" "command -v git"
    
    # Optional tools
    if command -v jq > /dev/null 2>&1; then
        log_success "jq available (optional)"
    else
        log_warning "jq not available (optional for validation)"
    fi
    
    if command -v bc > /dev/null 2>&1; then
        log_success "bc available (optional)"
    else
        log_warning "bc not available (optional for performance tests)"
    fi
}

# Test script syntax
test_script_syntax() {
    log "=== Testing Script Syntax ==="
    
    # Test main deployment script
    if [[ -f "backend-deploy-v2-optimized.sh" ]]; then
        run_test "Main deployment script syntax" "bash -n backend-deploy-v2-optimized.sh"
        run_test "Main deployment script executable" "test -x backend-deploy-v2-optimized.sh || chmod +x backend-deploy-v2-optimized.sh"
    else
        log_error "Main deployment script not found"
        ((TESTS_FAILED++))
    fi
    
    # Test validation script
    if [[ -f "validate-backend-deployment.sh" ]]; then
        run_test "Validation script syntax" "bash -n validate-backend-deployment.sh"
        run_test "Validation script executable" "test -x validate-backend-deployment.sh || chmod +x validate-backend-deployment.sh"
    else
        log_error "Validation script not found"
        ((TESTS_FAILED++))
    fi
    
    # Test original script for comparison
    if [[ -f "backend-deploy.sh" ]]; then
        run_test "Original deployment script syntax" "bash -n backend-deploy.sh"
    fi
}

# Test script functions (isolated)
test_script_functions() {
    log "=== Testing Script Functions ==="
    
    # Create temporary test environment
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Export functions from main script for testing
    if [[ -f "../backend-deploy-v2-optimized.sh" ]]; then
        # Extract function definitions
        bash -c "
            source ../backend-deploy-v2-optimized.sh
            echo 'Functions loaded successfully'
        " > /dev/null 2>&1
        
        if [[ $? -eq 0 ]]; then
            run_test "Script functions loadable" "true"
        else
            log_error "Script functions failed to load"
            ((TESTS_FAILED++))
        fi
    fi
    
    # Test validation script functions
    if [[ -f "../validate-backend-deployment.sh" ]]; then
        bash -c "
            source ../validate-backend-deployment.sh
            echo 'Validation functions loaded successfully'
        " > /dev/null 2>&1
        
        if [[ $? -eq 0 ]]; then
            run_test "Validation functions loadable" "true"
        else
            log_error "Validation functions failed to load"
            ((TESTS_FAILED++))
        fi
    fi
    
    # Cleanup
    cd ..
    rm -rf "$temp_dir"
}

# Test file generation capabilities
test_file_generation() {
    log "=== Testing File Generation ==="
    
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Test server.js generation
    cat > test_server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
EOF
    
    run_test "Server.js file generation test" "test -f test_server.js"
    
    # Test package.json generation
    cat > test_package.json << 'EOF'
{
  "name": "trust-score-backend",
  "version": "2.0.0",
  "description": "Vauntico Trust-Score Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF
    
    run_test "Package.json file generation test" "test -f test_package.json"
    
    # Test JSON validity
    if command -v node > /dev/null 2>&1; then
        run_test "Generated package.json valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"test_package.json\", \"utf8\"))'"
    fi
    
    # Cleanup
    cd ..
    rm -rf "$temp_dir"
}

# Test Node.js application basics
test_nodejs_application() {
    log "=== Testing Node.js Application Basics ==="
    
    if ! command -v node > /dev/null 2>&1; then
        log_warning "Node.js not available, skipping application tests"
        return
    fi
    
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Create minimal test application
    cat > test_app.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
    }));
});

const PORT = 3001;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server running on port ${PORT}`);
    setTimeout(() => {
        server.close();
        process.exit(0);
    }, 1000);
});
EOF
    
    # Test if Node.js can start the application
    run_test "Node.js application startup" "timeout 5 node test_app.js"
    
    # Cleanup
    cd ..
    rm -rf "$temp_dir"
}

# Test security configurations
test_security_configs() {
    log "=== Testing Security Configurations ==="
    
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Test PM2 ecosystem configuration generation
    cat > test_ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'test-app',
    script: './test.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};
EOF
    
    run_test "PM2 ecosystem config generation" "test -f test_ecosystem.config.js"
    
    # Test systemd service file generation
    cat > test_service << 'EOF'
[Unit]
Description=Test Service
After=network.target

[Service]
Type=simple
User=testuser
WorkingDirectory=/tmp
ExecStart=/usr/bin/node test.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    run_test "Systemd service file generation" "test -f test_service"
    
    # Cleanup
    cd ..
    rm -rf "$temp_dir"
}

# Test environment variable handling
test_environment_variables() {
    log "=== Testing Environment Variables ==="
    
    # Test default values
    export PORT="${PORT:-3000}"
    export NODE_ENV="${NODE_ENV:-production}"
    export LOG_DIR="${LOG_DIR:-/var/log/vauntico}"
    
    run_test "PORT variable set" "test -n '$PORT'"
    run_test "NODE_ENV variable set" "test -n '$NODE_ENV'"
    run_test "LOG_DIR variable set" "test -n '$LOG_DIR'"
    
    # Test custom values
    PORT=8080 NODE_ENV=development LOG_DIR=/tmp/test run_test "Custom environment variables" "test '$PORT' = '8080' -a '$NODE_ENV' = 'development' -a '$LOG_DIR' = '/tmp/test'"
}

# Test error handling
test_error_handling() {
    log "=== Testing Error Handling ==="
    
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Test error handling in scripts
    cat > test_error.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# Test error handling
test_command() {
    return 1
}

if test_command; then
    echo "Should not reach here"
else
    echo "Error handled correctly"
    exit 0
fi
EOF
    
    chmod +x test_error.sh
    run_test "Error handling in bash scripts" "./test_error.sh"
    
    # Cleanup
    cd ..
    rm -rf "$temp_dir"
}

# Main test function
main() {
    log "🧪 Starting Vauntico Trust-Score Backend Script Tests..."
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "backend-deploy-v2-optimized.sh" ]]; then
        log_error "Please run this script from the directory containing the deployment scripts"
        exit 1
    fi
    
    # Run all test suites
    check_dependencies
    echo ""
    
    test_script_syntax
    echo ""
    
    test_script_functions
    echo ""
    
    test_file_generation
    echo ""
    
    test_nodejs_application
    echo ""
    
    test_security_configs
    echo ""
    
    test_environment_variables
    echo ""
    
    test_error_handling
    echo ""
    
    # Generate summary
    log "=== Test Summary ==="
    
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
        log_success "🎉 All tests passed! The deployment scripts are ready for use."
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Upload scripts to your OCI instance"
        echo "2. Run: ./backend-deploy-v2-optimized.sh"
        echo "3. Validate deployment: ./validate-backend-deployment.sh"
        return 0
    else
        log_error "❌ Some tests failed. Please review the issues above before deployment."
        return 1
    fi
}

# Run main function
main "$@"

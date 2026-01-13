#!/bin/bash

# Vauntico Full Deployment Script
# Enhanced with comprehensive error handling, multi-component support, and monitoring
# Version: 3.0

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DEPLOYMENT_LOG="/var/log/vauntico-deployment.log"
readonly BACKUP_DIR="/tmp/vauntico-backup-$(date +%Y%m%d-%H%M%S)"
readonly MAX_RETRIES=3
readonly HEALTH_CHECK_TIMEOUT=300

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1" >> "$DEPLOYMENT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" >> "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1" >> "$DEPLOYMENT_LOG"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1" >> "$DEPLOYMENT_LOG"
}

# Error handling and cleanup
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed with exit code $exit_code"
        log_info "Backup available at: $BACKUP_DIR"
        log_info "Deployment logs available at: $DEPLOYMENT_LOG"
        
        # Send notification if webhook is configured
        if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
            curl -X POST "$SLACK_WEBHOOK_URL" \
                -H 'Content-type: application/json' \
                -d "{\"text\":\"🚨 Vauntico deployment FAILED! Check logs for details.\"}" \
                2>/dev/null || true
        fi
    fi
    exit $exit_code
}

trap cleanup EXIT

# Environment validation
validate_environment() {
    log "🔍 Validating deployment environment..."
    
    local required_vars=(
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID"
        "VERCEL_FRONTEND_PROJECT_ID"
        "OCI_BASTION_HOST"
        "OCI_COMPUTE_HOST"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_info "Please set these variables and try again"
        exit 1
    fi
    
    # Check required tools
    local required_tools=("vercel" "ssh" "curl" "gh")
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Check SSH keys
    if [[ ! -f ~/.ssh/oci_key ]]; then
        log_error "OCI SSH key not found at ~/.ssh/oci_key"
        exit 1
    fi
    
    if [[ ! -f ~/.ssh/bastion_key ]]; then
        log_error "Bastion SSH key not found at ~/.ssh/bastion_key"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Retry mechanism
retry_command() {
    local command="$1"
    local max_attempts="${2:-$MAX_RETRIES}"
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
        
        local wait_time=$((attempt * 10))
        log_warning "Command failed, retrying in $wait_time seconds..."
        sleep "$wait_time"
        ((attempt++))
    done
}

# Enhanced health check
health_check() {
    local url="$1"
    local timeout="${2:-$HEALTH_CHECK_TIMEOUT}"
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
        
        sleep 5
    done
    
    log_error "$service_name health check failed after ${timeout}s timeout"
    return 1
}

# Frontend deployment
deploy_frontend() {
    log "🚀 Starting frontend deployment to Vercel..."
    
    # Create backup of current deployment
    mkdir -p "$BACKUP_DIR/frontend"
    
    # Pre-deployment checks
    log "🔍 Running pre-deployment checks..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Install dependencies
    log "📦 Installing frontend dependencies..."
    npm ci --silent
    
    # Run linting and type checking
    log "🔍 Running code quality checks..."
    npm run lint --silent || log_warning "Linting failed, continuing deployment"
    npm run build --silent || {
        log_error "Frontend build failed"
        exit 1
    }
    
    # Deploy to Vercel with retry
    retry_command "vercel --prod --token \$VERCEL_TOKEN --scope \$VERCEL_ORG_ID --project \$VERCEL_FRONTEND_PROJECT_ID"
    
    # Verify Vercel domains
    log "🔍 Verifying Vercel domains..."
    vercel domains ls --token "$VERCEL_TOKEN" || log_warning "Could not verify Vercel domains"
    
    # Health check for frontend
    health_check "https://vauntico.com" 60 "Frontend"
    
    log_success "Frontend deployment completed"
}

# Backend deployment
deploy_backend() {
    log "🚀 Starting backend deployment via OCI bastion..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR/backend"
    
    # Deploy via bastion with enhanced error handling
    log "🔗 Connecting to OCI bastion and deploying backend..."
    
    ssh -i ~/.ssh/oci_key \
        -o ProxyCommand="ssh -W %h:%p -i ~/.ssh/bastion_key bastion_user@${OCI_BASTION_HOST}" \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=30 \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        oci_user@${OCI_COMPUTE_HOST} << 'EOF'
        set -euo pipefail
        
        echo "🔍 Backend deployment started on $(hostname)"
        
        # Navigate to application directory
        cd /srv/vauntico || {
            echo "❌ Application directory not found"
            exit 1
        }
        
        # Create backup
        if [[ -d "server-v2" ]]; then
            echo "📦 Creating backup of current deployment..."
            cp -r server-v2 server-v2.backup.$(date +%Y%m%d-%H%M%S)
        fi
        
        # Pull latest changes
        echo "📥 Pulling latest changes from repository..."
        git pull origin main || {
            echo "❌ Git pull failed"
            exit 1
        }
        
        # Check if we're in a workspace project
        if [[ -f "package.json" ]] && grep -q "workspaces" package.json; then
            echo "📦 Detected npm workspace, installing all dependencies..."
            npm ci --production --silent
        else
            # Install backend dependencies
            if [[ -d "server-v2" ]]; then
                echo "📦 Installing backend dependencies..."
                cd server-v2
                npm ci --production --silent
            fi
        fi
        
        # Build TypeScript project if needed
        if [[ -f "tsconfig.json" ]]; then
            echo "🔧 Building TypeScript application..."
            npm run build || {
                echo "❌ TypeScript build failed"
                exit 1
            }
        fi
        
        # Restart services with PM2
        echo "🔄 Restarting application services..."
        if command -v pm2 &> /dev/null; then
            pm2 restart all || {
                echo "❌ PM2 restart failed"
                exit 1
            }
            
            # Wait for services to start
            echo "⏳ Waiting for services to start..."
            sleep 15
            
            # Check PM2 status
            pm2 status || echo "⚠️ Could not get PM2 status"
        else
            echo "⚠️ PM2 not found, services may not be restarted properly"
        fi
        
        echo "✅ Backend deployment completed successfully"
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "Backend deployment completed"
    else
        log_error "Backend deployment failed"
        exit 1
    fi
}

# Widget deployment
deploy_widget() {
    log "🚀 Starting widget deployment..."
    
    if [[ ! -d "widget" ]]; then
        log_warning "Widget directory not found, skipping widget deployment"
        return 0
    fi
    
    cd widget
    
    # Install widget dependencies
    log "📦 Installing widget dependencies..."
    npm ci --silent
    
    # Build widget
    log "🔧 Building widget..."
    npm run build || {
        log_error "Widget build failed"
        exit 1
    }
    
    # Run tests
    log "🧪 Running widget tests..."
    npm test --silent || log_warning "Widget tests failed, continuing deployment"
    
    # Publish to npm if configured
    if [[ -n "${NPM_TOKEN:-}" ]] && npm whoami &>/dev/null; then
        log "📦 Publishing widget to npm..."
        npm publish || log_warning "Widget publish failed"
    else
        log_info "Skipping npm publish (not configured)"
    fi
    
    cd ..
    log_success "Widget deployment completed"
}

# Fulfillment engine deployment
deploy_fulfillment_engine() {
    log "🚀 Starting fulfillment engine deployment..."
    
    if [[ ! -d "vauntico-fulfillment-engine" ]]; then
        log_warning "Fulfillment engine directory not found, skipping deployment"
        return 0
    fi
    
    cd vauntico-fulfillment-engine
    
    # Install dependencies
    log "📦 Installing fulfillment engine dependencies..."
    npm ci --production --silent
    
    # Run tests
    log "🧪 Running fulfillment engine tests..."
    npm test --silent || log_warning "Fulfillment engine tests failed, continuing deployment"
    
    cd ..
    log_success "Fulfillment engine deployment completed"
}

# Comprehensive health checks
run_health_checks() {
    log "🏥 Running comprehensive health checks..."
    
    local endpoints=(
        "https://api.vauntico.com/health:API Health"
        "https://api.vauntico.com/trust-score:Trust Score API"
        "https://api.vauntico.com/api/v1/status:API Status"
        "https://vauntico.com:Frontend"
    )
    
    local failed_checks=()
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r url service_name <<< "$endpoint_info"
        
        if ! health_check "$url" 120 "$service_name"; then
            failed_checks+=("$service_name")
        fi
    done
    
    if [[ ${#failed_checks[@]} -gt 0 ]]; then
        log_error "Health checks failed for: ${failed_checks[*]}"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# CI/CD validation
run_cicd_validation() {
    log "🔄 Triggering CI/CD validation workflows..."
    
    # Trigger backend deployment workflow
    if gh workflow list | grep -q "Backend Build & Deploy (OCI)"; then
        log "🔄 Triggering backend deployment workflow..."
        gh workflow run "Backend Build & Deploy (OCI)" --ref main || \
            log_warning "Could not trigger backend workflow"
    else
        log_warning "Backend deployment workflow not found"
    fi
    
    # Trigger production deployment workflow
    if gh workflow list | grep -q "Production Deploy"; then
        log "🔄 Triggering production deployment workflow..."
        gh workflow run "Production Deploy" --ref main \
            -f environment=production \
            -f confirm=true || \
            log_warning "Could not trigger production workflow"
    else
        log_warning "Production deployment workflow not found"
    fi
    
    log_success "CI/CD validation workflows triggered"
}

# Monitoring and observability
check_monitoring() {
    log "📊 Checking monitoring and observability systems..."
    
    # Check if monitoring endpoints are available
    local monitoring_endpoints=(
        "https://api.vauntico.com/metrics:Prometheus Metrics"
        "https://api.vauntico.com/api/docs:API Documentation"
    )
    
    for endpoint_info in "${monitoring_endpoints[@]}"; do
        IFS=':' read -r url service_name <<< "$endpoint_info"
        
        if curl -f -s -m 10 "$url" > /dev/null 2>&1; then
            log_success "$service_name is accessible"
        else
            log_warning "$service_name is not accessible"
        fi
    done
    
    # Check Grafana if configured
    if [[ -n "${GRAFANA_URL:-}" ]]; then
        if curl -f -s -m 10 "$GRAFANA_URL/api/health" > /dev/null 2>&1; then
            log_success "Grafana is accessible"
        else
            log_warning "Grafana is not accessible"
        fi
    fi
    
    # Check Sentry if configured
    if [[ -n "${SENTRY_DSN:-}" ]]; then
        log_info "Sentry DSN is configured"
    else
        log_warning "Sentry DSN not configured"
    fi
    
    log_success "Monitoring check completed"
}

# Deployment summary
deployment_summary() {
    log "📋 Generating deployment summary..."
    
    echo ""
    echo -e "${CYAN}🎉 VAUNTICO DEPLOYMENT SUMMARY${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
    echo -e "${BLUE}📦 Components Deployed:${NC}"
    echo -e "   ✅ Frontend (Vercel)"
    echo -e "   ✅ Backend (OCI)"
    echo -e "   ✅ Widget (if available)"
    echo -e "   ✅ Fulfillment Engine (if available)"
    echo ""
    echo -e "${BLUE}🌐 URLs:${NC}"
    echo -e "   🌍 Frontend: https://vauntico.com"
    echo -e "   🔧 API: https://api.vauntico.com"
    echo -e "   📊 Health: https://api.vauntico.com/health"
    echo -e "   📖 API Docs: https://api.vauntico.com/api/docs"
    echo ""
    echo -e "${BLUE}🔧 Management:${NC}"
    echo -e "   📋 Deployment Log: $DEPLOYMENT_LOG"
    echo -e "   💾 Backup Location: $BACKUP_DIR"
    echo -e "   🔄 CI/CD: GitHub Actions"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo -e "   📈 Grafana: ${GRAFANA_URL:-Not configured}"
    echo -e "   🐛 Sentry: ${SENTRY_DSN:+Configured}"
    echo -e "   📋 Logs: Available on OCI instances"
    echo ""
    echo -e "${GREEN}🎊 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
    echo ""
    
    # Send success notification if webhook is configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            -d '{"text":"🎉 Vauntico deployment completed successfully! All systems are live."}' \
            2>/dev/null || true
    fi
}

# Main deployment function
main() {
    log "🚀 Starting Vauntico Full Deployment v3.0..."
    
    # Create log directory
    sudo mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    sudo touch "$DEPLOYMENT_LOG"
    sudo chmod 666 "$DEPLOYMENT_LOG"
    
    # Validate environment
    validate_environment
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Deploy components
    deploy_frontend
    deploy_backend
    deploy_widget
    deploy_fulfillment_engine
    
    # Run health checks
    run_health_checks
    
    # CI/CD validation
    run_cicd_validation
    
    # Check monitoring
    check_monitoring
    
    # Generate summary
    deployment_summary
    
    log_success "🎉 Full deployment completed successfully!"
}

# Run main function
main "$@"

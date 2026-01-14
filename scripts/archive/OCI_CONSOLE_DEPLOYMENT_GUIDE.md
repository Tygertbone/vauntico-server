# OCI Console Connection Deployment Guide

## 🚨 Important: SSH Port 22 is Blocked

Since SSH port 22 is blocked on the OCI instance (84.8.135.161), we must use the OCI Console Connection method to deploy the backend service.

## 📋 Step-by-Step Deployment Instructions

### Step 1: Access OCI Console Connection

1. **Log into OCI Console**
   - Go to: https://console.oracle-cloud.com
   - Sign in with your OCI credentials

2. **Navigate to Compute Instance**
   - Go to **Compute → Instances**
   - Find and click on your instance: `trust-score` (ID: `ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q`)

3. **Create Console Connection**
   - Click on **Console Connection** tab
   - Click **Create Console Connection**
   - Choose **SSH Key** option
   - Upload your SSH public key (or create a new one)
   - Click **Create Console Connection**

4. **Connect to Instance**
   - After creating the connection, click **Connect**
   - Copy the provided SSH command (it will look like):
   ```bash
   ssh -i /path/to/your/key -o ProxyCommand="ssh -W %h:%p -p 443 ocid1.instance.oc1.af-johannesburg-1.anvg4ljr4eq3kmqc7xrszmhs2geuocplk74cxm3sozcjr7otloapshomte3q@host.operator.oraclevcn.com" ubuntu@84.8.135.161
   ```

### Step 2: Upload Deployment Scripts

Once connected via Console Connection, you need to upload the scripts. Since you're in the console, you can create the scripts directly using a text editor:

1. **Create the deployment script**:

````bash
cat > backend-deploy-v2-optimized.sh << 'EOF'
#!/bin/bash

# Vauntico Trust-Score Backend Deployment Script v2.0 - Optimized
set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_DIR="/var/log/vauntico"
readonly APP_DIR="/home/ubuntu/trust-score-backend"
readonly SERVICE_NAME="trust-score"
readonly PORT="${PORT:-3000}"
readonly NODE_VERSION="18.x"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

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

# Error handling and rollback
rollback() {
    log_warning "Initiating rollback procedure..."

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME" || true
        log_warning "Stopped $SERVICE_NAME service"
    fi

    if systemctl is-enabled --quiet "$SERVICE_NAME"; then
        sudo systemctl disable "$SERVICE_NAME" || true
        log_warning "Disabled $SERVICE_NAME service"
    fi

    if [[ -f "/etc/systemd/system/$SERVICE_NAME.service" ]]; then
        sudo rm -f "/etc/systemd/system/$SERVICE_NAME.service"
        sudo systemctl daemon-reload
        log_warning "Removed systemd service file"
    fi

    if [[ -d "${APP_DIR}.backup" ]]; then
        sudo rm -rf "$APP_DIR"
        sudo mv "${APP_DIR}.backup" "$APP_DIR"
        log_warning "Restored application directory from backup"
    fi

    log_error "Rollback completed. Please investigate the error and try again."
    exit 1
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1

    log "Performing health check..."

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
            log_success "Health check passed on attempt $attempt"
            return 0
        fi

        log "Health check attempt $attempt/$max_attempts failed. Retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."

    if ! id "$SERVICE_NAME" &>/dev/null; then
        sudo useradd --system --shell /bin/false --home "$APP_DIR" "$SERVICE_NAME"
        log_success "Created dedicated user: $SERVICE_NAME"
    fi

    sudo chown -R "$SERVICE_NAME:$SERVICE_NAME" "$APP_DIR"
    sudo chmod 755 "$APP_DIR"
    sudo chmod 644 "$APP_DIR"/*.json "$APP_DIR"/*.js 2>/dev/null || true
    log_success "Set proper file permissions"

    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow "$PORT/tcp"
    log_success "Configured firewall rules"
}

# Monitoring setup
setup_monitoring() {
    log "Setting up monitoring..."

    sudo mkdir -p "$LOG_DIR"
    sudo chown "$SERVICE_NAME:$SERVICE_NAME" "$LOG_DIR"

    sudo tee /etc/logrotate.d/vauntico-trust-score > /dev/null << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_NAME $SERVICE_NAME
    postrotate
        systemctl reload $SERVICE_NAME || true
    endscript
}
EOF

    log_success "Set up log rotation"
}

# Main deployment function
main() {
    log "🚀 Starting Vauntico Trust-Score Backend Deployment v2.0..."

    trap rollback ERR

    sudo mkdir -p "$LOG_DIR"

    if [[ -d "$APP_DIR" ]]; then
        log_warning "Existing installation found. Creating backup..."
        sudo cp -r "$APP_DIR" "${APP_DIR}.backup"
    fi

    log "📦 Updating system packages..."
    sudo apt update && sudo apt upgrade -y

    log "📦 Installing required packages..."
    sudo apt-get install -y curl wget git ufw fail2ban unattended-upgrades

    log "📦 Installing Node.js $NODE_VERSION..."
    if ! command -v node &> /dev/null; then
        curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}" | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log_warning "Node.js already installed: $(node --version)"
    fi

    if ! command -v pm2 &> /dev/null; then
        log "📦 Installing PM2 process manager..."
        sudo npm install -g pm2
    else
        log_warning "PM2 already installed: $(pm2 --version)"
    fi

    log "📁 Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$(whoami):$(whoami)" "$APP_DIR"
    cd "$APP_DIR"

    log "🔧 Creating enhanced Express.js server..."
    cat > server.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_DIR = process.env.LOG_DIR || '/var/log/vauntico';

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'production') {
    const accessLogStream = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

        if (NODE_ENV === 'production') {
            fs.appendFile(path.join(LOG_DIR, 'requests.log'), logEntry + '\n', (err) => {
                if (err) console.error('Error writing to request log:', err);
            });
        } else {
            console.log(logEntry);
        }
    });
    next();
});

app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: NODE_ENV,
        port: PORT
    };

    res.json(healthData);
});

app.get('/api/v1/status', (req, res) => {
    res.json({
        status: 'ok',
        version: process.env.npm_package_version || '2.0.0',
        service: 'trust-score-backend',
        uptime: process.uptime(),
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Vauntico Trust-Score Backend API v2.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        environment: NODE_ENV
    });
});

app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Vauntico Trust-Score API',
        version: '2.0.0',
        endpoints: {
            health: {
                method: 'GET',
                path: '/health',
                description: 'Health check with detailed metrics'
            },
            status: {
                method: 'GET',
                path: '/api/v1/status',
                description: 'API status information'
            },
            docs: {
                method: 'GET',
                path: '/api/docs',
                description: 'API documentation'
            }
        }
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

    const errorLog = `${new Date().toISOString()} - ERROR: ${err.stack}\n`;
    if (NODE_ENV === 'production') {
        fs.appendFile(path.join(LOG_DIR, 'error.log'), errorLog, (err) => {
            if (err) console.error('Error writing to error log:', err);
        });
    } else {
        console.error(errorLog);
    }

    res.status(status).json({
        error: 'Internal Server Error',
        message: message,
        timestamp: new Date().toISOString(),
        ...(NODE_ENV !== 'production' && { stack: err.stack })
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
EOF

    log "📦 Creating enhanced package.json..."
    cat > package.json << EOF
{
  "name": "trust-score-backend",
  "version": "2.0.0",
  "description": "Vauntico Trust-Score Backend API - Production Ready",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "security-check": "npm audit",
    "monitor": "pm2 monit",
    "logs": "pm2 logs",
    "restart": "pm2 restart trust-score",
    "stop": "pm2 stop trust-score",
    "delete": "pm2 delete trust-score"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": [
    "vauntico",
    "trust-score",
    "api",
    "backend",
    "express"
  ],
  "author": "Vauntico Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/vauntico/trust-score-backend.git"
  }
}
EOF

    log "🔧 Creating environment configuration..."
    cat > .env << EOF
NODE_ENV=production
PORT=$PORT
LOG_DIR=$LOG_DIR
API_VERSION=2.0.0
EOF

    log "📦 Installing application dependencies..."
    npm ci --production

    log "🔒 Running security audit..."
    npm audit --audit-level moderate || true

    security_hardening

    setup_monitoring

    log "🔧 Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT,
      LOG_DIR: '$LOG_DIR'
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    log "🚀 Starting application with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup

    log "⏳ Waiting for application to fully start..."
    sleep 15

    if health_check; then
        log_success "Application is healthy and responding"
    else
        log_error "Health check failed"
        exit 1
    fi

    log "🔧 Creating systemd service for PM2..."
    sudo tee /etc/systemd/system/trust-score.service > /dev/null << EOF
[Unit]
Description=Trust Score Backend Service
After=network.target

[Service]
Type=forking
User=$SERVICE_NAME
Group=$SERVICE_NAME
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 delete all
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=LOG_DIR=$LOG_DIR

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable trust-score
    sudo systemctl start trust-score

    log "📊 Verifying service status..."
    if sudo systemctl is-active --quiet trust-score; then
        log_success "Systemd service is running"
    else
        log_error "Systemd service failed to start"
        exit 1
    fi

    log "🧹 Cleaning up..."
    if [[ -d "${APP_DIR}.backup" ]]; then
        sudo rm -rf "${APP_DIR}.backup"
    fi

    log "🧪 Performing final verification..."

    endpoints=(
        "/health"
        "/api/v1/status"
        "/"
        "/api/docs"
    )

    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "http://localhost:$PORT$endpoint" > /dev/null 2>&1; then
            log_success "Endpoint $endpoint is responding"
        else
            log_error "Endpoint $endpoint failed to respond"
        fi
    done

    echo ""
    log_success "✅ Backend deployment completed successfully!"
    echo ""
    echo -e "${BLUE}🌐 Available endpoints:${NC}"
    echo -e "   Health: http://localhost:$PORT/health"
    echo -e "   Status: http://localhost:$PORT/api/v1/status"
    echo -e "   Root: http://localhost:$PORT/"
    echo -e "   API Docs: http://localhost:$PORT/api/docs"
    echo ""
    echo -e "${BLUE}🔧 Service management:${NC}"
    echo -e "   Start: sudo systemctl start trust-score"
    echo -e "   Stop: sudo systemctl stop trust-score"
    echo -e "   Restart: sudo systemctl restart trust-score"
    echo -e "   Status: sudo systemctl status trust-score"
    echo -e "   Logs: sudo journalctl -u trust-score -f"
    echo -e "   PM2: pm2 monit"
    echo -e "   PM2 Logs: pm2 logs trust-score"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo -e "   Application logs: $LOG_DIR/"
    echo -e "   PM2 monitoring: pm2 monit"
    echo -e "   System metrics: top, htop, iostat"
    echo ""
    echo -e "${BLUE}🌍 External access will be available after DNS setup:${NC}"
    echo -e "   https://trust-score.vauntico.com/health"
    echo -e "   https://trust-score.vauntico.com/api/v1/status"
    echo -e "   https://trust-score.vauntico.com/api/docs"
    echo ""
    echo -e "${GREEN}🎉 Vauntico Trust-Score Backend v2.0 is now running with enhanced security and monitoring!${NC}"
}

# Run main function
main "$@"
EOF

2. **Create the validation script**:
```bash
cat > validate-backend-deployment.sh << 'EOF'
#!/bin/bash

set -euo pipefail

readonly HOST="${HOST:-localhost}"
readonly PORT="${PORT:-3000}"
readonly BASE_URL="http://$HOST:$PORT"
readonly TIMEOUT=30

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

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

run_test() {
    local test_name="$1"
    local test_command="$2"

    ((TESTS_TOTAL++))

    log "Running test: $test_name"

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

main() {
    log "🧪 Starting Vauntico Trust-Score Backend Validation..."
    echo ""

    if ! curl -f -s --connect-timeout 5 "$BASE_URL/health" > /dev/null 2>&1; then
        log_error "Service is not accessible at $BASE_URL"
        log_error "Please ensure the service is running before running validation"
        exit 1
    fi

    log_success "Service is accessible at $BASE_URL"
    echo ""

    log "=== Basic Connectivity Tests ==="

    run_test "Health Check Endpoint" "curl -f -s '$BASE_URL/health' > /dev/null"
    run_test "Status Endpoint" "curl -f -s '$BASE_URL/api/v1/status' > /dev/null"
    run_test "Root Endpoint" "curl -f -s '$BASE_URL/' > /dev/null"
    run_test "API Docs Endpoint" "curl -f -s '$BASE_URL/api/docs' > /dev/null"

    echo ""

    log "=== Response Format Tests ==="

    run_test "Health Endpoint JSON Structure" "
        curl -s '$BASE_URL/health' | grep -q '\"status\"' && curl -s '$BASE_URL/health' | grep -q '\"timestamp\"'
    "

    run_test "Status Endpoint JSON Structure" "
        curl -s '$BASE_URL/api/v1/status' | grep -q '\"status\"' && curl -s '$BASE_URL/api/v1/status' | grep -q '\"service\"'
    "

    echo ""

    log "=== Performance Tests ==="

    run_test "Health Endpoint Performance" "
        for i in {1..10}; do
            curl -s '$BASE_URL/health' > /dev/null || exit 1
        done
    "

    echo ""

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

main "$@"
EOF
````

### Step 3: Execute Deployment

1. **Make scripts executable**:

```bash
chmod +x backend-deploy-v2-optimized.sh
chmod +x validate-backend-deployment.sh
```

2. **Run the deployment**:

```bash
./backend-deploy-v2-optimized.sh
```

This will take approximately 10-15 minutes to complete. The script will:

- Update system packages
- Install Node.js 18.x and PM2
- Create the application directory
- Set up an Express.js server with security features
- Configure PM2 process management
- Set up systemd service
- Configure firewall and monitoring

3. **Verify deployment**:

```bash
# Test the health endpoint
curl http://localhost:3000/health

# Run the validation script
./validate-backend-deployment.sh
```

### Step 4: Verify External Access

After deployment is complete, test external access from your local machine:

```bash
# Test health endpoint through Cloudflare
curl -I https://trust-score.vauntico.com/health

# Test status API through Cloudflare
curl -I https://trust-score.vauntico.com/api/v1/status
```

## 🎯 Success Criteria

✅ **Health check returns HTTP 200 OK locally and via Cloudflare**
✅ **Status API responds with JSON payload**
✅ **Backend service is running persistently (systemd or PM2)**

## 🚨 Troubleshooting

If you encounter issues:

1. **Check service status**:

```bash
sudo systemctl status trust-score
pm2 status
```

2. **View logs**:

```bash
sudo journalctl -u trust-score -f
pm2 logs trust-score
```

3. **Restart service**:

```bash
sudo systemctl restart trust-score
```

4. **Check firewall**:

```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

## 📞 Additional Support

If you need assistance during the deployment:

- Check the application logs: `/var/log/vauntico/`
- Use PM2 monitoring: `pm2 monit`
- Verify all endpoints are responding: `curl http://localhost:3000/health`

---

**Once completed, the Vauntico Trust-Score Backend will be fully operational and accessible through the Cloudflare CDN at `https://trust-score.vauntico.com`**

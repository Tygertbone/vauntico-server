#!/bin/bash

# Vauntico Backend Deployment Script
# Consolidated from backend-deploy-v2-optimized.sh
# Enhanced with error handling, logging, and cleanup

set -euo pipefail  # Exit on error, undefined vars, pipe failures

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
readonly NC='\033[0m' # No Color

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
    
    # Stop and disable service
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME" || true
        log_warning "Stopped $SERVICE_NAME service"
    fi
    
    if systemctl is-enabled --quiet "$SERVICE_NAME"; then
        sudo systemctl disable "$SERVICE_NAME" || true
        log_warning "Disabled $SERVICE_NAME service"
    fi
    
    # Remove service file
    if [[ -f "/etc/systemd/system/$SERVICE_NAME.service" ]]; then
        sudo rm -f "/etc/systemd/system/$SERVICE_NAME.service"
        sudo systemctl daemon-reload
        log_warning "Removed systemd service file"
    fi
    
    # Remove application directory backup
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
    
    # Create dedicated user for the service
    if ! id "$SERVICE_NAME" &>/dev/null; then
        sudo useradd --system --shell /bin/false --home "$APP_DIR" "$SERVICE_NAME"
        log_success "Created dedicated user: $SERVICE_NAME"
    fi
    
    # Set proper permissions
    sudo chown -R "$SERVICE_NAME:$SERVICE_NAME" "$APP_DIR"
    sudo chmod 755 "$APP_DIR"
    sudo chmod 644 "$APP_DIR"/*.json "$APP_DIR"/*.js 2>/dev/null || true
    log_success "Set proper file permissions"
    
    # Configure firewall
    sudo ufw --force enable 2>/dev/null || true
    sudo ufw allow ssh 2>/dev/null || true
    sudo ufw allow "$PORT/tcp" 2>/dev/null || true
    log_success "Configured firewall rules"
}

# Monitoring setup
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directory
    sudo mkdir -p "$LOG_DIR"
    sudo chown "$SERVICE_NAME:$SERVICE_NAME" "$LOG_DIR"
    
    # Create log rotation config
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
    log "🚀 Starting Vauntico Backend Deployment..."
    
    # Trap errors and call rollback
    trap rollback ERR
    
    # Create log directory
    sudo mkdir -p "$LOG_DIR"
    
    # Backup existing installation if it exists
    if [[ -d "$APP_DIR" ]]; then
        log_warning "Existing installation found. Creating backup..."
        sudo cp -r "$APP_DIR" "${APP_DIR}.backup"
    fi
    
    # Update system packages
    log "📦 Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install required packages
    log "📦 Installing required packages..."
    sudo apt-get install -y curl wget git ufw fail2ban unattended-upgrades
    
    # Install Node.js
    log "📦 Installing Node.js $NODE_VERSION..."
    if ! command -v node &> /dev/null; then
        curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}" | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log_warning "Node.js already installed: $(node --version)"
    fi
    
    # Install PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        log "📦 Installing PM2 process manager..."
        sudo npm install -g pm2
    else
        log_warning "PM2 already installed: $(pm2 --version)"
    fi
    
    # Create application directory
    log "📁 Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$(whoami):$(whoami)" "$APP_DIR"
    cd "$APP_DIR"
    
    # Clone repository if REPO_URL is provided
    if [[ -n "${REPO_URL:-}" ]]; then
        log "📥 Cloning application repository..."
        git clone "$REPO_URL" .
    else
        log "📥 No REPO_URL provided, using placeholder application..."
    fi
    
    # Create enhanced Express.js server
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

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Middleware
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

// Logging
if (NODE_ENV === 'production') {
    const accessLogStream = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Request logging middleware
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

// Health check endpoint with detailed metrics
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

// API status endpoint
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

// Main endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Vauntico Trust-Score Backend API v2.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        environment: NODE_ENV
    });
});

// API documentation endpoint
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

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    
    // Log error
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

// Graceful shutdown
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

    # Create enhanced package.json
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

    # Create environment configuration
    log "🔧 Creating environment configuration..."
    cat > .env << EOF
NODE_ENV=production
PORT=$PORT
LOG_DIR=$LOG_DIR
API_VERSION=2.0.0
EOF

    # Install dependencies
    log "📦 Installing application dependencies..."
    npm ci --production
    
    # Security audit
    log "🔒 Running security audit..."
    npm audit --audit-level moderate || true
    
    # Security hardening
    security_hardening
    
    # Setup monitoring
    setup_monitoring
    
    # Create PM2 ecosystem file
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

    # Start application with PM2
    log "🚀 Starting application with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    # Wait for application to start
    log "⏳ Waiting for application to fully start..."
    sleep 15
    
    # Health check
    if health_check; then
        log_success "Application is healthy and responding"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Create systemd service for PM2
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

    # Enable and start systemd service
    sudo systemctl daemon-reload
    sudo systemctl enable trust-score
    sudo systemctl start trust-score
    
    # Verify service status
    log "📊 Verifying service status..."
    if sudo systemctl is-active --quiet trust-score; then
        log_success "Systemd service is running"
    else
        log_error "Systemd service failed to start"
        exit 1
    fi
    
    # Cleanup
    log "🧹 Cleaning up..."
    if [[ -d "${APP_DIR}.backup" ]]; then
        sudo rm -rf "${APP_DIR}.backup"
    fi
    
    # Final verification
    log "🧪 Performing final verification..."
    
    # Check all endpoints
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
    
    # Display deployment summary
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

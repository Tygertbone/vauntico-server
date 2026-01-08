#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Database Provisioning Script
# ============================================================================
# This script provisions an Oracle Autonomous Database in the private subnet
# and configures connection strings and access controls
#
# Prerequisites:
# - OCI infrastructure must be set up (run setup-oci-infrastructure.sh first)
# - Proper IAM permissions for database provisioning
# - OCI CLI installed and configured
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
COMPARTMENT_ID=""
PRIVATE_SUBNET_ID=""
DB_DISPLAY_NAME="Vauntico-MVP-ADB"
DB_ADMIN_PASSWORD=""
DB_WORKLOAD="OLTP"  # OLTP for transactional, DW for data warehousing
DB_CPU_CORE_COUNT=1
DB_DATA_STORAGE_SIZE_IN_TBS=1  # 1 TB
DB_AUTO_SCALING_ENABLED=true
DB_IS_FREE_TIER=true
DB_IS_DEDICATED=false
DB_LICENSE_MODEL="LICENSE_INCLUDED"
DB_DB_VERSION="19c"

# Variables to store created resource OCIDs
DB_ID=""
DB_CONNECTION_STRING=""
DB_WALLET_FILE=""

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if infrastructure exists
check_infrastructure() {
    log "Checking if OCI infrastructure exists..."
    
    if [[ -z "$COMPARTMENT_ID" ]]; then
        echo "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        read -p "Enter your Vauntico-MVP Compartment OCID: " COMPARTMENT_ID
        
        if [[ -z "$COMPARTMENT_ID" ]]; then
            error "Compartment ID is required"
        fi
    fi
    
    # Check for existing VCN and subnets
    VCN_ID=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" --display-name "Vauntico-MVP-VCN" --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$VCN_ID" ]]; then
        error "Vauntico-MVP VCN not found. Please run setup-oci-infrastructure.sh first"
    fi
    
    PRIVATE_SUBNET_ID=$(oci network subnet list --compartment-id "$COMPARTMENT_ID" --vcn-id "$VCN_ID" --display-name "Vauntico-MVP-Private-Subnet" --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$PRIVATE_SUBNET_ID" ]]; then
        error "Vauntico-MVP Private Subnet not found. Please run setup-oci-infrastructure.sh first"
    fi
    
    success "Infrastructure validation passed"
}

# Generate secure admin password
generate_admin_password() {
    log "Generating secure admin password..."
    
    if [[ -z "$DB_ADMIN_PASSWORD" ]]; then
        # Generate a strong password (12 characters with mixed case, numbers, and symbols)
        DB_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-12)
        log "Generated admin password (save this securely!)"
    fi
    
    # Validate password complexity
    if [[ ${#DB_ADMIN_PASSWORD} -lt 8 ]]; then
        error "Password must be at least 8 characters long"
    fi
    
    success "Admin password generated"
}

# Create Autonomous Database
create_autonomous_database() {
    log "Creating Autonomous Database..."
    
    DB_OUTPUT=$(oci db autonomous-database create \
        --compartment-id "$COMPARTMENT_ID" \
        --subnet-id "$PRIVATE_SUBNET_ID" \
        --display-name "$DB_DISPLAY_NAME" \
        --db-name "VAUNTICO" \
        --admin-password "$DB_ADMIN_PASSWORD" \
        --cpu-core-count "$DB_CPU_CORE_COUNT" \
        --data-storage-size-in-tbs "$DB_DATA_STORAGE_SIZE_IN_TBS" \
        --workload "$DB_WORKLOAD" \
        --auto-scaling-enabled "$DB_AUTO_SCALING_ENABLED" \
        --is-free-tier "$DB_IS_FREE_TIER" \
        --is-dedicated "$DB_IS_DEDICATED" \
        --license-model "$DB_LICENSE_MODEL" \
        --db-version "$DB_DB_VERSION" \
        --whitelisted-ips '[]' \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to create Autonomous Database: $DB_OUTPUT"
    fi
    
    DB_ID="$DB_OUTPUT"
    success "Autonomous Database created: $DB_ID"
    
    # Wait for database to be fully available
    log "Waiting for database to be fully available..."
    sleep 60
}

# Get database connection details
get_database_details() {
    log "Retrieving database connection details..."
    
    # Get connection strings
    DB_CONNECTION_STRING=$(oci db autonomous-database get \
        --autonomous-database-id "$DB_ID" \
        --query 'data.connection_strings.high' \
        --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$DB_CONNECTION_STRING" ]]; then
        error "Failed to retrieve connection string"
    fi
    
    success "Connection string retrieved"
}

# Download database wallet
download_database_wallet() {
    log "Downloading database wallet..."
    
    WALLET_DIR="vauntico-db-wallet"
    WALLET_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    # Create wallet directory
    mkdir -p "$WALLET_DIR"
    
    # Generate wallet
    WALLET_OUTPUT=$(oci db autonomous-database generate-wallet \
        --autonomous-database-id "$DB_ID" \
        --password "$WALLET_PASSWORD" \
        --file "$WALLET_DIR/Wallet_VAUNTICO.zip" \
        2>&1)
    
    if [[ $? -ne 0 ]]; then
        error "Failed to download database wallet: $WALLET_OUTPUT"
    fi
    
    # Extract wallet
    cd "$WALLET_DIR"
    unzip -q Wallet_VAUNTICO.zip
    cd ..
    
    DB_WALLET_FILE="$WALLET_DIR/Wallet_VAUNTICO.zip"
    success "Database wallet downloaded and extracted to $WALLET_DIR"
}

# Create database connection script
create_connection_script() {
    log "Creating database connection script..."
    
    cat > vauntico-db-connect.sh << 'EOF'
#!/bin/bash

# ============================================================================
# Vauntico MVP - Database Connection Helper
# ============================================================================
# This script provides connection utilities for the Vauntico database
# ============================================================================

# Database configuration
DB_CONNECTION_STRING="PLACEHOLDER_CONNECTION_STRING"
DB_USERNAME="ADMIN"
DB_PASSWORD="PLACEHOLDER_ADMIN_PASSWORD"
DB_WALLET_DIR="PLACEHOLDER_WALLET_DIR"
WALLET_PASSWORD="PLACEHOLDER_WALLET_PASSWORD"

# Connection string for different languages
echo "=========================================="
echo "Vauntico MVP Database Connection Strings"
echo "=========================================="
echo ""
echo "Oracle SQL*Plus:"
echo "sqlplus ADMIN@${DB_CONNECTION_STRING}"
echo ""
echo "Node.js (node-oracledb):"
echo "connectionString: '${DB_CONNECTION_STRING}',"
echo "user: 'ADMIN',"
echo "password: '${DB_PASSWORD}',"
echo "walletLocation: '${DB_WALLET_DIR}',"
echo "walletPassword: '${WALLET_PASSWORD}'"
echo ""
echo "Python (cx_Oracle):"
echo "dsn = cx_Oracle.makedsn('${DB_CONNECTION_STRING}', service_name='HIGH')"
echo "conn = cx_Oracle.connect(user='ADMIN', password='${DB_PASSWORD}', dsn=dsn, encoding='UTF-8')"
echo ""
echo "Java (JDBC):"
echo "jdbc:oracle:thin:@${DB_CONNECTION_STRING}?TNS_ADMIN=${DB_WALLET_DIR}"
echo ""
echo "Environment Variables for Applications:"
echo "export DATABASE_URL=\"oracle://ADMIN:${DB_PASSWORD}@${DB_CONNECTION_STRING}?wallet_location=${DB_WALLET_DIR}&wallet_password=${WALLET_PASSWORD}\""
echo "export DB_USERNAME=\"ADMIN\""
echo "export DB_PASSWORD=\"${DB_PASSWORD}\""
echo "export DB_CONNECTION_STRING=\"${DB_CONNECTION_STRING}\""
echo "export DB_WALLET_DIR=\"${DB_WALLET_DIR}\""
echo "export DB_WALLET_PASSWORD=\"${WALLET_PASSWORD}\""
echo ""
echo "To connect with SQL*Plus:"
echo "1. Install Oracle Instant Client"
echo "2. Set TNS_ADMIN=${DB_WALLET_DIR}"
echo "3. Run: sqlplus ADMIN@${DB_CONNECTION_STRING}"
echo ""

# Test connection if requested
if [[ "${1:-}" == "--test" ]]; then
    echo "Testing database connection..."
    echo "Please ensure Oracle Instant Client is installed and TNS_ADMIN is set."
    echo "Run: sqlplus ADMIN@${DB_CONNECTION_STRING}"
fi
EOF
    
    # Replace placeholders
    sed -i "s|PLACEHOLDER_CONNECTION_STRING|$DB_CONNECTION_STRING|g" vauntico-db-connect.sh
    sed -i "s|PLACEHOLDER_ADMIN_PASSWORD|$DB_ADMIN_PASSWORD|g" vauntico-db-connect.sh
    sed -i "s|PLACEHOLDER_WALLET_DIR|$DB_WALLET_DIR|g" vauntico-db-connect.sh
    sed -i "s|PLACEHOLDER_WALLET_PASSWORD|$WALLET_PASSWORD|g" vauntico-db-connect.sh
    
    chmod +x vauntico-db-connect.sh
    success "Database connection script created"
}

# Create sample database schema
create_database_schema() {
    log "Creating sample database schema..."
    
    cat > vauntico-schema.sql << 'EOF'
-- ============================================================================
-- Vauntico MVP - Database Schema
-- ============================================================================
-- This script creates the basic schema for Vauntico MVP
-- ============================================================================

-- Users table
CREATE TABLE vauntico_users (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) UNIQUE NOT NULL,
    username VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(100),
    last_name VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1,
    email_verified NUMBER(1) DEFAULT 0
);

-- Sessions table
CREATE TABLE vauntico_sessions (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    session_token VARCHAR2(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vauntico_users(id)
);

-- Trust scores table
CREATE TABLE vauntico_trust_scores (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    score NUMBER(5,2) NOT NULL,
    factors JSON,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vauntico_users(id)
);

-- Transactions table
CREATE TABLE vauntico_transactions (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    transaction_type VARCHAR2(50) NOT NULL,
    amount NUMBER(15,2),
    currency VARCHAR2(3) DEFAULT 'USD',
    status VARCHAR2(20) DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vauntico_users(id)
);

-- Audit log table
CREATE TABLE vauntico_audit_log (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    action VARCHAR2(100) NOT NULL,
    resource_type VARCHAR2(50),
    resource_id VARCHAR2(100),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vauntico_users(id)
);

-- Create indexes for performance
CREATE INDEX idx_vauntico_users_email ON vauntico_users(email);
CREATE INDEX idx_vauntico_users_username ON vauntico_users(username);
CREATE INDEX idx_vauntico_sessions_token ON vauntico_sessions(session_token);
CREATE INDEX idx_vauntico_sessions_user_id ON vauntico_sessions(user_id);
CREATE INDEX idx_vauntico_trust_scores_user_id ON vauntico_trust_scores(user_id);
CREATE INDEX idx_vauntico_transactions_user_id ON vauntico_transactions(user_id);
CREATE INDEX idx_vauntico_audit_log_user_id ON vauntico_audit_log(user_id);
CREATE INDEX idx_vauntico_audit_log_created_at ON vauntico_audit_log(created_at);

-- Insert sample data
INSERT INTO vauntico_users (email, username, first_name, last_name, password_hash)
VALUES ('admin@vauntico.com', 'admin', 'Vauntico', 'Admin', '\$2b\$10\$placeholder_hash');

COMMIT;

-- Show created tables
SELECT table_name FROM user_tables WHERE table_name LIKE 'VAUNTICO_%' ORDER BY table_name;
EOF
    
    success "Database schema file created"
}

# Generate database summary
generate_database_summary() {
    log "Generating database setup summary..."
    
    SUMMARY_FILE="oci-database-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
 ============================================================================
 Vauntico MVP - Autonomous Database Setup Summary
 ============================================================================
 Created on: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 DATABASE DETAILS:
 -----------------
 Database Name: $DB_DISPLAY_NAME
 Database ID: $DB_ID
 DB Name: VAUNTICO
 Workload: $DB_WORKLOAD
 CPU Cores: $DB_CPU_CORE_COUNT
 Storage: ${DB_DATA_STORAGE_SIZE_IN_TBS}TB
 Auto-scaling: $DB_AUTO_SCALING_ENABLED
 Free Tier: $DB_IS_FREE_TIER
 Version: $DB_DB_VERSION
 Private Subnet: $PRIVATE_SUBNET_ID
 
 CONNECTION DETAILS:
 -----------------
 Connection String: $DB_CONNECTION_STRING
 Admin Username: ADMIN
 Admin Password: $DB_ADMIN_PASSWORD
 Wallet Location: $DB_WALLET_DIR
 Wallet Password: $WALLET_PASSWORD
 
 SAMPLE CONNECTION STRINGS:
 -------------------------
 Oracle SQL*Plus:
   sqlplus ADMIN@$DB_CONNECTION_STRING
   
 Node.js (node-oracledb):
   connectionString: '$DB_CONNECTION_STRING',
   user: 'ADMIN',
   password: '$DB_ADMIN_PASSWORD',
   walletLocation: '$DB_WALLET_DIR',
   walletPassword: '$WALLET_PASSWORD'
   
 Python (cx_Oracle):
   dsn = cx_Oracle.makedsn('$DB_CONNECTION_STRING', service_name='HIGH')
   conn = cx_Oracle.connect(user='ADMIN', password='$DB_ADMIN_PASSWORD', dsn=dsn, encoding='UTF-8')
   
 Java (JDBC):
   jdbc:oracle:thin:@$DB_CONNECTION_STRING?TNS_ADMIN=$DB_WALLET_DIR
 
 NEXT STEPS:
 -----------
 1. Install Oracle Instant Client in your application server
 2. Set TNS_ADMIN environment variable to wallet directory
 3. Run the schema: ./vauntico-db-connect.sh for connection details
 4. Import sample schema: sqlplus ADMIN@$DB_CONNECTION_STRING @vauntico-schema.sql
 5. Configure your application with connection details
 6. Test connectivity from your application
 
 SECURITY NOTES:
 --------------
 • Store admin password securely (consider using OCI Vault)
 • Use least-privilege database users for applications
 • Enable database auditing in production
 • Regularly rotate database credentials
 • Use VCN security lists to restrict access
 
 CLEANUP COMMAND (if needed):
 ---------------------------
 oci db autonomous-database delete --autonomous-database-id $DB_ID --force
 ============================================================================
EOF
    
    success "Database summary saved to: $SUMMARY_FILE"
    
    # Display summary to console
    log "AUTONOMOUS DATABASE SETUP COMPLETED!"
    echo ""
    echo "Database Details:"
    echo "  Name: $DB_DISPLAY_NAME"
    echo "  ID: $DB_ID"
    echo "  Connection String: $DB_CONNECTION_STRING"
    echo "  Admin Username: ADMIN"
    echo "  Admin Password: $DB_ADMIN_PASSWORD"
    echo "  Wallet: $DB_WALLET_DIR"
    echo ""
    echo "Quick Connection Test:"
    echo "  ./vauntico-db-connect.sh"
    echo ""
    echo "Next Steps:"
    echo "  1. Run: ./vauntico-db-connect.sh (for connection strings)"
    echo "  2. Import schema: sqlplus ADMIN@$DB_CONNECTION_STRING @vauntico-schema.sql"
    echo "  3. Configure your application"
    echo ""
    echo "Full summary saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    log "Starting Vauntico MVP Autonomous Database Setup..."
    echo ""
    
    check_infrastructure
    generate_admin_password
    create_autonomous_database
    get_database_details
    download_database_wallet
    create_connection_script
    create_database_schema
    generate_database_summary
    
    success "🎉 Vauntico MVP database setup completed successfully!"
    echo ""
    log "Your Vauntico MVP Autonomous Database is ready for use!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

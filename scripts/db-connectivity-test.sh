#!/bin/bash

# Database Connectivity Test Script
# This script installs the PostgreSQL client, connects to the Neon database, and validates the schema.

# Exit immediately if any command fails
set -e

# Step 1: Install PostgreSQL Client
echo "🔧 Installing PostgreSQL client..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Ubuntu/Debian
    sudo apt update
    sudo apt install postgresql-client -y
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (Homebrew)
    brew install postgresql
elif [[ "$OSTYPE" == "cygwin"* || "$OSTYPE" == "msys"* || "$OSTYPE" == "win32"* ]]; then
    # Windows (Chocolatey)
    choco install postgresql
else
    echo "🚨 Unsupported operating system: $OSTYPE"
    exit 1
fi

# Step 2: Connect to Neon Database
echo "🔌 Connecting to Neon database..."
DATABASE_URL="postgresql://neondb_owner:npg_BNyQzvI6EZ5i@ep-sparkling-bush-ahi9wjg6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Step 3: Validate Schema
echo "📋 Validating schema..."
psql "$DATABASE_URL" <<EOF
-- List all tables
\dt

-- Check subscriptions table
\d subscriptions

-- Check feature_usage table
\d feature_usage
EOF

# Step 4: Confirm Schema Matches Migration Files
echo "✅ Schema validation complete. Please confirm that the schema matches your migration files (columns, constraints, indexes)."

# Step 5: Exit
echo "🎉 Database connectivity test completed successfully!"
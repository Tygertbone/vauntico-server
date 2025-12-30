#!/bin/bash
# Cross-platform migration script for Vauntico MVP Emergency Revenue Features
# Works on Git Bash, WSL, macOS, and Linux

echo "🚀 Starting Vauntico Emergency Revenue Database Migration..."

# Navigate to project directory
cd "$(dirname "$0")"

# Check if migration file exists
if [ ! -f "migrations/019_create_emergency_revenue_tables.sql" ]; then
    echo "❌ Migration file not found: migrations/019_create_emergency_revenue_tables.sql"
    exit 1
fi

echo "✅ Migration file found"

# Check if Neon CLI is installed
if ! command -v neon &> /dev/null; then
    echo "❌ Neon CLI not found. Installing..."
    npm install -g neonctl
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Neon CLI"
        exit 1
    fi
    echo "✅ Neon CLI installed successfully"
fi

# Get Neon CLI version
NEON_VERSION=$(neon --version 2>/dev/null)
echo "📋 Neon CLI version: $NEON_VERSION"

# Check if organization ID and project ID are set
if [ -z "$NEON_ORG_ID" ]; then
    echo "⚠️  NEON_ORG_ID environment variable not set"
    echo "Please set your Neon organization ID:"
    echo "export NEON_ORG_ID=your-org-id"
    echo "Then run the script again"
    exit 1
fi

if [ -z "$NEON_PROJECT_ID" ]; then
    echo "⚠️  NEON_PROJECT_ID environment variable not set"
    echo "Please set your Neon project ID:"
    echo "export NEON_PROJECT_ID=your-project-id"
    echo "Then run the script again"
    exit 1
fi

echo "✅ Environment variables configured"
echo "🏢 Organization ID: $NEON_ORG_ID"
echo "🏢 Project ID: $NEON_PROJECT_ID"

# Run the migration
echo "🔄 Running database migration..."
if neon sql --project-id "$NEON_PROJECT_ID" --org-id "$NEON_ORG_ID" --file "migrations/019_create_emergency_revenue_tables.sql"; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

# Verify the migration
echo "🔍 Verifying migration..."

# Check if tables were created
TABLE_COUNT=$(neon sql --project-id "$NEON_PROJECT_ID" --org-id "$NEON_ORG_ID" --command "
SELECT COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases');
" 2>/dev/null | grep -o '[0-9]\+' || echo "0")

if [ "$TABLE_COUNT" = "3" ]; then
    echo "✅ All 3 emergency revenue tables created successfully"
else
    echo "❌ Expected 3 tables, found $TABLE_COUNT"
    exit 1
fi

# Check row counts
echo "📊 Checking row counts..."
neon sql --project-id "$NEON_PROJECT_ID" --org-id "$NEON_ORG_ID" --command "
SELECT 
    'creator_payment_requests' as table_name,
    COUNT(*) as row_count
FROM creator_payment_requests
UNION ALL
SELECT 
    'creator_verifications' as table_name,
    COUNT(*) as row_count
FROM creator_verifications
UNION ALL
SELECT 
    'content_recovery_cases' as table_name,
    COUNT(*) as row_count
FROM content_recovery_cases;
"

echo "🎉 Migration and verification completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - 3 emergency revenue tables created"
echo "   - Database: Neon PostgreSQL"
echo "   - Organization: $NEON_ORG_ID"
echo "   - Project: $NEON_PROJECT_ID"
echo ""
echo "🔗 Next steps:"
echo "   1. Deploy backend to OCI server"
echo "   2. Deploy frontend to Vercel"
echo "   3. Run verification tests"
echo "   4. Monitor deployment"

@echo off
echo 🚀 Starting Vauntico Emergency Revenue Database Migration...

REM Navigate to project directory
cd /d "c:\Users\admin\vauntico-mvp\server-v2"

REM Check if migration file exists
if not exist "migrations\019_create_emergency_revenue_tables.sql" (
    echo ❌ Migration file not found: migrations\019_create_emergency_revenue_tables.sql
    pause
    exit /b 1
)

echo ✅ Migration file found

REM Check if Neon CLI is installed
neon --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Neon CLI not found. Installing...
    npm install -g neonctl
    if errorlevel 1 (
        echo ❌ Failed to install Neon CLI
        pause
        exit /b 1
    )
    echo ✅ Neon CLI installed successfully
)

REM Get Neon CLI version
for /f "tokens=1-2 delims=" " %%a in ('neon --version') do set neon_version=%%a

echo 📋 Neon CLI version: %neon_version%

REM Check if environment variables are set
if "%NEON_ORG_ID%"=="" (
    echo ⚠️  NEON_ORG_ID environment variable not set
    echo Please set your Neon organization ID:
    echo set NEON_ORG_ID=your-org-id
    echo Then run the script again
    pause
    exit /b 1
)

if "%NEON_PROJECT_ID%"=="" (
    echo ⚠️  NEON_PROJECT_ID environment variable not set
    echo Please set your Neon project ID:
    echo set NEON_PROJECT_ID=your-project-id
    echo Then run the script again
    pause
    exit /b 1
)

echo ✅ Environment variables configured
echo 🏢 Organization ID: %NEON_ORG_ID%
echo 🏢 Project ID: %NEON_PROJECT_ID%

REM Run the migration
echo 🔄 Running database migration...
neon sql --project-id %NEON_PROJECT_ID% --org-id %NEON_ORG_ID% --file "migrations\019_create_emergency_revenue_tables.sql"
if errorlevel 1 (
    echo ❌ Migration failed!
    pause
    exit /b 1
)

echo ✅ Migration completed successfully!

REM Verify the migration
echo 🔍 Verifying migration...

REM Check if tables were created (simplified check)
neon sql --project-id %NEON_PROJECT_ID% --org-id %NEON_ORG_ID% --command "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases');" > temp_count.txt

set /p count_value=<temp_count.txt
for /f "tokens=1-2 delims=" " %%a in ("%count_value%") do (
    if "%%a"=="3" (
        echo ✅ All 3 emergency revenue tables created successfully
        goto :verification_success
    )
)

:verification_failed
echo ❌ Expected 3 tables, found different count
del temp_count.txt
pause
exit /b 1

:verification_success
del temp_count.txt

REM Check row counts
echo 📊 Checking row counts...
neon sql --project-id %NEON_PROJECT_ID% --org-id %NEON_ORG_ID% --command "SELECT 'creator_payment_requests' as table_name, COUNT(*) as row_count FROM creator_payment_requests UNION ALL SELECT 'creator_verifications' as table_name, COUNT(*) as row_count FROM creator_verifications UNION ALL SELECT 'content_recovery_cases' as table_name, COUNT(*) as row_count FROM content_recovery_cases;"

echo.
echo 🎉 Migration and verification completed successfully!
echo.
echo 📋 Summary:
echo    - 3 emergency revenue tables created
echo    - Database: Neon PostgreSQL
echo    - Organization: %NEON_ORG_ID%
echo    - Project: %NEON_PROJECT_ID%
echo.
echo 🔗 Next steps:
echo    1. Deploy backend to OCI server
echo    2. Deploy frontend to Vercel
echo    3. Run verification tests
echo    4. Monitor deployment
echo.
pause

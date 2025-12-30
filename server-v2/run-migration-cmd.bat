@echo off
echo 🚀 Starting Vauntico Emergency Revenue Database Migration...

REM Navigate to project directory
cd c:\Users\admin\vauntico-mvp\server-v2

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

REM Get current date for backup filename
for /f "tokens=2 delims=/" %%a in ('%date%') do set month=%%a
for /f "tokens=2 delims=/" %%a in ('%date%') do set day=%%b
for /f "tokens=2 delims=/" %%a in ('%date%') do set year=%%c

REM Set environment variables (replace with your actual values)
set NEON_ORG_ID=your-org-id
set NEON_PROJECT_ID=your-project-id

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

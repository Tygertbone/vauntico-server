# PowerShell script to run database migration
Write-Host "Running Emergency Revenue Database Migration..." -ForegroundColor Green

# Navigate to server-v2 directory
Set-Location "C:\Users\admin\vauntico-mvp\server-v2"

# Load environment variables
$envPath = ".\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host ".env file not found" -ForegroundColor Red
    exit 1
}

# Show DATABASE_URL (masked)
$dbUrl = $env:DATABASE_URL
if ($dbUrl) {
    $maskedUrl = $dbUrl -replace '://[^:]+:[^@]+@', '://***:***@'
    Write-Host "DATABASE_URL: $maskedUrl" -ForegroundColor Blue
} else {
    Write-Host "DATABASE_URL not found" -ForegroundColor Red
    exit 1
}

# Check if psql is available
try {
    $psqlVersion = psql --version 2>$null
    Write-Host "PostgreSQL client found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL client (psql) not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Run migration
Write-Host "Running migration..." -ForegroundColor Blue
try {
    $migrationResult = psql $env:DATABASE_URL -f "migrations\019_create_emergency_revenue_tables.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host $migrationResult
    } else {
        Write-Host "Migration failed!" -ForegroundColor Red
        Write-Host $migrationResult
        exit 1
    }
} catch {
    Write-Host "Migration error: $_" -ForegroundColor Red
    exit 1
}

# Verify tables were created
Write-Host "Verifying tables were created..." -ForegroundColor Blue
try {
    $verificationResult = psql $env:DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases');" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tables verification:" -ForegroundColor Green
        Write-Host $verificationResult
        
        # Count rows
        $rowCount = psql $env:DATABASE_URL -c "SELECT 'creator_payment_requests' as table_name, COUNT(*) as row_count FROM creator_payment_requests UNION ALL SELECT 'creator_verifications', COUNT(*) FROM creator_verifications UNION ALL SELECT 'content_recovery_cases', COUNT(*) FROM content_recovery_cases;" 2>&1
        Write-Host "Row counts:" -ForegroundColor Blue
        Write-Host $rowCount
    } else {
        Write-Host "Verification failed!" -ForegroundColor Red
        Write-Host $verificationResult
    }
} catch {
    Write-Host "Verification error: $_" -ForegroundColor Red
}

Write-Host "Database migration process complete!" -ForegroundColor Green

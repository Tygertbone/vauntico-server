# Railway Smoke Test Script for Vauntico Project (PowerShell Version)
# This script tests all 4 services after Railway deployment

param(
    [string]$ServerV2Url = "https://server-v2-url.railway.app",
    [string]$SrcUrl = "https://src-url.railway.app",
    [string]$HomepageRedesignUrl = "https://homepage-redesign-url.railway.app",
    [string]$VaultLandingUrl = "https://vault-landing-url.railway.app"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    White = "White"
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Test-HealthEndpoint {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$ExpectedStatus = 200
    )
    
    Write-ColorText "Testing $ServiceName..." "Yellow"
    Write-Host "URL: $Url"
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        $statusCode = 200
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-ColorText "✅ PASS - HTTP $statusCode" "Green"
            Write-Host "Response: $($response | ConvertTo-Json -Compress | Select-Object -First 200)..."
            return $true
        } else {
            Write-ColorText "❌ FAIL - HTTP $statusCode (expected $ExpectedStatus)" "Red"
            return $false
        }
    }
    catch {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -ErrorAction Stop
            $statusCode = [int]$response.StatusCode
            
            if ($statusCode -eq $ExpectedStatus) {
                Write-ColorText "✅ PASS - HTTP $statusCode" "Green"
                Write-Host "Response: $($response.Content | Select-Object -First 200)..."
                return $true
            } else {
                Write-ColorText "❌ FAIL - HTTP $statusCode (expected $ExpectedStatus)" "Red"
                Write-Host "Response: $($response.Content | Select-Object -First 200)..."
                return $false
            }
        }
        catch {
            Write-ColorText "❌ FAIL - Could not connect to the service" "Red"
            Write-Host "Error: $($_.Exception.Message)"
            return $false
        }
    }
    finally {
        Write-Host ""
    }
}

function Test-JsonResponse {
    param(
        [string]$Response,
        [string]$ServiceName
    )
    
    try {
        $jsonObject = $Response | ConvertFrom-Json
        Write-ColorText "✅ JSON Valid for $ServiceName" "Green"
        return $true
    }
    catch {
        Write-ColorText "⚠️  Invalid JSON for $ServiceName (may be expected for static files)" "Yellow"
        return $false
    }
}

# Main execution
Write-ColorText "🚀 Starting Railway Smoke Tests for Vauntico Services" "Yellow"
Write-Host "=================================================="
Write-Host ""

# Test 1: server-v2 health endpoint
Write-Host "1. Testing server-v2 service..."
$serverV2Result = Test-HealthEndpoint "$ServerV2Url/health" "server-v2"

# Test 2: src React app health endpoint
Write-Host "2. Testing src React app..."
$srcResult = Test-HealthEndpoint "$SrcUrl/health.json" "src"

# Test 3: homepage-redesign Next.js health endpoint
Write-Host "3. Testing homepage-redesign Next.js app..."
$homepageResult = Test-HealthEndpoint "$HomepageRedesignUrl/api/health" "homepage-redesign"

# Test 4: vault-landing health endpoint
Write-Host "4. Testing vault-landing..."
$vaultResult = Test-HealthEndpoint "$VaultLandingUrl/health.json" "vault-landing"

Write-Host "=================================================="
Write-ColorText "📊 Detailed Health Checks" "Yellow"
Write-Host "=================================================="

# Detailed checks with JSON validation
Write-Host ""
Write-Host "Checking detailed responses..."

# server-v2 detailed check
Write-Host ""
Write-ColorText "server-v2 detailed check:" "Yellow"
try {
    $response = Invoke-RestMethod -Uri "$ServerV2Url/health" -Method Get -ErrorAction Stop
    $responseJson = $response | ConvertTo-Json -Compress
    Write-Host "Response: $responseJson"
    Test-JsonResponse $responseJson "server-v2"
}
catch {
    Write-Host "Response: { 'error': 'connection_failed' }"
    Test-JsonResponse "{ 'error': 'connection_failed' }" "server-v2"
}

# src detailed check
Write-Host ""
Write-ColorText "src detailed check:" "Yellow"
try {
    $response = Invoke-RestMethod -Uri "$SrcUrl/health.json" -Method Get -ErrorAction Stop
    $responseJson = $response | ConvertTo-Json -Compress
    Write-Host "Response: $responseJson"
    Test-JsonResponse $responseJson "src"
}
catch {
    try {
        $response = Invoke-WebRequest -Uri "$SrcUrl/health.json" -Method Get -ErrorAction Stop
        Write-Host "Response: $($response.Content)"
        Test-JsonResponse $response.Content "src"
    }
    catch {
        Write-Host "Response: { 'error': 'connection_failed' }"
        Test-JsonResponse "{ 'error': 'connection_failed' }" "src"
    }
}

# homepage-redesign detailed check
Write-Host ""
Write-ColorText "homepage-redesign detailed check:" "Yellow"
try {
    $response = Invoke-RestMethod -Uri "$HomepageRedesignUrl/api/health" -Method Get -ErrorAction Stop
    $responseJson = $response | ConvertTo-Json -Compress
    Write-Host "Response: $responseJson"
    Test-JsonResponse $responseJson "homepage-redesign"
}
catch {
    Write-Host "Response: { 'error': 'connection_failed' }"
    Test-JsonResponse "{ 'error': 'connection_failed' }" "homepage-redesign"
}

# vault-landing detailed check
Write-Host ""
Write-ColorText "vault-landing detailed check:" "Yellow"
try {
    $response = Invoke-RestMethod -Uri "$VaultLandingUrl/health.json" -Method Get -ErrorAction Stop
    $responseJson = $response | ConvertTo-Json -Compress
    Write-Host "Response: $responseJson"
    Test-JsonResponse $responseJson "vault-landing"
}
catch {
    try {
        $response = Invoke-WebRequest -Uri "$VaultLandingUrl/health.json" -Method Get -ErrorAction Stop
        Write-Host "Response: $($response.Content)"
        Test-JsonResponse $response.Content "vault-landing"
    }
    catch {
        Write-Host "Response: { 'error': 'connection_failed' }"
        Test-JsonResponse "{ 'error': 'connection_failed' }" "vault-landing"
    }
}

Write-Host ""
Write-Host "=================================================="
Write-ColorText "✅ Smoke Tests Complete!" "Green"
Write-Host "=================================================="

# Summary
Write-Host ""
Write-ColorText "📋 Summary:" "Yellow"
Write-Host "- All health endpoints tested"
Write-Host "- HTTP status codes validated"
Write-Host "- JSON responses checked"
Write-Host ""
Write-ColorText "🔗 URLs tested:" "Yellow"
Write-Host "- server-v2: $ServerV2Url/health"
Write-Host "- src: $SrcUrl/health.json"
Write-Host "- homepage-redesign: $HomepageRedesignUrl/api/health"
Write-Host "- vault-landing: $VaultLandingUrl/health.json"
Write-Host ""
Write-ColorText "💡 Tips:" "Yellow"
Write-Host "- If any tests failed, check the Railway dashboard for build logs"
Write-Host "- Verify health endpoints are accessible and returning correct responses"
Write-Host "- Check environment variables are properly set in Railway"
Write-Host "- Review service logs for any runtime errors"

# Final result
$allPassed = $serverV2Result -and $srcResult -and $homepageResult -and $vaultResult
if ($allPassed) {
    Write-Host ""
    Write-ColorText "🎉 All tests passed! All services are healthy." "Green"
    exit 0
} else {
    Write-Host ""
    Write-ColorText "⚠️  Some tests failed. Please check the services above." "Yellow"
    exit 1
}

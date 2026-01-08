# OCI Health Endpoints Smoke Test Script (PowerShell Version)
# Tests all OCI health endpoints and verifies JSON response format

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    White = "White"
}

# OCI Endpoints to test
$Endpoints = @{
    "Frontend" = "https://vauntico.com/api/health"
    "Backend API" = "https://api.vauntico.com/health"
    "Fulfillment Engine" = "https://api.vauntico.com/fulfillment/health"
    "Vault Landing" = "https://api.vauntico.com/vault/health"
}

Write-Host "🔍 Starting OCI Health Endpoints Smoke Test" -ForegroundColor $Colors.Yellow
Write-Host "==================================" -ForegroundColor $Colors.White

# Test each endpoint
foreach ($ServiceName in $Endpoints.Keys) {
    $Url = $Endpoints[$ServiceName]
    Write-Host "`nTesting $ServiceName`: $Url" -ForegroundColor $Colors.Yellow
    
    try {
        # Perform the request and capture response
        $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $StatusCode = $Response.StatusCode
        $Body = $Response.Content
        
        if ($StatusCode -eq 200) {
            Write-Host "✅ HTTP Status: $StatusCode" -ForegroundColor $Colors.Green
            
            # Parse JSON and validate required fields
            try {
                $JsonData = $Body | ConvertFrom-Json
                $Status = $JsonData.status
                $Service = $JsonData.service
                $Timestamp = $JsonData.timestamp
                $Uptime = $JsonData.uptime
                $Environment = $JsonData.environment
                
                # Check required fields
                if ($Status -eq "ok" -and $Service -and $Timestamp -and $Uptime -and $Environment -eq "production") {
                    Write-Host "✅ JSON Response Valid:" -ForegroundColor $Colors.Green
                    Write-Host "   - status: $Status"
                    Write-Host "   - service: $Service"
                    Write-Host "   - timestamp: $Timestamp"
                    Write-Host "   - uptime: $Uptime seconds"
                    Write-Host "   - environment: $Environment"
                } else {
                    Write-Host "❌ Invalid JSON Response:" -ForegroundColor $Colors.Red
                    Write-Host "   - status: $Status (expected: ok)"
                    Write-Host "   - service: $Service"
                    Write-Host "   - timestamp: $Timestamp"
                    Write-Host "   - uptime: $Uptime"
                    Write-Host "   - environment: $Environment (expected: production)"
                }
            } catch {
                Write-Host "⚠️  JSON parsing failed, displaying raw response:" -ForegroundColor $Colors.Yellow
                Write-Host $Body.Substring(0, [Math]::Min(200, $Body.Length))
            }
        } else {
            Write-Host "❌ HTTP Status: $StatusCode" -ForegroundColor $Colors.Red
            Write-Host "Response: $Body"
        }
    } catch {
        Write-Host "❌ Failed to connect to $Url" -ForegroundColor $Colors.Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

Write-Host "`n🎯 Smoke Test Complete" -ForegroundColor $Colors.Yellow
Write-Host "==================================" -ForegroundColor $Colors.White
Write-Host "Summary: All OCI health endpoints have been tested."
Write-Host "Check the results above for any issues that need attention."

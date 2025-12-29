# Test script for vauntico-server-v2 API health endpoint
# This script tests the health endpoint after deployment

param(
    [string]$BaseUrl = "https://api.vauntico.com"
)

function Test-HealthEndpoint {
    param([string]$Url)
    
    Write-Host "Testing health endpoint: $Url/health" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$Url/health" -Method GET -TimeoutSec 30
        $statusCode = (Invoke-WebRequest -Uri "$Url/health" -Method GET -TimeoutSec 30).StatusCode
        
        Write-Host "Status Code: $statusCode" -ForegroundColor $(if($statusCode -eq 200) {"Green"} else {"Red"})
        Write-Host "Response: $response" -ForegroundColor $(if($response.status -eq "ok") {"Green"} else {"Red"})
        
        if ($statusCode -eq 200 -and $response.status -eq "ok") {
            Write-Host "✅ Health endpoint is working correctly!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Health endpoint is not responding correctly" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error connecting to health endpoint: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-DomainResolution {
    param([string]$Domain)
    
    Write-Host "`nTesting DNS resolution for: $Domain" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Gray
    
    try {
        $dnsResult = Resolve-DnsName -Name $Domain -Type A -ErrorAction Stop
        Write-Host "✅ DNS resolution successful" -ForegroundColor Green
        $dnsResult | ForEach-Object {
            Write-Host "   IP: $($_.IPAddress)" -ForegroundColor Blue
        }
        return $true
    }
    catch {
        Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This may indicate domain is not yet configured or still propagating" -ForegroundColor Yellow
        return $false
    }
}

# Main execution
Write-Host "Vauntico API Health Test" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Gray
Write-Host ""

# Extract domain from base URL
$uri = [System.Uri]$BaseUrl
$domain = $uri.Host

# Test DNS resolution first
$dnsOk = Test-DomainResolution -Domain $domain

# Test health endpoint
$healthOk = Test-HealthEndpoint -Url $BaseUrl

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Gray
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Gray
Write-Host "DNS Resolution: $(if($dnsOk) {"✅ PASS"} else {"❌ FAIL"})" -ForegroundColor $(if($dnsOk) {"Green"} else {"Red"})
Write-Host "Health Endpoint: $(if($healthOk) {"✅ PASS"} else {"❌ FAIL"})" -ForegroundColor $(if($healthOk) {"Green"} else {"Red"})

if ($healthOk) {
    Write-Host "`n🎉 Vauntico API is successfully deployed and operational!" -ForegroundColor Green
    Write-Host "   Health endpoint: $BaseUrl/health" -ForegroundColor Blue
    exit 0
} else {
    Write-Host "`n⚠️  Vauntico API needs attention. Check the following:" -ForegroundColor Yellow
    Write-Host "   1. Railway deployment status in dashboard" -ForegroundColor White
    Write-Host "   2. DNS configuration in Namecheap" -ForegroundColor White
    Write-Host "   3. Railway application logs" -ForegroundColor White
    Write-Host "   4. Environment variables configuration" -ForegroundColor White
    exit 1
}

# Vercel Health Test Script
# Test health endpoints for deployed Vercel projects

$services = @(
    @{ Name = "src (vauntico-mvp)"; Path = "/health.json"; URL = "https://vauntico-mvp-tyrones-projects-6eab466c.vercel.app" },
    @{ Name = "homepage-redesign"; Path = "/"; URL = "https://homepage-redesign-omega.vercel.app" }
)

function Test-HealthEndpoint {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$URL
    )
    
    $fullUrl = "$URL$Path"
    
    Write-Host "Testing $ServiceName at $fullUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -TimeoutSec 10 -UseBasicParsing
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "SUCCESS - $ServiceName : ($statusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "FAILED - $ServiceName : ($statusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "FAILED - $ServiceName : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Vercel Health Test for Vauntico Frontend Projects" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue
Write-Host ""

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    if (Test-HealthEndpoint -ServiceName $service.Name -Path $service.Path -URL $service.URL) {
        $successCount++
    }
    Write-Host ""
}

Write-Host "Health Test Summary:" -ForegroundColor Blue
Write-Host "- Successful health checks: $successCount/$totalCount" -ForegroundColor White
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "All frontend services are healthy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some services are not responding. Check Vercel dashboard for deployment status." -ForegroundColor Yellow
    Write-Host "Note: Services may still be building. Try again in a few minutes." -ForegroundColor Yellow
    exit 1
}

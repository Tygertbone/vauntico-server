# Railway Health Test Script v2
# Test health endpoints for all deployed Vauntico services

$services = @(
    @{ Name = "vauntico-fulfillment-engine"; Path = "/health"; ProjectName = "vauntico-fulfillment-engine" },
    @{ Name = "src (vauntico-app)"; Path = "/health.json"; ProjectName = "vauntico-app" },
    @{ Name = "homepage-redesign (vauntico-homepage)"; Path = "/api/health"; ProjectName = "vauntico-homepage" },
    @{ Name = "vault-landing (vauntico-vault)"; Path = "/health.json"; ProjectName = "vauntico-vault" },
    @{ Name = "server-v2 (vauntico-api)"; Path = "/health"; ProjectName = "vauntico-api" }
)

function Test-HealthEndpoint {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$ProjectName
    )
    
    $url = "https://$ProjectName.up.railway.app$Path"
    
    Write-Host "Testing $ServiceName at $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
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

Write-Host "Railway Health Test v2 for Vauntico Services" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue
Write-Host ""

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    if (Test-HealthEndpoint -ServiceName $service.Name -Path $service.Path -ProjectName $service.ProjectName) {
        $successCount++
    }
    Write-Host ""
}

Write-Host "Health Test Summary:" -ForegroundColor Blue
Write-Host "- Successful health checks: $successCount/$totalCount" -ForegroundColor White
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "All services are healthy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some services are not responding. Check Railway dashboard for deployment status." -ForegroundColor Yellow
    Write-Host "Note: Services may still be building. Try again in a few minutes." -ForegroundColor Yellow
    exit 1
}

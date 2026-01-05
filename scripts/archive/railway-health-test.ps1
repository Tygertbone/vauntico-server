# Railway Health Test Script
# Test health endpoints for all deployed Vauntico services

$services = @(
    @{ Name = "vauntico-fulfillment-engine"; Path = "/health"; ExpectedProject = "vauntico-fulfillment" },
    @{ Name = "src"; Path = "/health.json"; ExpectedProject = "zoological-gentleness" },
    @{ Name = "homepage-redesign"; Path = "/api/health"; ExpectedProject = "hospitable-illumination" },
    @{ Name = "vault-landing"; Path = "/health.json"; ExpectedProject = "vauntico-server" },
    @{ Name = "server-v2"; Path = "/health"; ExpectedProject = "vauntico-api" }
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

Write-Host "Railway Health Test for Vauntico Services" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    if (Test-HealthEndpoint -ServiceName $service.Name -Path $service.Path -ProjectName $service.ExpectedProject) {
        $successCount++
    }
    Write-Host ""
}

Write-Host "Health Test Summary:" -ForegroundColor Blue
Write-Host "- Successful health checks: $successCount/$totalCount" -ForegroundColor White
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "🎉 All services are healthy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ Some services are not responding. Check Railway dashboard for deployment status." -ForegroundColor Yellow
    exit 1
}

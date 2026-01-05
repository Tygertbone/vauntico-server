# Vauntico Health Monitoring Script
# Tests all health endpoints and reports status

Write-Host "Vauntico Health Monitor - $(Get-Date)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Test endpoints
$endpoints = @(
    "https://api.vauntico.com/health|API Server",
    "https://fulfillment-sys.vauntico.com/health|Fulfillment Engine",
    "https://www.vauntico.com/health.json|Homepage Static",
    "https://fulfillment.vauntico.com/health.json|Fulfillment Static"
)

$allHealthy = $true

foreach ($endpoint in $endpoints) {
    $parts = $endpoint -split '\|'
    $url = $parts[0]
    $name = $parts[1]

    Write-Host -NoNewline "Testing $name ($url)... "

    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "PASS ($($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "FAIL ($($response.StatusCode))" -ForegroundColor Red
            $allHealthy = $false
        }
    } catch {
        Write-Host "FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""
if ($allHealthy) {
    Write-Host "All health checks passed!" -ForegroundColor Green
} else {
    Write-Host "Some health checks failed." -ForegroundColor Yellow
}

Write-Host "=====================================" -ForegroundColor Yellow

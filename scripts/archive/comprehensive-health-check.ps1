# Comprehensive Health Check Script for Vauntico Services (PowerShell)
# Usage: .\scripts\comprehensive-health-check.ps1

# Configuration
$LogPath = "logs\health-check.log"
$TimeoutSeconds = 10
$MaxRetries = 2
$PassThreshold = 100  # Default: 100% pass required
$MaxResponseTime = 2000  # Max response time in ms (2 seconds)

# Legacy Features: Health Thresholds, Alerts, Metrics, Contributor Experience
# Ensure deployments proceed only if >= threshold of services are healthy

# Ensure log directory exists
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# Start transcript for logging
Start-Transcript -Path $LogPath -Append

Write-Host "[HOSPITAL] Running comprehensive health check for all Vauntico services..." -ForegroundColor Cyan
Write-Host "[LOG] Log file: $LogPath" -ForegroundColor Gray
Write-Host "[TARGET] Pass threshold: $PassThreshold% required to proceed with deployment" -ForegroundColor Gray

# Load services from JSON config if available, otherwise use defaults
$ServicesConfigPath = "services.json"
$services = @()

if (Test-Path $ServicesConfigPath) {
    try {
        $config = Get-Content $ServicesConfigPath -Raw | ConvertFrom-Json
        if ($config.services) {
            $services = $config.services
            Write-Host "[CONFIG] Loaded $($services.Count) services from config file" -ForegroundColor Green
        }
    } catch {
        Write-Host "[WARNING] Failed to load services config, using defaults" -ForegroundColor Yellow
    }
}

# Default services if no config file
if ($services.Count -eq 0) {
    $services = @(
        @{ Name = "server-v2"; Url = $env:SERVER_V2_URL; DefaultUrl = "https://your-server-v2-url.railway.app"; Path = "/health" },
        @{ Name = "src"; Url = $env:SRC_URL; DefaultUrl = "https://your-src-url.railway.app"; Path = "/health.json" },
        @{ Name = "homepage-redesign"; Url = $env:HOMEPAGE_REDESIGN_URL; DefaultUrl = "https://your-homepage-redesign-url.railway.app"; Path = "/api/health" },
        @{ Name = "vault-landing"; Url = $env:VAULT_LANDING_URL; DefaultUrl = "https://your-vault-landing-url.railway.app"; Path = "/health.json" }
    )
}

# Initialize counters and metrics
$servicesPassed = 0
$servicesTotal = $services.Count
$servicesFailed = @()
$summaryData = @{}

# Function to check service health with retries and performance metrics
function Check-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [string]$ExpectedPath
    )

    Write-Host "[CHECK] Checking $ServiceName..." -ForegroundColor Yellow

    $success = $false
    $attempt = 1
    $startTime = Get-Date
    $responseTime = 0

    while ($attempt -le ($MaxRetries + 1) -and -not $success) {
        try {
            $response = Invoke-WebRequest -Uri "$Url$ExpectedPath" -UseBasicParsing -TimeoutSec $TimeoutSeconds -ErrorAction Stop
            $responseTime = ((Get-Date) - $startTime).TotalMilliseconds

            if ($response.StatusCode -eq 200) {
                Write-Host "[SUCCESS] ${ServiceName}: HEALTHY (HTTP $($response.StatusCode))" -ForegroundColor Green
                if ($responseTime -gt $MaxResponseTime) {
                    Write-Host "[WARNING] ${ServiceName}: Slow response ($responseTime ms > $MaxResponseTime ms)" -ForegroundColor Yellow
                }
                $success = $true
                $script:servicesPassed++
            } else {
                Write-Host "[FAIL] ${ServiceName}: UNHEALTHY (HTTP $($response.StatusCode))" -ForegroundColor Red
            }
        } catch {
            Write-Host "[ERROR] ${ServiceName}: ERROR - $($_.Exception.Message)" -ForegroundColor Red

            if ($attempt -gt $MaxRetries) {
                $script:servicesFailed += $ServiceName
                Write-Host "[RETRY] Max retries ($MaxRetries) reached for $ServiceName" -ForegroundColor Yellow

                # Send alert if configured
                if ($env:SLACK_WEBHOOK) {
                    try {
                        $slackBody = @{
                            text = "[ALERT] Health Check Alert: ${ServiceName} failed after $MaxRetries retries. Check logs at: ${LogPath}"
                            username = "Vauntico Bot"
                        } | ConvertTo-Json
                        Invoke-WebRequest -Uri $env:SLACK_WEBHOOK -Method Post -ContentType "application/json" -Body $slackBody | Out-Null
                    } catch {
                        Write-Host "[WARNING] Failed to send Slack alert for $ServiceName" -ForegroundColor Yellow
                    }
                }

                # Send email if configured
                if ($env:RESEND_API_KEY) {
                    try {
                        $emailBody = @{
                            from = "health-check@vauntico.com"
                            to = "devops@vauntico.com"
                            subject = "[ALERT] Vauntico Health Check Failure: ${ServiceName}"
                            text = "Service ${ServiceName} failed health check after $MaxRetries retries. Response time: ${responseTime}ms. Log: ${LogPath}"
                        } | ConvertTo-Json
                        Invoke-WebRequest -Uri "https://api.resend.com/v1/email" -Method Post -ContentType "application/json" -Headers @{"Authorization" = "Bearer $env:RESEND_API_KEY"} -Body $emailBody | Out-Null
                    } catch {
                        Write-Host "[WARNING] Failed to send email alert for $ServiceName" -ForegroundColor Yellow
                    }
                }
            }
        }

        if (-not $success -and $attempt -lt ($MaxRetries + 1)) {
            $attempt++
            Write-Host "[RETRY] Retrying $ServiceName (attempt $attempt/$($MaxRetries + 1))..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }

        # Break out of loop if we've reached max retries and still failed
        if (-not $success -and $attempt -ge $MaxRetries) {
            Write-Host "[FAIL] $ServiceName failed after $MaxRetries attempts" -ForegroundColor Red
            break
        }
    }

    Write-Host ""

    # Store metrics
    $summaryData.Add($ServiceName, @{
        Service = $ServiceName
        ResponseTime = $responseTime
        Attempts = $attempt
        Success = $success
        Status = if ($success) { "Healthy" } else { "Failed" }
    })
}

# Check all services
foreach ($service in $services) {
    $serviceUrl = if ($service.Url) { $service.Url } else { $service.DefaultUrl }
    Check-ServiceHealth $service.Name $serviceUrl $service.Path
}

# Summary Report
$passPercentage = if ($servicesTotal -gt 0) { [math]::Round(($servicesPassed / $servicesTotal) * 100, 0) } else { 100 }

Write-Host "[SUMMARY] Health Check Summary:" -ForegroundColor Cyan
Write-Host "[SUCCESS] $servicesPassed/$servicesTotal services passed ($passPercentage`%)" -ForegroundColor Green

if ($servicesFailed.Count -gt 0) {
    Write-Host "[FAIL] Failed services:" -ForegroundColor Red
    foreach ($failedService in $servicesFailed) {
        Write-Host "   • $failedService" -ForegroundColor Red
    }

    # Legacy Vauntico humor for contributor experience
    Write-Host "[HUMOR] Knobbed knees say: Service X is limping, fix it before it falls!" -ForegroundColor Magenta
}

Write-Host "[LOG] Detailed log available at: $LogPath" -ForegroundColor Gray

# Performance metrics
Write-Host "[METRICS] Performance Metrics:" -ForegroundColor Cyan
foreach ($metric in $summaryData.Values) {
    $statusColor = if ($metric.Success) { "Green" } else { "Red" }
    Write-Host "   $($metric.Service): $($metric.Status) ($($metric.ResponseTime) ms)" -ForegroundColor $statusColor
}

# CI/CD Exit Codes with threshold support
Write-Host "[DECISION] Deployment Decision: Pass threshold is $PassThreshold`%, current pass rate is $passPercentage`%" -ForegroundColor Gray

if ($passPercentage -ge $PassThreshold) {
    Write-Host "[GREEN] Overall status: ALL HEALTHY - Deployment allowed" -ForegroundColor Green
    Write-Host "[DEPLOY] CI/CD: All services healthy, proceeding with deployment" -ForegroundColor Green
    Stop-Transcript
    exit 0
} else {
    Write-Host "[YELLOW] Overall status: BELOW THRESHOLD - Deployment blocked" -ForegroundColor Yellow
    Write-Host "[BLOCK] CI/CD: Only $passPercentage`% services healthy (threshold: $PassThreshold`%). Deployment blocked." -ForegroundColor Red
    Stop-Transcript
    exit 1
}

# JSON Summary Output for CI/CD pipelines
$summaryJson = @{
    total = $servicesTotal
    passed = $servicesPassed
    failed = @($servicesFailed)
    percentage = $passPercentage
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
} | ConvertTo-Json

$summaryJson | Out-File -FilePath "logs\summary.json" -Encoding UTF8
Write-Host "[JSON] Summary JSON written to logs\summary.json" -ForegroundColor Gray

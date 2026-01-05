# Railway Redeploy Script for Vauntico Project
# This script will redeploy all existing services to Railway

param(
    [switch]$Force = $false
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Redeploy-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )

    Write-ColorText "Redeploying $ServiceName..." "Yellow"
    
    if (Test-Path $ServicePath) {
        Set-Location $ServicePath
        
        # Check if railway.toml exists
        if (-not (Test-Path "railway.toml")) {
            Write-ColorText "railway.toml not found in $ServicePath" "Red"
            Set-Location ..
            return $false
        }
        
        Write-ColorText "Current directory: $(Get-Location)" "Blue"
        
        try {
            # Redeploy the service (assumes project already exists and is linked)
            Write-ColorText "Redeploying $ServiceName..." "Blue"
            "y" | railway redeploy --service $ServiceName

            Write-ColorText "$ServiceName redeployed successfully" "Green"
            return $true
        }
        catch {
            Write-ColorText "Failed to redeploy $ServiceName" "Red"
            Write-ColorText "Error: $($_.Exception.Message)" "Red"
            Set-Location ..
            return $false
        }
    }
    else {
        Write-ColorText "Directory $ServicePath not found" "Red"
        return $false
    }
}

# Main execution
Write-ColorText "Railway Redeploy Script for Vauntico Project" "Blue"
Write-Host "=================================================="
Write-Host ""

Write-ColorText "Redeploying all services..." "Blue"
Write-Host ""

# Deploy all services
$services = @(
    @{ Name = "vauntico-fulfillment-engine"; Path = "vauntico-fulfillment-engine" },
    @{ Name = "vauntico-app"; Path = "src" },
    @{ Name = "vauntico-homepage"; Path = "homepage-redesign" },
    @{ Name = "vauntico-vault"; Path = "vault-landing" },
    @{ Name = "vauntico-api"; Path = "server-v2" }
)

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    if (Redeploy-Service -ServiceName $service.Name -ServicePath $service.Path) {
        $successCount++
    }
    Write-Host ""
}

Write-Host ""
Write-ColorText "Deployment process completed!" "Green"
Write-Host ""
Write-ColorText "Deployment Summary:" "Blue"
Write-Host "- Successful deployments: $successCount/$totalCount"
Write-Host ""

Write-ColorText "Next Steps:" "Blue"
Write-Host "1. Check Railway dashboard for deployment status"
Write-Host "2. Wait for deployments to complete (may take several minutes)"
Write-Host "3. Test health endpoints using: .\scripts\railway-health-test-v2.ps1"
Write-Host ""
Write-ColorText "Railway Dashboard: https://railway.app" "Blue"

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-ColorText "All services deployed successfully!" "Green"
    exit 0
}
else {
    Write-Host ""
    Write-ColorText "Some deployments failed. Please check the errors above." "Yellow"
    exit 1
}

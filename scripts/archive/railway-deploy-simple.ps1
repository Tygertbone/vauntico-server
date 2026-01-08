# Simple Railway Deployment Script
function Deploy-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Host "Deploying $ServiceName..."
    
    if (Test-Path $ServicePath) {
        Set-Location $ServicePath
        
        if (-not (Test-Path "railway.toml")) {
            Write-Host "ERROR: railway.toml not found in $ServicePath"
            Set-Location ..
            return $false
        }
        
        Write-Host "Current directory: $(Get-Location)"
        Write-Host "railway.toml found, proceeding with deployment..."
        
        try {
            "y" | railway redeploy --service $ServiceName
            Write-Host "SUCCESS: $ServiceName deployed successfully"
        }
        catch {
            Write-Host "ERROR: Failed to deploy $ServiceName"
            Write-Host "Error: $($_.Exception.Message)"
            Set-Location ..
            return $false
        }
        
        Set-Location ..
        return $true
    }
    else {
        Write-Host "ERROR: Directory $ServicePath not found"
        return $false
    }
}

Write-Host "Railway Deployment Script"
Write-Host "======================================="

# Deploy services
$services = @(
    @{ Name = "vauntico-fulfillment-engine"; Path = "vauntico-fulfillment-engine" },
    @{ Name = "src"; Path = "src" },
    @{ Name = "homepage-redesign"; Path = "homepage-redesign" },
    @{ Name = "vault-landing"; Path = "vault-landing" }
)

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    if (Deploy-Service -ServiceName $service.Name -ServicePath $service.Path) {
        $successCount++
    }
}

Write-Host ""
Write-Host "Deployment Summary: $successCount/$totalCount deployments successful"

if ($successCount -eq $totalCount) {
    Write-Host "All services deployed successfully!"
    exit 0
} else {
    Write-Host "Some deployments failed. Please check the errors above."
    exit 1
}

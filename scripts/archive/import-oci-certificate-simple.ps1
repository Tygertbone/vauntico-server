#!/usr/bin/env pwsh
# Simple OCI Certificate Import Script
# This script imports SSL certificates into Oracle Cloud Infrastructure with automatic tagging

param(
    [string]$Domain = "api.vauntico.com",
    [string]$CertificateName = "vauntico-mvp-api-cert",
    [string]$LoadBalancerId = "",
    [string]$CompartmentId = "",
    [string]$Environment = "production",
    [string]$Service = "api",
    [string]$Owner = "devops",
    [switch]$TestOnly = $false,
    [switch]$UseCompartmentTemplate = $false
)

Write-Host "=== OCI Certificate Import for $Domain ===" -ForegroundColor Green
Write-Host ""

function Test-Prerequisites {
    Write-Host "Testing prerequisites..." -ForegroundColor Cyan
    
    # Check if OCI CLI is installed
    $ociPath = Get-Command oci -ErrorAction SilentlyContinue
    if (-not $ociPath) {
        Write-Error "✗ OCI CLI not found. Please install it first."
        return $false
    }
    
    Write-Host "✓ OCI CLI installed at $($ociPath.Source)" -ForegroundColor Green
    
    # Check certificate files exist
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    $privkeyPath = Join-Path $certPath "privkey.pem"
    
    if (-not (Test-Path $fullchainPath)) {
        Write-Error "✗ Certificate file not found: $fullchainPath"
        return $false
    }
    
    if (-not (Test-Path $privkeyPath)) {
        Write-Error "✗ Private key file not found: $privkeyPath"
        return $false
    }
    
    Write-Host "✓ Certificate files found" -ForegroundColor Green
    Write-Host ""
    return $true
}

function Get-CompartmentId {
    param([string]$Environment)
    
    $templates = @{
        "production" = "ocid1.compartment.oc1..aaaaaaaaexampleprod1234567890abcdef"
        "staging" = "ocid1.compartment.oc1..aaaaaaaaexamplestag1234567890abcdef"
        "development" = "ocid1.compartment.oc1..aaaaaaaaexampledev1234567890abcdef"
    }
    
    if ($templates.ContainsKey($Environment)) {
        $compartmentId = $templates[$Environment]
        Write-Host "✓ Using compartment template for $Environment" -ForegroundColor Green
        Write-Host "  Compartment ID: $compartmentId" -ForegroundColor Gray
        return $compartmentId
    } else {
        Write-Warning "No template found for environment '$Environment'"
        Write-Host "Available templates: $($templates.Keys -join ', ')" -ForegroundColor Yellow
        return $null
    }
}

function Import-Certificate {
    param(
        [string]$CertificateName,
        [string]$CertificateData,
        [string]$PrivateKeyData,
        [string]$CompartmentId,
        [string]$Environment,
        [string]$Service,
        [string]$Owner
    )
    
    if ($TestOnly) {
        Write-Host "TEST MODE: Would import certificate '$CertificateName'" -ForegroundColor Yellow
        Write-Host "Certificate data preview:" -ForegroundColor Gray
        if ($CertificateData.Length -gt 50) {
            Write-Host $CertificateData.Substring(0, 50) + "..." -ForegroundColor Gray
        } else {
            Write-Host $CertificateData -ForegroundColor Gray
        }
        return $true
    }
    
    Write-Host "Importing certificate into OCI..." -ForegroundColor Cyan
    
    try {
        # Build OCI command
        $ociArgs = @(
            "lb", "certificate", "create",
            "--certificate-name", $CertificateName,
            "--certificate-body", $CertificateData,
            "--private-key", $PrivateKeyData
        )
        
        if ($CompartmentId) {
            $ociArgs += "--compartment-id", $CompartmentId
        }
        
        Write-Host "Running: oci $($ociArgs -join ' ')" -ForegroundColor Gray
        
        # Import certificate
        $result = oci lb certificate create @ociArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Certificate imported successfully!" -ForegroundColor Green
            
            # Apply tags after successful import
            if ($result -match '"id":\s*"([^"]+)"') {
                $certificateId = $matches[1]
                Write-Host "  Certificate ID: $certificateId" -ForegroundColor Gray
                
                # Apply tags
                $tagsApplied = $false
                $tagAttempts = @(
                    @("iam", "tag", "create", "--namespace", "vauntico", "--tag-name", "vauntico.environment", "--tag-value", $Environment),
                    @("iam", "tag", "create", "--namespace", "vauntico", "--tag-name", "vauntico.service", "--tag-value", $Service),
                    @("iam", "tag", "create", "--namespace", "vauntico", "--tag-name", "vauntico.owner", "--tag-value", $Owner),
                    @("iam", "tag", "create", "--namespace", "vauntico", "--tag-name", "vauntico.managed-by", "--tag-value", "ssl-certificate-script"),
                    @("iam", "tag", "create", "--namespace", "vauntico", "--tag-name", "vauntico.created-date", "--tag-value", (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"))
                )
                
                foreach ($tagCmd in $tagAttempts) {
                    $tagResult = oci @tagCmd 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✓ Applied tag: $($tagCmd[4])" -ForegroundColor Green
                        $tagsApplied = $true
                    } else {
                        Write-Warning "✗ Failed to apply tag: $($tagCmd[4])"
                        if ($tagResult) {
                            Write-Host "  Error: $tagResult" -ForegroundColor Red
                        }
                    }
                }
                
                if ($tagsApplied) {
                    Write-Host "✓ All tags applied successfully" -ForegroundColor Green
                } else {
                    Write-Warning "⚠ Some tags may have failed to apply"
                }
            }
            
            return $true
        } else {
            Write-Error "✗ Certificate import failed"
            Write-Host "Error output:" -ForegroundColor Red
            $result | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
            return $false
        }
    }
    catch {
        Write-Error "Failed to import certificate: $($_.Exception.Message)"
        return $false
    }
}

function Show-CertificateFiles {
    param([string]$Domain)
    
    Write-Host "Certificate Files for OCI Import:" -ForegroundColor Cyan
    Write-Host ""
    
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    $privkeyPath = Join-Path $certPath "privkey.pem"
    
    Write-Host "=== CERTIFICATE CHAIN (for OCI Certificate Body) ===" -ForegroundColor Yellow
    try {
        Get-Content $fullchainPath | Write-Host
    } catch {
        Write-Error "Could not read fullchain.pem"
    }
    
    Write-Host ""
    
    Write-Host "=== PRIVATE KEY (for OCI Private Key) ===" -ForegroundColor Yellow
    try {
        Get-Content $privkeyPath | Write-Host
    } catch {
        Write-Error "Could not read privkey.pem"
    }
    
    Write-Host ""
    
    Write-Host "Copy the contents above for manual OCI import." -ForegroundColor Green
    Write-Host "File locations:" -ForegroundColor Gray
    Write-Host "  Certificate chain: $fullchainPath" -ForegroundColor Gray
    Write-Host "  Private key: $privkeyPath" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
try {
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Handle compartment template if requested
    if ($UseCompartmentTemplate -and (-not $CompartmentId)) {
        Write-Host "Using compartment template for environment: $Environment" -ForegroundColor Cyan
        $CompartmentId = Get-CompartmentId -Environment $Environment
        if (-not $CompartmentId) {
            exit 1
        }
    }
    
    # Get certificate data
    Write-Host "Reading certificate data for $Domain..." -ForegroundColor Cyan
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    $privkeyPath = Join-Path $certPath "privkey.pem"
    
    $certificateData = Get-Content $fullchainPath -Raw
    $privateKeyData = Get-Content $privkeyPath -Raw
    
    if (-not $certificateData -or -not $privateKeyData) {
        Write-Error "Failed to read certificate files"
        exit 1
    }
    
    # Import certificate
    $importSuccess = Import-Certificate -CertificateName $CertificateName -CertificateData $certificateData -PrivateKeyData $privateKeyData -CompartmentId $CompartmentId -Environment $Environment -Service $Service -Owner $Owner
    
    # Show certificate files for manual copy
    if (-not $importSuccess) {
        Show-CertificateFiles -Domain $Domain
    }
    
    # If load balancer specified, show attachment instructions
    if ($LoadBalancerId -and $importSuccess) {
        Write-Host ""
        Write-Host "=== Load Balancer Attachment Instructions ===" -ForegroundColor Cyan
        Write-Host "To attach certificate to load balancer ${LoadBalancerId}:" -ForegroundColor Gray
        Write-Host "1. Go to OCI Console → Networking → Load Balancers → $LoadBalancerId" -ForegroundColor Gray
        Write-Host "2. Go to Listeners → Create Listener" -ForegroundColor Gray
        Write-Host "3. Configure:" -ForegroundColor Gray
        Write-Host "   - Name: https-listener" -ForegroundColor Gray
        Write-Host "   - Port: 443" -ForegroundColor Gray
        Write-Host "   - Protocol: HTTPS" -ForegroundColor Gray
        Write-Host "   - Certificate: $CertificateName" -ForegroundColor Gray
        Write-Host "   - Backend Set: Select your API backend" -ForegroundColor Gray
        Write-Host "   - Click Create" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "=== OCI Certificate Import Complete ===" -ForegroundColor Green
    Write-Host "Tags applied:" -ForegroundColor Cyan
    Write-Host "  vauntico.environment: $Environment" -ForegroundColor Gray
    Write-Host "  vauntico.service: $Service" -ForegroundColor Gray
    Write-Host "  vauntico.owner: $Owner" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Error "Import script failed: $($_.Exception.Message)"
    exit 1
}

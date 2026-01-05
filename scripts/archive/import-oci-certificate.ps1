#!/usr/bin/env pwsh
# OCI Certificate Import Script
# This script helps import SSL certificates into Oracle Cloud Infrastructure

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
        Write-Error "✗ OCI CLI not found. Please install it first:"
        Write-Host "1. Visit: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm" -ForegroundColor Yellow
        Write-Host "2. Or install via PowerShell:" -ForegroundColor Yellow
        Write-Host "   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
        Write-Host "   Invoke-WebRequest -Uri https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1 -UseBasicParsing | Invoke-Expression" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✓ OCI CLI installed at $($ociPath.Source)" -ForegroundColor Green
    
    # Check if OCI CLI is configured
    try {
        $null = oci setup config 2>$null
        Write-Host "✓ OCI CLI configured" -ForegroundColor Green
    }
    catch {
        Write-Error "✗ OCI CLI not configured. Please run 'oci setup config' first."
        return $false
    }
    
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

function Get-CertificateData {
    param([string]$Domain)
    
    Write-Host "Reading certificate data..." -ForegroundColor Cyan
    
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    $privkeyPath = Join-Path $certPath "privkey.pem"
    
    try {
        $certificateData = Get-Content $fullchainPath -Raw
        $privateKeyData = Get-Content $privkeyPath -Raw
        
        Write-Host "✓ Certificate data loaded" -ForegroundColor Green
        Write-Host "  Certificate: $($certificateData.Length) characters" -ForegroundColor Gray
        Write-Host "  Private Key: $($privateKeyData.Length) characters" -ForegroundColor Gray
        Write-Host ""
        
        return @{
            Certificate = $certificateData
            PrivateKey = $privateKeyData
        }
    }
    catch {
        Write-Error "Failed to read certificate files: $($_.Exception.Message)"
        return $null
    }
}

function Show-CertificateInfo {
    param([string]$Domain)
    
    Write-Host "Certificate Information:" -ForegroundColor Cyan
    
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    
    try {
        # Use OpenSSL if available to get certificate details
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        
        if ($opensslPath) {
            Write-Host "Certificate details:" -ForegroundColor Gray
            
            # Get certificate subject
            $subject = & openssl x509 -in $fullchainPath -noout -subject 2>$null
            if ($subject) {
                Write-Host "  Subject: $subject" -ForegroundColor Gray
            }
            
            # Get certificate issuer
            $issuer = & openssl x509 -in $fullchainPath -noout -issuer 2>$null
            if ($issuer) {
                Write-Host "  Issuer: $issuer" -ForegroundColor Gray
            }
            
            # Get certificate dates
            $dates = & openssl x509 -in $fullchainPath -noout -dates 2>$null
            if ($dates) {
                Write-Host "  Validity:" -ForegroundColor Gray
                $dates | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
            }
            
            # Get certificate fingerprint
            $fingerprint = & openssl x509 -in $fullchainPath -noout -fingerprint -sha256 2>$null
            if ($fingerprint) {
                Write-Host "  SHA256 Fingerprint: $fingerprint" -ForegroundColor Gray
            }
        } else {
            Write-Warning "OpenSSL not available. Install with 'choco install openssl' for detailed certificate info."
        }
        
        Write-Host ""
    }
    catch {
        Write-Warning "Could not get certificate details: $($_.Exception.Message)"
    }
}

function Test-OCIConnection {
    Write-Host "Testing OCI connection..." -ForegroundColor Cyan
    
    try {
        $tenancy = oci iam tenancy get 2>$null
        if ($tenancy) {
            Write-Host "✓ OCI connection successful" -ForegroundColor Green
            Write-Host "  Tenancy: $($tenancy.data.name)" -ForegroundColor Gray
            Write-Host "  Tenancy ID: $($tenancy.data.id)" -ForegroundColor Gray
        } else {
            Write-Error "✗ Could not connect to OCI"
            return $false
        }
    }
    catch {
        Write-Error "✗ OCI connection failed: $($_.Exception.Message)"
        return $false
    }
    
    Write-Host ""
    return $true
}

function Get-CompartmentTemplate {
    param([string]$Environment)
    
    $templates = @{
        "production" = @{
            CompartmentId = "ocid1.compartment.oc1..aaaaaaaaexampleprod1234567890abcdef"
            Description = "Production compartment for live services"
        }
        "staging" = @{
            CompartmentId = "ocid1.compartment.oc1..aaaaaaaaexamplestag1234567890abcdef"
            Description = "Staging compartment for pre-production testing"
        }
        "development" = @{
            CompartmentId = "ocid1.compartment.oc1..aaaaaaaaexampledev1234567890abcdef"
            Description = "Development compartment for development resources"
        }
    }
    
    if ($templates.ContainsKey($Environment)) {
        return $templates[$Environment]
    } else {
        Write-Warning "No template found for environment '$Environment'. Available templates: $($templates.Keys -join ', ')"
        return $null
    }
}

function Set-ResourceTags {
    param(
        [string]$ResourceId,
        [string]$Environment,
        [string]$Service,
        [string]$Owner
    )
    
    Write-Host "Applying resource tags..." -ForegroundColor Cyan
    
    try {
        # Define standard Vauntico tags
        $tags = @{
            "vauntico.environment" = $Environment
            "vauntico.service" = $Service
            "vauntico.owner" = $Owner
            "vauntico.managed-by" = "ssl-certificate-script"
            "vauntico.created-date" = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        }
        
        # Apply defined tags to certificate resource
        foreach ($tag in $tags.GetEnumerator()) {
            $tagValueArgs = @(
                "iam", "tag", "create",
                "--tag-name", $tag.Key,
                "--tag-value", $tag.Value,
                "--resource-id", $ResourceId
            )
            
            $null = oci @tagValueArgs 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Applied tag: $($tag.Key) = $($tag.Value)" -ForegroundColor Green
            } else {
                Write-Warning "⚠ Failed to apply tag: $($tag.Key)"
            }
        }
        
        Write-Host "Tagging completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Warning "Failed to apply tags: $($_.Exception.Message)"
        return $false
    }
}

function Import-OCICertificate {
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
        Write-Host $CertificateData.Substring(0, 100) + "..." -ForegroundColor Gray
        Write-Host "Tags to be applied:" -ForegroundColor Gray
        Write-Host "  vauntico.environment: $Environment" -ForegroundColor Gray
        Write-Host "  vauntico.service: $Service" -ForegroundColor Gray
        Write-Host "  vauntico.owner: $Owner" -ForegroundColor Gray
        Write-Host ""
        return $true
    }
    
    Write-Host "Importing certificate into OCI..." -ForegroundColor Cyan
    
    try {
        # Build OCI command
        $ociArgs = @(
            "lb", "certificate", "create",
            "--certificate-name", $CertificateName,
            "--certificate-body", $CertificateData,
            "--private-key", $PrivateKeyData,
            "--ca-bundle", "",  # Let's Encrypt includes CA bundle in fullchain
            "--public-certificate", ""  # Not needed for Let's Encrypt
        )
        
        if ($CompartmentId) {
            $ociArgs += "--compartment-id", $CompartmentId
        }
        
        Write-Host "Running: oci $($ociArgs -join ' ')" -ForegroundColor Gray
        
        # Import certificate
        $result = oci lb certificate create @ociArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Certificate imported successfully!" -ForegroundColor Green
            
            # Parse result to get certificate ID
            if ($result -match '"id":\s*"([^"]+)"') {
                $certificateId = $matches[1]
                Write-Host "  Certificate ID: $certificateId" -ForegroundColor Gray
                
                # Save certificate ID for later use
                $certificateId | Out-File ".\oci-certificate-id.txt" -Encoding UTF8
                Write-Host "  Certificate ID saved to: .\oci-certificate-id.txt" -ForegroundColor Gray
                
                # Apply tags to certificate
                Set-ResourceTags -ResourceId $certificateId -Environment $Environment -Service $Service -Owner $Owner | Out-Null
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

function Get-LoadBalancers {
    param([string]$CompartmentId)
    
    Write-Host "Available Load Balancers:" -ForegroundColor Cyan
    
    try {
        $ociArgs = @("lb", "load-balancer", "list")
        if ($CompartmentId) {
            $ociArgs += "--compartment-id", $CompartmentId
        }
        
        $loadBalancers = oci lb load-balancer list @ociArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Load Balancers in compartment:" -ForegroundColor Gray
            
            # Parse JSON output
            $lbData = $loadBalancers | ConvertFrom-Json
            $lbData.data | ForEach-Object {
                Write-Host "  Name: $($_.name)" -ForegroundColor White
                Write-Host "    ID: $($_.id)" -ForegroundColor Gray
                Write-Host "    State: $($_.'lifecycle-state')" -ForegroundColor Gray
                Write-Host "    IP: $($_.'ip-addresses'[0].'ip-address')" -ForegroundColor Gray
                Write-Host ""
            }
            
            return $lbData.data
        } else {
            Write-Warning "Could not list load balancers"
            return @()
        }
    }
    catch {
        Write-Warning "Failed to list load balancers: $($_.Exception.Message)"
        return @()
    }
}

function Add-CertificateToLoadBalancer {
    param(
        [string]$LoadBalancerId,
        [string]$CertificateName,
        [string]$CompartmentId
    )
    
    if ($TestOnly) {
        Write-Host "TEST MODE: Would attach certificate to load balancer $LoadBalancerId" -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "Attaching certificate to load balancer..." -ForegroundColor Cyan
    
    try {
        # Get existing backend sets
        $backendSets = oci lb backend-set list --load-balancer-id $LoadBalancerId --compartment-id $CompartmentId 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $backendData = $backendSets | ConvertFrom-Json
            $defaultBackend = $backendData.data | Where-Object { $_.name -like "*http*" -or $_.name -like "*backend*" } | Select-Object -First 1
            
            if ($defaultBackend) {
                Write-Host "Using backend set: $($defaultBackend.name)" -ForegroundColor Gray
                
                # Create HTTPS listener
                $listenerArgs = @(
                    "lb", "listener", "create",
                    "--load-balancer-id", $LoadBalancerId,
                    "--default-backend-set-name", $defaultBackend.name,
                    "--name", "https-listener",
                    "--port", "443",
                    "--protocol", "HTTP",
                    "--certificate-name", $CertificateName
                )
                
                if ($CompartmentId) {
                    $listenerArgs += "--compartment-id", $CompartmentId
                }
                
                $listenerResult = oci lb listener create @listenerArgs 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ HTTPS listener created successfully!" -ForegroundColor Green
                    return $true
                } else {
                    Write-Warning "Could not create HTTPS listener"
                    Write-Host $listenerResult -ForegroundColor Yellow
                    return $false
                }
            } else {
                Write-Warning "No suitable backend set found for HTTPS listener"
                return $false
            }
        } else {
            Write-Warning "Could not list backend sets"
            return $false
        }
    }
    catch {
        Write-Warning "Failed to attach certificate to load balancer: $($_.Exception.Message)"
        return $false
    }
}

function Show-NextSteps {
    param(
        [string]$CertificateName,
        [string]$Domain
    )
    
    Write-Host "=== Next Steps ===" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "1. Verify Certificate in OCI Console:" -ForegroundColor Cyan
    Write-Host "   - Go to Networking → Load Balancers → Certificates" -ForegroundColor Gray
    Write-Host "   - Look for certificate: $CertificateName" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Configure HTTPS Listener:" -ForegroundColor Cyan
    Write-Host "   - Go to your Load Balancer → Listeners" -ForegroundColor Gray
    Write-Host "   - Create HTTPS listener on port 443" -ForegroundColor Gray
    Write-Host "   - Select certificate: $CertificateName" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Test HTTPS Connection:" -ForegroundColor Cyan
    Write-Host "   - Run: .\scripts\verify-ssl-certificate.ps1 -Domain $Domain" -ForegroundColor Gray
    Write-Host "   - Visit: https://$Domain" -ForegroundColor Gray
    Write-Host "   - Test with: https://www.ssllabs.com/ssltest/" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. Set Up Monitoring:" -ForegroundColor Cyan
    Write-Host "   - Monitor certificate expiration" -ForegroundColor Gray
    Write-Host "   - Set up alerts for renewal failures" -ForegroundColor Gray
    Write-Host "   - Test automatic renewal process" -ForegroundColor Gray
    Write-Host ""
}

function Show-ManualImportInstructions {
    param(
        [string]$CertificateName,
        [string]$Domain
    )
    
    Write-Host "=== Manual Import Instructions ===" -ForegroundColor Cyan
    Write-Host ""
    
    $certPath = "C:\Certbot\live\$Domain"
    $fullchainPath = Join-Path $certPath "fullchain.pem"
    $privkeyPath = Join-Path $certPath "privkey.pem"
    
    Write-Host "If the automated import fails, follow these manual steps:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Copy Certificate Data:" -ForegroundColor White
    Write-Host "   Run this command and copy the output:" -ForegroundColor Gray
    Write-Host "   Get-Content '$fullchainPath' | clip" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Copy Private Key Data:" -ForegroundColor White
    Write-Host "   Run this command and copy the output:" -ForegroundColor Gray
    Write-Host "   Get-Content '$privkeyPath' | clip" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Import in OCI Console:" -ForegroundColor White
    Write-Host "   a. Login to Oracle Cloud Console" -ForegroundColor Gray
    Write-Host "   b. Go to Networking → Load Balancers → Certificates" -ForegroundColor Gray
    Write-Host "   c. Click 'Create Certificate' → 'Import Certificate'" -ForegroundColor Gray
    Write-Host "   d. Certificate Name: $CertificateName" -ForegroundColor Gray
    Write-Host "   e. Certificate Body: Paste certificate data" -ForegroundColor Gray
    Write-Host "   f. Private Key: Paste private key data" -ForegroundColor Gray
    Write-Host "   g. Certificate Authority: Let's Encrypt" -ForegroundColor Gray
    Write-Host "   h. Click 'Create'" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. Configure HTTPS Listener:" -ForegroundColor White
    Write-Host "   a. Go to your Load Balancer" -ForegroundColor Gray
    Write-Host "   b. Click 'Listeners' → 'Add Listener'" -ForegroundColor Gray
    Write-Host "   c. Port: 443" -ForegroundColor Gray
    Write-Host "   d. Protocol: HTTPS" -ForegroundColor Gray
    Write-Host "   e. Certificate: $CertificateName" -ForegroundColor Gray
    Write-Host "   f. Backend Set: Select your API backend" -ForegroundColor Gray
    Write-Host "   g. Click 'Create'" -ForegroundColor Gray
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
        $template = Get-CompartmentTemplate -Environment $Environment
        if ($template) {
            $CompartmentId = $template.CompartmentId
            Write-Host "✓ Using compartment: $($template.Description)" -ForegroundColor Green
            Write-Host "  Compartment ID: $CompartmentId" -ForegroundColor Gray
        } else {
            Write-Error "Failed to get compartment template for environment '$Environment'"
            exit 1
        }
    }
    
    Show-CertificateInfo -Domain $Domain
    Test-OCIConnection | Out-Null
    
    $certData = Get-CertificateData -Domain $Domain
    if (-not $certData) {
        exit 1
    }
    
    # Show available load balancers if no LoadBalancerId provided
    if (-not $LoadBalancerId) {
        Get-LoadBalancers -CompartmentId $CompartmentId
        Write-Host "To attach certificate to a specific load balancer, re-run with:" -ForegroundColor Yellow
        Write-Host "  -LoadBalancerId <LOAD_BALANCER_ID>" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Import certificate with tagging
    $importSuccess = Import-OCICertificate -CertificateName $CertificateName -CertificateData $certData.Certificate -PrivateKeyData $certData.PrivateKey -CompartmentId $CompartmentId -Environment $Environment -Service $Service -Owner $Owner
    
    if ($importSuccess -and $LoadBalancerId) {
        # Attach certificate to load balancer if specified
        Add-CertificateToLoadBalancer -LoadBalancerId $LoadBalancerId -CertificateName $CertificateName -CompartmentId $CompartmentId
    }
    
    Show-NextSteps -CertificateName $CertificateName -Domain $Domain
    Show-ManualImportInstructions -CertificateName $CertificateName -Domain $Domain
    
    Write-Host "=== OCI Certificate Import Process Complete ===" -ForegroundColor Green
    Write-Host "Tags applied:" -ForegroundColor Cyan
    Write-Host "  vauntico.environment: $Environment" -ForegroundColor Gray
    Write-Host "  vauntico.service: $Service" -ForegroundColor Gray
    Write-Host "  vauntico.owner: $Owner" -ForegroundColor Gray
}
catch {
    Write-Error "Import script failed: $($_.Exception.Message)"
    exit 1
}

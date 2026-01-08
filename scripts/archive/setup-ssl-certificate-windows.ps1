#!/usr/bin/env pwsh
# SSL Certificate Setup Script for Windows
# This script generates an SSL certificate for api.vauntico.com using Certbot

param(
    [string[]]$Domains = @("api.vauntico.com"),
    [string]$Email = "",
    [switch]$Staging = $false,
    [switch]$Force = $false,
    [switch]$MultiDomain = $false
)

Write-Host "=== SSL Certificate Setup for $($Domains -join ', ') ===" -ForegroundColor Green
Write-Host "Operating System: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)" -ForegroundColor Yellow
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator. Please run PowerShell as Administrator."
    exit 1
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Cyan
    
    # Check if Chocolatey is installed
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    if (-not $chocoInstalled) {
        Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Host "Chocolatey installed successfully." -ForegroundColor Green
    } else {
        Write-Host "Chocolatey is already installed." -ForegroundColor Green
    }
    
    # Check domain resolution
    try {
        $dnsResult = Resolve-DnsName -Name $Domain -ErrorAction Stop
        Write-Host "✓ Domain $Domain resolves to $($dnsResult.IPAddress)" -ForegroundColor Green
    }
    catch {
        Write-Error "✗ Domain $Domain does not resolve to this server. Please ensure DNS is configured correctly."
        exit 1
    }
    
    # Check port 80 availability
    try {
        $port80Listener = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
        if ($port80Listener) {
            Write-Warning "⚠ Port 80 is currently in use. You may need to stop the web service temporarily."
            Write-Host "Services using port 80:" -ForegroundColor Yellow
            $port80Listener | ForEach-Object {
                $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  - PID: $($_.OwningProcess) - $($process.ProcessName)" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "✓ Port 80 is available" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Could not check port 80 availability"
    }
    
    Write-Host ""
}

function Install-Certbot {
    Write-Host "Installing Certbot..." -ForegroundColor Cyan
    
    try {
        # Install Certbot via Chocolatey
        choco install certbot -y
        
        # Verify installation
        $certbotPath = Get-Command certbot -ErrorAction Stop
        Write-Host "✓ Certbot installed at $($certbotPath.Source)" -ForegroundColor Green
        
        # Refresh PATH to include Certbot
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Host ""
    }
    catch {
        Write-Error "Failed to install Certbot: $($_.Exception.Message)"
        exit 1
    }
}

function New-SSLCertificate {
    param(
        [string]$Domain,
        [string]$Email,
        [switch]$Staging,
        [switch]$Force
    )
    
    Write-Host "Generating SSL certificate for $Domain..." -ForegroundColor Cyan
    
    # Build Certbot command
    $certbotArgs = @("certonly", "--standalone")
    
    if ($Staging) {
        $certbotArgs += "--staging"
        Write-Host "Using Let's Encrypt staging environment (for testing)" -ForegroundColor Yellow
    }
    
    if ($Force) {
        $certbotArgs += "--force-renewal"
        Write-Host "Force renewal enabled" -ForegroundColor Yellow
    }
    
    if ($Email) {
        $certbotArgs += "--email", $Email, "--agree-tos", "--non-interactive"
    } else {
        $certbotArgs += "--register-unsafely-without-email", "--non-interactive"
        Write-Warning "No email provided. You should register with an email for renewal notices."
    }
    
    $certbotArgs += "-d", $Domain
    
    Write-Host "Running: certbot $($certbotArgs -join ' ')" -ForegroundColor Gray
    
    try {
        # Run Certbot
        $process = Start-Process -FilePath "certbot" -ArgumentList $certbotArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✓ SSL certificate generated successfully!" -ForegroundColor Green
            
            # Display certificate location
            $certPath = "C:\Certbot\live\$Domain"
            if (Test-Path $certPath) {
                Write-Host "Certificate files located at: $certPath" -ForegroundColor Green
                Get-ChildItem $certPath | ForEach-Object {
                    Write-Host "  - $($_.Name)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Error "✗ Certificate generation failed with exit code $($process.ExitCode)"
            exit 1
        }
    }
    catch {
        Write-Error "Failed to generate certificate: $($_.Exception.Message)"
        exit 1
    }
    
    Write-Host ""
}

function Show-CertificateInfo {
    param([string]$Domain)
    
    Write-Host "Certificate Information:" -ForegroundColor Cyan
    
    $certPath = "C:\Certbot\live\$Domain\fullchain.pem"
    $keyPath = "C:\Certbot\live\$Domain\privkey.pem"
    
    if (Test-Path $certPath) {
        Write-Host "Certificate file (fullchain.pem):" -ForegroundColor Green
        # Use OpenSSL if available, otherwise just show file info
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        
        if ($opensslPath) {
            try {
                $certInfo = & openssl x509 -in $certPath -text -noout
                Write-Host $certInfo -ForegroundColor Gray
            }
            catch {
                Write-Host "OpenSSL not available. Showing file information:" -ForegroundColor Yellow
                Get-Item $certPath | Format-List Name, Length, LastWriteTime
            }
        } else {
            Get-Item $certPath | Format-List Name, Length, LastWriteTime
        }
        
        Write-Host ""
        
        # Show private key information
        if (Test-Path $keyPath) {
            Write-Host "Private key file (privkey.pem):" -ForegroundColor Green
            Get-Item $keyPath | Format-List Name, Length, LastWriteTime
            
            # Check if private key is encrypted (basic check)
            try {
                $keyContent = Get-Content $keyPath -Raw
                if ($keyContent -match "ENCRYPTED") {
                    Write-Host "  Status: Encrypted private key" -ForegroundColor Yellow
                } else {
                    Write-Host "  Status: Unencrypted private key" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "  Status: Could not analyze key content" -ForegroundColor Red
            }
        } else {
            Write-Warning "Private key file not found at $keyPath"
        }
    } else {
        Write-Error "Certificate file not found at $certPath"
    }
    
    Write-Host ""
}

function Export-ForOCI {
    param([string]$Domain)
    
    Write-Host "Exporting certificate for OCI import..." -ForegroundColor Cyan
    
    $certPath = "C:\Certbot\live\$Domain"
    $exportPath = ".\oci-certificate-export"
    
    if (-not (Test-Path $exportPath)) {
        New-Item -ItemType Directory -Path $exportPath -Force | Out-Null
    }
    
    # Copy certificate files
    $fullchainPath = "$certPath\fullchain.pem"
    $privkeyPath = "$certPath\privkey.pem"
    
    if ((Test-Path $fullchainPath) -and (Test-Path $privkeyPath)) {
        Copy-Item $fullchainPath "$exportPath\fullchain.pem" -Force
        Copy-Item $privkeyPath "$exportPath\privkey.pem" -Force
        
        Write-Host "✓ Certificate files exported to $exportPath" -ForegroundColor Green
        Write-Host "Files for OCI import:" -ForegroundColor Green
        Write-Host "  - fullchain.pem (certificate chain)" -ForegroundColor Gray
        Write-Host "  - privkey.pem (private key)" -ForegroundColor Gray
        Write-Host ""
        
        # Display file contents for copying
        Write-Host "=== CERTIFICATE CHAIN (fullchain.pem) ===" -ForegroundColor Yellow
        Write-Host "Copy this content for OCI Certificate Body:" -ForegroundColor Gray
        Write-Host ""
        Get-Content $fullchainPath | Write-Host
        Write-Host ""
        Write-Host "=== PRIVATE KEY (privkey.pem) ===" -ForegroundColor Yellow
        Write-Host "Copy this content for OCI Private Key:" -ForegroundColor Gray
        Write-Host ""
        Get-Content $privkeyPath | Write-Host
        Write-Host ""
        
        # Create OCI import instructions
        $ociInstructions = @"
OCI Certificate Import Instructions:
=====================================

1. Go to Oracle Cloud Console
2. Navigate to Networking - Load Balancers - Certificates
3. Click "Create Certificate" - "Import Certificate"
4. Certificate Name: vauntico-mvp-api-cert
5. Certificate Body: Copy contents from fullchain.pem above
6. Private Key: Copy contents from privkey.pem above
7. Certificate Authority: Let's Encrypt
8. Click "Create"

After creation, attach the certificate to your HTTPS listener:
- Port: 443
- Protocol: HTTPS
- Certificate: vauntico-mvp-api-cert
"@
        
        Write-Host $ociInstructions -ForegroundColor Cyan
    } else {
        Write-Error "Certificate files not found. Make sure the certificate was generated successfully."
        exit 1
    }
}

function Test-Certificate {
    param([string]$Domain)
    
    Write-Host "Testing certificate installation..." -ForegroundColor Cyan
    
    try {
        # Test HTTPS connection
        Invoke-WebRequest -Uri "https://$Domain" -Method HEAD -TimeoutSec 10 -ErrorAction Stop | Out-Null
        Write-Host "✓ HTTPS connection successful" -ForegroundColor Green
        
        # Check SSL certificate details
        $cert = [System.Net.ServicePointManager]::FindServicePoint("https://$Domain", $null).Certificate
        if ($cert) {
            Write-Host "Certificate Details:" -ForegroundColor Green
            Write-Host "  Subject: $($cert.Subject)" -ForegroundColor Gray
            Write-Host "  Issuer: $($cert.Issuer)" -ForegroundColor Gray
            Write-Host "  Valid From: $($cert.GetEffectiveDateString())" -ForegroundColor Gray
            Write-Host "  Valid Until: $($cert.GetExpirationDateString())" -ForegroundColor Gray
        }
    }
    catch {
        Write-Warning "Could not verify HTTPS connection. This is expected if the certificate is not yet configured in OCI."
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Show-RenewalInfo {
    param([string]$Domain)
    
    Write-Host "Certificate Renewal Information:" -ForegroundColor Cyan
    
    # Check if renewal task is scheduled
    $taskName = "Certbot Renewal"
    $scheduledTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    
    if ($scheduledTask) {
        Write-Host "✓ Automatic renewal is configured via scheduled task: $taskName" -ForegroundColor Green
        $taskInfo = Get-ScheduledTaskInfo -TaskName $taskName
        Write-Host "  Next run: $($taskInfo.NextRunTime)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Automatic renewal not configured. Creating scheduled task..." -ForegroundColor Yellow
        
        # Create renewal task
        $action = New-ScheduledTaskAction -Execute "certbot" -Argument "renew --quiet"
        $trigger = New-ScheduledTaskTrigger -Daily -At 3am
        $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount
        
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
        
        Write-Host "✓ Scheduled task created for daily 3:00 AM renewal" -ForegroundColor Green
    }
    
    # Show manual renewal command
    Write-Host "Manual renewal commands:" -ForegroundColor Gray
    Write-Host "  Test renewal: certbot renew --dry-run" -ForegroundColor Gray
    Write-Host "  Force renewal: certbot renew --force-renewal" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
try {
    Test-Prerequisites
    Install-Certbot
    
    foreach ($domain in $Domains) {
        Write-Host "Processing domain: $domain" -ForegroundColor Magenta
        Write-Host ""
        
        New-SSLCertificate -Domain $domain -Email $Email -Staging:$Staging -Force:$Force
        Show-CertificateInfo -Domain $domain
        Export-ForOCI -Domain $domain
        Test-Certificate -Domain $domain
        Show-RenewalInfo -Domain $domain
        
        Write-Host "Domain $domain setup completed." -ForegroundColor Cyan
        Write-Host ""
    }
    
    Write-Host "=== All SSL Certificate Setups Complete ===" -ForegroundColor Green
    Write-Host "Domains processed: $($Domains -join ', ')" -ForegroundColor Gray
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Import certificates into OCI using the instructions above" -ForegroundColor Gray
    Write-Host "2. Configure HTTPS listeners in OCI Load Balancer" -ForegroundColor Gray
    Write-Host "3. Test HTTPS connections" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    exit 1
}

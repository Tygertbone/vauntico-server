#!/usr/bin/env pwsh
# SSL Certificate Verification and Testing Script
# This script verifies SSL certificate installation and tests HTTPS connectivity

param(
    [string[]]$Domains = @("api.vauntico.com"),
    [switch]$Detailed = $false,
    [switch]$OnlineTests = $false,
    [switch]$SlackAlerts = $false,
    [string]$SlackWebhookUrl = "",
    [switch]$MultiDomain = $false
)

Write-Host "=== SSL Certificate Verification for $($Domains -join ', ') ===" -ForegroundColor Green
Write-Host ""

function Send-SlackAlert {
    param(
        [string]$Message,
        [string]$WebhookUrl,
        [string]$Color = "good",
        [hashtable]$Fields = @{}
    )
    
    if (-not $SlackAlerts -or -not $WebhookUrl) {
        return
    }
    
    try {
        $payload = @{
            text = $Message
            attachments = @(
                @{
                    color = $Color
                    fields = @($Fields.GetEnumerator() | ForEach-Object {
                        @{
                            title = $_.Key
                            value = $_.Value
                            short = $true
                        }
                    })
                    footer = "SSL Certificate Verification Script"
                    ts = [int][double]::Parse((Get-Date -UFormat %s))
                }
            )
        } | ConvertTo-Json -Depth 10
        
        Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType "application/json" -Body $payload | Out-Null
        Write-Host "✓ Slack alert sent" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to send Slack alert: $($_.Exception.Message)"
    }
}

function Test-LocalCertificate {
    param([string]$Domain)
    
    Write-Host "Testing Local Certificate Files for $Domain..." -ForegroundColor Cyan
    
    $certPath = "C:\Certbot\live\$Domain"
    
    if (-not (Test-Path $certPath)) {
        Write-Error "✗ Certificate directory not found: $certPath"
        if ($SlackAlerts) {
            Send-SlackAlert -Message "🚨 SSL Certificate Verification Failed for $Domain" -WebhookUrl $SlackWebhookUrl -Color "danger" -Fields @{
                "Status" = "Certificate directory not found"
                "Domain" = $Domain
                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            }
        }
        return $false
    }
    
    $requiredFiles = @("fullchain.pem", "privkey.pem", "cert.pem", "chain.pem")
    $allFilesExist = $true
    $missingFiles = @()
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $certPath $file
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            Write-Host "✓ $file exists ($([math]::Round($fileInfo.Length / 1KB, 2)) KB)" -ForegroundColor Green
        } else {
            Write-Error "✗ $file not found"
            $allFilesExist = $false
            $missingFiles += $file
        }
    }
    
    if (-not $allFilesExist) {
        if ($SlackAlerts) {
            Send-SlackAlert -Message "🚨 SSL Certificate Files Missing for $Domain" -WebhookUrl $SlackWebhookUrl -Color "danger" -Fields @{
                "Status" = "Missing certificate files"
                "Missing Files" = ($missingFiles -join ", ")
                "Domain" = $Domain
                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            }
        }
        return $false
    }
    
    # Test certificate validity
    try {
        $fullchainPath = Join-Path $certPath "fullchain.pem"
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        
        if ($opensslPath) {
            Write-Host "Validating certificate with OpenSSL..." -ForegroundColor Yellow
            
            # Check certificate expiration
            $certInfo = & openssl x509 -in $fullchainPath -noout -dates 2>$null
            if ($certInfo) {
                Write-Host "Certificate validity:" -ForegroundColor Gray
                $certInfo | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
                
                # Extract expiration date for Slack alert
                $notAfter = $certInfo | Where-Object { $_ -match "notAfter=" } | Select-Object -First 1
                if ($notAfter -match "notAfter=(.+)") {
                    $expiryDate = [DateTime]::ParseExact($matches[1].Trim(), "MMM dd HH:mm:ss yyyy GMT", $null)
                    $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
                    
                    if ($daysUntilExpiry -lt 30) {
                        Write-Warning "⚠ Certificate expires in $daysUntilExpiry days!"
                        if ($SlackAlerts) {
                            Send-SlackAlert -Message "⚠️ SSL Certificate Expiring Soon for $Domain" -WebhookUrl $SlackWebhookUrl -Color "warning" -Fields @{
                                "Status" = "Certificate expiring soon"
                                "Days Until Expiry" = "$daysUntilExpiry days"
                                "Expiry Date" = $expiryDate.ToString("yyyy-MM-dd")
                                "Domain" = $Domain
                                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                            }
                        }
                    }
                }
            }
            
            # Check certificate subject
            $subject = & openssl x509 -in $fullchainPath -noout -subject 2>$null
            if ($subject) {
                Write-Host "Certificate subject: $subject" -ForegroundColor Gray
            }
            
            # Verify certificate chain
            $chainVerify = & openssl verify -untrusted "$certPath\chain.pem" $fullchainPath 2>$null
            if ($chainVerify -match "OK") {
                Write-Host "✓ Certificate chain verification passed" -ForegroundColor Green
            } else {
                Write-Warning "⚠ Certificate chain verification issue"
                Write-Host $chainVerify -ForegroundColor Yellow
                if ($SlackAlerts) {
                    Send-SlackAlert -Message "⚠️ SSL Certificate Chain Verification Failed for $Domain" -WebhookUrl $SlackWebhookUrl -Color "warning" -Fields @{
                        "Status" = "Certificate chain verification failed"
                        "Domain" = $Domain
                        "Details" = "OpenSSL verification failed"
                        "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                    }
                }
            }
        } else {
            Write-Warning "OpenSSL not available. Skipping detailed certificate validation."
        }
    }
    catch {
        Write-Warning "Could not validate certificate: $($_.Exception.Message)"
        if ($SlackAlerts) {
            Send-SlackAlert -Message "🚨 SSL Certificate Validation Error for $Domain" -WebhookUrl $SlackWebhookUrl -Color "danger" -Fields @{
                "Status" = "Certificate validation error"
                "Domain" = $Domain
                "Error" = $_.Exception.Message
                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            }
        }
    }
    
    Write-Host ""
    return $true
}

function Test-HTTPSConnection {
    param([string]$Domain)
    
    Write-Host "Testing HTTPS Connection..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "https://$Domain" -Method HEAD -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "✓ HTTPS connection successful" -ForegroundColor Green
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "  Server: $($response.Headers['Server'])" -ForegroundColor Gray
        
        # Get SSL certificate details
        try {
            $certRequest = [System.Net.WebRequest]::Create("https://$Domain")
            $certRequest.GetResponse() | Out-Null
            
            $cert = $certRequest.ServicePoint.Certificate
            if ($cert) {
                Write-Host "✓ SSL Certificate Details:" -ForegroundColor Green
                Write-Host "  Subject: $($cert.Subject)" -ForegroundColor Gray
                Write-Host "  Issuer: $($cert.Issuer)" -ForegroundColor Gray
                Write-Host "  Valid From: $($cert.GetEffectiveDateString())" -ForegroundColor Gray
                Write-Host "  Valid Until: $($cert.GetExpirationDateString())" -ForegroundColor Gray
                Write-Host "  Serial Number: $($cert.GetSerialNumberString())" -ForegroundColor Gray
                
                # Check expiration
                $daysUntilExpiry = ($cert.GetExpirationDateString() - (Get-Date)).Days
                if ($daysUntilExpiry -lt 30) {
                    Write-Warning "⚠ Certificate expires in $daysUntilExpiry days!"
                } else {
                    Write-Host "✓ Certificate valid for $daysUntilExpiry days" -ForegroundColor Green
                }
            }
        }
        catch {
            Write-Warning "Could not retrieve SSL certificate details: $($_.Exception.Message)"
        }
    }
    catch {
        Write-Error "✗ HTTPS connection failed: $($_.Exception.Message)"
        Write-Host "This is expected if certificate is not yet configured in the load balancer." -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Test-HTTPRedirect {
    param([string]$Domain)
    
    Write-Host "Testing HTTP to HTTPS Redirect..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "http://$Domain" -Method HEAD -TimeoutSec 10 -ErrorAction Stop -MaximumRedirection 0
        
        if ($response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
            Write-Host "✓ HTTP redirects to HTTPS (Status $($response.StatusCode))" -ForegroundColor Green
            $location = $response.Headers['Location']
            if ($location) {
                Write-Host "  Redirects to: $location" -ForegroundColor Gray
            }
        } else {
            Write-Warning "⚠ HTTP does not redirect to HTTPS (Status $($response.StatusCode))"
        }
    }
    catch {
        Write-Warning "Could not test HTTP redirect: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

function Test-OnlineSSLTools {
    param([string]$Domain)
    
    if (-not $OnlineTests) {
        Write-Host "Online SSL testing skipped (use -OnlineTests to enable)" -ForegroundColor Yellow
        Write-Host ""
        return
    }
    
    Write-Host "Testing with Online SSL Tools..." -ForegroundColor Cyan
    
    try {
        # Test with SSL Labs API
        $sslLabsApi = "https://api.ssllabs.com/api/v3/analyze?host=$Domain&startNew=on"
        $response = Invoke-RestMethod -Uri $sslLabsApi -TimeoutSec 30
        
        if ($response.status -eq "READY") {
            Write-Host "✓ SSL Labs Test Complete" -ForegroundColor Green
            Write-Host "  Grade: $($response.endpoints[0].grade)" -ForegroundColor Gray
            Write-Host "  Status: $($response.status)" -ForegroundColor Gray
            
            if ($Detailed) {
                Write-Host "  Detailed results available at: https://www.ssllabs.com/ssltest/analyze.html?d=$Domain&hideResults=on" -ForegroundColor Gray
            }
        } elseif ($response.status -eq "IN_PROGRESS") {
            Write-Host "⏳ SSL Labs test in progress..." -ForegroundColor Yellow
            Write-Host "  Check progress at: https://www.ssllabs.com/ssltest/analyze.html?d=$Domain" -ForegroundColor Gray
        } else {
            Write-Warning "SSL Labs test status: $($response.status)"
        }
    }
    catch {
        Write-Warning "Could not run SSL Labs test: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

function Test-RenewalConfiguration {
    param([string]$Domain)
    
    Write-Host "Testing Renewal Configuration..." -ForegroundColor Cyan
    
    # Check if Certbot is installed
    $certbotPath = Get-Command certbot -ErrorAction SilentlyContinue
    if (-not $certbotPath) {
        Write-Error "✗ Certbot not found"
        return
    }
    
    Write-Host "✓ Certbot installed at $($certbotPath.Source)" -ForegroundColor Green
    
    # Check certificates
    try {
        $certOutput = & certbot certificates 2>$null
        if ($certOutput -match $Domain) {
            Write-Host "✓ Certificate found in Certbot registry" -ForegroundColor Green
            if ($Detailed) {
                Write-Host "Certificate details:" -ForegroundColor Gray
                $certOutput | Where-Object { $_ -match $Domain -or $_ -match "Expiry" } | ForEach-Object {
                    Write-Host "  $_" -ForegroundColor Gray
                }
            }
        } else {
            Write-Warning "⚠ Certificate not found in Certbot registry"
        }
    }
    catch {
        Write-Warning "Could not check Certbot certificates: $($_.Exception.Message)"
    }
    
    # Check scheduled task
    $taskName = "Certbot Renewal"
    $scheduledTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    
    if ($scheduledTask) {
        Write-Host "✓ Automatic renewal task configured: $taskName" -ForegroundColor Green
        
        $taskInfo = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction SilentlyContinue
        if ($taskInfo) {
            Write-Host "  Next run: $($taskInfo.NextRunTime)" -ForegroundColor Gray
            Write-Host "  Last run: $($taskInfo.LastRunTime)" -ForegroundColor Gray
            if ($taskInfo.LastTaskResult -eq 0) {
                Write-Host "  Last result: Success" -ForegroundColor Green
            } else {
                Write-Warning "  Last result: Failed (code $($taskInfo.LastTaskResult))"
            }
        }
    } else {
        Write-Warning "⚠ Automatic renewal task not found"
    }
    
    # Test renewal process
    try {
        Write-Host "Testing renewal process (dry run)..." -ForegroundColor Yellow
        $renewOutput = & certbot renew --dry-run 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Renewal process test passed" -ForegroundColor Green
        } else {
            Write-Warning "⚠ Renewal process test failed"
            if ($Detailed) {
                Write-Host "Renewal output:" -ForegroundColor Gray
                $renewOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            }
        }
    }
    catch {
        Write-Warning "Could not test renewal process: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

function Test-Dependencies {
    Write-Host "Testing Dependencies..." -ForegroundColor Cyan
    
    # Check Chocolatey
    $chocoPath = Get-Command choco -ErrorAction SilentlyContinue
    if ($chocoPath) {
        Write-Host "✓ Chocolatey installed" -ForegroundColor Green
    } else {
        Write-Warning "⚠ Chocolatey not found"
    }
    
    # Check OpenSSL
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
    if ($opensslPath) {
        Write-Host "✓ OpenSSL available" -ForegroundColor Green
    } else {
        Write-Warning "⚠ OpenSSL not available (install via 'choco install openssl')"
    }
    
    # Check PowerShell execution policy
    $executionPolicy = Get-ExecutionPolicy
    Write-Host "PowerShell Execution Policy: $executionPolicy" -ForegroundColor Gray
    
    # Check administrator privileges
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if ($isAdmin) {
        Write-Host "✓ Running as Administrator" -ForegroundColor Green
    } else {
        Write-Warning "⚠ Not running as Administrator"
    }
    
    Write-Host ""
}

function Show-Summary {
    param([string[]]$Domains)
    
    Write-Host "=== Verification Summary ===" -ForegroundColor Green
    Write-Host "Domains: $($Domains -join ', ')" -ForegroundColor Gray
    Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Quick Commands:" -ForegroundColor Cyan
    Write-Host "  Check certificates: certbot certificates" -ForegroundColor Gray
    Write-Host "  Test renewal: certbot renew --dry-run" -ForegroundColor Gray
    Write-Host "  Force renewal: certbot renew --force-renewal" -ForegroundColor Gray
    Write-Host "  View logs: Get-Content C:\Certbot\log\letsencrypt.log -Tail 50" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Online Tools:" -ForegroundColor Cyan
    Write-Host "  SSL Labs: https://www.ssllabs.com/ssltest/" -ForegroundColor Gray
    Write-Host "  Let's Debug: https://letsdebug.net/" -ForegroundColor Gray
    Write-Host ""
    
    if ($SlackAlerts) {
        Write-Host "Slack alerts enabled: $SlackWebhookUrl" -ForegroundColor Gray
        Write-Host ""
    }
}

# Main execution
try {
    Test-Dependencies
    
    $overallSuccess = $true
    
    foreach ($domain in $Domains) {
        Write-Host "Processing domain: $domain" -ForegroundColor Magenta
        Write-Host ""
        
        $domainSuccess = $true
        $domainSuccess = Test-LocalCertificate -Domain $domain
        $domainSuccess = Test-HTTPSConnection -Domain $domain
        $domainSuccess = Test-HTTPRedirect -Domain $domain
        $domainSuccess = Test-OnlineSSLTools -Domain $domain
        $domainSuccess = Test-RenewalConfiguration -Domain $domain
        
        if (-not $domainSuccess) {
            $overallSuccess = $false
            if ($SlackAlerts) {
                Send-SlackAlert -Message "🚨 SSL Certificate Verification Failed for $domain" -WebhookUrl $SlackWebhookUrl -Color "danger" -Fields @{
                    "Status" = "Multiple verification failures"
                    "Domain" = $domain
                    "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                }
            }
        }
        
        Write-Host "Domain $domain verification completed." -ForegroundColor Cyan
        Write-Host ""
    }
    
    Show-Summary -Domains $Domains
    
    if ($overallSuccess) {
        Write-Host "=== All SSL Certificate Verifications Passed ===" -ForegroundColor Green
        if ($SlackAlerts) {
            Send-SlackAlert -Message "✅ All SSL Certificate Verifications Passed" -WebhookUrl $SlackWebhookUrl -Color "good" -Fields @{
                "Status" = "All domains verified successfully"
                "Domains" = ($Domains -join ", ")
                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            }
        }
    } else {
        Write-Host "=== Some SSL Certificate Verifications Failed ===" -ForegroundColor Red
        if ($SlackAlerts) {
            Send-SlackAlert -Message "⚠️ Some SSL Certificate Verifications Failed" -WebhookUrl $SlackWebhookUrl -Color "warning" -Fields @{
                "Status" = "Some verification tests failed"
                "Domains" = ($Domains -join ", ")
                "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            }
        }
        exit 1
    }
}
catch {
    Write-Error "Verification script failed: $($_.Exception.Message)"
    if ($SlackAlerts) {
        Send-SlackAlert -Message "🚨 SSL Certificate Verification Script Error" -WebhookUrl $SlackWebhookUrl -Color "danger" -Fields @{
            "Status" = "Script execution error"
            "Error" = $_.Exception.Message
            "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
    }
    exit 1
}

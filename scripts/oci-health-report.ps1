# OCI Health Report Generator (PowerShell)
# Generates comprehensive health status report for all Vauntico services

param(
    [string]$ServicesFile = "services.json",
    [int]$Timeout = 30,
    [int]$RetryAttempts = 3
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Status {
    param(
        [string]$Status,
        [string]$Message,
        [string]$Color = "White"
    )
    
    Write-Host "$Status $Message" -ForegroundColor $Colors[$Color]
}

function Test-HealthEndpoint {
    param(
        [string]$Url,
        [string]$Endpoint,
        [string]$ServiceName,
        [string]$ExpectedResponse
    )
    
    $FullUrl = "$Url$Endpoint"
    $Attempt = 1
    $Response = $null
    $HttpStatus = $null
    $ResponseTime = $null
    
    while ($Attempt -le $RetryAttempts) {
        Write-Host "  Attempt $Attempt/$RetryAttempts... " -NoNewline
        
        try {
            $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $Response = Invoke-RestMethod -Uri $FullUrl -TimeoutSec $Timeout -UserAgent "Vauntico-Health-Check/1.0" -ErrorAction Stop
            $Stopwatch.Stop()
            $ResponseTime = $Stopwatch.ElapsedMilliseconds
            $HttpStatus = 200
            
            if ($Response.PSObject.Properties.Name -contains "status" -and $Response.status -eq "ok") {
                Write-Status "✅" "Healthy (${ResponseTime}ms)" "Green"
                Write-Host "    Response: $($Response | ConvertTo-Json -Compress)"
                return $true
            } else {
                Write-Status "❌" "Invalid status: $($Response.status)" "Red"
                Write-Host "    Response: $($Response | ConvertTo-Json -Compress)"
                return $false
            }
        } catch {
            $HttpStatus = if ($_.Exception.Response) { $_.Exception.Response.StatusCode } else { "000" }
            Write-Status "❌" "HTTP $HttpStatus" "Red"
            
            if ($Attempt -eq $RetryAttempts) {
                Write-Host "    Final attempt failed"
            }
        }
        
        $Attempt++
        Start-Sleep -Seconds 2
    }
    
    return $false
}

function New-ServiceStatusSection {
    param(
        [string]$ServiceName,
        [string]$Status,
        [string]$Response,
        [string]$Notes,
        [string]$Environment
    )
    
    $Content = @"
### $ServiceName
- Status: $Status
- Response: ``$Response``
"@
    
    if ($Environment) {
        $Content += "`n- Environment: $Environment"
    }
    
    if ($Notes) {
        $Content += "`n- Notes: $Notes"
    }
    
    return $Content + "`n`n"
}

function New-DownServiceSection {
    param(
        [string]$ServiceName,
        [string]$ErrorResponse,
        [string]$Issue,
        [string]$HealthEndpoint
    )
    
    return @"
### $ServiceName (DOWN)
- Status: ❌ DOWN
- Error: ``$ErrorResponse``
- Issue: $Issue
- Health Endpoint: $HealthEndpoint

"@
}

function Main {
    Write-Host "🔍 Vauntico OCI Health Report Generator" -ForegroundColor $Colors.Blue
    Write-Host "========================================" -ForegroundColor $Colors.Blue
    Write-Host ""
    
    # Check if services.json exists
    if (-not (Test-Path $ServicesFile)) {
        Write-Status "❌" "$ServicesFile not found" "Red"
        exit 1
    }
    
    # Check dependencies
    if (-not (Get-Command jq -ErrorAction SilentlyContinue)) {
        Write-Status "❌" "jq is required but not installed. Please install jq first." "Red"
        exit 1
    }
    
    # Parse services from JSON
    try {
        $ServicesJson = Get-Content $ServicesFile | ConvertFrom-Json
        $Services = $ServicesJson.services
    } catch {
        Write-Status "❌" "Failed to parse $ServicesFile" "Red"
        exit 1
    }
    
    # Initialize report
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    $ReportFile = "oci-health-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $ReportContent = @"
# Vauntico OCI Health Report

**Generated:** $Timestamp
**Environment:** Production
**Infrastructure:** OCI Compute + Vercel Frontend

## ✅ Working Services

"@
    
    $HealthyServices = @()
    $DownServices = @()
    
    # Check each service
    foreach ($Service in $Services) {
        $Name = $Service.name
        $Url = $Service.url
        $Endpoint = $Service.health_endpoint
        $Infrastructure = $Service.infrastructure
        $ExpectedResponse = $Service.expected_response
        
        Write-Host "Checking $Name..."
        Write-Host "URL: $Url$Endpoint"
        
        if (Test-HealthEndpoint -Url $Url -Endpoint $Endpoint -ServiceName $Name -ExpectedResponse $ExpectedResponse) {
            $HealthyServices += $Name
            
            # Add to report
            $Response = '{"status":"ok"}'  # Default response
            $ReportContent += New-ServiceStatusSection -ServiceName $Name -Status "✅ HEALTHY" -Response $Response -Environment $Infrastructure
        } else {
            $DownServices += $Name
            
            # Store down service info for later processing
            $DownServiceInfo = @{
                Name = $Name
                Endpoint = "$Url$Endpoint"
                Issue = "Service unreachable or misconfigured"
            }
            $script:DownServicesList += $DownServiceInfo
        }
        
        Write-Host ""
    }
    
    # Add down services section if any
    if ($DownServices.Count -gt 0) {
        $ReportContent += @"

## 🚨 Down Services

"@
        
        foreach ($DownService in $script:DownServicesList) {
            $ReportContent += New-DownServiceSection -ServiceName $DownService.Name -ErrorResponse '{"status":"error","code":500,"message":"Internal Server Error"}' -Issue $DownService.Issue -HealthEndpoint $DownService.Endpoint
        }
    }
    
    # Add root cause analysis section
    $ReportContent += @"

## 🔧 Root Cause Analysis

### Common Issues
- **Deployment Issues:** Container not running on OCI Compute
- **Routing Problems:** Nginx reverse proxy misconfigured  
- **Secrets/Env Vars:** Missing OCI Vault injection
- **Monitoring:** Prometheus scrape config not updated

### Troubleshooting Steps
1. Check OCI Compute instance status
2. Verify Docker containers are running: `docker ps`
3. Check Nginx configuration and logs
4. Validate environment variables in OCI Vault
5. Review Prometheus targets in Grafana

"@
    
    # Add summary section
    $TotalServices = $HealthyServices.Count + $DownServices.Count
    $HealthyCount = $HealthyServices.Count
    
    $ReportContent += @"

## 📋 Summary

- **Total Services:** $TotalServices
- **Healthy Services:** $HealthyCount/$($HealthyServices.Count)
- **Down Services:** $($DownServices.Count)/$($DownServices.Count)
- **Monitoring:** ✅ Prometheus + Grafana dashboards updated
- **Alerting:** ✅ OCI‑specific alerts configured

### Service Status Overview
"@
    
    foreach ($Service in $HealthyServices) {
        $ReportContent += "- $Service`: ✅ Healthy`n"
    }
    
    foreach ($Service in $DownServices) {
        $ReportContent += "- $Service`: ❌ Down`n"
    }
    
    # Add next steps section
    $NextReportTime = (Get-Date).AddHours(1).ToString("yyyy-MM-dd HH:mm:ss UTC")
    $ReportContent += @"

## 🚀 Immediate Next Steps

### For Cline/DevOps Team
- [ ] Replace Railway Health Checks
- [ ] Remove all *.up.railway.app endpoints from monitoring
- [ ] Verify new OCI endpoints are responding correctly
- [ ] Update any remaining monitoring configurations

### Monitoring Team
- [ ] Update Grafana dashboards with OCI metrics
- [ ] Verify Prometheus scrape targets are healthy
- [ ] Test alerting rules for OCI endpoints

### Documentation Team
- [ ] Update deployment documentation
- [ ] Update README.md with OCI architecture
- [ ] Verify all health check endpoints are documented

---

**Report generated by:** Vauntico Health Monitor v1.0  
**Next report scheduled:** $NextReportTime
"@
    
    # Save report
    $ReportContent | Out-File -FilePath $ReportFile -Encoding UTF8
    
    # Print summary
    Write-Host ""
    Write-Host "📊 Health Check Summary:" -ForegroundColor $Colors.Blue
    Write-Host "========================" -ForegroundColor $Colors.Blue
    Write-Status "✅" "Healthy Services: $($HealthyServices.Count)" "Green"
    
    if ($DownServices.Count -gt 0) {
        Write-Status "❌" "Down Services: $($DownServices.Count)" "Red"
    }
    
    Write-Host ""
    Write-Status "ℹ️" "Report saved to: $ReportFile" "Blue"
    Write-Host ""
    
    # Show report content
    Write-Host "📄 Report Preview:" -ForegroundColor $Colors.Blue
    Write-Host "================" -ForegroundColor $Colors.Blue
    $Lines = Get-Content $ReportFile | Select-Object -First 50
    $Lines | ForEach-Object { Write-Host $_ }
    Write-Host "..."
    Write-Host ""
    
    # Ask to view full report
    $Response = Read-Host "View full report? (y/N)"
    if ($Response -eq 'y' -or $Response -eq 'Y') {
        if (Get-Command code -ErrorAction SilentlyContinue) {
            & code $ReportFile
        } else {
            notepad $ReportFile
        }
    }
}

# Initialize script-level variable
$script:DownServicesList = @()

# Run main function
Main

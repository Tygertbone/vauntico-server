 ============================================================================
# Vauntico MVP - OCI Infrastructure Verification Script (PowerShell)
# ============================================================================
# This script verifies that your OCI infrastructure is up and running properly
# including compute instances, databases, network components, vaults, and monitoring
#
# Prerequisites:
# - OCI CLI installed and configured
# - Valid OCI credentials with appropriate permissions
# - Compartment OCID for Vauntico-MVP
# ============================================================================

param(
    [string]$CompartmentId = "",
    [string]$OutputFile = "",
    [switch]$Verbose = $false,
    [switch]$FailOnWarning = $false,
    [switch]$Help = $false
)

# Color codes for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

# Status counters
$Script:TotalChecks = 0
$Script:PassedChecks = 0
$Script:FailedChecks = 0
$Script:WarningChecks = 0

# Logging functions
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Colors.Blue
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
    $Script:FailedChecks++
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
    $Script:PassedChecks++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
    $Script:WarningChecks++
    if ($FailOnWarning) {
        $Script:FailedChecks++
    }
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Cyan
}

# Increment total checks counter
function Add-Check {
    $Script:TotalChecks++
}

# Check if OCI CLI is installed and configured
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    try {
        $ociVersion = oci --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "OCI not found"
        }
        Write-Log "OCI CLI version: $ociVersion"
    }
    catch {
        Write-Error "OCI CLI is not installed. Please install it first: https://docs.oracle.com/en/learn/getting-started-cli/"
        return $false
    }
    
    # Check if OCI is configured
    try {
        $null = oci iam compartment list --max-items 1 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "OCI not configured"
        }
    }
    catch {
        Write-Error "OCI CLI is not configured. Please run 'oci setup config' first."
        return $false
    }
    
    Write-Success "Prerequisites check passed"
    return $true
}

# Get user input for compartment ID
function Get-UserInput {
    if ([string]::IsNullOrEmpty($CompartmentId)) {
        Write-Host "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        
        $CompartmentId = Read-Host "Enter your Vauntico-MVP Compartment OCID"
        
        if ([string]::IsNullOrEmpty($CompartmentId)) {
            Write-Error "Compartment ID is required"
            exit 1
        }
    }
    
    # Validate compartment ID format
    if ($CompartmentId -notmatch "^ocid1\.compartment\.") {
        Write-Error "Invalid compartment ID format. Expected format: ocid1.compartment.oc1..."
        exit 1
    }
    
    # Set output file if not specified
    if ([string]::IsNullOrEmpty($OutputFile)) {
        $OutputFile = "oci-infrastructure-verification-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    }
    
    Write-Success "Using compartment: $CompartmentId"
}

# Check Compute Instances Status
function Test-ComputeInstances {
    Write-Log "Checking Compute Instances Status..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci compute instance list --compartment-id $CompartmentId --query `"data[].{Name:`"display-name`", State:`"lifecycle-state`"}`""
    }
    
    $computeOutput = oci compute instance list --compartment-id $CompartmentId --query "data[].{Name:\"display-name\", State:\"lifecycle-state\"}" --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list compute instances: $computeOutput"
        return $false
    }
    
    if ($computeOutput -eq "[]") {
        Write-Warning "No compute instances found in compartment"
        return $true
    }
    
    try {
        $instances = $computeOutput | ConvertFrom-Json
        foreach ($instance in $instances) {
            Add-Check
            $statusLine = "Instance: $($instance.Name) - State: $($instance.State)"
            
            if ($instance.State -eq "RUNNING") {
                Write-Success $statusLine
            } elseif ($instance.State -in @("STARTING", "STOPPING", "PROVISIONING")) {
                Write-Warning "$statusLine (transitioning)"
            } else {
                Write-Error "$statusLine (not running)"
            }
        }
    }
    catch {
        Write-Error "Failed to parse compute instances JSON: $_"
        return $false
    }
    
    return $true
}

# Check Autonomous Database Status
function Test-AutonomousDatabases {
    Write-Log "Checking Autonomous Database Status..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci db autonomous-database list --compartment-id $CompartmentId --query `"data[].{Name:`"display-name`", State:`"lifecycle-state`"}`""
    }
    
    $dbOutput = oci db autonomous-database list --compartment-id $CompartmentId --query "data[].{Name:\"display-name\", State:\"lifecycle-state\"}" --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list autonomous databases: $dbOutput"
        return $false
    }
    
    if ($dbOutput -eq "[]") {
        Write-Warning "No autonomous databases found in compartment"
        return $true
    }
    
    try {
        $databases = $dbOutput | ConvertFrom-Json
        foreach ($database in $databases) {
            Add-Check
            $statusLine = "Database: $($database.Name) - State: $($database.State)"
            
            if ($database.State -eq "AVAILABLE") {
                Write-Success $statusLine
            } elseif ($database.State -in @("UPDATING", "PROVISIONING", "STARTING", "STOPPING")) {
                Write-Warning "$statusLine (transitioning)"
            } else {
                Write-Error "$statusLine (not available)"
            }
        }
    }
    catch {
        Write-Error "Failed to parse autonomous databases JSON: $_"
        return $false
    }
    
    return $true
}

# Check Network Components (VCNs and Subnets)
function Test-NetworkComponents {
    Write-Log "Checking Network Components..."
    
    # Check VCNs
    Add-Check
    if ($Verbose) {
        Write-Info "Running: oci network vcn list --compartment-id $CompartmentId"
    }
    
    $vcnOutput = oci network vcn list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list VCNs: $vcnOutput"
        return $false
    }
    
    if ($vcnOutput -eq "[]") {
        Write-Warning "No VCNs found in compartment"
    } else {
        Write-Success "VCNs found:"
        try {
            $vcns = $vcnOutput | ConvertFrom-Json
            foreach ($vcn in $vcns) {
                Write-Host "  VCN: $($vcn.'display-name') - CIDR: $($vcn.'cidr-block') - State: $($vcn.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse VCNs JSON: $_"
            return $false
        }
    }
    
    # Check Subnets
    Add-Check
    if ($Verbose) {
        Write-Info "Running: oci network subnet list --compartment-id $CompartmentId"
    }
    
    $subnetOutput = oci network subnet list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list subnets: $subnetOutput"
        return $false
    }
    
    if ($subnetOutput -eq "[]") {
        Write-Warning "No subnets found in compartment"
    } else {
        Write-Success "Subnets found:"
        try {
            $subnets = $subnetOutput | ConvertFrom-Json
            foreach ($subnet in $subnets) {
                Write-Host "  Subnet: $($subnet.'display-name') - CIDR: $($subnet.'cidr-block') - State: $($subnet.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse subnets JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Check Vault and Secrets
function Test-VaultAndSecrets {
    Write-Log "Checking Vault and Secrets..."
    
    # Check Vaults
    Add-Check
    if ($Verbose) {
        Write-Info "Running: oci kms vault list --compartment-id $CompartmentId"
    }
    
    $vaultOutput = oci kms vault list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list vaults: $vaultOutput"
        return $false
    }
    
    if ($vaultOutput -eq "[]") {
        Write-Warning "No vaults found in compartment"
    } else {
        Write-Success "Vaults found:"
        try {
            $vaults = $vaultOutput | ConvertFrom-Json
            foreach ($vault in $vaults) {
                Write-Host "  Vault: $($vault.'display-name') - State: $($vault.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse vaults JSON: $_"
            return $false
        }
    }
    
    # Check Secrets
    Add-Check
    if ($Verbose) {
        Write-Info "Running: oci secrets secret list --compartment-id $CompartmentId"
    }
    
    $secretsOutput = oci secrets secret list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list secrets: $secretsOutput"
        return $false
    }
    
    if ($secretsOutput -eq "[]") {
        Write-Warning "No secrets found in compartment"
    } else {
        Write-Success "Secrets found:"
        try {
            $secrets = $secretsOutput | ConvertFrom-Json
            foreach ($secret in $secrets) {
                Write-Host "  Secret: $($secret.'secret-name') - State: $($secret.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse secrets JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Check Monitoring and Alerts
function Test-MonitoringAndAlerts {
    Write-Log "Checking Monitoring and Alerts..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci monitoring alarm list --compartment-id $CompartmentId"
    }
    
    $alarmOutput = oci monitoring alarm list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list alarms: $alarmOutput"
        return $false
    }
    
    if ($alarmOutput -eq "[]") {
        Write-Warning "No alarms found in compartment"
    } else {
        Write-Success "Alarms found:"
        try {
            $alarms = $alarmOutput | ConvertFrom-Json
            foreach ($alarm in $alarms) {
                Write-Host "  Alarm: $($alarm.'display-name') - State: $($alarm.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse alarms JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Check Load Balancers
function Test-LoadBalancers {
    Write-Log "Checking Load Balancers..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci lb load-balancer list --compartment-id $CompartmentId"
    }
    
    $lbOutput = oci lb load-balancer list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list load balancers: $lbOutput"
        return $false
    }
    
    if ($lbOutput -eq "[]") {
        Write-Warning "No load balancers found in compartment"
    } else {
        Write-Success "Load balancers found:"
        try {
            $loadBalancers = $lbOutput | ConvertFrom-Json
            foreach ($lb in $loadBalancers) {
                Write-Host "  Load Balancer: $($lb.'display-name') - State: $($lb.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse load balancers JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Check Block Storage
function Test-BlockStorage {
    Write-Log "Checking Block Storage..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci bv volume list --compartment-id $CompartmentId"
    }
    
    $volumeOutput = oci bv volume list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list block volumes: $volumeOutput"
        return $false
    }
    
    if ($volumeOutput -eq "[]") {
        Write-Warning "No block volumes found in compartment"
    } else {
        Write-Success "Block volumes found:"
        try {
            $volumes = $volumeOutput | ConvertFrom-Json
            foreach ($volume in $volumes) {
                Write-Host "  Volume: $($volume.'display-name') - Size: $($volume.'size-in-gbs')GB - State: $($volume.'lifecycle-state')"
            }
        }
        catch {
            Write-Error "Failed to parse block volumes JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Check Object Storage Buckets
function Test-ObjectStorage {
    Write-Log "Checking Object Storage..."
    Add-Check
    
    if ($Verbose) {
        Write-Info "Running: oci os bucket list --compartment-id $CompartmentId"
    }
    
    $bucketOutput = oci os bucket list --compartment-id $CompartmentId --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to list object storage buckets: $bucketOutput"
        return $false
    }
    
    if ($bucketOutput -eq "[]") {
        Write-Warning "No object storage buckets found in compartment"
    } else {
        Write-Success "Object storage buckets found:"
        try {
            $buckets = $bucketOutput | ConvertFrom-Json
            foreach ($bucket in $buckets) {
                Write-Host "  Bucket: $($bucket.name) - Created: $($bucket.'time-created')"
            }
        }
        catch {
            Write-Error "Failed to parse object storage buckets JSON: $_"
            return $false
        }
    }
    
    return $true
}

# Generate comprehensive report
function New-VerificationReport {
    Write-Log "Generating verification report..."
    
    $reportFile = $OutputFile
    
    $overallStatus = if ($Script:FailedChecks -eq 0) { "✅ HEALTHY" } else { "❌ ISSUES FOUND" }
    
    $componentStatus = if ($Script:FailedChecks -gt 0) { "❌ Some components have issues that need attention" } 
                       elseif ($Script:WarningChecks -gt 0) { "⚠️  Some components are in transitional states" } 
                       else { "✅ All components are running normally" }
    
    $recommendations = @()
    if ($Script:FailedChecks -gt 0) { $recommendations += "1. Investigate failed components immediately" }
    if ($Script:WarningChecks -gt 0) { $recommendations += "2. Monitor transitional components" }
    if ($Script:PassedChecks -eq $Script:TotalChecks) { $recommendations += "1. All systems operational - continue monitoring" }
    $recommendations += "3. Set up automated monitoring and alerting"
    $recommendations += "4. Regularly verify infrastructure health"
    $recommendations += "5. Implement backup and disaster recovery procedures"
    
    $nextSteps = @()
    if ($Script:FailedChecks -gt 0) { 
        $nextSteps += "1. Address failed components immediately"
        $nextSteps += "2. Re-run verification after fixes"
    } else {
        $nextSteps += "1. Continue with deployment tasks"
        $nextSteps += "2. Schedule regular health checks"
    }
    $nextSteps += "3. Monitor system performance"
    $nextSteps += "4. Update documentation as needed"
    
    $reportContent = @"
 ============================================================================
 Vauntico MVP - OCI Infrastructure Verification Report
 ============================================================================
 Verification Date: $(Get-Date)
 Compartment ID: $CompartmentId
 
 VERIFICATION SUMMARY:
 --------------------
 Total Checks: $Script:TotalChecks
 Passed: $Script:PassedChecks
 Failed: $Script:FailedChecks
 Warnings: $Script:WarningChecks
 
 Overall Status: $overallStatus
 
 COMPONENT STATUS:
 ---------------
$componentStatus
 
 RECOMMENDATIONS:
 ---------------
$($recommendations -join "`n")
 
 NEXT STEPS:
 -----------
$($nextSteps -join "`n")
 
 VERIFICATION COMMANDS:
 ---------------------
 # Re-run this verification:
 ./scripts/verify-oci-infrastructure.ps1 -CompartmentId $CompartmentId
 
 # Check specific components:
 oci compute instance list --compartment-id $CompartmentId
 oci db autonomous-database list --compartment-id $CompartmentId
 oci network vcn list --compartment-id $CompartmentId
 oci kms vault list --compartment-id $CompartmentId
 oci monitoring alarm list --compartment-id $CompartmentId
 ============================================================================
"@
    
    $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Success "Verification report saved to: $reportFile"
}

# Display final summary
function Show-Summary {
    Write-Host ""
    Write-Log "VERIFICATION SUMMARY"
    Write-Host "===================="
    Write-Host "Total Checks: $Script:TotalChecks"
    Write-Host "Passed: $Script:PassedChecks"
    Write-Host "Failed: $Script:FailedChecks"
    Write-Host "Warnings: $Script:WarningChecks"
    Write-Host ""
    
    if ($Script:FailedChecks -gt 0) {
        Write-Error "❌ INFRASTRUCTURE HAS ISSUES - $Script:FailedChecks checks failed"
        Write-Host ""
        Write-Host "Recommendations:"
        Write-Host "1. Review the failed components above"
        Write-Host "2. Take corrective action immediately"
        Write-Host "3. Re-run verification after fixes"
    } elseif ($Script:WarningChecks -gt 0) {
        Write-Warning "⚠️  INFRASTRUCTURE HAS WARNINGS - $Script:WarningChecks checks have warnings"
        Write-Host ""
        Write-Host "Recommendations:"
        Write-Host "1. Monitor transitional components"
        Write-Host "2. Investigate if warnings persist"
    } else {
        Write-Success "✅ INFRASTRUCTURE IS HEALTHY - All checks passed"
        Write-Host ""
        Write-Host "Recommendations:"
        Write-Host "1. Continue with deployment tasks"
        Write-Host "2. Schedule regular health checks"
    }
    
    Write-Host ""
    Write-Host "Full report saved to: $OutputFile"
}

# Show usage
function Show-Usage {
    Write-Host "Usage: .\verify-oci-infrastructure.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -CompartmentId         Compartment OCID (required if not set)"
    Write-Host "  -OutputFile            Output file for the report (default: auto-generated)"
    Write-Host "  -Verbose               Enable verbose output"
    Write-Host "  -FailOnWarning         Treat warnings as failures"
    Write-Host "  -Help                  Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example"
    Write-Host "  .\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example -Verbose -OutputFile my-report.txt"
    Write-Host "  .\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example -FailOnWarning"
}

# Main execution function
function Main {
    # Show help if requested
    if ($Help) {
        Show-Usage
        exit 0
    }
    
    Write-Log "Starting Vauntico MVP OCI Infrastructure Verification..."
    Write-Host ""
    
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    Get-UserInput
    
    # Run all verification checks
    Test-ComputeInstances
    Test-AutonomousDatabases
    Test-NetworkComponents
    Test-VaultAndSecrets
    Test-MonitoringAndAlerts
    Test-LoadBalancers
    Test-BlockStorage
    Test-ObjectStorage
    
    # Generate report and display summary
    New-VerificationReport
    Show-Summary
    
    # Exit with appropriate code
    if ($Script:FailedChecks -gt 0) {
        exit 1
    } elseif ($FailOnWarning -and $Script:WarningChecks -gt 0) {
        exit 1
    } else {
        exit 0
    }
}

# Script execution
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    Main
}

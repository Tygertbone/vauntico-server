# ============================================================================
# Vauntico MVP - OCI Infrastructure Setup Script (PowerShell)
# ============================================================================
# This script sets up the complete network infrastructure for Vauntico MVP
# including VCN, subnets, gateways, route tables, and security lists
#
# Prerequisites:
# - OCI CLI installed and configured
# - Valid OCI credentials with appropriate permissions
# - Compartment OCID for Vauntico-MVP
# ============================================================================

param(
    [string]$CompartmentId = "",
    [string]$VcnCidr = "10.0.0.0/16",
    [string]$PublicSubnetCidr = "10.0.1.0/24",
    [string]$PrivateSubnetCidr = "10.0.2.0/24"
)

# Color codes for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Configuration variables
$VCN_DISPLAY_NAME = "Vauntico-MVP-VCN"
$PUBLIC_SUBNET_NAME = "Vauntico-MVP-Public-Subnet"
$PRIVATE_SUBNET_NAME = "Vauntico-MVP-Private-Subnet"
$IG_NAME = "Vauntico-MVP-IG"
$NAT_NAME = "Vauntico-MVP-NAT"
$PUBLIC_RT_NAME = "Vauntico-MVP-Public-RT"
$PRIVATE_RT_NAME = "Vauntico-MVP-Private-RT"
$PUBLIC_SL_NAME = "Vauntico-MVP-Public-SL"

# Variables to store created resource OCIDs
$Script:VCN_ID = ""
$Script:PUBLIC_SUBNET_ID = ""
$Script:PRIVATE_SUBNET_ID = ""
$Script:IG_ID = ""
$Script:NAT_ID = ""
$Script:PUBLIC_RT_ID = ""
$Script:PRIVATE_RT_ID = ""
$Script:PUBLIC_SL_ID = ""

# Logging functions
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Colors.Blue
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
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
    }
    
    Write-Success "Prerequisites check passed"
}

# Get user input for compartment ID
function Get-UserInput {
    Write-Log "Getting user configuration..."
    
    if ([string]::IsNullOrEmpty($CompartmentId)) {
        Write-Host "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        
        $CompartmentId = Read-Host "Enter your Vauntico-MVP Compartment OCID"
        
        if ([string]::IsNullOrEmpty($CompartmentId)) {
            Write-Error "Compartment ID is required"
        }
    }
    
    # Validate compartment ID format
    if ($CompartmentId -notmatch "^ocid1\.compartment\.") {
        Write-Error "Invalid compartment ID format. Expected format: ocid1.compartment.oc1..."
    }
    
    # Confirm configuration
    Write-Log "Configuration Summary:"
    Write-Host "  Compartment ID: $CompartmentId"
    Write-Host "  VCN CIDR: $VcnCidr"
    Write-Host "  Public Subnet CIDR: $PublicSubnetCidr"
    Write-Host "  Private Subnet CIDR: $PrivateSubnetCidr"
    Write-Host ""
    
    $confirm = Read-Host "Continue with this configuration? (y/N)"
    
    if ($confirm -notmatch "^[yY]$") {
        Write-Error "Setup cancelled by user"
    }
    
    Write-Success "Configuration confirmed"
}

# Step 1: Create VCN
function New-VCN {
    Write-Log "Step 1: Creating VCN..."
    
    Write-Log "Creating VCN with name: $VCN_DISPLAY_NAME"
    Write-Log "CIDR Block: $VcnCidr"
    
    $vcnOutput = oci network vcn create `
        --compartment-id $CompartmentId `
        --display-name $VCN_DISPLAY_NAME `
        --cidr-block $VcnCidr `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create VCN: $vcnOutput"
    }
    
    $Script:VCN_ID = $vcnOutput.Trim()
    Write-Success "VCN created successfully: $Script:VCN_ID"
    
    # Wait a bit for the VCN to be fully available
    Write-Log "Waiting for VCN to be fully available..."
    Start-Sleep -Seconds 10
}

# Step 2: Create Subnets
function New-Subnets {
    Write-Log "Step 2: Creating subnets..."
    
    # Create Public Subnet
    Write-Log "Creating public subnet: $PUBLIC_SUBNET_NAME"
    $publicSubnetOutput = oci network subnet create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $PUBLIC_SUBNET_NAME `
        --cidr-block $PublicSubnetCidr `
        --prohibit-public-ip-on-vnic false `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create public subnet: $publicSubnetOutput"
    }
    
    $Script:PUBLIC_SUBNET_ID = $publicSubnetOutput.Trim()
    Write-Success "Public subnet created successfully: $Script:PUBLIC_SUBNET_ID"
    
    # Create Private Subnet
    Write-Log "Creating private subnet: $PRIVATE_SUBNET_NAME"
    $privateSubnetOutput = oci network subnet create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $PRIVATE_SUBNET_NAME `
        --cidr-block $PrivateSubnetCidr `
        --prohibit-public-ip-on-vnic true `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create private subnet: $privateSubnetOutput"
    }
    
    $Script:PRIVATE_SUBNET_ID = $privateSubnetOutput.Trim()
    Write-Success "Private subnet created successfully: $Script:PRIVATE_SUBNET_ID"
    
    # Wait for subnets to be fully available
    Write-Log "Waiting for subnets to be fully available..."
    Start-Sleep -Seconds 10
}

# Step 3: Create Gateways
function New-Gateways {
    Write-Log "Step 3: Creating gateways..."
    
    # Create Internet Gateway
    Write-Log "Creating Internet Gateway: $IG_NAME"
    $igOutput = oci network internet-gateway create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $IG_NAME `
        --is-enabled true `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create Internet Gateway: $igOutput"
    }
    
    $Script:IG_ID = $igOutput.Trim()
    Write-Success "Internet Gateway created successfully: $Script:IG_ID"
    
    # Create NAT Gateway
    Write-Log "Creating NAT Gateway: $NAT_NAME"
    $natOutput = oci network nat-gateway create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $NAT_NAME `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create NAT Gateway: $natOutput"
    }
    
    $Script:NAT_ID = $natOutput.Trim()
    Write-Success "NAT Gateway created successfully: $Script:NAT_ID"
    
    # Wait for gateways to be fully available
    Write-Log "Waiting for gateways to be fully available..."
    Start-Sleep -Seconds 10
}

# Step 4: Create Route Tables
function New-RouteTables {
    Write-Log "Step 4: Creating route tables..."
    
    # Create Public Route Table
    Write-Log "Creating public route table: $PUBLIC_RT_NAME"
    $publicRtRules = "[{`"cidrBlock`":`"0.0.0.0/0`",`"networkEntityId`":`"$Script:IG_ID`"}]"
    
    $publicRtOutput = oci network route-table create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $PUBLIC_RT_NAME `
        --route-rules $publicRtRules `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create public route table: $publicRtOutput"
    }
    
    $Script:PUBLIC_RT_ID = $publicRtOutput.Trim()
    Write-Success "Public route table created successfully: $Script:PUBLIC_RT_ID"
    
    # Create Private Route Table
    Write-Log "Creating private route table: $PRIVATE_RT_NAME"
    $privateRtRules = "[{`"cidrBlock`":`"0.0.0.0/0`",`"networkEntityId`":`"$Script:NAT_ID`"}]"
    
    $privateRtOutput = oci network route-table create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $PRIVATE_RT_NAME `
        --route-rules $privateRtRules `
        --wait-for-state AVAILABLE `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create private route table: $privateRtOutput"
    }
    
    $Script:PRIVATE_RT_ID = $privateRtOutput.Trim()
    Write-Success "Private route table created successfully: $Script:PRIVATE_RT_ID"
    
    # Associate route tables with subnets
    Write-Log "Associating route tables with subnets..."
    
    # Update public subnet to use public route table
    $null = oci network subnet update `
        --subnet-id $Script:PUBLIC_SUBNET_ID `
        --route-table-id $Script:PUBLIC_RT_ID `
        --force 2>$null
    
    # Update private subnet to use private route table
    $null = oci network subnet update `
        --subnet-id $Script:PRIVATE_SUBNET_ID `
        --route-table-id $Script:PRIVATE_RT_ID `
        --force 2>$null
    
    Write-Success "Route tables associated with subnets"
    
    # Wait for route tables to be fully available
    Write-Log "Waiting for route tables to be fully available..."
    Start-Sleep -Seconds 10
}

# Step 5: Create Security Lists
function New-SecurityLists {
    Write-Log "Step 5: Creating security lists..."
    
    # Create Public Subnet Security List
    Write-Log "Creating public subnet security list: $PUBLIC_SL_NAME"
    
    $egressRules = '[{"destination":"0.0.0.0/0","protocol":"all"}]'
    $ingressRules = '[
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
        {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}
    ]'
    
    $publicSlOutput = oci network security-list create `
        --compartment-id $CompartmentId `
        --vcn-id $Script:VCN_ID `
        --display-name $PUBLIC_SL_NAME `
        --egress-security-rules $egressRules `
        --ingress-security-rules $ingressRules `
        --query 'data.id' `
        --raw-output 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create public security list: $publicSlOutput"
    }
    
    $Script:PUBLIC_SL_ID = $publicSlOutput.Trim()
    Write-Success "Public security list created successfully: $Script:PUBLIC_SL_ID"
    
    # Associate security list with public subnet
    Write-Log "Associating security list with public subnet..."
    $securityListIds = '["' + $Script:PUBLIC_SL_ID + '"]'
    
    $null = oci network subnet update `
        --subnet-id $Script:PUBLIC_SUBNET_ID `
        --security-list-ids $securityListIds `
        --force 2>$null
    
    Write-Success "Security list associated with public subnet"
}

# Generate summary and save configuration
function New-Summary {
    Write-Log "Generating infrastructure summary..."
    
    $summaryFile = "oci-infrastructure-summary-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    
    $summaryContent = @"
 ============================================================================
 Vauntico MVP - OCI Infrastructure Setup Summary
 ============================================================================
 Created on: $(Get-Date)
 Compartment ID: $CompartmentId
 
 RESOURCE DETAILS:
 ----------------
 VCN:
   Name: $VCN_DISPLAY_NAME
   ID: $Script:VCN_ID
   CIDR: $VcnCidr
   
 Public Subnet:
   Name: $PUBLIC_SUBNET_NAME
   ID: $Script:PUBLIC_SUBNET_ID
   CIDR: $PublicSubnetCidr
   
 Private Subnet:
   Name: $PRIVATE_SUBNET_NAME
   ID: $Script:PRIVATE_SUBNET_ID
   CIDR: $PrivateSubnetCidr
   
 Internet Gateway:
   Name: $IG_NAME
   ID: $Script:IG_ID
   
 NAT Gateway:
   Name: $NAT_NAME
   ID: $Script:NAT_ID
   
 Public Route Table:
   Name: $PUBLIC_RT_NAME
   ID: $Script:PUBLIC_RT_ID
   
 Private Route Table:
   Name: $PRIVATE_RT_NAME
   ID: $Script:PRIVATE_RT_ID
   
 Public Security List:
   Name: $PUBLIC_SL_NAME
   ID: $Script:PUBLIC_SL_ID
   
 USAGE NOTES:
 ------------
 - Public subnet is configured for internet-facing resources
 - Private subnet is configured for backend services
 - SSH (port 22), HTTP (port 80), and HTTPS (port 443) are allowed in public subnet
 - Private subnet has outbound internet access through NAT Gateway
 
 NEXT STEPS:
 -----------
 1. Deploy VMs to appropriate subnets
 2. Configure application security groups if needed
 3. Set up monitoring and alerting
 4. Implement backup strategies
 
 CLEANUP COMMANDS (if needed):
 -----------------------------
 # Delete resources in reverse order of creation
 oci network security-list delete --security-list-id $Script:PUBLIC_SL_ID --force
 oci network route-table delete --rt-id $Script:PUBLIC_RT_ID --force
 oci network route-table delete --rt-id $Script:PRIVATE_RT_ID --force
 oci network nat-gateway delete --nat-gateway-id $Script:NAT_ID --force
 oci network internet-gateway delete --ig-id $Script:IG_ID --force
 oci network subnet delete --subnet-id $Script:PUBLIC_SUBNET_ID --force
 oci network subnet delete --subnet-id $Script:PRIVATE_SUBNET_ID --force
 oci network vcn delete --vcn-id $Script:VCN_ID --force
 ============================================================================
"@
    
    $summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Success "Infrastructure summary saved to: $summaryFile"
    
    # Display summary to console
    Write-Log "INFRASTRUCTURE SETUP COMPLETED SUCCESSFULLY!"
    Write-Host ""
    Write-Host "Key Resources Created:"
    Write-Host "  VCN ID: $Script:VCN_ID"
    Write-Host "  Public Subnet ID: $Script:PUBLIC_SUBNET_ID"
    Write-Host "  Private Subnet ID: $Script:PRIVATE_SUBNET_ID"
    Write-Host "  Internet Gateway ID: $Script:IG_ID"
    Write-Host "  NAT Gateway ID: $Script:NAT_ID"
    Write-Host ""
    Write-Host "Full summary saved to: $summaryFile"
}

# Main execution function
function Main {
    Write-Log "Starting Vauntico MVP OCI Infrastructure Setup..."
    Write-Host ""
    
    Test-Prerequisites
    Get-UserInput
    New-VCN
    New-Subnets
    New-Gateways
    New-RouteTables
    New-SecurityLists
    New-Summary
    
    Write-Success "🎉 Vauntico MVP infrastructure setup completed successfully!"
    Write-Host ""
    Write-Log "Your Oracle Cloud Infrastructure is now ready for Vauntico MVP deployment!"
}

# Script execution
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
    Main
}

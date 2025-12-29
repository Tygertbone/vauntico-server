# Vauntico MVP - OCI Infrastructure Setup Guide

This guide provides comprehensive instructions for setting up the Oracle Cloud Infrastructure (OCI) network components required for the Vauntico MVP deployment.

## Overview

The infrastructure setup scripts create the following components:
- **Virtual Cloud Network (VCN)** - The main network container
- **Public Subnet** - For internet-facing resources (web servers, load balancers)
- **Private Subnet** - For backend services (databases, application servers)
- **Internet Gateway** - Enables internet access for public subnet
- **NAT Gateway** - Enables outbound internet access for private subnet
- **Route Tables** - Directs traffic between subnets and gateways
- **Security Lists** - Firewall rules for subnet access control

## Prerequisites

### 1. OCI CLI Installation
Install the Oracle Cloud Infrastructure CLI:

**Linux/Mac:**
```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

**Windows:**
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1 -OutFile install.ps1
Set-ExecutionPolicy RemoteSigned
.\install.ps1
```

### 2. OCI CLI Configuration
Configure the CLI with your credentials:
```bash
oci setup config
```
You'll need:
- User OCID
- Tenancy OCID
- API Key (generated from OCI console)
- Region
- Fingerprint

### 3. Required Permissions
Ensure your OCI user has the following policies in your compartment:
```
Allow group <YourGroup> to manage vcns in compartment <CompartmentName>
Allow group <YourGroup> to manage subnets in compartment <CompartmentName>
Allow group <YourGroup> to manage internet-gateways in compartment <CompartmentName>
Allow group <YourGroup> to manage nat-gateways in compartment <CompartmentName>
Allow group <YourGroup> to manage route-tables in compartment <CompartmentName>
Allow group <YourGroup> to manage security-lists in compartment <CompartmentName>
```

## Quick Start

### Option 1: Bash Script (Linux/Mac/WSL)
```bash
# Navigate to the scripts directory
cd scripts

# Run the setup script
./setup-oci-infrastructure.sh
```

### Option 2: PowerShell Script (Windows)
```powershell
# Navigate to the scripts directory
cd scripts

# Run the setup script
.\setup-oci-infrastructure.ps1
```

### Option 3: With Parameters (PowerShell)
```powershell
.\setup-oci-infrastructure.ps1 -CompartmentId "ocid1.compartment.oc1..yourcompartmentid"
```

## Detailed Usage Guide

### Step-by-Step Execution

1. **Prerequisites Check**
   - Verifies OCI CLI installation
   - Validates OCI configuration
   - Checks API connectivity

2. **Compartment Selection**
   - Lists available compartments
   - Prompts for Vauntico-MVP compartment OCID
   - Validates compartment ID format

3. **Configuration Confirmation**
   - Displays network CIDR blocks
   - Shows resource naming conventions
   - Requests user confirmation

4. **Infrastructure Creation**
   - Creates VCN with specified CIDR
   - Creates public and private subnets
   - Sets up Internet and NAT gateways
   - Configures route tables
   - Applies security list rules
   - Associates all components correctly

5. **Summary Generation**
   - Creates detailed summary file
   - Displays resource IDs
   - Provides cleanup commands

### Custom Configuration

The scripts use default values that can be customized:

**Default Network Configuration:**
- VCN CIDR: `10.0.0.0/16`
- Public Subnet CIDR: `10.0.1.0/24`
- Private Subnet CIDR: `10.0.2.0/24`

**Default Resource Names:**
- VCN: `Vauntico-MVP-VCN`
- Public Subnet: `Vauntico-MVP-Public-Subnet`
- Private Subnet: `Vauntico-MVP-Private-Subnet`
- Internet Gateway: `Vauntico-MVP-IG`
- NAT Gateway: `Vauntico-MVP-NAT`
- Public Route Table: `Vauntico-MVP-Public-RT`
- Private Route Table: `Vauntico-MVP-Private-RT`
- Public Security List: `Vauntico-MVP-Public-SL`

To modify these values, edit the respective script files before execution.

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (0.0.0.0/0)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Internet Gateway (IG)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Public Route Table                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Public Subnet (10.0.1.0/24)                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          Security List (SSH/HTTP/HTTPS)             │  │
│  │  • Port 22  (SSH)                                   │  │
│  │  • Port 80  (HTTP)                                  │  │
│  │  • Port 443 (HTTPS)                                 │  │
│  │  • All outbound traffic                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Internet-Facing Resources                   │  │
│  │  • Load Balancers                                    │  │
│  │  • Web Servers                                      │  │
│  │  • Bastion Hosts                                     │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Private Route Table                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Private Subnet (10.0.2.0/24)                 │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Backend Services                           │  │
│  │  • Application Servers                              │  │
│  │  • Database Servers                                 │  │
│  │  • Cache Servers (Redis)                           │  │
│  │  • Message Queues                                   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   NAT Gateway                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Internet (0.0.0.0/0)                    │
└─────────────────────────────────────────────────────────────┘
```

## Security Configuration

### Public Subnet Security Rules
**Inbound Rules:**
- TCP 22 (SSH) from 0.0.0.0/0
- TCP 80 (HTTP) from 0.0.0.0/0
- TCP 443 (HTTPS) from 0.0.0.0/0

**Outbound Rules:**
- All traffic to 0.0.0.0/0

### Private Subnet Security
- No inbound internet access
- Outbound internet access via NAT Gateway
- Inter-subnet communication allowed through VCN routing

## Troubleshooting

### Common Issues

1. **OCI CLI Not Found**
   ```
   Error: OCI CLI is not installed
   ```
   **Solution:** Install OCI CLI following the installation guide above

2. **Authentication Failed**
   ```
   Error: OCI CLI is not configured
   ```
   **Solution:** Run `oci setup config` with proper credentials

3. **Permission Denied**
   ```
   Error: Failed to create VCN: AuthorizationFailed
   ```
   **Solution:** Ensure your user has required IAM policies

4. **Compartment Not Found**
   ```
   Error: Invalid compartment ID format
   ```
   **Solution:** Verify compartment OCID format: `ocid1.compartment.oc1...`

5. **Resource Creation Timeout**
   ```
   Error: Failed to create subnet
   ```
   **Solution:** Check compartment quotas and retry

### Manual Verification Commands

```bash
# List VCNs
oci network vcn list --compartment-id <compartment-ocid>

# List subnets
oci network subnet list --compartment-id <compartment-ocid>

# List gateways
oci network internet-gateway list --compartment-id <compartment-ocid>
oci network nat-gateway list --compartment-id <compartment-ocid>

# List route tables
oci network route-table list --compartment-id <compartment-ocid>

# List security lists
oci network security-list list --compartment-id <compartment-ocid>
```

## Cleanup

### Automated Cleanup
The generated summary file includes cleanup commands. Run them in reverse order:

```bash
# Delete resources in reverse order of creation
oci network security-list delete --security-list-id <security-list-id> --force
oci network route-table delete --rt-id <public-rt-id> --force
oci network route-table delete --rt-id <private-rt-id> --force
oci network nat-gateway delete --nat-gateway-id <nat-gateway-id> --force
oci network internet-gateway delete --ig-id <internet-gateway-id> --force
oci network subnet delete --subnet-id <public-subnet-id> --force
oci network subnet delete --subnet-id <private-subnet-id> --force
oci network vcn delete --vcn-id <vcn-id> --force
```

### PowerShell Cleanup
```powershell
# Delete resources in reverse order of creation
oci network security-list delete --security-list-id <security-list-id> --force
oci network route-table delete --rt-id <public-rt-id> --force
oci network route-table delete --rt-id <private-rt-id> --force
oci network nat-gateway delete --nat-gateway-id <nat-gateway-id> --force
oci network internet-gateway delete --ig-id <internet-gateway-id> --force
oci network subnet delete --subnet-id <public-subnet-id> --force
oci network subnet delete --subnet-id <private-subnet-id> --force
oci network vcn delete --vcn-id <vcn-id> --force
```

## Next Steps

After successful infrastructure setup:

1. **Deploy Compute Instances**
   - Create VM instances in appropriate subnets
   - Configure SSH keys and security groups
   - Set up monitoring and backup

2. **Configure Application Deployment**
   - Set up load balancers for high availability
   - Configure auto-scaling groups
   - Implement CI/CD pipelines

3. **Set Up Monitoring**
   - Configure OCI Monitoring service
   - Set up alarm notifications
   - Create custom metrics

4. **Implement Security Best Practices**
   - Use OCI WAF for web applications
   - Configure IAM policies correctly
   - Enable审计日志 (Audit Logging)

## Support

For issues related to:
- **OCI CLI**: [OCI CLI Documentation](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)
- **OCI Networking**: [VNC Documentation](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)
- **IAM Policies**: [IAM Documentation](https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/policyreference.htm)

For Vauntico-specific infrastructure questions, refer to the project documentation or create an issue in the repository.

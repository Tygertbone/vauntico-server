# OCI Infrastructure Verification Guide

## Overview

This guide explains how to use the OCI Infrastructure Verification scripts to verify that your Oracle Cloud Infrastructure is up and running properly.

## Prerequisites

1. **OCI CLI Installed**: Install and configure the OCI CLI
   - Installation guide: https://docs.oracle.com/en/learn/getting-started-cli/
   - Configuration: `oci setup config`

2. **Valid OCI Credentials**: Ensure you have appropriate permissions for:
   - Compute instances
   - Autonomous databases
   - Network components (VCNs, subnets)
   - Vault and secrets
   - Monitoring and alarms
   - Load balancers
   - Block storage
   - Object storage

3. **Compartment OCID**: Have your Vauntico-MVP compartment OCID ready

## Available Scripts

### Bash Script
- **File**: `scripts/verify-oci-infrastructure.sh`
- **Platform**: Linux/macOS/WSL

### PowerShell Script  
- **File**: `scripts/verify-oci-infrastructure.ps1`
- **Platform**: Windows

## Usage

### Bash Script

```bash
# Basic usage with interactive compartment selection
./scripts/verify-oci-infrastructure.sh

# Specify compartment ID
./scripts/verify-oci-infrastructure.sh --compartment-id ocid1.compartment.oc1..example

# Enable verbose output
./scripts/verify-oci-infrastructure.sh -c ocid1.compartment.oc1..example -v

# Specify custom output file
./scripts/verify-oci-infrastructure.sh -c ocid1.compartment.oc1..example -o my-report.txt

# Treat warnings as failures (exit code 1 for any warning)
./scripts/verify-oci-infrastructure.sh -c ocid1.compartment.oc1..example --fail-on-warning

# Show help
./scripts/verify-oci-infrastructure.sh --help
```

### PowerShell Script

```powershell
# Basic usage with interactive compartment selection
.\scripts\verify-oci-infrastructure.ps1

# Specify compartment ID
.\scripts\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example

# Enable verbose output
.\scripts\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example -Verbose

# Specify custom output file
.\scripts\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example -OutputFile my-report.txt

# Treat warnings as failures (exit code 1 for any warning)
.\scripts\verify-oci-infrastructure.ps1 -CompartmentId ocid1.compartment.oc1..example -FailOnWarning

# Show help
.\scripts\verify-oci-infrastructure.ps1 -Help
```

## Command Line Options

| Option | Bash | PowerShell | Description |
|--------|------|-------------|-------------|
| Compartment ID | `-c, --compartment-id` | `-CompartmentId` | Compartment OCID (required) |
| Output File | `-o, --output-file` | `-OutputFile` | Custom report file name |
| Verbose | `-v, --verbose` | `-Verbose` | Show detailed command output |
| Fail on Warning | `-w, --fail-on-warning` | `-FailOnWarning` | Treat warnings as failures |
| Help | `-h, --help` | `-Help` | Show usage information |

## Verification Checks

The scripts perform the following comprehensive checks:

### 1. Compute Instances Status
- Lists all compute instances in the compartment
- Checks lifecycle state:
  - ✅ **RUNNING**: Instance is operational
  - ⚠️ **STARTING/STOPPING/PROVISIONING**: Instance is transitioning
  - ❌ **STOPPED/TERMINATED/FAILED**: Instance is not operational

### 2. Autonomous Database Status
- Lists all autonomous databases in the compartment
- Checks lifecycle state:
  - ✅ **AVAILABLE**: Database is operational
  - ⚠️ **UPDATING/PROVISIONING/STARTING/STOPPING**: Database is transitioning
  - ❌ **STOPPED/TERMINATED/FAILED**: Database is not operational

### 3. Network Components
- **VCNs**: Lists all Virtual Cloud Networks with CIDR blocks and states
- **Subnets**: Lists all subnets with CIDR blocks and states
- Checks for proper network infrastructure existence

### 4. Vault and Secrets
- **Vaults**: Lists all KMS vaults and their states
- **Secrets**: Lists all secrets and their states
- Verifies security infrastructure is in place

### 5. Monitoring and Alerts
- Lists all monitoring alarms
- Checks alerting configuration
- Verifies monitoring is properly set up

### 6. Load Balancers
- Lists all load balancers
- Checks operational status
- Verifies traffic distribution components

### 7. Block Storage
- Lists all block volumes
- Checks size and state
- Verifies storage components are available

### 8. Object Storage
- Lists all object storage buckets
- Checks creation dates
- Verifies storage buckets are accessible

## Exit Codes

- **0**: All checks passed (or only warnings, if not using `--fail-on-warning`)
- **1**: One or more checks failed, or warnings treated as failures

## Output Format

### Console Output
The scripts provide real-time status updates with color-coded output:
- 🔵 **[INFO]**: Informational messages
- 🟢 **[SUCCESS]**: Healthy components
- 🟡 **[WARNING]**: Transitional states or missing optional components
- 🔴 **[ERROR]**: Failed components or errors

### Report File
A comprehensive report is generated with:
- Verification summary with counts
- Component status overview
- Detailed recommendations
- Next steps for remediation
- Reference commands for manual verification

## Sample Report

```
 ============================================================================
 Vauntico MVP - OCI Infrastructure Verification Report
 ============================================================================
 Verification Date: 2025-12-21 22:28:00
 Compartment ID: ocid1.compartment.oc1..example
 
 VERIFICATION SUMMARY:
 --------------------
 Total Checks: 15
 Passed: 12
 Failed: 2
 Warnings: 1
 
 Overall Status: ❌ ISSUES FOUND
 
 COMPONENT STATUS:
 ---------------
❌ Some components have issues that need attention
 
 RECOMMENDATIONS:
 ---------------
1. Investigate failed components immediately
3. Set up automated monitoring and alerting
4. Regularly verify infrastructure health
5. Implement backup and disaster recovery procedures
 
 NEXT STEPS:
 -----------
1. Address failed components immediately
2. Re-run verification after fixes
3. Monitor system performance
4. Update documentation as needed
 ============================================================================
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: OCI Infrastructure Verification

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  verify-infrastructure:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup OCI CLI
      run: |
        curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash
        echo "$OCI_CONFIG" | base64 -d > ~/.oci/config
        
    - name: Verify Infrastructure
      run: |
        ./scripts/verify-oci-infrastructure.sh \
          --compartment-id ${{ secrets.OCI_COMPARTMENT_ID }} \
          --fail-on-warning
      env:
        OCI_CONFIG: ${{ secrets.OCI_CONFIG_BASE64 }}
```

## Troubleshooting

### Common Issues

1. **OCI CLI Not Found**
   ```
   [ERROR] OCI CLI is not installed. Please install it first
   ```
   **Solution**: Install OCI CLI from https://docs.oracle.com/en/learn/getting-started-cli/

2. **OCI Not Configured**
   ```
   [ERROR] OCI CLI is not configured. Please run 'oci setup config' first.
   ```
   **Solution**: Configure OCI CLI with `oci setup config`

3. **Invalid Compartment ID**
   ```
   [ERROR] Invalid compartment ID format. Expected format: ocid1.compartment.oc1...
   ```
   **Solution**: Verify your compartment OCID format starts with `ocid1.compartment.`

4. **Permission Denied**
   ```
   [ERROR] Failed to list compute instances: Service error:NotAuthorized
   ```
   **Solution**: Ensure your OCI user has required permissions in the compartment

### Debug Mode

Enable verbose output to see the exact OCI CLI commands being executed:

```bash
./scripts/verify-oci-infrastructure.sh -v -c your-compartment-id
```

### Manual Verification

You can manually run individual checks using the OCI CLI commands provided in the report:

```bash
oci compute instance list --compartment-id your-compartment-id
oci db autonomous-database list --compartment-id your-compartment-id
oci network vcn list --compartment-id your-compartment-id
```

## Best Practices

1. **Regular Monitoring**: Schedule automated verification runs (every 6-12 hours)
2. **Alert Integration**: Set up notifications for failed verifications
3. **Documentation**: Keep verification reports for audit purposes
4. **Proactive Monitoring**: Use `--fail-on-warning` in critical environments
5. **Version Control**: Track verification scripts in your repository

## Integration with Existing Setup

These verification scripts complement the existing OCI infrastructure setup scripts:

- **Setup**: `scripts/setup-oci-infrastructure.sh` / `scripts/setup-oci-infrastructure.ps1`
- **Verification**: `scripts/verify-oci-infrastructure.sh` / `scripts/verify-oci-infrastructure.ps1`

Use the setup scripts to create infrastructure, then use verification scripts to ensure everything is running properly.

## Support

For issues with:
- **OCI CLI**: Oracle Cloud Infrastructure documentation
- **Script Execution**: Check troubleshooting section above
- **Permissions**: Verify IAM policies in OCI console
- **Infrastructure Issues**: Use manual verification commands

## Related Documentation

- [OCI Infrastructure Setup Guide](./OCI_INFRASTRUCTURE_SETUP_GUIDE.md)
- [OCI Quick Reference](./OCI_QUICK_REFERENCE.md)
- [Vauntico MVP Deployment Guide](../DEPLOYMENT_GUIDE_COMPLETE.md)

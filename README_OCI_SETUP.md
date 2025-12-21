# Vauntico MVP - OCI Infrastructure Setup

🛠️ **Complete Oracle Cloud Infrastructure setup scripts for Vauntico MVP deployment**

This repository contains automated scripts to set up the complete network infrastructure required for deploying Vauntico MVP on Oracle Cloud Infrastructure (OCI).

## 🎯 What These Scripts Do

The scripts automatically create a production-ready network infrastructure including:

- ✅ **Virtual Cloud Network (VCN)** with secure IP space
- ✅ **Public Subnet** for internet-facing resources
- ✅ **Private Subnet** for backend services  
- ✅ **Internet Gateway** for public subnet internet access
- ✅ **NAT Gateway** for private subnet outbound access
- ✅ **Route Tables** for proper traffic routing
- ✅ **Security Lists** with firewall rules (SSH/HTTP/HTTPS)

## 🚀 Quick Start

### Prerequisites
1. **OCI CLI installed** - [Installation Guide](docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md#1-oci-cli-installation)
2. **OCI CLI configured** - Run `oci setup config`
3. **Compartment OCID** - Your Vauntico-MVP compartment ID
4. **Proper IAM permissions** - See [IAM Requirements](docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md#3-required-permissions)

### Run the Setup

#### Option 1: Bash (Linux/Mac/WSL)
```bash
cd scripts
./setup-oci-infrastructure.sh
```

#### Option 2: PowerShell (Windows)
```powershell
cd scripts
.\setup-oci-infrastructure.ps1
```

#### Option 3: With Parameters (PowerShell)
```powershell
.\setup-oci-infrastructure.ps1 -CompartmentId "ocid1.compartment.oc1..yourcompartmentid"
```

## 📁 Files Created

| File | Purpose |
|------|---------|
| `scripts/setup-oci-infrastructure.sh` | Bash script for Linux/Mac/WSL |
| `scripts/setup-oci-infrastructure.ps1` | PowerShell script for Windows |
| `scripts/verify-oci-infrastructure.sh` | Bash script for infrastructure verification |
| `scripts/verify-oci-infrastructure.ps1` | PowerShell script for infrastructure verification |
| `scripts/setup-oci-compute.sh` | Compute instance provisioning with cloud-init |
| `scripts/setup-oci-database.sh` | Autonomous Database provisioning and setup |
| `scripts/setup-oci-monitoring.sh` | Monitoring, alerting, and Cloud Guard setup |
| `scripts/setup-oci-secrets.sh` | OCI Vault and secrets management |
| `.github/workflows/oci-infrastructure.yml` | GitHub Actions CI/CD workflow |
| `.github/workloads/cloud-init.yaml` | Cloud-init configuration for instances |
| `docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md` | Comprehensive setup guide |
| `docs/OCI_QUICK_REFERENCE.md` | Quick reference card |
| `docs/OCI_VERIFICATION_GUIDE.md` | Infrastructure verification guide |
| `oci-*-summary-*.txt` | Generated summary files with resource IDs |

## 🏗️ Network Architecture

```
Internet
    ↓
Internet Gateway
    ↓
Public Subnet (10.0.1.0/24)
├─ Web Servers
├─ Load Balancers  
└─ Bastion Hosts
    ↓
Private Subnet (10.0.2.0/24)
├─ Application Servers
├─ Database Servers
└─ Cache Servers
    ↓
NAT Gateway
    ↓
Internet (outbound only)
```

## 🔒 Security Configuration

### Public Subnet Rules
- **Inbound**: SSH (22), HTTP (80), HTTPS (443) from 0.0.0.0/0
- **Outbound**: All traffic to 0.0.0.0/0

### Private Subnet Rules  
- **Inbound**: No direct internet access
- **Outbound**: Internet access via NAT Gateway
- **Internal**: Full communication with public subnet

## 📋 Default Configuration

| Resource | Name | CIDR/Configuration |
|----------|------|-------------------|
| VCN | `Vauntico-MVP-VCN` | `10.0.0.0/16` |
| Public Subnet | `Vauntico-MVP-Public-Subnet` | `10.0.1.0/24` |
| Private Subnet | `Vauntico-MVP-Private-Subnet` | `10.0.2.0/24` |
| Internet Gateway | `Vauntico-MVP-IG` | Enabled |
| NAT Gateway | `Vauntico-MVP-NAT` | Enabled |

## 🛠️ Customization

Need different CIDR blocks or naming? Edit the variables in the scripts before running:

```bash
# In setup-oci-infrastructure.sh
VCN_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_CIDR="10.0.1.0/24"
PRIVATE_SUBNET_CIDR="10.0.2.0/24"
```

```powershell
# In setup-oci-infrastructure.ps1
$VcnCidr = "10.0.0.0/16"
$PublicSubnetCidr = "10.0.1.0/24"
$PrivateSubnetCidr = "10.0.2.0/24"
```

## 🧹 Cleanup

The generated summary file includes cleanup commands. To remove all infrastructure:

```bash
# Run commands in reverse order of creation
oci network security-list delete --security-list-id <id> --force
oci network route-table delete --rt-id <id> --force
oci network nat-gateway delete --nat-gateway-id <id> --force
oci network internet-gateway delete --ig-id <id> --force
oci network subnet delete --subnet-id <id> --force
oci network vcn delete --vcn-id <id> --force
```

## 🔍 Infrastructure Verification

After setting up your infrastructure, verify everything is running properly:

### Quick Verification
```bash
# Bash/Linux/WSL
./scripts/verify-oci-infrastructure.sh

# PowerShell (Windows)
.\scripts\verify-oci-infrastructure.ps1
```

### Comprehensive Health Check
The verification scripts check:
- ✅ **Compute Instances**: Running state and availability
- ✅ **Autonomous Databases**: Available state and connectivity
- ✅ **Network Components**: VCNs, subnets, gateways status
- ✅ **Vault & Secrets**: Access and lifecycle state
- ✅ **Monitoring & Alerts**: Alarm configuration and status
- ✅ **Load Balancers**: Operational status and health
- ✅ **Block Storage**: Volume availability and state
- ✅ **Object Storage**: Bucket accessibility and configuration

### Verification Options
```bash
# With compartment ID
./verify-oci-infrastructure.sh -c ocid1.compartment.oc1..example

# Verbose output
./verify-oci-infrastructure.sh -v

# Custom report file
./verify-oci-infrastructure.sh -o my-infrastructure-report.txt

# Treat warnings as failures (critical environments)
./verify-oci-infrastructure.sh --fail-on-warning
```

📖 **[Complete Verification Guide](docs/OCI_VERIFICATION_GUIDE.md)** - Detailed usage instructions

## 🔧 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| `OCI CLI not found` | [Install OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) |
| `AuthorizationFailed` | Check IAM policies and permissions |
| `Invalid compartment ID` | Verify format: `ocid1.compartment.oc1...` |
| `Resource creation timeout` | Check compartment quotas and retry |
| `Instance not running` | Use verification script to check all components |

### Manual Verification Commands

```bash
# List all created resources
oci network vcn list --compartment-id <compartment-ocid>
oci network subnet list --compartment-id <compartment-ocid>
oci network internet-gateway list --compartment-id <compartment-ocid>
oci network nat-gateway list --compartment-id <compartment-ocid>

# Check compute instances
oci compute instance list --compartment-id <compartment-ocid>

# Check databases
oci db autonomous-database list --compartment-id <compartment-ocid>
```

## 📚 Documentation

- 📖 **[Complete Setup Guide](docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md)** - Detailed instructions
- ⚡ **[Quick Reference](docs/OCI_QUICK_REFERENCE.md)** - Commands and cheat sheet
- 🔧 **[OCI CLI Docs](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)** - Official documentation
- 🌐 **[OCI Networking Guide](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)** - Networking concepts

## 🚀 Extended Capabilities

The Vauntico MVP OCI setup has been extended with powerful automation capabilities:

### 🖥️ Compute Provisioning
- **Always Free VM Deployment**: Automated VM provisioning with cloud-init
- **SSH Key Management**: Automatic key generation and distribution
- **Application Setup**: Pre-configured with Docker, Node.js, and Git
- **Multi-environment Support**: Dev, staging, and production ready

### 🗄️ Database Services
- **Autonomous Database**: Automated provisioning with secure wallet management
- **Connection Management**: Automated connection string generation
- **Schema Setup**: Sample Vauntico database schema included
- **Backup Integration**: Automated backup configuration

### 📊 Monitoring & Alerting
- **Cloud Guard**: Automated threat detection and compliance monitoring
- **Custom Alarms**: CPU, memory, database, and network monitoring
- **Slack Integration**: Real-time notifications to your team channels
- **Dashboard Creation**: Pre-built monitoring dashboards

### 🔐 Secrets Management
- **OCI Vault Integration**: Secure storage for API keys and secrets
- **Automatic Injection**: Runtime secret injection into applications
- **Key Rotation**: Automated key lifecycle management
- **Audit Logging**: Complete access audit trail

### 🔄 CI/CD Automation
- **GitHub Actions**: Complete infrastructure-as-code workflows
- **Multi-environment**: Separate dev/staging/prod deployments
- **Pull Requests**: Automatic PR creation for infrastructure changes
- **Artifact Management**: Automated credential and configuration distribution

## 🎯 Next Steps

After successful infrastructure setup:

1. **🖥️ Deploy Compute Instances** with `./setup-oci-compute.sh`
2. **🗄️ Set Up Database** with `./setup-oci-database.sh`
3. **📊 Configure Monitoring** with `./setup-oci-monitoring.sh`
4. **🔐 Manage Secrets** with `./setup-oci-secrets.sh`
5. **🔄 Set Up CI/CD** using GitHub Actions workflow
6. **⚖️ Configure Load Balancers** for high availability  
7. **💾 Implement Backup strategies**

## 🤝 Support

- 🐛 **Issues**: Create an issue in the repository
- 📧 **Questions**: Refer to [OCI Documentation](https://docs.oracle.com/en-us/iaas/Content/Home.htm)
- 💬 **Community**: Oracle Cloud Infrastructure forums

---

## 🎉 Ready to Deploy Your Vauntico MVP!

Once you've run the setup script, your Oracle Cloud Infrastructure will be ready for deploying Vauntico MVP components. The generated summary file contains all resource IDs you'll need for deployment.

**💡 Pro Tip**: Save the summary file - it contains all resource IDs and cleanup commands!**

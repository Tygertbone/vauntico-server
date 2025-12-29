# OCI Infrastructure Setup - Quick Reference

## 🚀 Quick Start Commands

### Bash/Linux/Mac/WSL
```bash
cd scripts
./setup-oci-infrastructure.sh
```

### Windows PowerShell
```powershell
cd scripts
.\setup-oci-infrastructure.ps1

# With compartment ID parameter
.\setup-oci-infrastructure.ps1 -CompartmentId "ocid1.compartment.oc1..yourcompartmentid"

# With custom CIDR blocks
.\setup-oci-infrastructure.ps1 -CompartmentId "ocid1.compartment.oc1.." -VcnCidr "10.0.0.0/16" -PublicSubnetCidr "10.0.1.0/24" -PrivateSubnetCidr "10.0.2.0/24"
```

## 📋 Prerequisites Checklist

- [ ] OCI CLI installed
- [ ] OCI CLI configured (`oci setup config`)
- [ ] Compartment OCID ready
- [ ] Proper IAM permissions set
- [ ] API keys generated

## 🏗️ Infrastructure Components Created

| Component | Name | CIDR/ID | Purpose |
|-----------|------|---------|---------|
| **VCN** | `Vauntico-MVP-VCN` | `10.0.0.0/16` | Main network container |
| **Public Subnet** | `Vauntico-MVP-Public-Subnet` | `10.0.1.0/24` | Internet-facing resources |
| **Private Subnet** | `Vauntico-MVP-Private-Subnet` | `10.0.2.0/24` | Backend services |
| **Internet Gateway** | `Vauntico-MVP-IG` | - | Public subnet internet access |
| **NAT Gateway** | `Vauntico-MVP-NAT` | - | Private subnet outbound access |
| **Public RT** | `Vauntico-MVP-Public-RT` | - | Routes for public subnet |
| **Private RT** | `Vauntico-MVP-Private-RT` | - | Routes for private subnet |
| **Public SL** | `Vauntico-MVP-Public-SL` | - | Firewall rules for public subnet |

## 🔒 Security Rules Summary

### Public Subnet (Inbound)
- **Port 22** (SSH) - 0.0.0.0/0
- **Port 80** (HTTP) - 0.0.0.0/0  
- **Port 443** (HTTPS) - 0.0.0.0/0

### Public Subnet (Outbound)
- **All traffic** - 0.0.0.0/0

### Private Subnet
- **No inbound internet access**
- **Outbound via NAT Gateway**
- **Inter-subnet communication allowed**

## 🛠️ Useful OCI Commands

### List Resources
```bash
# List all VCNs
oci network vcn list --compartment-id <compartment-ocid>

# List subnets
oci network subnet list --compartment-id <compartment-ocid>

# List internet gateways
oci network internet-gateway list --compartment-id <compartment-ocid>

# List NAT gateways
oci network nat-gateway list --compartment-id <compartment-ocid>

# List route tables
oci network route-table list --compartment-id <compartment-ocid>

# List security lists
oci network security-list list --compartment-id <compartment-ocid>
```

### Get Resource Details
```bash
# Get VCN details
oci network vcn get --vcn-id <vcn-id>

# Get subnet details
oci network subnet get --subnet-id <subnet-id>

# Get gateway details
oci network internet-gateway get --ig-id <ig-id>
oci network nat-gateway get --nat-gateway-id <nat-id>
```

## 🧹 Cleanup Commands

⚠️ **Run in reverse order of creation**

```bash
# 1. Delete Security List
oci network security-list delete --security-list-id <security-list-id> --force

# 2. Delete Route Tables
oci network route-table delete --rt-id <public-rt-id> --force
oci network route-table delete --rt-id <private-rt-id> --force

# 3. Delete Gateways
oci network nat-gateway delete --nat-gateway-id <nat-gateway-id> --force
oci network internet-gateway delete --ig-id <internet-gateway-id> --force

# 4. Delete Subnets
oci network subnet delete --subnet-id <public-subnet-id> --force
oci network subnet delete --subnet-id <private-subnet-id> --force

# 5. Delete VCN
oci network vcn delete --vcn-id <vcn-id> --force
```

## 📁 File Locations

- **Scripts**: `scripts/setup-oci-infrastructure.sh` (Bash) / `scripts/setup-oci-infrastructure.ps1` (PowerShell)
- **Documentation**: `docs/OCI_INFRASTRUCTURE_SETUP_GUIDE.md`
- **Generated Summary**: `oci-infrastructure-summary-YYYYMMDD-HHMMSS.txt`

## 🎯 Next Steps After Setup

1. **Deploy Compute Instances** to appropriate subnets
2. **Configure Load Balancers** for high availability
3. **Set up Monitoring** and alerting
4. **Implement Backup strategies**
5. **Configure CI/CD pipelines**

## 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `OCI CLI not found` | Install OCI CLI: `bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"` |
| `AuthorizationFailed` | Check IAM policies and permissions |
| `Invalid compartment ID` | Verify OCID format: `ocid1.compartment.oc1...` |
| `Resource creation timeout` | Check compartment quotas and retry |

## 📞 Support Links

- [OCI CLI Documentation](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)
- [OCI Networking Guide](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)
- [IAM Policy Reference](https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/policyreference.htm)

---

💡 **Tip**: After running the setup script, save the generated summary file - it contains all resource IDs and cleanup commands!

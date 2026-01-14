# Vauntico Backend Deployment via OCI Bastion

This guide explains how to deploy the Vauntico backend service using Oracle Cloud Infrastructure (OCI) Bastion for secure access without opening SSH ports to the internet.

## Overview

The deployment workflow (`deploy.yml`) automates the following process:

1. **Triggers**: Runs on pushes to `main` branch or manual workflow dispatch
2. **OCI Setup**: Configures OCI CLI dynamically from GitHub Actions secrets
3. **Bastion Session**: Creates a temporary bastion session for secure SSH access
4. **Deployment**: Executes the backend deployment script via the bastion
5. **Validation**: Performs health checks and validates the deployment
6. **Cleanup**: Terminates bastion sessions and cleans up temporary files

## Required GitHub Actions Secrets

### OCI Configuration

- `OCI_TENANCY_OCID` - Your OCI tenancy OCID
- `OCI_USER_OCID` - Your OCI user OCID
- `OCI_REGION` - OCI region (e.g., `us-ashburn-1`)
- `OCI_KEY_FINGERPRINT` - Fingerprint of your OCI API key
- `OCI_KEY_FILE` - Base64-encoded private key file content

### Infrastructure Configuration

- `OCI_TARGET_PRIVATE_IP` - Private IP of the target backend VM
- `OCI_BASTION_CONFIG` - JSON string with bastion configuration
- `OCI_BASTION_CIDR` - JSON string with CIDR block configuration

### Application Secrets

- `DB_PASSWORD` - Database password
- `PAYSTACK_PUBLIC_KEY` - PayStack public key
- `PAYSTACK_SECRET_KEY` - PayStack secret key
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `ANTHROPIC_API_KEY` - Anthropic API key

## Bastion Configuration Format

### OCI_BASTION_CONFIG

```json
{
  "compartment_id": "ocid1.compartment.oc1..aaaaaaa...",
  "subnet_id": "ocid1.subnet.oc1..aaaaaaa...",
  "bastion_id": "ocid1.bastion.oc1..aaaaaaa..."
}
```

### OCI_BASTION_CIDR

```json
{
  "cidr_block": "10.0.0.0/16",
  "allowed_ports": [22, 80, 443, 3000]
}
```

## Deployment Process

### 1. Automatic Trigger

The workflow automatically runs when code is pushed to the `main` branch.

### 2. Manual Trigger

You can also trigger the deployment manually:

1. Go to the Actions tab in your GitHub repository
2. Select "Deploy Vauntico Backend via OCI Bastion"
3. Click "Run workflow"

### 3. Workflow Steps

#### Setup Phase

- Checks out the repository
- Sets up Node.js 18.x environment
- Installs OCI CLI and required dependencies
- Configures OCI CLI using provided secrets

#### Security Configuration

- Generates SSH key pair for bastion connection
- Creates bastion configuration files from secrets
- Sets up proper file permissions

#### Deployment Phase

- Makes all deployment scripts executable
- Executes deployment via bastion using `scripts/deploy-via-bastion.sh`
- Passes all required secrets as environment variables

#### Validation Phase

- Waits for application to start (30 seconds)
- Runs deployment validation through bastion
- Performs health checks on the deployed service

#### Notification Phase

- Sends success/failure notification to Slack
- Cleans up bastion sessions and temporary files

## Security Features

### Network Security

- No open SSH ports required on target VM
- Temporary bastion sessions with limited lifetime
- Encrypted SSH tunneling through OCI Bastion
- Session-based access control

### Credential Security

- All secrets stored in GitHub Actions encrypted storage
- OCI API key decoded only in workflow runtime
- Automatic cleanup of sensitive files after deployment
- Environment-based secret injection

### Access Control

- Requires production environment protection rules
- IAM permissions controlled through OCI policies
- Bastion sessions terminated automatically after deployment

## Deployment Scripts

### scripts/deploy-via-bastion.sh

Main orchestration script that:

- Creates and manages bastion sessions
- Uploads deployment scripts to target VM
- Executes deployment and validation
- Provides connection information and cleanup

### scripts/backend-deploy.sh

Backend deployment script that:

- Updates system packages
- Installs Node.js and dependencies
- Creates and configures the Express.js application
- Sets up PM2 process management
- Configures security hardening and monitoring
- Performs health checks and validation

### scripts/validate-deployment.sh

Validation script that:

- Checks application health endpoints
- Validates API functionality
- Verifies service status and logs

## Monitoring and Logging

### Application Logs

- Location: `/var/log/vauntico/` on target VM
- Log rotation configured for 30 days
- PM2 monitoring available via `pm2 monit`
- Systemd service logs via `journalctl`

### Health Endpoints

- Health Check: `http://localhost:3000/health`
- API Status: `http://localhost:3000/api/v1/status`
- API Documentation: `http://localhost:3000/api/docs`

### Service Management

```bash
# Start service
sudo systemctl start trust-score

# Stop service
sudo systemctl stop trust-score

# Restart service
sudo systemctl restart trust-score

# Check status
sudo systemctl status trust-score

# View logs
sudo journalctl -u trust-score -f
```

## Troubleshooting

### Common Issues

#### 1. OCI CLI Authentication

- Verify all OCI secrets are correctly configured
- Check that the API key fingerprint matches the uploaded key
- Ensure the user has necessary IAM permissions

#### 2. Bastion Session Creation

- Verify bastion configuration JSON is valid
- Check that the target VM is accessible from the bastion subnet
- Ensure proper IAM permissions for bastion operations

#### 3. SSH Connection Issues

- Verify SSH key generation and permissions
- Check that the target VM SSH service is running
- Ensure the bastion session is properly established

#### 4. Deployment Failures

- Check deployment logs for specific error messages
- Verify all required secrets are available
- Ensure target VM has sufficient resources

### Debugging Steps

1. **Check Workflow Logs**
   - Review each step's output in GitHub Actions
   - Look for specific error messages and warnings

2. **Verify OCI Configuration**

   ```bash
   # Test OCI CLI locally
   oci setup validate
   oci iam user get --user-id <user-ocid>
   ```

3. **Manual Bastion Test**

   ```bash
   # Test bastion session creation
   oci bastion session create --compartment-id <compartment-id> ...
   ```

4. **Target VM Status**
   ```bash
   # Check VM status
   ssh ubuntu@<target-ip> "systemctl status trust-score"
   ```

## Rolling Back

### Automatic Rollback

The deployment script includes automatic rollback functionality that:

- Restores previous application version if deployment fails
- Removes broken services and configurations
- Reverts file system changes

### Manual Rollback

```bash
# Restore from backup
sudo mv /home/ubuntu/trust-score-backend.backup /home/ubuntu/trust-score-backend

# Restart service
sudo systemctl restart trust-score

# Validate rollback
curl -f http://localhost:3000/health
```

## Performance Considerations

### Deployment Time

- OCI CLI installation: ~2-3 minutes
- Bastion session creation: ~1-2 minutes
- Application deployment: ~5-10 minutes
- Validation and cleanup: ~2-3 minutes
- **Total**: ~10-18 minutes

### Resource Usage

- GitHub Actions runner: Standard (2 cores, 7GB RAM)
- Target VM: Minimum requirements for Node.js application
- Network: Temporary bandwidth for file transfer

## Maintenance

### Regular Tasks

- Rotate OCI API keys periodically
- Update bastion configuration as needed
- Monitor deployment logs for issues
- Keep deployment scripts updated

### Security Updates

- Regularly update OCI CLI version
- Review IAM permissions quarterly
- Update bastion security rules as needed
- Monitor for security advisories

## Support

For issues with:

- **OCI Bastion**: Contact Oracle Cloud Support
- **GitHub Actions**: Check GitHub documentation
- **Deployment Scripts**: Review script logs and error messages
- **Application Issues**: Check application logs and health endpoints

---

**Note**: This deployment method requires proper OCI IAM configuration and sufficient permissions for bastion operations. Ensure your OCI policies allow the required actions before deploying.

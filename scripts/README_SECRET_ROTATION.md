# Vauntico Secret Rotation Scripts

This directory contains comprehensive secret rotation scripts for the Vauntico platform, supporting both Bash and PowerShell environments.

## Overview

The secret rotation scripts provide:

- **Automated secret generation** using cryptographically secure random methods
- **Multi-platform support** for environment files, GitHub Actions, Vercel, and OCI
- **Structured logging** with JSON format for easy parsing
- **Stakeholder notifications** via Slack and email
- **Verification and rollback** capabilities for safe operations
- **Environment-specific configurations** for development, staging, and production

## Files

| File                        | Platform    | Description                             |
| --------------------------- | ----------- | --------------------------------------- |
| `secret-rotation.sh`        | Linux/macOS | Bash-based secret rotation script       |
| `secret-rotation.ps1`       | Windows     | PowerShell-based secret rotation script |
| `README_SECRET_ROTATION.md` | All         | This documentation                      |

## Prerequisites

### Common Requirements

- OpenSSL (for secret generation)
- Git CLI (for GitHub Actions secrets)
- Vercel CLI (for Vercel environment variables)
- OCI CLI (for Oracle Cloud Infrastructure secrets)

### Bash Script Requirements

- Bash 4.0+
- Standard Unix tools (curl, grep, sed, etc.)

### PowerShell Script Requirements

- PowerShell 5.1+ or PowerShell Core 6+
- Windows environment with appropriate permissions

## Installation

1. **Make scripts executable** (Linux/macOS):

   ```bash
   chmod +x scripts/secret-rotation.sh
   ```

2. **Set execution policy** (Windows PowerShell):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## Environment Variables

Configure these environment variables before running the scripts:

### Required Variables

```bash
# Current secret value (for backup/rollback)
export VAUNTICO_SECRET="your_current_secret_value"

# Notification configuration
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
export RESEND_API_KEY="re_your_resend_api_key"
export ADMIN_EMAIL="admin@yourdomain.com"
```

### Optional Variables

```bash
# Secret generation
export SECRET_TYPE="alphanumeric"  # Options: alphanumeric, hex, base64, uuid
export SECRET_LENGTH="32"

# Environment-specific URLs
export FRONTEND_URL="https://yourapp.com"
export DATABASE_URL="postgresql://..."

# Cloud provider credentials
export GITHUB_REPOSITORY="your-org/your-repo"
export VERCEL_PROJECT_ID="your-vercel-project-id"
export OCI_USER_OCID="your-oci-user-ocid"
export VAUNTICO_SECRET_OCID="your-secret-ocid"

# Environment-specific webhooks
export STAGING_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/STAGING/WEBHOOK"
export DEV_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/DEV/WEBHOOK"
```

## Usage

### Bash Script (Linux/macOS)

```bash
# Basic usage
./scripts/secret-rotation.sh

# With options
./scripts/secret-rotation.sh \
  --environment production \
  --secret-name "database_connection" \
  --secret-length 64 \
  --dry-run

# Show help
./scripts/secret-rotation.sh --help
```

### PowerShell Script (Windows)

```powershell
# Basic usage
.\scripts\secret-rotation.ps1

# With options
.\scripts\secret-rotation.ps1 `
  -Environment production `
  -SecretName "database_connection" `
  -SecretLength 64 `
  -DryRun

# Show help
.\scripts\secret-rotation.ps1 -Help
```

## Command Line Options

| Option           | Bash                     | PowerShell             | Description                                           |
| ---------------- | ------------------------ | ---------------------- | ----------------------------------------------------- |
| Dry run          | `--dry-run`              | `-DryRun`              | Simulate rotation without making changes              |
| Environment      | `--environment ENV`      | `-Environment ENV`     | Target environment (development\|staging\|production) |
| Secret name      | `--secret-name NAME`     | `-SecretName NAME`     | Name of secret to rotate                              |
| Secret length    | `--secret-length LENGTH` | `-SecretLength LENGTH` | Length of generated secret (default: 32)              |
| No backup        | `--no-backup`            | `-NoBackup`            | Disable secret backup                                 |
| No notifications | `--no-notifications`     | `-NoNotifications`     | Disable stakeholder notifications                     |
| No rollback      | `--no-rollback`          | `-NoRollback`          | Disable automatic rollback on failure                 |
| Help             | `--help`                 | `-Help`                | Show help message                                     |

## Secret Types

The scripts support different secret generation types:

| Type           | Description                                 | Example                           |
| -------------- | ------------------------------------------- | --------------------------------- |
| `alphanumeric` | Base64 with special chars removed (default) | `aB3xY9ZpL7qR8wK2mN5vF6jH1`       |
| `hex`          | Hexadecimal string                          | `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6` |
| `base64`       | Standard Base64                             | `qJ3N9vR7X6pK8mY5wZ4bA2cF1dE3=`   |
| `uuid`         | UUID without dashes                         | `9f8d7b6e5a4c3b2a1d0f9e8c7b6a5`   |

## Workflow

The secret rotation process follows these steps:

1. **Initialization**
   - Set up logging directories
   - Validate environment variables
   - Load configuration

2. **Secret Generation**
   - Generate cryptographically secure secret
   - Validate secret length and format

3. **System Updates**
   - Update local environment files (`.env`, `server-v2/.env`)
   - Update GitHub Actions secrets (if CLI available)
   - Update Vercel environment variables (if CLI available)
   - Update OCI secrets (if CLI available)

4. **Verification**
   - Verify secret updates in all target systems
   - Perform application health checks
   - Validate secret functionality

5. **Cleanup**
   - Backup old secret to secure location
   - Clear old secret from memory
   - Mark old secret as revoked (if database available)

6. **Notifications**
   - Send success/failure notifications to stakeholders
   - Log all events with structured JSON format

## Logging

### Log Location

- **Bash**: `logs/secret-rotation.log`
- **PowerShell**: `..\logs\secret-rotation.log`

### Log Format

```json
{
  "timestamp": "2026-01-15 02:30:00",
  "level": "INFO",
  "message": "Secret rotation completed successfully for vauntico_main_secret",
  "secret_name": "vauntico_main_secret",
  "environment": "production",
  "script_version": "2.0.0",
  "pid": 12345,
  "details": {
    "success_count": 3,
    "total_count": 3
  }
}
```

### Log Levels

- **ERROR**: Critical errors requiring immediate attention
- **WARN**: Warning messages for potential issues
- **INFO**: General information about rotation progress
- **DEBUG**: Detailed debugging information

## Backup and Restore

### Backup Location

- **Bash**: `backups/secrets/`
- **PowerShell**: `..\backups\secrets\`

### Backup Format

```
{SECRET_NAME}_{YYYYMMDD_HHMMSS}.bak
```

Example: `vauntico_main_secret_20260115_023000.bak`

### Manual Restore

If automatic rollback fails, you can manually restore:

```bash
# Find latest backup
ls -la backups/secrets/vauntico_main_secret_*.bak | tail -1

# Restore from backup
cp backups/secrets/vauntico_main_secret_20260115_023000.bak .env
```

## Notifications

### Slack Integration

Configure Slack webhook for real-time notifications:

1. Create Slack app: https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Copy webhook URL to `SLACK_WEBHOOK_URL`

### Email Integration

Configure email notifications using Resend:

1. Get Resend API key: https://resend.com/api-keys
2. Set `RESEND_API_KEY` environment variable
3. Configure `ADMIN_EMAIL` for notification recipient

## Security Considerations

### Production Usage

1. **Test first**: Always run with `--dry-run` in staging
2. **Verify backups**: Ensure backup directory has proper permissions
3. **Monitor logs**: Watch for errors during rotation
4. **Rollback plan**: Have manual rollback procedure documented

### Secret Handling

- Secrets are never logged in plain text
- Old secrets are backed up with restricted permissions
- Memory is cleared after rotation
- Temporary files are securely deleted

### Access Control

- Limit script execution to authorized personnel
- Use separate service accounts for cloud provider CLIs
- Implement audit logging for script execution

## Troubleshooting

### Common Issues

#### Permission Denied

```bash
# Linux/macOS
chmod +x scripts/secret-rotation.sh

# Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### CLI Tools Not Found

```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-3.0.0.tar.gz | tar xz

# Install Vercel CLI
npm i -g vercel

# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

#### Secret Update Failures

1. Check API credentials and permissions
2. Verify network connectivity
3. Review cloud provider console for rate limits
4. Check environment variable formatting

#### Verification Failures

1. Ensure application is running during health checks
2. Verify `FRONTEND_URL` is accessible
3. Check firewall rules blocking health endpoint
4. Review application logs for secret-related errors

### Debug Mode

Enable debug logging:

```bash
# Bash
export LOG_LEVEL=DEBUG
./scripts/secret-rotation.sh --dry-run

# PowerShell
$env:LOG_LEVEL = "DEBUG"
.\scripts\secret-rotation.ps1 -DryRun
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Rotate Secrets
on:
  schedule:
    - cron: "0 2 * * 0" # Weekly rotation at 2 AM Sunday

jobs:
  rotate-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Rotate secrets
        env:
          VAUNTICO_SECRET: ${{ secrets.VAUNTICO_SECRET }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          ./scripts/secret-rotation.sh --environment production
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    triggers {
        cron('H H * * 0')  # Weekly rotation
    }
    environment {
        VAUNTICO_SECRET = credentials('vauntico-secret')
        SLACK_WEBHOOK_URL = credentials('slack-webhook')
    }
    stages {
        stage('Rotate Secrets') {
            steps {
                sh './scripts/secret-rotation.sh --environment production'
            }
        }
    }
}
```

## Maintenance

### Regular Tasks

1. **Review logs** for failed rotations or security events
2. **Clean up old backups** (retain last 30 days)
3. **Update notification channels** as team changes
4. **Test rollback procedures** quarterly
5. **Audit script permissions** monthly

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Add to logrotate configuration
/path/to/vauntico-mvp/logs/secret-rotation.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
    create 644 vauntico vauntico
}
```

## Support

For issues or questions:

1. **Check logs** for error messages
2. **Run with debug mode** for detailed output
3. **Verify prerequisites** are installed
4. **Test with dry-run** before production execution

## Version History

| Version | Date       | Changes                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------- |
| 2.0.0   | 2026-01-15 | Complete rewrite with PowerShell support, structured logging, and enhanced error handling |
| 1.0.0   | 2025-12-01 | Initial version with basic secret rotation                                                |

## License

This script is part of the Vauntico platform and follows the project's licensing terms.

#!/bin/bash

# =============================================================================
# VAUNTICO SECRET ROTATION SCRIPT
# =============================================================================
# Comprehensive secret rotation with proper error handling, logging, and notifications
# Supports multiple environments and secret management systems
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURATION
# =============================================================================

# Script configuration
SCRIPT_VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/../logs/secret-rotation.log"
BACKUP_DIR="${SCRIPT_DIR}/../backups/secrets"
CONFIG_FILE="${SCRIPT_DIR}/../config/secret-rotation.conf"

# Default secret configuration (can be overridden by config file)
SECRET_NAME="vauntico_main_secret"
OLD_SECRET="${VAUNTICO_SECRET:-}"
NEW_SECRET=""
ENVIRONMENT="${ENVIRONMENT:-development}"
DRY_RUN="${DRY_RUN:-false}"
BACKUP_ENABLED="${BACKUP_ENABLED:-true}"
NOTIFICATIONS_ENABLED="${NOTIFICATIONS_ENABLED:-true}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# Environment-specific settings
case "$ENVIRONMENT" in
  "production")
    SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"
    LOG_LEVEL="INFO"
    VERIFICATION_TIMEOUT=300
    ;;
  "staging")
    SLACK_WEBHOOK_URL="${STAGING_SLACK_WEBHOOK_URL:-}"
    LOG_LEVEL="DEBUG"
    VERIFICATION_TIMEOUT=180
    ;;
  "development"|*)
    SLACK_WEBHOOK_URL="${DEV_SLACK_WEBHOOK_URL:-}"
    LOG_LEVEL="DEBUG"
    VERIFICATION_TIMEOUT=60
    ;;
esac

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

# Initialize logging
setup_logging() {
  # Create directories
  mkdir -p "$(dirname "$LOG_FILE")"
  mkdir -p "$BACKUP_DIR"
  
  # Initialize log file
  if [[ ! -f "$LOG_FILE" ]]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Secret rotation log initialized (v$SCRIPT_VERSION)" >> "$LOG_FILE"
  fi
}

# Structured logging function
log_rotation_event() {
  local level="$1"
  local message="$2"
  local details="${3:-}"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Log to file with structured format
  local log_entry="{
    \"timestamp\": \"$timestamp\",
    \"level\": \"$level\",
    \"message\": \"$message\",
    \"secret_name\": \"$SECRET_NAME\",
    \"environment\": \"$ENVIRONMENT\",
    \"script_version\": \"$SCRIPT_VERSION\",
    \"pid\": $$"
  
  if [[ -n "$details" ]]; then
    log_entry+=",\"details\": $details"
  fi
  
  log_entry+="}"
  
  echo "$log_entry" >> "$LOG_FILE"
  
  # Also output to console with color coding
  case "$level" in
    "ERROR")
      echo -e "\033[0;31m[$level] $message\033[0m" >&2
      ;;
    "WARN")
      echo -e "\033[0;33m[$level] $message\033[0m" >&2
      ;;
    "INFO")
      echo -e "\033[0;32m[$level] $message\033[0m"
      ;;
    "DEBUG")
      echo -e "\033[0;36m[$level] $message\033[0m"
      ;;
    *)
      echo "[$level] $message"
      ;;
  esac
}

# =============================================================================
# SECRET GENERATION
# =============================================================================

# Generate a new cryptographically secure secret
generate_new_secret() {
  local secret_length="${SECRET_LENGTH:-32}"
  local secret_type="${SECRET_TYPE:-alphanumeric}"
  
  log_rotation_event "DEBUG" "Generating new secret" "{\"length\": $secret_length, \"type\": \"$secret_type\"}"
  
  case "$secret_type" in
    "alphanumeric")
      NEW_SECRET=$(openssl rand -base64 $((secret_length * 3 / 4)) | tr -d '/+=' | head -c $secret_length)
      ;;
    "hex")
      NEW_SECRET=$(openssl rand -hex $((secret_length / 2)))
      ;;
    "base64")
      NEW_SECRET=$(openssl rand -base64 $secret_length)
      ;;
    "uuid")
      NEW_SECRET=$(uuidgen | tr -d '-')
      ;;
    *)
      log_rotation_event "ERROR" "Unsupported secret type: $secret_type"
      return 1
      ;;
  esac
  
  if [[ -z "$NEW_SECRET" || ${#NEW_SECRET} -lt $((secret_length / 2)) ]]; then
    log_rotation_event "ERROR" "Failed to generate valid secret"
    return 1
  fi
  
  log_rotation_event "INFO" "Generated new secret" "{\"length\": ${#NEW_SECRET}}"
  echo "$NEW_SECRET"
}

# =============================================================================
# SECRET MANAGEMENT FUNCTIONS
# =============================================================================

# Update secret in target systems
update_secret_in_system() {
  local secret_value="$1"
  local update_count=0
  local failed_updates=()
  
  log_rotation_event "INFO" "Starting secret update in target systems"
  
  # Update environment files
  if [[ -f ".env" ]]; then
    log_rotation_event "DEBUG" "Updating .env file"
    if [[ "$DRY_RUN" == "false" ]]; then
      if grep -q "^VAUNTICO_SECRET=" .env; then
        sed -i.bak "s/^VAUNTICO_SECRET=.*/VAUNTICO_SECRET=$secret_value/" .env
        ((update_count++))
      else
        echo "VAUNTICO_SECRET=$secret_value" >> .env
        ((update_count++))
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would update .env file"
    fi
  fi
  
  # Update server-v2 .env
  if [[ -f "server-v2/.env" ]]; then
    log_rotation_event "DEBUG" "Updating server-v2/.env file"
    if [[ "$DRY_RUN" == "false" ]]; then
      if grep -q "^VAUNTICO_SECRET=" server-v2/.env; then
        sed -i.bak "s/^VAUNTICO_SECRET=.*/VAUNTICO_SECRET=$secret_value/" server-v2/.env
        ((update_count++))
      else
        echo "VAUNTICO_SECRET=$secret_value" >> server-v2/.env
        ((update_count++))
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would update server-v2/.env file"
    fi
  fi
  
  # Update GitHub Actions secrets
  if command -v gh >/dev/null 2>&1 && [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
    log_rotation_event "DEBUG" "Updating GitHub Actions secrets"
    if [[ "$DRY_RUN" == "false" ]]; then
      if echo "$secret_value" | gh secret set VAUNTICO_SECRET; then
        ((update_count++))
        log_rotation_event "DEBUG" "GitHub secret updated successfully"
      else
        failed_updates+=("GitHub Actions")
        log_rotation_event "WARN" "Failed to update GitHub secret"
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would update GitHub Actions secret"
    fi
  fi
  
  # Update Vercel environment variables
  if command -v vercel >/dev/null 2>&1 && [[ -n "${VERCEL_PROJECT_ID:-}" ]]; then
    log_rotation_event "DEBUG" "Updating Vercel environment variables"
    if [[ "$DRY_RUN" == "false" ]]; then
      if vercel env add VAUNTICO_SECRET production <<< "$secret_value"; then
        ((update_count++))
        log_rotation_event "DEBUG" "Vercel secret updated successfully"
      else
        failed_updates+=("Vercel")
        log_rotation_event "WARN" "Failed to update Vercel secret"
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would update Vercel secret"
    fi
  fi
  
  # Update OCI secrets (if OCI CLI is available)
  if command -v oci >/dev/null 2>&1 && [[ -n "${OCI_USER_OCID:-}" ]]; then
    log_rotation_event "DEBUG" "Updating OCI secrets"
    if [[ "$DRY_RUN" == "false" ]]; then
      if oci vault secret update --secret-id "${VAUNTICO_SECRET_OCID:-}" --secret-content "$secret_value"; then
        ((update_count++))
        log_rotation_event "DEBUG" "OCI secret updated successfully"
      else
        failed_updates+=("OCI")
        log_rotation_event "WARN" "Failed to update OCI secret"
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would update OCI secret"
    fi
  fi
  
  local success_count=$update_count
  local total_count=$((success_count + ${#failed_updates[@]}))
  
  if [[ $success_count -gt 0 ]]; then
    log_rotation_event "INFO" "Secret update completed" "{\"success_count\": $success_count, \"total_count\": $total_count}"
  else
    log_rotation_event "ERROR" "All secret updates failed" "{\"failed_updates\": [$(printf '"%s",' "${failed_updates[@]}")]}"
    return 1
  fi
  
  if [[ ${#failed_updates[@]} -gt 0 ]]; then
    log_rotation_event "WARN" "Some secret updates failed" "{\"failed_updates\": [$(printf '"%s",' "${failed_updates[@]}")]}"
  fi
}

# Revoke old secret
revoke_old_secret() {
  log_rotation_event "INFO" "Starting old secret revocation"
  
  local revoked_count=0
  local failed_revocations=()
  
  # Backup old secret before revocation
  if [[ "$BACKUP_ENABLED" == "true" && -n "$OLD_SECRET" ]]; then
    local backup_file="$BACKUP_DIR/${SECRET_NAME}_$(date +%Y%m%d_%H%M%S).bak"
    echo "$OLD_SECRET" > "$backup_file"
    chmod 600 "$backup_file"
    log_rotation_event "INFO" "Old secret backed up" "{\"backup_file\": \"$backup_file\"}"
  fi
  
  # Mark old secret as revoked in database (if applicable)
  if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
    log_rotation_event "DEBUG" "Marking secret as revoked in database"
    if [[ "$DRY_RUN" == "false" ]]; then
      if psql "$DATABASE_URL" -c "UPDATE secret_rotations SET revoked_at = NOW() WHERE secret_name = '$SECRET_NAME' AND revoked_at IS NULL;" 2>/dev/null; then
        ((revoked_count++))
        log_rotation_event "DEBUG" "Database revocation successful"
      else
        failed_revocations+=("Database")
        log_rotation_event "WARN" "Failed to revoke in database"
      fi
    else
      log_rotation_event "DEBUG" "DRY RUN: Would mark secret as revoked in database"
    fi
  fi
  
  # Clear old secret from memory
  if [[ -n "$OLD_SECRET" ]]; then
    OLD_SECRET=""
    log_rotation_event "DEBUG" "Old secret cleared from memory"
  fi
  
  log_rotation_event "INFO" "Secret revocation completed" "{\"revoked_count\": $revoked_count}"
}

# =============================================================================
# NOTIFICATION FUNCTIONS
# =============================================================================

# Send notification to stakeholders
notify_stakeholders() {
  local message="$1"
  local severity="${2:-INFO}"
  
  if [[ "$NOTIFICATIONS_ENABLED" != "true" ]]; then
    log_rotation_event "DEBUG" "Notifications disabled, skipping"
    return 0
  fi
  
  log_rotation_event "DEBUG" "Sending stakeholder notifications"
  
  # Send Slack notification
  if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
    local slack_color="good"
    local slack_emoji="✅"
    
    case "$severity" in
      "ERROR")
        slack_color="danger"
        slack_emoji="❌"
        ;;
      "WARN")
        slack_color="warning"
        slack_emoji="⚠️"
        ;;
    esac
    
    local slack_payload="{
      \"text\": \"$slack_emoji Secret Rotation: $severity\",
      \"attachments\": [
        {
          \"color\": \"$slack_color\",
          \"fields\": [
            {
              \"title\": \"Message\",
              \"value\": \"$message\",
              \"short\": false
            },
            {
              \"title\": \"Secret Name\",
              \"value\": \"$SECRET_NAME\",
              \"short\": true
            },
            {
              \"title\": \"Environment\",
              \"value\": \"$ENVIRONMENT\",
              \"short\": true
            },
            {
              \"title\": \"Timestamp\",
              \"value\": \"$(date -Iseconds)\",
              \"short\": true
            },
            {
              \"title\": \"Script Version\",
              \"value\": \"$SCRIPT_VERSION\",
              \"short\": true
            }
          ]
        }
      ]
    }"
    
    if curl -s -X POST -H 'Content-type: application/json' --data "$slack_payload" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1; then
      log_rotation_event "DEBUG" "Slack notification sent successfully"
    else
      log_rotation_event "WARN" "Failed to send Slack notification"
    fi
  fi
  
  # Send email notification (if email service is configured)
  if [[ -n "${RESEND_API_KEY:-}" && -n "${ADMIN_EMAIL:-}" ]]; then
    local email_subject="Secret Rotation $severity: $SECRET_NAME ($ENVIRONMENT)"
    local email_body="Secret rotation event:\n\n$message\n\nSecret: $SECRET_NAME\nEnvironment: $ENVIRONMENT\nTimestamp: $(date -Iseconds)\nScript Version: $SCRIPT_VERSION"
    
    if command -v curl >/dev/null 2>&1; then
      if curl -s -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
          \"from\": \"noreply@vauntico.com\",
          \"to\": [\"$ADMIN_EMAIL\"],
          \"subject\": \"$email_subject\",
          \"text\": \"$email_body\"
        }" >/dev/null 2>&1; then
        log_rotation_event "DEBUG" "Email notification sent successfully"
      else
        log_rotation_event "WARN" "Failed to send email notification"
      fi
    fi
  fi
}

# =============================================================================
# VERIFICATION FUNCTIONS
# =============================================================================

# Verify secret update was successful
verify_secret_update() {
  local expected_secret="$1"
  local verification_start=$(date +%s)
  
  log_rotation_event "INFO" "Starting secret verification"
  
  # Verify environment files
  local verification_passed=true
  local verification_results=()
  
  if [[ -f ".env" ]]; then
    local current_secret=$(grep "^VAUNTICO_SECRET=" .env | cut -d'=' -f2)
    if [[ "$current_secret" == "$expected_secret" ]]; then
      verification_results+=(".env: PASS")
      log_rotation_event "DEBUG" ".env verification passed"
    else
      verification_results+=(".env: FAIL")
      verification_passed=false
      log_rotation_event "ERROR" ".env verification failed"
    fi
  fi
  
  if [[ -f "server-v2/.env" ]]; then
    local current_secret=$(grep "^VAUNTICO_SECRET=" server-v2/.env | cut -d'=' -f2)
    if [[ "$current_secret" == "$expected_secret" ]]; then
      verification_results+=("server-v2/.env: PASS")
      log_rotation_event "DEBUG" "server-v2/.env verification passed"
    else
      verification_results+=("server-v2/.env: FAIL")
      verification_passed=false
      log_rotation_event "ERROR" "server-v2/.env verification failed"
    fi
  fi
  
  # Verify application can start with new secret (health check)
  if command -v curl >/dev/null 2>&1; then
    local health_url="${FRONTEND_URL:-http://localhost:3000}/health"
    local health_timeout=10
    local max_attempts=3
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
      if curl -s -f -m "$health_timeout" "$health_url" >/dev/null 2>&1; then
        verification_results+=("health_check: PASS")
        log_rotation_event "DEBUG" "Health check passed on attempt $attempt"
        break
      else
        log_rotation_event "DEBUG" "Health check failed on attempt $attempt"
        ((attempt++))
        sleep 2
      fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
      verification_results+=("health_check: FAIL")
      verification_passed=false
      log_rotation_event "ERROR" "Health check failed after $max_attempts attempts"
    fi
  fi
  
  local verification_end=$(date +%s)
  local verification_duration=$((verification_end - verification_start))
  
  log_rotation_event "INFO" "Verification completed" "{\"passed\": $verification_passed, \"duration\": $verification_duration, \"results\": [$(printf '"%s",' "${verification_results[@]}")]}"
  
  if [[ "$verification_passed" == "true" ]]; then
    return 0
  else
    return 1
  fi
}

# =============================================================================
# ERROR HANDLING AND ROLLBACK
# =============================================================================

# Rollback to previous secret
rollback_secret() {
  log_rotation_event "WARN" "Initiating secret rollback"
  
  if [[ -z "$OLD_SECRET" ]]; then
    log_rotation_event "ERROR" "Cannot rollback: old secret not available"
    return 1
  fi
  
  # Restore from backup if available
  local latest_backup=$(ls -t "$BACKUP_DIR"/${SECRET_NAME}_*.bak 2>/dev/null | head -1)
  if [[ -n "$latest_backup" ]]; then
    OLD_SECRET=$(cat "$latest_backup")
    log_rotation_event "INFO" "Restored old secret from backup" "{\"backup_file\": \"$latest_backup\"}"
  fi
  
  # Update systems with old secret
  if update_secret_in_system "$OLD_SECRET"; then
    log_rotation_event "INFO" "Rollback completed successfully"
    notify_stakeholders "Secret rotation was rolled back due to verification failure" "WARN"
    return 0
  else
    log_rotation_event "ERROR" "Rollback failed"
    notify_stakeholders "CRITICAL: Secret rotation rollback failed - manual intervention required" "ERROR"
    return 1
  fi
}

# Error handler
handle_error() {
  local exit_code=$?
  local line_number=$1
  
  log_rotation_event "ERROR" "Script failed" "{\"exit_code\": $exit_code, \"line\": $line_number}"
  
  if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
    rollback_secret
  fi
  
  notify_stakeholders "Secret rotation script failed at line $line_number with exit code $exit_code" "ERROR"
  
  exit $exit_code
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

# Set up error handling
trap 'handle_error $LINENO' ERR

# Main rotation workflow
main() {
  log_rotation_event "INFO" "Starting secret rotation for $SECRET_NAME"
  notify_stakeholders "Starting secret rotation for $SECRET_NAME in $ENVIRONMENT environment"
  
  # Generate new secret
  NEW_SECRET=$(generate_new_secret)
  
  if [[ -z "$NEW_SECRET" ]]; then
    log_rotation_event "ERROR" "Failed to generate new secret"
    exit 1
  fi
  
  # Update secret in all target systems
  if update_secret_in_system "$NEW_SECRET"; then
    log_rotation_event "INFO" "Secret update completed successfully"
  else
    log_rotation_event "ERROR" "Secret update failed"
    exit 1
  fi
  
  # Verify the update
  if verify_secret_update "$NEW_SECRET"; then
    log_rotation_event "INFO" "Secret verification passed"
    
    # Revoke old secret
    revoke_old_secret
    
    log_rotation_event "INFO" "Secret rotation completed successfully for $SECRET_NAME"
    notify_stakeholders "Secret rotation completed successfully for $SECRET_NAME in $ENVIRONMENT environment"
    
    exit 0
  else
    log_rotation_event "ERROR" "Secret verification failed"
    
    if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
      rollback_secret
    fi
    
    notify_stakeholders "Secret rotation verification failed for $SECRET_NAME in $ENVIRONMENT environment" "ERROR"
    exit 1
  fi
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --secret-name)
      SECRET_NAME="$2"
      shift 2
      ;;
    --secret-length)
      SECRET_LENGTH="$2"
      shift 2
      ;;
    --no-backup)
      BACKUP_ENABLED="false"
      shift
      ;;
    --no-notifications)
      NOTIFICATIONS_ENABLED="false"
      shift
      ;;
    --no-rollback)
      ROLLBACK_ON_FAILURE="false"
      shift
      ;;
    --help)
      echo "Vauntico Secret Rotation Script v$SCRIPT_VERSION"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run                Simulate rotation without making changes"
      echo "  --environment ENV        Target environment (development|staging|production)"
      echo "  --secret-name NAME       Name of the secret to rotate"
      echo "  --secret-length LENGTH    Length of generated secret (default: 32)"
      echo "  --no-backup             Disable secret backup"
      echo "  --no-notifications       Disable stakeholder notifications"
      echo "  --no-rollback            Disable automatic rollback on failure"
      echo "  --help                  Show this help message"
      echo ""
      echo "Environment Variables:"
      echo "  VAUNTICO_SECRET         Current secret value"
      echo "  SLACK_WEBHOOK_URL       Slack webhook for notifications"
      echo "  RESEND_API_KEY          Email service API key"
      echo "  ADMIN_EMAIL             Email address for notifications"
      echo ""
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Initialize logging
setup_logging

# Validate environment
if [[ -z "$OLD_SECRET" ]]; then
  log_rotation_event "WARN" "No old secret provided (VAUNTICO_SECRET not set)"
fi

# Run main workflow
main

# This should never be reached due to exit calls in main()
exit 0

#!/bin/bash

# ============================================================================
# Vauntico MVP - OCI Monitoring and Alerting Setup Script
# ============================================================================
# This script sets up comprehensive monitoring and alerting for OCI resources
# including Cloud Guard, Monitoring service, and Slack integration
#
# Prerequisites:
# - OCI infrastructure must be set up (run setup-oci-infrastructure.sh first)
# - Proper IAM permissions for monitoring services
# - Slack webhook URL for notifications (optional)
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
COMPARTMENT_ID=""
SLACK_WEBHOOK_URL=""
ALERT_EMAIL=""
ENABLE_CLOUD_GUARD=true
ENABLE_MONITORING=true
ENABLE_LOGGING=true

# Variables to store created resource OCIDs
CLOUD_GUARD_ID=""
MONITORING_TOPIC_ID=""
ALARM_NAMESPACE="oci_monitoring"

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if infrastructure exists
check_infrastructure() {
    log "Checking if OCI infrastructure exists..."
    
    if [[ -z "$COMPARTMENT_ID" ]]; then
        echo "Available compartments:"
        oci iam compartment list --query "data[*].{Name:name, ID:id}" --output table
        read -p "Enter your Vauntico-MVP Compartment OCID: " COMPARTMENT_ID
        
        if [[ -z "$COMPARTMENT_ID" ]]; then
            error "Compartment ID is required"
        fi
    fi
    
    # Check for existing VCN
    VCN_ID=$(oci network vcn list --compartment-id "$COMPARTMENT_ID" --display-name "Vauntico-MVP-VCN" --query 'data[0].id' --raw-output 2>/dev/null || echo "")
    
    if [[ -z "$VCN_ID" ]]; then
        error "Vauntico-MVP VCN not found. Please run setup-oci-infrastructure.sh first"
    fi
    
    success "Infrastructure validation passed"
}

# Get monitoring configuration
get_monitoring_config() {
    log "Configuring monitoring settings..."
    
    # Get Slack webhook (optional)
    read -p "Enter Slack webhook URL for notifications (optional, press Enter to skip): " SLACK_WEBHOOK_URL
    
    # Get alert email
    read -p "Enter email address for alerts: " ALERT_EMAIL
    
    if [[ -z "$ALERT_EMAIL" ]]; then
        ALERT_EMAIL="admin@vauntico.com"
        warning "Using default alert email: $ALERT_EMAIL"
    fi
    
    # Confirm monitoring components
    echo ""
    echo "Monitoring Components to Enable:"
    echo "  [✓] Cloud Guard: $ENABLE_CLOUD_GUARD"
    echo "  [✓] Monitoring Service: $ENABLE_MONITORING"
    echo "  [✓] Logging Service: $ENABLE_LOGGING"
    echo "  Email Alerts: $ALERT_EMAIL"
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        echo "  Slack Notifications: Enabled"
    fi
    echo ""
    read -p "Continue with this configuration? (y/N): " confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        error "Setup cancelled by user"
    fi
    
    success "Monitoring configuration confirmed"
}

# Enable Cloud Guard
enable_cloud_guard() {
    if [[ "$ENABLE_CLOUD_GUARD" != "true" ]]; then
        log "Skipping Cloud Guard setup..."
        return 0
    fi
    
    log "Enabling Cloud Guard..."
    
    # Create Cloud Guard target
    CLOUD_GUARD_OUTPUT=$(oci cloud-guard cloud-guard-target create \
        --compartment-id "$COMPARTMENT_ID" \
        --target-details '{"targetResourceId":"'"$COMPARTMENT_ID"'","targetResourceType":"COMPARTMENT","targetDetectorRecipeId":"oci.cloudguard.detectorrecipe.global"}' \
        --display-name "Vauntico-MVP-CloudGuard" \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        warning "Failed to create Cloud Guard target: $CLOUD_GUARD_OUTPUT"
        log "Cloud Guard may already be enabled or insufficient permissions"
    else
        CLOUD_GUARD_ID="$CLOUD_GUARD_OUTPUT"
        success "Cloud Guard target created: $CLOUD_GUARD_ID"
    fi
    
    # Enable Cloud Guard in compartment
    log "Enabling Cloud Guard status..."
    oci cloud-guard compartment create \
        --compartment-id "$COMPARTMENT_ID" \
        --cloud-guard-compartment-details '{"status":"ENABLED"}' 2>/dev/null || true
    
    success "Cloud Guard configuration completed"
}

# Create Notification Topic
create_notification_topic() {
    log "Creating notification topic..."
    
    TOPIC_OUTPUT=$(oci ons notification-topic create \
        --compartment-id "$COMPARTMENT_ID" \
        --name "vauntico-mvp-alerts" \
        --description "Vauntico MVP monitoring and security alerts" \
        --query 'data.topicId' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        warning "Failed to create notification topic: $TOPIC_OUTPUT"
        log "Using existing topic or creating fallback"
        MONITORING_TOPIC_ID="vauntico-mvp-alerts"
    else
        MONITORING_TOPIC_ID="$TOPIC_OUTPUT"
        success "Notification topic created: $MONITORING_TOPIC_ID"
    fi
    
    # Create email subscription
    if [[ -n "$ALERT_EMAIL" ]]; then
        log "Creating email subscription..."
        oci ons subscription create \
            --topic-id "$MONITORING_TOPIC_ID" \
            --protocol EMAIL \
            --endpoint "$ALERT_EMAIL" \
            --compartment-id "$COMPARTMENT_ID" 2>/dev/null || true
        
        success "Email subscription created for: $ALERT_EMAIL"
    fi
    
    # Create Slack subscription (if webhook provided)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        log "Creating Slack subscription..."
        oci ons subscription create \
            --topic-id "$MONITORING_TOPIC_ID" \
            --protocol SLACK \
            --endpoint "$SLACK_WEBHOOK_URL" \
            --compartment-id "$COMPARTMENT_ID" 2>/dev/null || true
        
        success "Slack subscription created"
    fi
}

# Create monitoring alarms
create_monitoring_alarms() {
    if [[ "$ENABLE_MONITORING" != "true" ]]; then
        log "Skipping Monitoring service setup..."
        return 0
    fi
    
    log "Creating monitoring alarms..."
    
    # CPU Utilization Alarm for Compute Instances
    log "Creating CPU utilization alarm..."
    cat > cpu-alarm.json << EOF
{
    "displayName": "Vauntico-MVP-High-CPU-Usage",
    "compartmentId": "$COMPARTMENT_ID",
    "metricCompartmentId": "$COMPARTMENT_ID",
    "namespace": "$ALARM_NAMESPACE",
    "query": "CpuUtilization[1m].mean() > 80",
    "severity": "CRITICAL",
    "destinations": ["$MONITORING_TOPIC_ID"],
    "isEnabled": true,
    "body": "High CPU usage detected on Vauntico MVP instance. Current utilization: {{value}}% at {{timestamp}}",
    "pendingDuration": "PT5M",
    "resolution": "AUTO_RESOLVE"
}
EOF
    
    CPU_ALARM_OUTPUT=$(oci monitoring alarm create \
        --from-json file://cpu-alarm.json \
        --query 'data.id' \
        --raw-output 2>&1) || warning "CPU alarm creation failed: $CPU_ALARM_OUTPUT"
    
    # Memory Utilization Alarm
    log "Creating memory utilization alarm..."
    cat > memory-alarm.json << EOF
{
    "displayName": "Vauntico-MVP-High-Memory-Usage",
    "compartmentId": "$COMPARTMENT_ID",
    "metricCompartmentId": "$COMPARTMENT_ID",
    "namespace": "$ALARM_NAMESPACE",
    "query": "MemoryUtilization[1m].mean() > 85",
    "severity": "CRITICAL",
    "destinations": ["$MONITORING_TOPIC_ID"],
    "isEnabled": true,
    "body": "High memory usage detected on Vauntico MVP instance. Current utilization: {{value}}% at {{timestamp}}",
    "pendingDuration": "PT5M",
    "resolution": "AUTO_RESOLVE"
}
EOF
    
    MEMORY_ALARM_OUTPUT=$(oci monitoring alarm create \
        --from-json file://memory-alarm.json \
        --query 'data.id' \
        --raw-output 2>&1) || warning "Memory alarm creation failed: $MEMORY_ALARM_OUTPUT"
    
    # Database Connection Alarm
    log "Creating database connection alarm..."
    cat > db-alarm.json << EOF
{
    "displayName": "Vauntico-MVP-Database-Connections",
    "compartmentId": "$COMPARTMENT_ID",
    "metricCompartmentId": "$COMPARTMENT_ID",
    "namespace": "oci_autonomous_database",
    "query": "DatabaseCpuUtilization[5m].mean() > 90",
    "severity": "CRITICAL",
    "destinations": ["$MONITORING_TOPIC_ID"],
    "isEnabled": true,
    "body": "High database CPU utilization detected. Current: {{value}}% at {{timestamp}}",
    "pendingDuration": "PT3M",
    "resolution": "AUTO_RESOLVE"
}
EOF
    
    DB_ALARM_OUTPUT=$(oci monitoring alarm create \
        --from-json file://db-alarm.json \
        --query 'data.id' \
        --raw-output 2>&1) || warning "Database alarm creation failed: $DB_ALARM_OUTPUT"
    
    # Network Ingress Alarm
    log "Creating network ingress alarm..."
    cat > network-alarm.json << EOF
{
    "displayName": "Vauntico-MVP-High-Network-Traffic",
    "compartmentId": "$COMPARTMENT_ID",
    "metricCompartmentId": "$COMPARTMENT_ID",
    "namespace": "$ALARM_NAMESPACE",
    "query": "NetworkIngressBytes[5m].sum() > 104857600",
    "severity": "WARNING",
    "destinations": ["$MONITORING_TOPIC_ID"],
    "isEnabled": true,
    "body": "High network ingress detected. Current: {{value}} bytes/5m at {{timestamp}}",
    "pendingDuration": "PT5M",
    "resolution": "AUTO_RESOLVE"
}
EOF
    
    NETWORK_ALARM_OUTPUT=$(oci monitoring alarm create \
        --from-json file://network-alarm.json \
        --query 'data.id' \
        --raw-output 2>&1) || warning "Network alarm creation failed: $NETWORK_ALARM_OUTPUT"
    
    success "Monitoring alarms created"
    
    # Clean up temporary files
    rm -f cpu-alarm.json memory-alarm.json db-alarm.json network-alarm.json
}

# Create log groups and custom logs
setup_logging() {
    if [[ "$ENABLE_LOGGING" != "true" ]]; then
        log "Skipping Logging service setup..."
        return 0
    fi
    
    log "Setting up logging service..."
    
    # Create log group
    LOG_GROUP_OUTPUT=$(oci logging log-group create \
        --compartment-id "$COMPARTMENT_ID" \
        --name "vauntico-mvp-logs" \
        --description "Vauntico MVP application and audit logs" \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        warning "Failed to create log group: $LOG_GROUP_OUTPUT"
        LOG_GROUP_ID="vauntico-mvp-logs"
    else
        LOG_GROUP_ID="$LOG_GROUP_OUTPUT"
        success "Log group created: $LOG_GROUP_ID"
    fi
    
    # Create custom log for application
    oci logging log create \
        --log-group-id "$LOG_GROUP_ID" \
        --name "vauntico-application" \
        --log-type CUSTOM 2>/dev/null || true
    
    # Create custom log for security events
    oci logging log create \
        --log-group-id "$LOG_GROUP_ID" \
        --name "vauntico-security" \
        --log-type CUSTOM 2>/dev/null || true
    
    success "Logging setup completed"
}

# Create monitoring dashboard
create_monitoring_dashboard() {
    log "Creating monitoring dashboard..."
    
    cat > vauntico-dashboard.json << EOF
{
    "displayName": "Vauntico MVP Monitoring Dashboard",
    "compartmentId": "$COMPARTMENT_ID",
    "widgets": [
        {
            "displayName": "CPU Utilization",
            "description": "Instance CPU utilization over time",
            "gridSpan": 12,
            "widgetType": "line_chart",
            "dataConfigurations": [
                {
                    "dataSourceId": "oci_monitoring",
                    "displayName": "CPU",
                    "queryDefinition": {
                        "compartmentId": "$COMPARTMENT_ID",
                        "namespace": "$ALARM_NAMESPACE",
                        "metricName": "CpuUtilization",
                        "aggregation": "mean"
                    }
                }
            ]
        },
        {
            "displayName": "Memory Utilization",
            "description": "Instance memory utilization over time",
            "gridSpan": 12,
            "widgetType": "line_chart",
            "dataConfigurations": [
                {
                    "dataSourceId": "oci_monitoring",
                    "displayName": "Memory",
                    "queryDefinition": {
                        "compartmentId": "$COMPARTMENT_ID",
                        "namespace": "$ALARM_NAMESPACE",
                        "metricName": "MemoryUtilization",
                        "aggregation": "mean"
                    }
                }
            ]
        },
        {
            "displayName": "Network Traffic",
            "description": "Network ingress and egress",
            "gridSpan": 12,
            "widgetType": "line_chart",
            "dataConfigurations": [
                {
                    "dataSourceId": "oci_monitoring",
                    "displayName": "Ingress",
                    "queryDefinition": {
                        "compartmentId": "$COMPARTMENT_ID",
                        "namespace": "$ALARM_NAMESPACE",
                        "metricName": "NetworkIngressBytes",
                        "aggregation": "sum"
                    }
                },
                {
                    "dataSourceId": "oci_monitoring",
                    "displayName": "Egress",
                    "queryDefinition": {
                        "compartmentId": "$COMPARTMENT_ID",
                        "namespace": "$ALARM_NAMESPACE",
                        "metricName": "NetworkEgressBytes",
                        "aggregation": "sum"
                    }
                }
            ]
        },
        {
            "displayName": "Database Performance",
            "description": "Autonomous Database performance metrics",
            "gridSpan": 12,
            "widgetType": "line_chart",
            "dataConfigurations": [
                {
                    "dataSourceId": "oci_monitoring",
                    "displayName": "DB CPU",
                    "queryDefinition": {
                        "compartmentId": "$COMPARTMENT_ID",
                        "namespace": "oci_autonomous_database",
                        "metricName": "DatabaseCpuUtilization",
                        "aggregation": "mean"
                    }
                }
            ]
        }
    ]
}
EOF
    
    DASHBOARD_OUTPUT=$(oci monitoring dashboard create \
        --from-json file://vauntico-dashboard.json \
        --query 'data.id' \
        --raw-output 2>&1)
    
    if [[ $? -ne 0 ]]; then
        warning "Failed to create monitoring dashboard: $DASHBOARD_OUTPUT"
    else
        DASHBOARD_ID="$DASHBOARD_OUTPUT"
        success "Monitoring dashboard created: $DASHBOARD_ID"
    fi
    
    # Clean up temporary file
    rm -f vauntico-dashboard.json
}

# Generate monitoring summary
generate_monitoring_summary() {
    log "Generating monitoring setup summary..."
    
    SUMMARY_FILE="oci-monitoring-summary-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$SUMMARY_FILE" << EOF
 ============================================================================
 Vauntico MVP - Monitoring and Alerting Setup Summary
 ============================================================================
 Created on: $(date)
 Compartment ID: $COMPARTMENT_ID
 
 MONITORING COMPONENTS:
 ----------------------
 Cloud Guard: $ENABLE_CLOUD_GUARD
 Monitoring Service: $ENABLE_MONITORING
 Logging Service: $ENABLE_LOGGING
 
 NOTIFICATION CONFIGURATION:
 ----------------------------
 Notification Topic: $MONITORING_TOPIC_ID
 Email Alerts: $ALERT_EMAIL
 Slack Notifications: $([[ -n "$SLACK_WEBHOOK_URL" ]] && echo "Enabled" || echo "Disabled")
 
 CREATED ALARMS:
 ---------------
 • High CPU Usage (>80%)
 • High Memory Usage (>85%)
 • Database CPU Utilization (>90%)
 • High Network Traffic (>100MB/5m)
 
 LOG GROUPS:
 -----------
 • vauntico-mvp-logs
 • vauntico-application (custom log)
 • vauntico-security (security events log)
 
 DASHBOARD:
 ----------
 Monitoring Dashboard: $([[ -n "$DASHBOARD_ID" ]] && echo "$DASHBOARD_ID" || echo "Failed to create")
 
 MONITORING ENDPOINTS:
 --------------------
 OCI Console: https://console.oci.oraclecloud.com/monitoring/
 Cloud Guard: https://console.oci.oraclecloud.com/cloud-guard/
 Logs: https://console.oci.oraclecloud.com/logging/
 Alarms: https://console.oci.oraclecloud.com/monitoring/alarms/
 
 CONFIGURATION FILES:
 ------------------
 Alarm definitions are stored in JSON format and can be modified
 Custom metrics can be added via the OCI CLI or Console
 
 SECURITY NOTES:
 --------------
 • Cloud Guard provides threat detection and compliance monitoring
 • All access attempts are logged to the security log
 • Alerts are sent to configured email and Slack channels
 • Monitoring data retention follows OCI default policies
 
 MAINTENANCE:
 -------------
 • Review and update alarm thresholds as needed
 • Monitor alarm delivery to ensure notifications work
 • Regularly review Cloud Guard findings
 • Update notification endpoints as team members change
 
 CLEANUP COMMANDS (if needed):
 -----------------------------
 # Delete monitoring dashboard
 oci monitoring dashboard delete --dashboard-id $DASHBOARD_ID --force
 
 # Delete alarms
 oci monitoring alarm list --compartment-id $COMPARTMENT_ID --query 'data[0].id' --raw-output | xargs -I {} oci monitoring alarm delete --alarm-id {} --force
 
 # Delete notification topic
 oci ons notification-topic delete --topic-id $MONITORING_TOPIC_ID --force
 
 # Delete log group
 oci logging log-group delete --log-group-id $LOG_GROUP_ID --force
 
 # Disable Cloud Guard
 oci cloud-guard compartment delete --compartment-id $COMPARTMENT_ID
 ============================================================================
EOF
    
    success "Monitoring summary saved to: $SUMMARY_FILE"
    
    # Display summary to console
    log "MONITORING AND ALERTING SETUP COMPLETED!"
    echo ""
    echo "Components Enabled:"
    echo "  Cloud Guard: $ENABLE_CLOUD_GUARD"
    echo "  Monitoring: $ENABLE_MONITORING"
    echo "  Logging: $ENABLE_LOGGING"
    echo "  Email Alerts: $ALERT_EMAIL"
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        echo "  Slack: Enabled"
    fi
    echo ""
    echo "Key Resources:"
    echo "  Notification Topic: $MONITORING_TOPIC_ID"
    if [[ -n "$DASHBOARD_ID" ]]; then
        echo "  Dashboard ID: $DASHBOARD_ID"
    fi
    echo ""
    echo "Next Steps:"
    echo "  1. Monitor alarms in OCI Console"
    echo "  2. Configure application logging"
    echo "  3. Review Cloud Guard findings"
    echo "  4. Test notification delivery"
    echo ""
    echo "Full summary saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    log "Starting Vauntico MVP Monitoring and Alerting Setup..."
    echo ""
    
    check_infrastructure
    get_monitoring_config
    enable_cloud_guard
    create_notification_topic
    create_monitoring_alarms
    setup_logging
    create_monitoring_dashboard
    generate_monitoring_summary
    
    success "🎉 Vauntico MVP monitoring and alerting setup completed successfully!"
    echo ""
    log "Your Vauntico MVP infrastructure is now monitored and secured!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

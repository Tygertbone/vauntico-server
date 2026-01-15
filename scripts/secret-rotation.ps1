# =============================================================================
# VAUNTICO SECRET ROTATION SCRIPT (PowerShell Version)
# =============================================================================
# Comprehensive secret rotation with proper error handling, logging, and notifications
# Supports multiple environments and secret management systems
# =============================================================================

#Requires -Version 5.1

param(
    [switch]$DryRun,
    [string]$Environment = "development",
    [string]$SecretName = "vauntico_main_secret",
    [int]$SecretLength = 32,
    [switch]$NoBackup,
    [switch]$NoNotifications,
    [switch]$NoRollback,
    [switch]$Help
)

# =============================================================================
# CONFIGURATION
# =============================================================================

$ScriptVersion = "2.0.0"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogFile = Join-Path $ScriptDir "..\logs\secret-rotation.log"
$BackupDir = Join-Path $ScriptDir "..\backups\secrets"
$ConfigFile = Join-Path $ScriptDir "..\config\secret-rotation.conf"

# Environment variables
$OldSecret = $env:VAUNTICO_SECRET
$NewSecret = ""
$BackupEnabled = -not $NoBackup
$NotificationsEnabled = -not $NoNotifications
$RollbackOnFailure = -not $NoRollback

# Environment-specific settings
switch ($Environment) {
    "production" {
        $SlackWebhookUrl = $env:SLACK_WEBHOOK_URL
        $LogLevel = "INFO"
        $VerificationTimeout = 300
    }
    "staging" {
        $SlackWebhookUrl = $env:STAGING_SLACK_WEBHOOK_URL
        $LogLevel = "DEBUG"
        $VerificationTimeout = 180
    }
    default {
        $SlackWebhookUrl = $env:DEV_SLACK_WEBHOOK_URL
        $LogLevel = "DEBUG"
        $VerificationTimeout = 60
    }
}

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

# Initialize logging
function Setup-Logging {
    # Create directories
    New-Item -ItemType Directory -Force -Path (Split-Path $LogFile) | Out-Null
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    
    # Initialize log file
    if (-not (Test-Path $LogFile)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "[$timestamp] [INFO] Secret rotation log initialized (v$ScriptVersion)" | Out-File -FilePath $LogFile -Encoding UTF8
    }
}

# Structured logging function
function Log-RotationEvent {
    param(
        [string]$Level,
        [string]$Message,
        [string]$Details = ""
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Create structured log entry
    $logEntry = @{
        timestamp = $timestamp
        level = $Level
        message = $Message
        secret_name = $SecretName
        environment = $Environment
        script_version = $ScriptVersion
        pid = $PID
    }
    
    if ($Details) {
        $logEntry.details = $Details | ConvertFrom-Json
    }
    
    $jsonLogEntry = $logEntry | ConvertTo-Json -Compress
    $jsonLogEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
    
    # Console output with color coding
    switch ($Level) {
        "ERROR" {
            Write-Host "[$Level] $Message" -ForegroundColor Red
        }
        "WARN" {
            Write-Host "[$Level] $Message" -ForegroundColor Yellow
        }
        "INFO" {
            Write-Host "[$Level] $Message" -ForegroundColor Green
        }
        "DEBUG" {
            Write-Host "[$Level] $Message" -ForegroundColor Cyan
        }
        default {
            Write-Host "[$Level] $Message"
        }
    }
}

# =============================================================================
# SECRET GENERATION
# =============================================================================

# Generate a new cryptographically secure secret
function Generate-NewSecret {
    $secretType = $env:SECRET_TYPE
    if (-not $secretType) { $secretType = "alphanumeric" }
    
    Log-RotationEvent "DEBUG" "Generating new secret" (@{length = $SecretLength; type = $secretType} | ConvertTo-Json -Compress)
    
    try {
        switch ($secretType) {
            "alphanumeric" {
                $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes($SecretLength)
                $secret = [System.Convert]::ToBase64String($bytes) -replace '[/+=]', '' -replace '.{32}', '$0'
                $NewSecret = $secret.Substring(0, [Math]::Min($SecretLength, $secret.Length))
            }
            "hex" {
                $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes([Math]::Ceiling($SecretLength / 2))
                $NewSecret = ([System.BitConverter]::ToString($bytes)).Replace("-", "").ToLower().Substring(0, $SecretLength)
            }
            "base64" {
                $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes($SecretLength)
                $NewSecret = [System.Convert]::ToBase64String($bytes)
            }
            "uuid" {
                $NewSecret = [System.Guid]::NewGuid().ToString("N")
            }
            default {
                Log-RotationEvent "ERROR" "Unsupported secret type: $secretType"
                throw "Unsupported secret type: $secretType"
            }
        }
        
        if (-not $NewSecret -or $NewSecret.Length -lt ($SecretLength / 2)) {
            Log-RotationEvent "ERROR" "Failed to generate valid secret"
            throw "Failed to generate valid secret"
        }
        
        Log-RotationEvent "INFO" "Generated new secret" (@{length = $NewSecret.Length} | ConvertTo-Json -Compress)
        return $NewSecret
    }
    catch {
        Log-RotationEvent "ERROR" "Secret generation failed: $($_.Exception.Message)"
        throw
    }
}

# =============================================================================
# SECRET MANAGEMENT FUNCTIONS
# =============================================================================

# Update secret in target systems
function Update-SecretInSystem {
    param([string]$SecretValue)
    
    Log-RotationEvent "INFO" "Starting secret update in target systems"
    
    $updateCount = 0
    $failedUpdates = @()
    
    # Update environment files
    $envFile = ".env"
    if (Test-Path $envFile) {
        Log-RotationEvent "DEBUG" "Updating .env file"
        if (-not $DryRun) {
            try {
                $content = Get-Content $envFile
                $updatedContent = $content -replace '^VAUNTICO_SECRET=.*', "VAUNTICO_SECRET=$SecretValue"
                
                if ($updatedContent -join "`n" -eq $content -join "`n") {
                    # Secret not found, add it
                    $SecretValue | Out-File -FilePath $envFile -Append -Encoding UTF8
                } else {
                    # Secret found and updated
                    $updatedContent | Out-File -FilePath $envFile -Encoding UTF8
                }
                
                $updateCount++
                Log-RotationEvent "DEBUG" ".env file updated successfully"
            }
            catch {
                $failedUpdates += ".env file"
                Log-RotationEvent "WARN" "Failed to update .env file: $($_.Exception.Message)"
            }
        }
        else {
            Log-RotationEvent "DEBUG" "DRY RUN: Would update .env file"
        }
    }
    
    # Update server-v2 .env
    $serverEnvFile = "server-v2\.env"
    if (Test-Path $serverEnvFile) {
        Log-RotationEvent "DEBUG" "Updating server-v2\.env file"
        if (-not $DryRun) {
            try {
                $content = Get-Content $serverEnvFile
                $updatedContent = $content -replace '^VAUNTICO_SECRET=.*', "VAUNTICO_SECRET=$SecretValue"
                
                if ($updatedContent -join "`n" -eq $content -join "`n") {
                    $SecretValue | Out-File -FilePath $serverEnvFile -Append -Encoding UTF8
                } else {
                    $updatedContent | Out-File -FilePath $serverEnvFile -Encoding UTF8
                }
                
                $updateCount++
                Log-RotationEvent "DEBUG" "server-v2\.env file updated successfully"
            }
            catch {
                $failedUpdates += "server-v2\.env file"
                Log-RotationEvent "WARN" "Failed to update server-v2\.env file: $($_.Exception.Message)"
            }
        }
        else {
            Log-RotationEvent "DEBUG" "DRY RUN: Would update server-v2\.env file"
        }
    }
    
    # Update GitHub Actions secrets (if gh CLI is available)
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Log-RotationEvent "DEBUG" "Updating GitHub Actions secrets"
        if (-not $DryRun) {
            try {
                $SecretValue | gh secret set VAUNTICO_SECRET
                $updateCount++
                Log-RotationEvent "DEBUG" "GitHub secret updated successfully"
            }
            catch {
                $failedUpdates += "GitHub Actions"
                Log-RotationEvent "WARN" "Failed to update GitHub secret: $($_.Exception.Message)"
            }
        }
        else {
            Log-RotationEvent "DEBUG" "DRY RUN: Would update GitHub Actions secret"
        }
    }
    
    # Update Vercel environment variables (if Vercel CLI is available)
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        Log-RotationEvent "DEBUG" "Updating Vercel environment variables"
        if (-not $DryRun) {
            try {
                echo $SecretValue | vercel env add VAUNTICO_SECRET production
                $updateCount++
                Log-RotationEvent "DEBUG" "Vercel secret updated successfully"
            }
            catch {
                $failedUpdates += "Vercel"
                Log-RotationEvent "WARN" "Failed to update Vercel secret: $($_.Exception.Message)"
            }
        }
        else {
            Log-RotationEvent "DEBUG" "DRY RUN: Would update Vercel secret"
        }
    }
    
    $successCount = $updateCount
    $totalCount = $successCount + $failedUpdates.Count
    
    if ($successCount -gt 0) {
        Log-RotationEvent "INFO" "Secret update completed" (@{success_count = $successCount; total_count = $totalCount} | ConvertTo-Json -Compress)
    }
    else {
        Log-RotationEvent "ERROR" "All secret updates failed" (@{failed_updates = $failedUpdates} | ConvertTo-Json -Compress)
        throw "All secret updates failed"
    }
    
    if ($failedUpdates.Count -gt 0) {
        Log-RotationEvent "WARN" "Some secret updates failed" (@{failed_updates = $failedUpdates} | ConvertTo-Json -Compress)
    }
}

# Revoke old secret
function Revoke-OldSecret {
    Log-RotationEvent "INFO" "Starting old secret revocation"
    
    $revokedCount = 0
    $failedRevocations = @()
    
    # Backup old secret before revocation
    if ($BackupEnabled -and $OldSecret) {
        $backupFile = Join-Path $BackupDir "$($SecretName)_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak"
        $OldSecret | Out-File -FilePath $backupFile -Encoding UTF8
        
        # Set file permissions (PowerShell equivalent of chmod 600)
        $acl = Get-Acl $backupFile
        $acl.SetAccessRuleProtection($true, $false)
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl $backupFile $acl
        
        Log-RotationEvent "INFO" "Old secret backed up" (@{backup_file = $backupFile} | ConvertTo-Json -Compress)
    }
    
    # Clear old secret from memory
    if ($OldSecret) {
        $OldSecret = ""
        Log-RotationEvent "DEBUG" "Old secret cleared from memory"
    }
    
    Log-RotationEvent "INFO" "Secret revocation completed" (@{revoked_count = $revokedCount} | ConvertTo-Json -Compress)
}

# =============================================================================
# NOTIFICATION FUNCTIONS
# =============================================================================

# Send notification to stakeholders
function Notify-Stakeholders {
    param(
        [string]$Message,
        [string]$Severity = "INFO"
    )
    
    if (-not $NotificationsEnabled) {
        Log-RotationEvent "DEBUG" "Notifications disabled, skipping"
        return
    }
    
    Log-RotationEvent "DEBUG" "Sending stakeholder notifications"
    
    # Send Slack notification
    if ($SlackWebhookUrl) {
        try {
            $slackColor = "good"
            $slackEmoji = "✅"
            
            switch ($Severity) {
                "ERROR" {
                    $slackColor = "danger"
                    $slackEmoji = "❌"
                }
                "WARN" {
                    $slackColor = "warning"
                    $slackEmoji = "⚠️"
                }
            }
            
            $slackPayload = @{
                text = "$slackEmoji Secret Rotation: $Severity"
                attachments = @(
                    @{
                        color = $slackColor
                        fields = @(
                            @{
                                title = "Message"
                                value = $Message
                                short = $false
                            }
                            @{
                                title = "Secret Name"
                                value = $SecretName
                                short = $true
                            }
                            @{
                                title = "Environment"
                                value = $Environment
                                short = $true
                            }
                            @{
                                title = "Timestamp"
                                value = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
                                short = $true
                            }
                            @{
                                title = "Script Version"
                                value = $ScriptVersion
                                short = $true
                            }
                        )
                    }
                )
            } | ConvertTo-Json -Depth 10
            
            Invoke-RestMethod -Uri $SlackWebhookUrl -Method Post -ContentType "application/json" -Body $slackPayload | Out-Null
            Log-RotationEvent "DEBUG" "Slack notification sent successfully"
        }
        catch {
            Log-RotationEvent "WARN" "Failed to send Slack notification: $($_.Exception.Message)"
        }
    }
    
    # Send email notification (if email service is configured)
    if ($env:RESEND_API_KEY -and $env:ADMIN_EMAIL) {
        try {
            $emailSubject = "Secret Rotation $($Severity): $($SecretName) ($($Environment))"
            $emailBody = @"
Secret rotation event:

$Message

Secret: $SecretName
Environment: $Environment
Timestamp: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
Script Version: $ScriptVersion
"@
            
            $emailPayload = @{
                from = "noreply@vauntico.com"
                to = @($env:ADMIN_EMAIL)
                subject = $emailSubject
                text = $emailBody
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "https://api.resend.com/emails" -Method Post -ContentType "application/json" -Headers @{
                Authorization = "Bearer $($env:RESEND_API_KEY)"
            } -Body $emailPayload | Out-Null
            
            Log-RotationEvent "DEBUG" "Email notification sent successfully"
        }
        catch {
            Log-RotationEvent "WARN" "Failed to send email notification: $($_.Exception.Message)"
        }
    }
}

# =============================================================================
# VERIFICATION FUNCTIONS
# =============================================================================

# Verify secret update was successful
function Test-SecretUpdate {
    param([string]$ExpectedSecret)
    
    $verificationStart = Get-Date
    Log-RotationEvent "INFO" "Starting secret verification"
    
    $verificationPassed = $true
    $verificationResults = @()
    
    # Verify environment files
    $envFile = ".env"
    if (Test-Path $envFile) {
        try {
            $content = Get-Content $envFile | Where-Object { $_ -match "^VAUNTICO_SECRET=" }
            $currentSecret = ($content -split "=", 2)[1]
            
            if ($currentSecret -eq $ExpectedSecret) {
                $verificationResults += ".env: PASS"
                Log-RotationEvent "DEBUG" ".env verification passed"
            }
            else {
                $verificationResults += ".env: FAIL"
                $verificationPassed = $false
                Log-RotationEvent "ERROR" ".env verification failed"
            }
        }
        catch {
            $verificationResults += ".env: ERROR"
            $verificationPassed = $false
            Log-RotationEvent "ERROR" ".env verification error: $($_.Exception.Message)"
        }
    }
    
    $serverEnvFile = "server-v2\.env"
    if (Test-Path $serverEnvFile) {
        try {
            $content = Get-Content $serverEnvFile | Where-Object { $_ -match "^VAUNTICO_SECRET=" }
            $currentSecret = ($content -split "=", 2)[1]
            
            if ($currentSecret -eq $ExpectedSecret) {
                $verificationResults += "server-v2\.env: PASS"
                Log-RotationEvent "DEBUG" "server-v2\.env verification passed"
            }
            else {
                $verificationResults += "server-v2\.env: FAIL"
                $verificationPassed = $false
                Log-RotationEvent "ERROR" "server-v2\.env verification failed"
            }
        }
        catch {
            $verificationResults += "server-v2\.env: ERROR"
            $verificationPassed = $false
            Log-RotationEvent "ERROR" "server-v2\.env verification error: $($_.Exception.Message)"
        }
    }
    
    # Verify application can start with new secret (health check)
    if (Get-Command curl -ErrorAction SilentlyContinue) {
        $healthUrl = "$($env:FRONTEND_URL -or "http://localhost:3000")/health"
        $healthTimeout = 10
        $maxAttempts = 3
        $attempt = 1
        
        while ($attempt -le $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec $healthTimeout -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    $verificationResults += "health_check: PASS"
                    Log-RotationEvent "DEBUG" "Health check passed on attempt $attempt"
                    break
                }
            }
            catch {
                Log-RotationEvent "DEBUG" "Health check failed on attempt $attempt"
            }
            
            $attempt++
            Start-Sleep -Seconds 2
        }
        
        if ($attempt -gt $maxAttempts) {
            $verificationResults += "health_check: FAIL"
            $verificationPassed = $false
            Log-RotationEvent "ERROR" "Health check failed after $maxAttempts attempts"
        }
    }
    
    $verificationEnd = Get-Date
    $verificationDuration = ($verificationEnd - $verificationStart).TotalSeconds
    
    Log-RotationEvent "INFO" "Verification completed" (@{passed = $verificationPassed; duration = [int]$verificationDuration; results = $verificationResults} | ConvertTo-Json -Compress)
    
    return $verificationPassed
}

# =============================================================================
# ERROR HANDLING AND ROLLBACK
# =============================================================================

# Rollback to previous secret
function Undo-SecretRotation {
    Log-RotationEvent "WARN" "Initiating secret rollback"
    
    if (-not $OldSecret) {
        Log-RotationEvent "ERROR" "Cannot rollback: old secret not available"
        throw "Cannot rollback: old secret not available"
    }
    
    # Restore from backup if available
    $latestBackup = Get-ChildItem (Join-Path $BackupDir "$SecretName_*.bak") | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestBackup) {
        $OldSecret = Get-Content $latestBackup.FullName
        Log-RotationEvent "INFO" "Restored old secret from backup" (@{backup_file = $latestBackup.FullName} | ConvertTo-Json -Compress)
    }
    
    # Update systems with old secret
    try {
        Update-SecretInSystem $OldSecret
        Log-RotationEvent "INFO" "Rollback completed successfully"
        Notify-Stakeholders "Secret rotation was rolled back due to verification failure" "WARN"
    }
    catch {
        Log-RotationEvent "ERROR" "Rollback failed: $($_.Exception.Message)"
        Notify-Stakeholders "CRITICAL: Secret rotation rollback failed - manual intervention required" "ERROR"
        throw
    }
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

# Main rotation workflow
function Invoke-SecretRotation {
    try {
        Log-RotationEvent "INFO" "Starting secret rotation for $SecretName"
        Notify-Stakeholders "Starting secret rotation for $SecretName in $Environment environment"
        
        # Generate new secret
        $NewSecret = Generate-NewSecret
        
        if (-not $NewSecret) {
            Log-RotationEvent "ERROR" "Failed to generate new secret"
            throw "Failed to generate new secret"
        }
        
        # Update secret in all target systems
        Update-SecretInSystem $NewSecret
        Log-RotationEvent "INFO" "Secret update completed successfully"
        
        # Verify update
        if (Test-SecretUpdate $NewSecret) {
            Log-RotationEvent "INFO" "Secret verification passed"
            
            # Revoke old secret
            Revoke-OldSecret
            
            Log-RotationEvent "INFO" "Secret rotation completed successfully for $SecretName"
            Notify-Stakeholders "Secret rotation completed successfully for $SecretName in $Environment environment"
        }
        else {
            Log-RotationEvent "ERROR" "Secret verification failed"
            
            if ($RollbackOnFailure) {
                Undo-SecretRotation
            }
            
            Notify-Stakeholders "Secret rotation verification failed for $SecretName in $Environment environment" "ERROR"
            throw "Secret rotation verification failed"
        }
    }
    catch {
        Log-RotationEvent "ERROR" "Secret rotation failed: $($_.Exception.Message)"
        
        if ($RollbackOnFailure) {
            try {
                Undo-SecretRotation
            }
            catch {
                Log-RotationEvent "ERROR" "Rollback failed: $($_.Exception.Message)"
            }
        }
        
        Notify-Stakeholders "Secret rotation script failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Show help
if ($Help) {
    Write-Host "Vauntico Secret Rotation Script v$ScriptVersion"
    Write-Host ""
    Write-Host "Usage: .\secret-rotation.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -DryRun                Simulate rotation without making changes"
    Write-Host "  -Environment ENV        Target environment (development|staging|production)"
    Write-Host "  -SecretName NAME       Name of secret to rotate"
    Write-Host "  -SecretLength LENGTH    Length of generated secret (default: 32)"
    Write-Host "  -NoBackup             Disable secret backup"
    Write-Host "  -NoNotifications      Disable stakeholder notifications"
    Write-Host "  -NoRollback           Disable automatic rollback on failure"
    Write-Host "  -Help                 Show this help message"
    Write-Host ""
    Write-Host "Environment Variables:"
    Write-Host "  VAUNTICO_SECRET         Current secret value"
    Write-Host "  SLACK_WEBHOOK_URL       Slack webhook for notifications"
    Write-Host "  RESEND_API_KEY          Email service API key"
    Write-Host "  ADMIN_EMAIL             Email address for notifications"
    Write-Host ""
    exit 0
}

# Initialize logging
Setup-Logging

# Validate environment
if (-not $OldSecret) {
    Log-RotationEvent "WARN" "No old secret provided (VAUNTICO_SECRET not set)"
}

# Run main workflow
Invoke-SecretRotation

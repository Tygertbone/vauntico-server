# VS Code Network Optimization Restoration Script
# This script restores normal VS Code settings after 2.5 hours of network optimization

param(
    [int]$DelayMinutes = 150  # Default: 2.5 hours = 150 minutes
)

Write-Host "VS Code Network Optimization Restoration Script" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Current time: $(Get-Date)" -ForegroundColor Yellow
Write-Host "Will restore normal settings after $DelayMinutes minutes" -ForegroundColor Yellow
Write-Host "Restoration time: $((Get-Date).AddMinutes($DelayMinutes))" -ForegroundColor Yellow
Write-Host ""

# Create a scheduled task to restore settings
$taskName = "RestoreVSCodeSettings"
$scriptPath = "$PSScriptRoot\.vscode\restore-normal-settings.ps1"

# Create the restoration script content
$restoreScript = @"
# VS Code Settings Restoration Script
Write-Host "Restoring VS Code normal network settings..." -ForegroundColor Green
Write-Host "Time: $(Get-Date)" -ForegroundColor Yellow

# Backup current settings
if (Test-Path "$PSScriptRoot\.vscode\settings.json") {
    Copy-Item "$PSScriptRoot\.vscode\settings.json" "$PSScriptRoot\.vscode\settings-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    Write-Host "Current settings backed up" -ForegroundColor Green
}

# Restore normal settings
if (Test-Path "$PSScriptRoot\.vscode\restore-network-settings.json") {
    Copy-Item "$PSScriptRoot\.vscode\restore-network-settings.json" "$PSScriptRoot\.vscode\settings.json"
    Write-Host "Normal VS Code settings restored successfully!" -ForegroundColor Green
    Write-Host "Please restart VS Code to apply all changes." -ForegroundColor Yellow
} else {
    Write-Host "Error: Restore settings file not found!" -ForegroundColor Red
}

# Clean up the scheduled task
Unregister-ScheduledTask -TaskName "$taskName" -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "Scheduled task cleaned up." -ForegroundColor Gray
"@

# Save the restoration script
$restoreScript | Out-File -FilePath $scriptPath -Encoding UTF8
Write-Host "Restoration script created: $scriptPath" -ForegroundColor Green

# Create the scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes($DelayMinutes)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Scheduled task created successfully!" -ForegroundColor Green
Write-Host "Task will run at: $((Get-Date).AddMinutes($DelayMinutes))" -ForegroundColor Yellow

Write-Host ""
Write-Host "Network optimization is now active for the next $DelayMinutes minutes." -ForegroundColor Cyan
Write-Host "To manually restore settings sooner, run: powershell -ExecutionPolicy Bypass -File `"$scriptPath`"" -ForegroundColor Yellow
Write-Host "To cancel the scheduled task: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor Yellow

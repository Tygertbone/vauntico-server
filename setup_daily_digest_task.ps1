# Windows Task Scheduler Setup for Daily Digest Generation
# This script creates a scheduled task that runs generate_digest.py daily at startup

# Get the current directory (should be vauntico-mvp repo root)
$RepoPath = Get-Location
$ScriptPath = Join-Path $RepoPath "generate_digest.py"
$TaskName = "Vauntico Daily Digest Generator"
$TaskDescription = "Generates daily context digest for Vauntico codebase"

Write-Host "Setting up daily digest generator task..." -ForegroundColor Green
Write-Host "Repo Path: $RepoPath" -ForegroundColor Yellow
Write-Host "Script Path: $ScriptPath" -ForegroundColor Yellow

# Check if Python is available
try {
    $PythonVersion = python --version 2>$null
    Write-Host "Python found: $PythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if the digest script exists
if (-not (Test-Path $ScriptPath)) {
    Write-Host "ERROR: generate_digest.py not found in current directory." -ForegroundColor Red
    exit 1
}

# Remove existing task if it exists
try {
    Unregister-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Write-Host "Removed existing task (if any)" -ForegroundColor Yellow
} catch {
    Write-Host "No existing task to remove" -ForegroundColor Gray
}

# Create the scheduled task action
$Action = New-ScheduledTaskAction -Execute "python" -Argument $ScriptPath -WorkingDirectory $RepoPath

# Create trigger for daily at startup + repeat every 24 hours
$Trigger = New-ScheduledTaskTrigger -Daily -At 9am # Run daily at 9 AM
$Trigger.Repetition.Interval = "PT24H" # Repeat every 24 hours

# Create the task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd

# Register the scheduled task
try {
    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest -Force
    Write-Host "✅ Daily digest task created successfully!" -ForegroundColor Green
    Write-Host "Task will run daily at 9:00 AM" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create scheduled task: $_" -ForegroundColor Red
    exit 1
}

# Test the task immediately
try {
    Write-Host "Testing the task..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 5
    
    # Check if task completed successfully
    $TaskStatus = Get-ScheduledTaskInfo -TaskName $TaskName
    if ($TaskStatus.LastTaskResult -eq 0) {
        Write-Host "✅ Test run completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Test run completed with warnings. Check the digest file." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to test the task: $_" -ForegroundColor Red
}

Write-Host "`n📋 Task Summary:" -ForegroundColor Cyan
Write-Host "Task Name: $TaskName" -ForegroundColor White
Write-Host "Schedule: Daily at 9:00 AM" -ForegroundColor White
Write-Host "Output File: $(Join-Path $RepoPath 'daily_digest.md')" -ForegroundColor White
Write-Host "`n💡 To modify schedule:" -ForegroundColor Cyan
Write-Host "1. Open Task Scheduler (taskschd.msc)" -ForegroundColor White
Write-Host "2. Find " -ForegroundColor White -NoNewline
Write-Host $TaskName -ForegroundColor White -NoNewline
Write-Host "'" -ForegroundColor White
Write-Host "3. Right-click Properties Triggers" -ForegroundColor White
Write-Host "`n🚀 To run manually anytime:" -ForegroundColor Cyan
Write-Host "python generate_digest.py" -ForegroundColor White

# Ask if user wants to see the generated digest
$Response = Read-Host "`n📄 Would you like to see the generated digest now? (y/n)"
if ($Response -eq "y" -or $Response -eq "Y") {
    if (Test-Path (Join-Path $RepoPath "daily_digest.md")) {
        Get-Content (Join-Path $RepoPath "daily_digest.md") | Write-Host
    } else {
        Write-Host "Digest file not found. The task may still be running." -ForegroundColor Yellow
    }
}

Write-Host "`n✨ Setup complete! Your daily digest will be ready every morning at 9 AM." -ForegroundColor Green

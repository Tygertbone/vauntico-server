# Enhanced Windows Task Scheduler Setup for Daily Digest Generation with Logging
# This version includes comprehensive logging and error tracking

# Get current directory (should be vauntico-mvp repo root)
$RepoPath = Get-Location
$LogWrapperScript = Join-Path $RepoPath "generate_digest_with_logging.ps1"
$TaskName = "Vauntico Daily Digest Generator (Enhanced)"
$TaskDescription = "Enhanced daily context digest generator with logging for Vauntico codebase"
$LogFile = Join-Path $RepoPath "digest_generation.log"

Write-Host "Setting up enhanced daily digest generator task with logging..." -ForegroundColor Green
Write-Host "Repo Path: $RepoPath" -ForegroundColor Yellow
Write-Host "Log Wrapper Script: $LogWrapperScript" -ForegroundColor Yellow
Write-Host "Log File: $LogFile" -ForegroundColor Yellow

# Check if PowerShell execution policy allows script execution
try {
    $executionPolicy = Get-ExecutionPolicy -Scope CurrentUser
    if ($executionPolicy -eq "Restricted") {
        Write-Host "WARNING: PowerShell execution policy is Restricted. Attempting to set to RemoteSigned..." -ForegroundColor Yellow
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "Execution policy set to RemoteSigned" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Could not set execution policy: $_" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and execute: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Red
    exit 1
}

# Check if Python is available
try {
    $PythonVersion = python --version 2>$null
    Write-Host "Python found: $PythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if log wrapper script exists
if (-not (Test-Path $LogWrapperScript)) {
    Write-Host "ERROR: generate_digest_with_logging.ps1 not found in current directory." -ForegroundColor Red
    exit 1
}

# Check if main digest script exists
$MainScriptPath = Join-Path $RepoPath "generate_digest.py"
if (-not (Test-Path $MainScriptPath)) {
    Write-Host "ERROR: generate_digest.py not found in current directory." -ForegroundColor Red
    exit 1
}

# Remove existing task if it exists
try {
    Unregister-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Write-Host "Removed existing enhanced task (if any)" -ForegroundColor Yellow
    
    # Also remove the simple version if it exists
    Unregister-ScheduledTask -TaskName "Vauntico Daily Digest Generator" -ErrorAction SilentlyContinue
    Write-Host "Removed existing simple task (if any)" -ForegroundColor Yellow
} catch {
    Write-Host "No existing tasks to remove" -ForegroundColor Gray
}

# Create the scheduled task action using PowerShell wrapper
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$LogWrapperScript`"" -WorkingDirectory $RepoPath

# Create trigger for daily at 9 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At 9am
$Trigger.Repetition.Interval = "PT24H"

# Create the task settings with enhanced logging capabilities
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd -WakeToRun

# Register the scheduled task
try {
    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest -Force
    Write-Host "Enhanced daily digest task created successfully!" -ForegroundColor Green
    Write-Host "Task will run daily at 9:00 AM with comprehensive logging" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create scheduled task: $_" -ForegroundColor Red
    exit 1
}

# Test the task immediately
try {
    Write-Host "Testing enhanced task..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 10  # Give it more time to complete with logging
    
    # Check if task completed successfully
    $TaskStatus = Get-ScheduledTaskInfo -TaskName $TaskName
    if ($TaskStatus.LastTaskResult -eq 0) {
        Write-Host "Test run completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Test run completed with warnings. Check the log file." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to test the task: $_" -ForegroundColor Red
}

# Check if log file was created
if (Test-Path $LogFile) {
    Write-Host "Log file created successfully: $LogFile" -ForegroundColor Green
    
    # Show last few log entries
    try {
        $logEntries = Get-Content $LogFile -Tail 5
        Write-Host "Recent log entries:" -ForegroundColor Cyan
        foreach ($entry in $logEntries) {
            Write-Host "  $entry" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Could not read log file entries" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: Log file not found. The task may still be running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Enhanced Task Summary:" -ForegroundColor Cyan
Write-Host "Task Name: $TaskName" -ForegroundColor White
Write-Host "Schedule: Daily at 9:00 AM" -ForegroundColor White
Write-Host "Output File: $(Join-Path $RepoPath 'daily_digest.md')" -ForegroundColor White
Write-Host "Log File: $LogFile" -ForegroundColor White
Write-Host "Features: Comprehensive logging, error tracking, backup creation" -ForegroundColor White
Write-Host ""
Write-Host "Enhanced Features:" -ForegroundColor Cyan
Write-Host "✅ Timestamped logging with color-coded console output" -ForegroundColor White
Write-Host "✅ Automatic backup of previous digest files" -ForegroundColor White
Write-Host "✅ Detailed error reporting and stack traces" -ForegroundColor White
Write-Host "✅ Validation of generated digest content" -ForegroundColor White
Write-Host "✅ Automatic log cleanup (30-day retention)" -ForegroundColor White
Write-Host "✅ Dynamic depth control via parameter" -ForegroundColor White
Write-Host ""
Write-Host "To modify schedule:" -ForegroundColor Cyan
Write-Host "1. Open Task Scheduler (taskschd.msc)" -ForegroundColor White
Write-Host "2. Find '$TaskName'" -ForegroundColor White
Write-Host "3. Right-click → Properties → Triggers" -ForegroundColor White
Write-Host ""
Write-Host "To run manually anytime:" -ForegroundColor Cyan
Write-Host ".\generate_digest_with_logging.ps1" -ForegroundColor White
Write-Host ""
Write-Host "To change depth manually:" -ForegroundColor Cyan
Write-Host ".\generate_digest_with_logging.ps1 -Depth 3" -ForegroundColor White
Write-Host ""
Write-Host "To change log file location:" -ForegroundColor Cyan
Write-Host ".\generate_digest_with_logging.ps1 -LogFile 'C:\custom\path\digest.log'" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor Cyan
Write-Host "Check the log file for detailed execution history: $LogFile" -ForegroundColor White
Write-Host "Look for [SUCCESS], [ERROR], [WARN], and [INFO] entries" -ForegroundColor White

# Ask if user wants to see the generated digest
$Response = Read-Host "Would you like to see the generated digest now? (y/n)"
if ($Response -eq "y" -or $Response -eq "Y") {
    if (Test-Path (Join-Path $RepoPath "daily_digest.md")) {
        Get-Content (Join-Path $RepoPath "daily_digest.md") | Write-Host
    } else {
        Write-Host "Digest file not found. The task may still be running." -ForegroundColor Yellow
    }
}

# Ask if user wants to see the current log
$Response = Read-Host "Would you like to see the current log file? (y/n)"
if ($Response -eq "y" -or $Response -eq "Y") {
    if (Test-Path $LogFile) {
        Write-Host "Current log contents:" -ForegroundColor Cyan
        Get-Content $LogFile | Write-Host
    } else {
        Write-Host "Log file not found." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Enhanced setup complete! Your daily digest with comprehensive logging will be ready every morning at 9 AM." -ForegroundColor Green
Write-Host "You can monitor execution history and troubleshoot issues using the log file." -ForegroundColor Green
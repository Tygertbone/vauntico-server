---

## 🛠️ Alternative Simple Setup

For users who prefer a simpler approach without comprehensive logging, you can use this minimal PowerShell script:

### Simple Daily Digest Script (`run_daily_digest.ps1`)

```powershell
# Path setup
$repoPath = "C:\Users\admin\vauntico-mvp"
$scriptPath = Join-Path $repoPath "generate_digest.py"
$logFile = Join-Path $repoPath "digest_log.txt"

# Timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Run Python script and capture result
try {
    python $scriptPath
    $message = "$timestamp - SUCCESS: Digest generated."
} catch {
    $message = "$timestamp - ERROR: Digest generation failed. $_"
}

# Append to log file
Add-Content -Path $logFile -Value $message
```

### Simple Task Scheduler Setup

```powershell
# Create simple task
$Action = New-ScheduledTaskAction -Execute "python" -Argument $scriptPath -WorkingDirectory $repoPath
$Trigger = New-ScheduledTaskTrigger -Daily -At 9am
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "Simple Daily Digest" -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest
```

### Benefits of Simple Approach

✅ **Quick Verification**: Just open `digest_log.txt` to confirm daily runs  
✅ **Error Visibility**: Failures are logged with details for debugging  
✅ **Audit Trail**: You'll have a full history of digest generation over time  
✅ **Minimal Overhead**: Simple, reliable execution without complex logging infrastructure

This provides a lightweight alternative while maintaining the core benefits of automated daily digest generation.

# Enhanced PowerShell wrapper for daily digest generation with logging
# This script wraps the Python digest generator and adds comprehensive logging

param(
    [string]$LogPath = "C:\Users\admin\vauntico-mvp\digest_generation.log",
    [string]$RepoPath = "C:\Users\admin\vauntico-mvp",
    [int]$Depth = 2
)

# Function to write timestamped log entries
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to log file
    Add-Content -Path $LogPath -Value $logEntry
    
    # Also write to console with color coding
    switch ($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry -ForegroundColor White }
    }
}

# Function to check if digest was actually generated
function Test-DigestGenerated {
    $digestPath = Join-Path $RepoPath "daily_digest.md"
    if (Test-Path $digestPath) {
        $content = Get-Content $digestPath -Raw
        if ($content -match "## 📅 Digest Date" -and $content -match "## 🎯 Current Mission") {
            return $true
        }
    }
    return $false
}

# Main execution
try {
    Write-Log "Starting daily digest generation" "INFO"
    Write-Log "Repository path: $RepoPath" "INFO"
    Write-Log "Log file: $LogPath" "INFO"
    Write-Log "Tree depth: $Depth" "INFO"
    
    # Check if Python is available
    try {
        $pythonVersion = python --version 2>$null
        Write-Log "Python found: $pythonVersion" "SUCCESS"
    } catch {
        Write-Log "Python not found or not in PATH" "ERROR"
        exit 1
    }
    
    # Check if digest script exists
    $scriptPath = Join-Path $RepoPath "generate_digest.py"
    if (-not (Test-Path $scriptPath)) {
        Write-Log "generate_digest.py not found at: $scriptPath" "ERROR"
        exit 1
    }
    Write-Log "Digest script found at: $scriptPath" "SUCCESS"
    
    # Check if we're in a git repository
    try {
        $gitStatus = git -C $RepoPath status --porcelain 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Git repository confirmed" "SUCCESS"
        } else {
            Write-Log "Not a git repository or git commands failing" "WARN"
        }
    } catch {
        Write-Log "Git commands not available" "WARN"
    }
    
    # Backup previous digest if it exists
    $digestPath = Join-Path $RepoPath "daily_digest.md"
    if (Test-Path $digestPath) {
        $backupPath = Join-Path $RepoPath "daily_digest_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
        Copy-Item $digestPath $backupPath
        Write-Log "Previous digest backed up to: $(Split-Path $backupPath -Leaf)" "INFO"
    }
    
    # Run the digest generation
    Write-Log "Executing digest generation script..." "INFO"
    
    try {
        # Modify the Python script to use dynamic depth
        $pythonScript = Get-Content $scriptPath -Raw
        $modifiedScript = $pythonScript -replace 'def get_repo_tree\(path, depth=2\):', "def get_repo_tree(path, depth=$Depth):"
        
        $tempScriptPath = Join-Path $RepoPath "generate_digest_temp.py"
        Set-Content -Path $tempScriptPath -Value $modifiedScript
        
        $result = python $tempScriptPath 2>&1
        $exitCode = $LASTEXITCODE
        
        # Clean up temp script
        Remove-Item $tempScriptPath -ErrorAction SilentlyContinue
        
        if ($exitCode -eq 0) {
            Write-Log "Python script executed successfully" "SUCCESS"
            Write-Log "Script output: $result" "INFO"
        } else {
            Write-Log "Python script failed with exit code: $exitCode" "ERROR"
            Write-Log "Error output: $result" "ERROR"
            throw "Python script execution failed"
        }
    } catch {
        Write-Log "Failed to execute digest generation: $_" "ERROR"
        throw
    }
    
    # Verify digest was generated
    if (Test-DigestGenerated) {
        Write-Log "Daily digest generated successfully!" "SUCCESS"
        
        # Get digest file info
        $digestInfo = Get-Item $digestPath
        Write-Log "Digest file size: $($digestInfo.Length) bytes" "INFO"
        Write-Log "Digest last modified: $($digestInfo.LastWriteTime)" "INFO"
        
        # Count lines for basic validation
        $lineCount = (Get-Content $digestPath | Measure-Object -Line).Lines
        Write-Log "Digest contains $lineCount lines" "INFO"
        
    } else {
        Write-Log "Digest generation appears to have failed - invalid output format" "ERROR"
        exit 1
    }
    
    # Check for common issues
    $content = Get-Content $digestPath -Raw
    
    if ($content -match "Error fetching commits") {
        Write-Log "Warning: Git commit fetching failed" "WARN"
    }
    
    if ($content -match "Error fetching repo tree") {
        Write-Log "Warning: Repository tree generation failed" "WARN"
    }
    
    Write-Log "Daily digest generation completed successfully" "SUCCESS"
    
} catch {
    Write-Log "Fatal error in digest generation: $_" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}

# Cleanup old log files (keep last 30 days)
try {
    $logDir = Split-Path $LogPath -Parent
    $logFiles = Get-ChildItem $logDir -Name "digest_generation*.log" | Where-Object { $_ -ne (Split-Path $LogPath -Leaf) }
    
    foreach ($logFile in $logFiles) {
        $logFilePath = Join-Path $logDir $logFile
        $fileAge = (Get-Date) - (Get-Item $logFilePath).LastWriteTime
        
        if ($fileAge.Days -gt 30) {
            Remove-Item $logFilePath -ErrorAction SilentlyContinue
            Write-Log "Cleaned up old log file: $logFile" "INFO"
        }
    }
} catch {
    Write-Log "Error during log cleanup: $_" "WARN"
}

Write-Log "Script execution finished" "INFO"
# Test script for OCI verification scripts
Write-Host "Testing OCI Verification Scripts..." -ForegroundColor Green

# Test PowerShell script syntax
Write-Host "`nTesting PowerShell script syntax..." -ForegroundColor Blue
try {
    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw '.\scripts\verify-oci-infrastructure.ps1'), [ref]$null)
    Write-Host "✅ PowerShell script syntax is valid" -ForegroundColor Green
}
catch {
    Write-Host "❌ PowerShell script syntax error: $_" -ForegroundColor Red
}

# Test bash script syntax (if Git Bash or WSL available)
Write-Host "`nTesting Bash script syntax..." -ForegroundColor Blue
if (Get-Command bash -ErrorAction SilentlyContinue) {
    try {
        $result = bash -n "./scripts/verify-oci-infrastructure.sh" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Bash script syntax is valid" -ForegroundColor Green
        } else {
            Write-Host "❌ Bash script syntax error: $result" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "⚠️  Could not test bash script (bash not available)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Could not test bash script (bash not available)" -ForegroundColor Yellow
}

# Test PowerShell help functionality
Write-Host "`nTesting PowerShell help functionality..." -ForegroundColor Blue
try {
    $helpOutput = powershell -Command "& { . '.\scripts\verify-oci-infrastructure.ps1' -Help }" 2>&1
    if ($helpOutput -match "Usage:") {
        Write-Host "✅ PowerShell help functionality works" -ForegroundColor Green
    } else {
        Write-Host "❌ PowerShell help functionality failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ PowerShell help functionality error: $_" -ForegroundColor Red
}

Write-Host "`nScript testing completed!" -ForegroundColor Green

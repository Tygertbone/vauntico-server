# Route Verification Test Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ROUTE ACCESSIBILITY TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if App.jsx has all routes defined
Write-Host "1. Checking App.jsx for route definitions..." -ForegroundColor Yellow
$appContent = Get-Content "src\App.jsx" -Raw

$routes = @(
    @{Path="/"; Component="PromptVaultPage"; Description="Homepage"},
    @{Path="/prompt-vault"; Component="PromptVaultPage"; Description="Prompt Vault"},
    @{Path="/vaults"; Component="VaultsPage"; Description="Vaults Page"},
    @{Path="/creator-pass"; Component="CreatorPassPage"; Description="Creator Pass"},
    @{Path="/vault-success"; Component="VaultSuccessPage"; Description="Vault Success"},
    @{Path="/dashboard"; Component="VaultDashboard"; Description="Vault Dashboard"},
    @{Path="/workshop"; Component="WorkshopPage"; Description="Workshop Page"},
    @{Path="/audit-service"; Component="AuditServicePage"; Description="Audit Service Page"}
)

$allRoutesFound = $true
foreach ($route in $routes) {
    $pathPattern = 'path="' + [regex]::Escape($route.Path) + '"'
    $componentPattern = '<' + $route.Component
    
    if ($appContent -match $pathPattern -and $appContent -match $componentPattern) {
        Write-Host "   ✓ $($route.Path) → $($route.Component)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $($route.Path) → $($route.Component) [NOT FOUND]" -ForegroundColor Red
        $allRoutesFound = $false
    }
}

Write-Host ""
Write-Host "2. Verifying component files exist..." -ForegroundColor Yellow

$components = @(
    @{File="src\components\PromptVaultPage.jsx"; Name="PromptVaultPage"},
    @{File="src\components\VaultsPage.jsx"; Name="VaultsPage"},
    @{File="src\components\CreatorPassPage.jsx"; Name="CreatorPassPage"},
    @{File="src\components\VaultSuccessPage.jsx"; Name="VaultSuccessPage"},
    @{File="src\components\VaultDashboard.jsx"; Name="VaultDashboard"},
    @{File="src\pages\WorkshopPage.jsx"; Name="WorkshopPage"},
    @{File="src\pages\AuditServicePage.jsx"; Name="AuditServicePage"}
)

$allComponentsExist = $true
foreach ($comp in $components) {
    if (Test-Path $comp.File) {
        Write-Host "   ✓ $($comp.Name) exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $($comp.Name) [MISSING]" -ForegroundColor Red
        $allComponentsExist = $false
    }
}

Write-Host ""
Write-Host "3. Checking for JSX syntax errors..." -ForegroundColor Yellow

$criticalFiles = @("src\App.jsx", "src\pages\WorkshopPage.jsx", "src\pages\AuditServicePage.jsx", "src\components\VaultDashboard.jsx")
$syntaxErrors = $false

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check for escaped quotes in JSX attributes
        if ($content -match 'path=\\"' -or $content -match 'className=\\"') {
            Write-Host "   ✗ $($file) has escaped quotes in JSX attributes" -ForegroundColor Red
            $syntaxErrors = $true
        }
        
        # Check for problematic JSX patterns (e.g., <1hr in JSX content)
        if ($content -match '>\s*<\d') {
            Write-Host "   ✗ $($file) has invalid JSX pattern (e.g., <1hr)" -ForegroundColor Red
            $syntaxErrors = $true
        }
    }
}

if (-not $syntaxErrors) {
    Write-Host "   ✓ No JSX syntax errors found in critical files" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Testing build process..." -ForegroundColor Yellow

$buildOutput = npm run build 2>&1 | Out-String
if ($buildOutput -match "built in" -and $LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Build successful" -ForegroundColor Green
    $buildSuccess = $true
    
    # Extract build time
    if ($buildOutput -match "built in (\d+\.\d+)s") {
        Write-Host "   Build completed in $($Matches[1])s" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ✗ Build failed" -ForegroundColor Red
    $buildSuccess = $false
    if ($buildOutput -match "ERROR:.*") {
        Write-Host "   Error: $($Matches[0])" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5. Checking dev server compatibility..." -ForegroundColor Yellow

# Check if package.json has dev script
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.scripts.dev) {
    Write-Host "   ✓ Dev server script configured: $($packageJson.scripts.dev)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Dev server script not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($allRoutesFound -and $allComponentsExist -and -not $syntaxErrors -and $buildSuccess) {
    Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "Your application is ready! Start the dev server with:" -ForegroundColor Green
    Write-Host "  npm run dev" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host "Available routes:" -ForegroundColor Cyan
    foreach ($route in $routes) {
        Write-Host "  • http://localhost:5173$($route.Path)" -ForegroundColor White -NoNewline
        Write-Host " - $($route.Description)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "All routes are properly configured and ready to render! 🎉" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red -BackgroundColor DarkRed
    Write-Host ""
    if (-not $allRoutesFound) { Write-Host "  - Not all routes are defined in App.jsx" -ForegroundColor Red }
    if (-not $allComponentsExist) { Write-Host "  - Some component files are missing" -ForegroundColor Red }
    if ($syntaxErrors) { Write-Host "  - JSX syntax errors detected" -ForegroundColor Red }
    if (-not $buildSuccess) { Write-Host "  - Build process failed" -ForegroundColor Red }
}

Write-Host ""

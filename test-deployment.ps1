# Pre-Deployment Test Script for Vauntico MVP
# Run this before deploying to Vercel to catch issues early

Write-Host "🔍 Vauntico Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$ErrorCount = 0

# Test 1: Check Node.js version
Write-Host "✓ Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)") {
    $major = [int]$matches[1]
    if ($major -ge 18) {
        Write-Host "  ✅ Node.js $nodeVersion (OK)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Node.js $nodeVersion (Need v18+)" -ForegroundColor Red
        $ErrorCount++
    }
}

# Test 2: Check pnpm
Write-Host "`n✓ Checking pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if ($pnpmVersion) {
    Write-Host "  ✅ pnpm $pnpmVersion installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  pnpm not found (Vercel will use it anyway)" -ForegroundColor Yellow
}

# Test 3: Check critical files
Write-Host "`n✓ Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "package.json",
    "vite.config.js",
    "vercel.json",
    "index.html",
    "src/main.jsx",
    "src/App.jsx"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING!)" -ForegroundColor Red
        $ErrorCount++
    }
}

# Test 4: Check environment variables
Write-Host "`n✓ Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "env.example") {
    Write-Host "  ✅ env.example exists (template ready)" -ForegroundColor Green
    Write-Host "  ⚠️  Remember to add these to Vercel!" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  env.example not found" -ForegroundColor Yellow
}

# Test 5: Check package.json scripts
Write-Host "`n✓ Checking build scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.build) {
    Write-Host "  ✅ Build script: $($packageJson.scripts.build)" -ForegroundColor Green
} else {
    Write-Host "  ❌ No build script found!" -ForegroundColor Red
    $ErrorCount++
}

# Test 6: Check vercel.json configuration
Write-Host "`n✓ Checking Vercel configuration..." -ForegroundColor Yellow
$vercelJson = Get-Content "vercel.json" | ConvertFrom-Json
if ($vercelJson.buildCommand) {
    Write-Host "  ✅ Build command: $($vercelJson.buildCommand)" -ForegroundColor Green
}
if ($vercelJson.outputDirectory) {
    Write-Host "  ✅ Output directory: $($vercelJson.outputDirectory)" -ForegroundColor Green
}
if ($vercelJson.rewrites) {
    Write-Host "  ✅ SPA rewrites configured" -ForegroundColor Green
}

# Test 7: Try to install dependencies
Write-Host "`n✓ Testing dependency installation..." -ForegroundColor Yellow
Write-Host "  This may take a moment..." -ForegroundColor Gray

$installOutput = pnpm install --frozen-lockfile 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Dependency installation failed!" -ForegroundColor Red
    Write-Host "  Error: $installOutput" -ForegroundColor Red
    $ErrorCount++
}

# Test 8: Try to build
Write-Host "`n✓ Testing production build..." -ForegroundColor Yellow
Write-Host "  This may take a moment..." -ForegroundColor Gray

$buildOutput = pnpm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Build completed successfully!" -ForegroundColor Green
    
    # Check dist folder
    if (Test-Path "dist") {
        $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object
        Write-Host "  ✅ dist/ folder created ($($distFiles.Count) files)" -ForegroundColor Green
        
        # Check for index.html
        if (Test-Path "dist/index.html") {
            Write-Host "  ✅ index.html generated" -ForegroundColor Green
        } else {
            Write-Host "  ❌ index.html not found in dist!" -ForegroundColor Red
            $ErrorCount++
        }
    } else {
        Write-Host "  ❌ dist/ folder not created!" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "  ❌ Build failed!" -ForegroundColor Red
    Write-Host "  Error: $buildOutput" -ForegroundColor Red
    $ErrorCount++
}

# Test 9: Check public assets
Write-Host "`n✓ Checking public assets..." -ForegroundColor Yellow
$publicAssets = @("favicon.ico", "robots.txt")
foreach ($asset in $publicAssets) {
    if (Test-Path "public/$asset") {
        Write-Host "  ✅ public/$asset" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  public/$asset (optional but recommended)" -ForegroundColor Yellow
    }
}

# Final Report
Write-Host "`n================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`n✅ Your project is READY for deployment!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Add environment variables in Vercel" -ForegroundColor White
    Write-Host "2. Click 'Deploy' button" -ForegroundColor White
    Write-Host "3. Wait 2-4 minutes" -ForegroundColor White
    Write-Host "4. Add custom domain (vault.vauntico.com)" -ForegroundColor White
    Write-Host "5. Test the live site`n" -ForegroundColor White
} else {
    Write-Host "❌ FOUND $ErrorCount ERROR(S)" -ForegroundColor Red
    Write-Host "`n⚠️  Fix these issues before deploying!" -ForegroundColor Yellow
    Write-Host "Review the errors above and make necessary corrections.`n" -ForegroundColor Yellow
}

# Preview size
if (Test-Path "dist") {
    $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📦 Build size: $($distSize.ToString('0.00')) MB" -ForegroundColor Cyan
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

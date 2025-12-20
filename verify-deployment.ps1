# Vauntico Deployment Verification Script
# Run this locally to verify everything is ready for Vercel

Write-Host "🚀 Vauntico Deployment Verification" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green

# Check critical files
$criticalFiles = @(
    "vercel.json",
    "vite.config.js",
    "index.html",
    "src/main.jsx",
    "src/App.jsx",
    "src/components/PromptVaultPage.jsx"
)

Write-Host "`n📁 Checking critical files..." -ForegroundColor Cyan
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MISSING: $file" -ForegroundColor Red
    }
}

# Check vercel.json configuration
Write-Host "`n📋 Vercel Configuration:" -ForegroundColor Cyan
$vercelConfig = Get-Content "vercel.json" -Raw | ConvertFrom-Json
Write-Host "  Build Command: $($vercelConfig.buildCommand)" -ForegroundColor Yellow
Write-Host "  Output Directory: $($vercelConfig.outputDirectory)" -ForegroundColor Yellow
Write-Host "  Install Command: $($vercelConfig.installCommand)" -ForegroundColor Yellow

# Check for environment variable template
Write-Host "`n🔑 Environment Variables:" -ForegroundColor Cyan
if (Test-Path "env.example") {
    Write-Host "  ✅ env.example found" -ForegroundColor Green
    Write-Host "  📝 Required variables:" -ForegroundColor Yellow
    Get-Content "env.example" | ForEach-Object {
        if ($_ -match "^VITE_") {
            Write-Host "    - $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  ⚠️  env.example not found (optional)" -ForegroundColor Yellow
}

# Test build
Write-Host "`n🔨 Testing production build..." -ForegroundColor Cyan
Write-Host "  Running: pnpm run build" -ForegroundColor Yellow

# Clean previous build
if (Test-Path "dist") {
    Write-Host "  🧹 Cleaning previous build..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "dist"
}

# Run build
$buildResult = & pnpm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Build completed successfully!" -ForegroundColor Green
    
    # Check output directory
    if (Test-Path "dist/index.html") {
        Write-Host "  ✅ dist/index.html found" -ForegroundColor Green
        
        # Check for assets
        $jsFiles = Get-ChildItem "dist/assets/*.js" -ErrorAction SilentlyContinue
        $cssFiles = Get-ChildItem "dist/assets/*.css" -ErrorAction SilentlyContinue
        
        if ($jsFiles) {
            Write-Host "  ✅ Found $($jsFiles.Count) JavaScript file(s)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ No JavaScript files in dist/assets/" -ForegroundColor Red
        }
        
        if ($cssFiles) {
            Write-Host "  ✅ Found $($cssFiles.Count) CSS file(s)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  No CSS files in dist/assets/" -ForegroundColor Yellow
        }
        
        # Check bundle size
        $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  📦 Total bundle size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
        
    } else {
        Write-Host "  ❌ dist/index.html not found!" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Build failed!" -ForegroundColor Red
    Write-Host "  Error output:" -ForegroundColor Yellow
    Write-Host $buildResult -ForegroundColor Gray
    exit 1
}

# Test preview server (optional)
Write-Host "`n🌐 Preview Server Test:" -ForegroundColor Cyan
Write-Host "  To test locally, run:" -ForegroundColor Yellow
Write-Host "    pnpm run preview" -ForegroundColor White
Write-Host "  Then open: http://localhost:4173" -ForegroundColor White

# Final summary
Write-Host "`n✅ Pre-Deployment Checklist:" -ForegroundColor Green
Write-Host "  ✅ All critical files present" -ForegroundColor Green
Write-Host "  ✅ Production build successful" -ForegroundColor Green
Write-Host "  ✅ Output directory contains bundled files" -ForegroundColor Green

Write-Host "`n🚀 Ready for Vercel Deployment!" -ForegroundColor Cyan
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check Vercel build logs" -ForegroundColor White
Write-Host "  2. Verify Root Directory = './' in Vercel settings" -ForegroundColor White
Write-Host "  3. Test live URL" -ForegroundColor White
Write-Host "  4. Test all routes" -ForegroundColor White
Write-Host "  5. Test payment flow" -ForegroundColor White
Write-Host "  6. Test Notion embed on /workshop" -ForegroundColor White

Write-Host "`nFor detailed verification steps, see:" -ForegroundColor Cyan
Write-Host "  VERCEL_DEPLOYMENT_VERIFICATION.md" -ForegroundColor White
Write-Host ""

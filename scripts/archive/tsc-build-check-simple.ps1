# TypeScript Build Check Script for Windows Contributors (Simple Version)
# Usage: .\scripts\tsc-build-check-simple.ps1

Write-Host "Running TypeScript sanity check..." -ForegroundColor Cyan

# Run TypeScript type check
npm run tsc:check

if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript check failed. Fix errors before deploying."
    Write-Host "Please check TypeScript errors above and resolve them before proceeding with deployment." -ForegroundColor Yellow
    exit 1
}

Write-Host "TypeScript check passed!" -ForegroundColor Green
Write-Host "Running build..." -ForegroundColor Cyan

# Run build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Check build errors above."
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Ready for deployment!" -ForegroundColor Green

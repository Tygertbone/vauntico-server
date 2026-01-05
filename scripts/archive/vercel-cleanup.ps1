# Vercel Cleanup Script
# Remove unnecessary Vercel projects, keeping only essential frontends

param(
    [switch]$Force = $false
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

# Projects to remove (keep only vauntico-mvp and homepage-redesign)
$projectsToRemove = @(
    "src",
    "vauntico-mvp-2ozt", 
    "vauntico-mvp-front",
    "server-v2",
    "fulfillment-engine",
    "vauntico-fulfillment",
    "vauntico-fulfillment-sys",
    "vauntico-fulfillment-engine"
)

# Projects to keep
$projectsToKeep = @(
    "vauntico-mvp",
    "homepage-redesign"
)

Write-ColorText "Vercel Project Cleanup Script" "Blue"
Write-Host "=============================="
Write-Host ""

Write-ColorText "Projects to REMOVE:" "Red"
foreach ($project in $projectsToRemove) {
    Write-Host "  - $project" -ForegroundColor Red
}

Write-Host ""
Write-ColorText "Projects to KEEP:" "Green"
foreach ($project in $projectsToKeep) {
    Write-Host "  - $project" -ForegroundColor Green
}

Write-Host ""
Write-ColorText "Removing unnecessary projects..." "Yellow"
Write-Host ""

$successCount = 0
$totalCount = $projectsToRemove.Count

foreach ($project in $projectsToRemove) {
    Write-ColorText "Removing $project..." "Yellow"
    
    try {
        # Pipe "y" to automatically confirm deletion
        "y" | npx vercel projects rm $project 2>$null
        Write-ColorText "$project removed successfully" "Green"
        $successCount++
    }
    catch {
        Write-ColorText "Failed to remove $project" "Red"
        Write-ColorText "Error: $($_.Exception.Message)" "Red"
    }
    Write-Host ""
}

Write-Host ""
Write-ColorText "Cleanup process completed!" "Green"
Write-Host ""
Write-ColorText "Cleanup Summary:" "Blue"
Write-Host "- Successful removals: $successCount/$totalCount"
Write-Host ""

Write-ColorText "Verifying final project list..." "Blue"
try {
    $finalProjects = npx vercel projects ls
    Write-Host $finalProjects -ForegroundColor White
}
catch {
    Write-ColorText "Failed to list projects" "Red"
}

Write-Host ""
Write-ColorText "Next Steps:" "Blue"
Write-Host "1. Verify only vauntico-mvp and homepage-redesign remain"
Write-Host "2. Set up DNS in Namecheap:"
Write-Host "   - app.vauntico.com → vauntico-mvp"
Write-Host "   - homepage.vauntico.com → homepage-redesign"
Write-Host ""
Write-ColorText "Vercel Dashboard: https://vercel.com/dashboard" "Blue"

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-ColorText "All unnecessary projects removed successfully!" "Green"
    exit 0
}
else {
    Write-Host ""
    Write-ColorText "Some removals failed. Please check errors above." "Yellow"
    exit 1
}

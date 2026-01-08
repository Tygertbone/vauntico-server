# Vercel Setup Script for Vauntico Frontend Projects
# This script will link src and homepage-redesign workspaces to Vercel

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

function Link-Project {
    param(
        [string]$ProjectName,
        [string]$ProjectPath
    )

    Write-ColorText "Linking $ProjectName to Vercel..." "Yellow"

    if (Test-Path $ProjectPath) {
        Push-Location $ProjectPath
        Write-ColorText "Current directory: $(Get-Location)" "Blue"

        try {
            # Use npx to ensure vercel is available
            npx vercel link --yes
            Write-ColorText "$ProjectName linked successfully" "Green"
            Pop-Location
            return $true
        }
        catch {
            Write-ColorText "Failed to link $ProjectName" "Red"
            Write-ColorText "Error: $($_.Exception.Message)" "Red"
            Pop-Location
            return $false
        }
    }
    else {
        Write-ColorText "Directory $ProjectPath not found" "Red"
        return $false
    }
}

# Main execution
Write-ColorText "Vercel Setup for Vauntico Frontend Projects" "Blue"
Write-Host "=============================================="
Write-Host ""

Write-ColorText "Checking Vercel authentication..." "Blue"
try {
    $whoami = npx vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "Authenticated as: $whoami" "Green"
    } else {
        throw "Authentication failed"
    }
}
catch {
    Write-ColorText "Not authenticated. Please run 'npx vercel login' first." "Red"
    exit 1
}

Write-Host ""
Write-ColorText "Linking frontend projects to Vercel..." "Blue"
Write-Host ""

# Link frontend projects
$projects = @(
    @{ Name = "vauntico-app"; Path = "src" },
    @{ Name = "vauntico-homepage"; Path = "homepage-redesign" }
)

$successCount = 0
$totalCount = $projects.Count

foreach ($project in $projects) {
    if (Link-Project -ProjectName $project.Name -ProjectPath $project.Path) {
        $successCount++
    }
    Write-Host ""
}

Write-Host ""
Write-ColorText "Setup process completed!" "Green"
Write-Host ""
Write-ColorText "Setup Summary:" "Blue"
Write-Host "- Successful links: $successCount/$totalCount"
Write-Host ""

Write-ColorText "Next Steps:" "Blue"
Write-Host "1. Deploy using 'npx vercel --prod' in each project directory"
Write-Host "2. Configure environment variables in Vercel dashboard"
Write-Host "3. Verify deployments at your Vercel URLs"
Write-Host ""
Write-ColorText "Vercel Dashboard: https://vercel.com/dashboard" "Blue"

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-ColorText "All projects linked successfully!" "Green"
    exit 0
}
else {
    Write-Host ""
    Write-ColorText "Some links failed. Please check the errors above." "Yellow"
    exit 1
}

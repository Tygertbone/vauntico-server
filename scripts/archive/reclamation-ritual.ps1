# 🧿 THE RECLAMATION RITUAL
# Automated script to seal all Neon Arc scrolls and syndicate the Vauntico MVP Core

Write-Host "🧿 Beginning the Reclamation Ritual..." -ForegroundColor Cyan
Write-Host ""

# Function to perform git operations with error handling
function Invoke-GitRitual {
    param(
        [string]$Message,
        [string]$Emoji
    )
    
    Write-Host "$Emoji $Message" -ForegroundColor Yellow
    
    try {
        git add .
        git commit -m "$Emoji $Message"
        Write-Host "   ✅ Ritual complete" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Ritual skipped (no changes or error)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# ========================================
# 1. SEAL THE SCROLL
# ========================================
Write-Host "📜 PHASE 1: Sealing the Neon Reclamation Scroll" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "docs/lore/scrolls/neon-reclamation.md") {
    Write-Host "   📄 Neon Reclamation Report found" -ForegroundColor Green
    Invoke-GitRitual -Message "Seal Neon Reclamation Scroll — lore-bound documentation of the neon arc" -Emoji "📜"
} else {
    Write-Host "   ⚠️  Neon Reclamation Report not found, skipping" -ForegroundColor Yellow
}

# ========================================
# 2. AWAKEN THE DREAM MOVER
# ========================================
Write-Host "🚚 PHASE 2: Awakening the Dream Mover" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "vauntico-mvp-cursur-build/vauntico-dream-mover/README.md") {
    Write-Host "   🚚 Dream Mover scaffolded" -ForegroundColor Green
    Invoke-GitRitual -Message "Awaken Dream Mover — scaffolded CLI migration tool" -Emoji "🚚"
} else {
    Write-Host "   ⚠️  Dream Mover not found, skipping" -ForegroundColor Yellow
}

# ========================================
# 3. SYNDICATE THE SYSTEM
# ========================================
Write-Host "📦 PHASE 3: Syndicating the MVP Core" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "syndication/README.md") {
    Write-Host "   📦 Syndication packages prepared:" -ForegroundColor Green
    if (Test-Path "syndication/packages/WorkshopKit.jsx") { Write-Host "      ✓ WorkshopKit.jsx" -ForegroundColor Cyan }
    if (Test-Path "syndication/packages/AuditKit.jsx") { Write-Host "      ✓ AuditKit.jsx" -ForegroundColor Cyan }
    if (Test-Path "syndication/packages/VaultDashboard.jsx") { Write-Host "      ✓ VaultDashboard.jsx" -ForegroundColor Cyan }
    if (Test-Path "syndication/packages/PromptVaultLegacy") { Write-Host "      ✓ PromptVaultLegacy/" -ForegroundColor Cyan }
    
    Invoke-GitRitual -Message "Syndicate MVP Core — packaged Workshop, Audit, Vault, and Prompt Vault for licensing" -Emoji "📦"
} else {
    Write-Host "   ⚠️  Syndication packages not found, skipping" -ForegroundColor Yellow
}

# ========================================
# 4. NARRATE THE NEON TRAIL
# ========================================
Write-Host "🌀 PHASE 4: Narrating the Neon Trail" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "docs/lore/scrolls/neon-commit-trail.md") {
    Write-Host "   🌀 Commit trail documented" -ForegroundColor Green
    Invoke-GitRitual -Message "Narrate Neon Trail — commit history of the aesthetic arc" -Emoji "🌀"
} else {
    Write-Host "   ⚠️  Neon commit trail not found, skipping" -ForegroundColor Yellow
}

# ========================================
# 5. BLESS THE UNIFIED SYSTEM
# ========================================
Write-Host "🧬 PHASE 5: Blessing the Unified System" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "docs/system/manifest.md") {
    Write-Host "   🧬 System manifest declared" -ForegroundColor Green
    Invoke-GitRitual -Message "Declare Vauntico MVP Core — unified system manifest" -Emoji "🧬"
} else {
    Write-Host "   ⚠️  System manifest not found, skipping" -ForegroundColor Yellow
}

# ========================================
# FINAL BLESSING
# ========================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🧿 THE RECLAMATION RITUAL IS COMPLETE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📊 Summary of sealed artifacts:" -ForegroundColor White
Write-Host "   📜 Neon Reclamation Scroll" -ForegroundColor Gray
Write-Host "   🚚 Dream Mover CLI Tool" -ForegroundColor Gray
Write-Host "   📦 MVP Core Syndication Packages" -ForegroundColor Gray
Write-Host "   🌀 Neon Commit Trail" -ForegroundColor Gray
Write-Host "   🧬 Unified System Manifest" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review git status: git status" -ForegroundColor Gray
Write-Host "   2. Push to remote: git push origin main" -ForegroundColor Gray
Write-Host "   3. Tag the release: git tag -a v1.0.0-reclamation -m '🧿 Neon Reclamation Complete'" -ForegroundColor Gray
Write-Host ""
Write-Host "🔮 The system is ready. The scrolls are sealed. The ritual is bound." -ForegroundColor Magenta
Write-Host ""

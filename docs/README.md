# Vauntico - AI-Powered Content Creation Platform

Welcome to **Vauntico**, the next-generation AI-powered content creation platform. Transform your ideas into reality with intelligent vault technology, collaborative tools, and advanced AI content generation.

## 🔥 Phase 5: Live Deployment + Syndication Layer

**Status:** ✅ Production Ready | **Deploy Time:** ~2 minutes

### Quick Start
```bash
npm run build && vercel --prod
```

📖 **Documentation:** [PHASE_5_INDEX.md](PHASE_5_INDEX.md) | [Quick Start](PHASE_5_QUICK_START.md) | [🚀 Deploy Now](🚀_PHASE_5_READY_TO_DEPLOY.md)

### New Features
- 📊 **Analytics System** - Track scroll views, upgrades, CLI usage (GA4, Plausible, Mixpanel)
- 🔗 **Syndication Layer** - Shareable links, referral codes, embed snippets
- 🏔️ **/ascend Page** - Soul stack progression map with tier unlock logic
- 📤 **Share Modal** - Social sharing & embed generation UI
- 💰 **Commission System** - 5-15% referral rewards
- 🎯 **Dev Tools** - Browser console utilities for testing

## 🚀 Features

### Core Platform
- **Dashboard**: Centralized hub for managing your content and vaults
- **Creator Pass**: Three-tier subscription system (Starter, Pro, Legacy)
- **Vaults**: Organize and manage your content collections efficiently
- **Dream Mover**: AI-powered content generation for text, images, and more
- **Pricing**: Flexible plans with regional currency support (USD/ZAR)

### Lore Vault & Onboarding
- **📚 Lore Vault**: Interactive scroll library with tier-based access
- **⚡ CLI Onboarding**: Role-based terminal-style onboarding (Solo Creator, Agency, Team Lead)
- **🏔️ /ascend Page**: Soul stack progression map with 4 unlockable tiers
- **🎯 Achievement System**: Track progress through scrolls and challenges

### Growth & Syndication (Phase 5)
- **📊 Analytics**: Event tracking for scrolls, upgrades, CLI usage
- **🔗 Referral System**: Shareable links with commission tracking (5-15%)
- **📤 Social Sharing**: Twitter/X, LinkedIn integration
- **💻 Embed Snippets**: iframe, widget, and preview card generation
- **🏢 Agency Tools**: Demo kits, white-label configs, partnership framework

## 🛠️ Tech Stack

- **React 18.2** - Modern UI library
- **Vite 5.0** - Next-generation frontend tooling
- **React Router 6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS transformations

## 📦 Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Build for production
npm run build
# or
pnpm build

# Preview production build
npm run preview
# or
pnpm preview
```

## 🏗️ Project Structure

```
vauntico-mvp/
├── public/
│   └── vauntico_banner.webp
├── src/
│   ├── components/
│   │   ├── CLIOnboarding.jsx          # Phase 3: CLI onboarding
│   │   ├── RoleSelector.jsx           # Phase 3: Role selection
│   │   ├── ScrollGallery.jsx          # Phase 2: Scroll display
│   │   ├── ScrollViewer.jsx           # Phase 2: Scroll reader
│   │   ├── UnlockAnimation.jsx        # Phase 4: Unlock effects
│   │   ├── UpgradeModal.jsx           # Phase 4: Upgrade prompts
│   │   ├── CreditTracker.jsx          # Phase 4: Usage tracking
│   │   ├── TierComparison.jsx         # Phase 4: Tier calculator
│   │   ├── PersonalizedRecommendations.jsx  # Phase 4: AI suggestions
│   │   └── ShareScrollModal.jsx       # Phase 5: Share UI
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CreatorPass.jsx
│   │   ├── Vaults.jsx
│   │   ├── DreamMover.jsx
│   │   ├── Pricing.jsx
│   │   ├── LoreVault.jsx              # Phase 2: Scroll library
│   │   └── Ascend.jsx                 # Phase 5: Soul stack map
│   ├── utils/
│   │   ├── pricing.js                 # Phase 2: Access control
│   │   ├── analytics.js               # Phase 5: Event tracking
│   │   └── syndication.js             # Phase 5: Sharing & referrals
│   ├── hooks/
│   │   └── useAccess.js               # Phase 2: Access hooks
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scrolls/                            # Phase 1: Content library
│   ├── scrollIndex.json
│   ├── creator-pass.md
│   ├── 10-agency-scroll.md
│   └── ... (20+ scrolls)
├── docs/                               # Phase 1-5: Documentation
│   ├── PHASE_5_INDEX.md               # Phase 5: Master index
│   ├── PHASE_5_QUICK_START.md         # Phase 5: 10-min deploy
│   ├── 🚀_PHASE_5_READY_TO_DEPLOY.md  # Phase 5: Launch guide
│   └── ... (50+ docs)
├── vercel.json                         # Deployment config
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Purple**: `#6c5ce7` (vault-purple)
- **Primary Blue**: `#0984e3` (vault-blue)
- **Primary Cyan**: `#00cec9` (vault-cyan)
- **Dark**: `#1a1a2e` (vault-dark)

### Typography
- **Body Font**: Inter
- **Display Font**: Plus Jakarta Sans

## 📄 Pages & Routes

### Core Pages
- **/** - Dashboard with quick stats and navigation
- **/creator-pass** - Three-tier subscription system (Starter/Pro/Legacy)
- **/vaults** - Content management interface
- **/dream-mover** - AI content generation tool
- **/pricing** - Comprehensive pricing with regional currency support

### Lore & Onboarding (Phases 2-4)
- **/lore** - Interactive scroll library with tier-based access
  - Role selection (Solo Creator, Agency, Team Lead)
  - CLI onboarding system
  - Scroll gallery with unlock animations
  - Personalized recommendations
  - Credit tracking

### Progression & Syndication (Phase 5)
- **/ascend** - Soul stack progression map (NEW!)
  - 4-tier visual hierarchy
  - Progress tracking
  - Unlock animations
  - Journey statistics
  - Dynamic CTAs based on tier

## 🚀 Deployment

### Quick Deploy (2 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

### Configuration
- ✅ Vercel auto-detects Vite configuration
- ✅ Framework preset: Vite
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing configured in `vercel.json`

### Post-Deploy
1. Test all routes (/, /lore, /ascend, /creator-pass)
2. Verify analytics tracking (browser console)
3. Generate referral code: `window.VaunticoSyndication.getMyCode()`
4. Test share functionality
5. Monitor console for errors

📖 **Full Guide:** [PHASE_5_DEPLOYMENT_GUIDE.md](PHASE_5_DEPLOYMENT_GUIDE.md)

## 🔧 Development Tools

### Browser Console Utilities
```javascript
// Analytics
window.VaunticoAnalytics.logState()      // View analytics state
window.VaunticoAnalytics.flush()         // Force flush events

// Syndication
window.VaunticoSyndication.getMyCode()   // Get referral code
window.VaunticoSyndication.viewStats()   // View stats

// Pricing
window.VaunticoDev.setCreatorPassTier('pro', 'yearly')
window.VaunticoDev.logState()
```

## 📊 Phase Completion Status

- ✅ **Phase 1** - Foundation & Scroll Library (20+ scrolls)
- ✅ **Phase 2** - Pricing Logic & Scroll Gating
- ✅ **Phase 3** - CLI Onboarding System (3 role paths)
- ✅ **Phase 4** - Enhanced Scroll Access UI (animations, modals, tracking)
- ✅ **Phase 5** - Live Deployment + Syndication Layer
- ⏳ **Phase 6** - User Dashboard & Advanced Analytics (Planned)

## 📖 Documentation

### Phase 5 (Current)
- [🚀 Ready to Deploy](🚀_PHASE_5_READY_TO_DEPLOY.md) - Launch guide
- [Master Index](PHASE_5_INDEX.md) - Navigation hub
- [Quick Start](PHASE_5_QUICK_START.md) - 10-minute deployment
- [Activation Checklist](PHASE_5_ACTIVATION_CHECKLIST.md) - Step-by-step tasks
- [Complete Summary](PHASE_5_COMPLETE.md) - Full feature documentation

### Previous Phases
- [Phase 4 Summary](PHASE_4_COMPLETE_SUMMARY.md) - Enhanced scroll access
- [Phase 3 Summary](PHASE_3_CLI_ONBOARDING_SUMMARY.md) - CLI onboarding
- [Phase 2 Summary](PHASE_2_COMPLETE_EXECUTIVE_SUMMARY.md) - Scroll gating

## 📝 License

Copyright © 2024 Vauntico. All rights reserved.

## 🤝 Contributing

This is a private project. For access or contribution inquiries, please contact the development team.

---

**Status:** ✅ Phase 5 Complete - Ready for Production Deployment

Built with ❤️ by the Vauntico team

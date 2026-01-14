# Vauntico Architecture

> **Last Updated:** 2024-12-28  
> **Version:** Phase 6 - R2,000 Challenge Launch

---

## 📁 Project Structure

```
vauntico/
├── public/                          # Static assets
│   └── vauntico_banner.webp        # Hero image
├── content/                         # R2,000 Challenge content (PLANNED)
│   └── r2000/
│       ├── days/                   # 60 daily lessons (markdown)
│       │   ├── day-01.md
│       │   ├── day-02.md
│       │   └── ...                 # Through day-60.md
│       └── bonuses/
│           ├── templates.md        # 100 viral content templates
│           ├── brands.md           # African brands directory
│           └── resources.md        # Tools & links
├── api/                             # Serverless functions
│   ├── send-welcome-email.js        # Resend integration
│   └── paystack/
│       └── webhook.js               # Payment webhooks
├── src/
│   ├── components/                  # React components (30+ files)
│   │   ├── AccessGate.jsx          # Conditional rendering based on tier
│   │   ├── CLIOnboarding.jsx       # Terminal-style onboarding
│   │   ├── CLICommandGenerator.jsx # Command builder
│   │   ├── ShareScrollModal.jsx    # Social sharing UI
│   │   ├── UpgradeModal.jsx        # Tier upgrade prompts
│   │   ├── UnlockAnimation.jsx     # Scroll unlock effects
│   │   ├── ScrollViewer.jsx        # Markdown scroll renderer
│   │   ├── ScrollGallery.jsx       # Grid display of scrolls
│   │   ├── TierComparison.jsx      # Pricing calculator
│   │   ├── ErrorBoundary.jsx       # Error handling
│   │   └── ...                     # 20+ more components
│   ├── pages/                       # Route pages (15+ files)
│   │   ├── Home.jsx                # Landing page
│   │   ├── Dashboard.jsx           # User hub
│   │   ├── CreatorPass.jsx         # Pricing & tiers
│   │   ├── LoreVault.jsx           # Scroll library
│   │   ├── Ascend.jsx              # Soul stack progression
│   │   ├── WorkshopKit.jsx         # R2000 Challenge landing (✅ LIVE)
│   │   ├── WorkshopKitSuccess.jsx  # Payment success page (✅ LIVE)
│   │   ├── r2000/                  # R2,000 Challenge pages (PLANNED)
│   │   │   ├── R2000Dashboard.jsx  # Member area (payment gated)
│   │   │   ├── DayLesson.jsx       # Dynamic day viewer
│   │   │   ├── Bonuses.jsx         # Templates & resources hub
│   │   │   └── Progress.jsx        # Completion tracker
│   │   ├── AuditService.jsx        # Audit offering
│   │   ├── vs/                     # Competitor comparison pages
│   │   │   ├── VsJasper.jsx
│   │   │   ├── VsChatGPT.jsx
│   │   │   └── ...
│   │   └── ...
│   ├── utils/                       # Business logic
│   │   ├── pricing.js              # Access control & tier logic
│   │   ├── analytics.js            # Event tracking (GA4, Mixpanel)
│   │   ├── syndication.js          # Referral & sharing
│   │   ├── paystack.js             # Payment integration (✅ WORKING)
│   │   └── ...
│   ├── hooks/                       # React hooks
│   │   └── useAccess.js            # Access control hooks
│   ├── styles/                      # CSS
│   │   └── mobile-optimizations.css
│   ├── App.jsx                      # Router & layout
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles + Tailwind
├── scrolls/                         # Content library (20+ files)
│   ├── scrollIndex.json            # Scroll metadata catalog
│   ├── creator-pass.md             # Subscription guide
│   ├── 10-agency-scroll.md         # Agency playbook
│   └── ...                         # Educational content
├── docs/                            # 100+ documentation files
├── vercel.json                      # Deployment config
├── vite.config.js                   # Build config
├── tailwind.config.js               # Styling config
├── package.json                     # Dependencies
└── README.md                        # Project overview
```

---

## 🏗️ Component Architecture

### Layout Components

**App.jsx** - Root component

- React Router setup
- Navigation bar (responsive desktop/mobile)
- Footer with sitemap
- R2000 Challenge banner
- Error boundary wrapper
- Lazy loading for all pages except Home

### Page Components (Route-Level)

1. **Home.jsx** - Landing page with hero, features, testimonials
2. **Dashboard.jsx** - User hub (placeholder for Phase 6)
3. **CreatorPass.jsx** - Three-tier pricing page with comparison
4. **LoreVault.jsx** - Scroll library with CLI onboarding
5. **Ascend.jsx** - Soul stack progression map (4 tiers)
6. **WorkshopKit.jsx** - R2000 Challenge landing page
7. **AuditService.jsx** - Code audit service offering
8. **Pricing.jsx** - Detailed pricing breakdown

### Reusable Components

**Access Control:**

- `AccessGate.jsx` - Conditionally render based on user tier
- `UpgradeModal.jsx` - Prompt for tier upgrade with CTAs
- `UnlockAnimation.jsx` - Celebration animation for unlocked content

**Scroll System:**

- `ScrollViewer.jsx` - Renders markdown with syntax highlighting
- `ScrollGallery.jsx` - Grid display with tier badges
- `ScrollPreview.jsx` - Card preview with metadata
- `ShareScrollModal.jsx` - Multi-tab sharing interface

**Onboarding:**

- `CLIOnboarding.jsx` - Terminal-style interactive walkthrough
- `RoleSelector.jsx` - Choose creator path (solo/agency/team)
- `OnboardingProgress.jsx` - Progress tracker

**Conversion:**

- `TierComparison.jsx` - Interactive pricing calculator
- `CreditTracker.jsx` - Usage visualization
- `PersonalizedRecommendations.jsx` - AI-suggested scrolls
- `EmailCapture.jsx` - Lead magnet forms

---

## 🔄 Data Flow

### Access Control Flow

```
User visits page
    ↓
useAccess hook checks tier
    ↓
pricing.js reads localStorage
    ↓
Returns access status
    ↓
Component renders conditionally
    ↓
If locked: Show UpgradeModal
If unlocked: Show content
```

### Scroll Viewing Flow

```
User clicks scroll in LoreVault
    ↓
ScrollViewer checks access (useAccess hook)
    ↓
If locked:
  → Show lock overlay
  → Track lock click (analytics)
  → Open UpgradeModal
    ↓
If unlocked:
  → Render markdown content
  → Track scroll view (analytics)
  → Show share button
  → Track reading time
```

### Referral Attribution Flow

```
User clicks referral link (?ref=CODE)
    ↓
analytics.js captures UTM params
    ↓
Stores in localStorage
    ↓
User upgrades
    ↓
trackSubscriptionSuccess() includes referral data
    ↓
Backend calculates commission (Phase 6)
```

### Analytics Event Flow

```
User action (scroll view, upgrade click, etc.)
    ↓
Call track function (e.g., trackScrollView)
    ↓
Event added to queue
    ↓
Queue reaches 10 events OR 5 seconds elapsed
    ↓
Batch sent to providers:
  → Google Analytics 4
  → Mixpanel
  → Plausible (optional)
```

---

## 🗄️ State Management

### Current Implementation (Phase 5)

**LocalStorage-Based State:**

```javascript
// Access state
localStorage.getItem("vauntico_creator_pass"); // 'true' | null
localStorage.getItem("vauntico_creator_pass_tier"); // JSON: {tier, billingCycle}
localStorage.getItem("vauntico_workshop_kit"); // 'true' | null

// Analytics state
localStorage.getItem("vauntico_session_id"); // Session tracking
localStorage.getItem("vauntico_user_id"); // Authenticated user
localStorage.getItem("vauntico_anonymous_id"); // Anonymous tracking
localStorage.getItem("vauntico_referral_code"); // Attribution

// Preferences
localStorage.getItem("vauntico_locale"); // 'USD' | 'ZAR'
localStorage.getItem("vauntico_cli_progress_*"); // Onboarding progress
```

**React State (Component-Level):**

- Navigation menu open/close
- Modal visibility
- Form inputs
- Loading states

**Custom Events:**

```javascript
// Trigger re-check across components
window.dispatchEvent(new Event("vauntico_access_changed"));
```

### Future Implementation (Phase 6)

**React Context Providers:**

```
<AuthProvider>          // User authentication
  <AccessProvider>      // Tier-based permissions
    <AnalyticsProvider> // Event tracking
      <App />
    </AnalyticsProvider>
  </AccessProvider>
</AuthProvider>
```

---

## 🔌 Key Integrations

### Analytics (Phase 5 - Active)

**Google Analytics 4:**

- Page views, events, conversions
- Configured in `src/utils/analytics.js`
- Measurement ID: `G-30N4CHF6JR` (default)

**Mixpanel:**

- Deep product analytics
- User properties, event tracking
- Token configured via env var: `VITE_MIXPANEL_TOKEN`

**Plausible (Optional):**

- Privacy-friendly analytics
- Domain-based tracking

### Payment Gateways (Phase 6 - Pending)

**Paystack (Primary - South Africa):**

- ZAR payments
- Utility file: `src/utils/paystack.js`
- Webhook handling needed

**Stripe (Secondary - International):**

- USD/EUR payments
- Utility file: `src/utils/stripe.js`
- Subscription management

---

## 📊 Database Schema (Phase 6 - Planned)

### Users Table

```sql
users (
  id: UUID PRIMARY KEY,
  email: STRING UNIQUE,
  name: STRING,
  created_at: TIMESTAMP,
  creator_pass_tier: ENUM('free', 'starter', 'pro', 'legacy'),
  billing_cycle: ENUM('monthly', 'yearly'),
  subscription_status: ENUM('active', 'cancelled', 'expired'),
  credits_balance: INTEGER,
  referral_code: STRING UNIQUE
)
```

### Referrals Table

```sql
referrals (
  id: UUID PRIMARY KEY,
  referrer_id: UUID FK(users),
  referred_email: STRING,
  referral_code: STRING,
  conversion_date: TIMESTAMP,
  commission_earned: DECIMAL,
  commission_paid: BOOLEAN,
  created_at: TIMESTAMP
)
```

### Analytics Events Table

```sql
analytics_events (
  id: UUID PRIMARY KEY,
  user_id: UUID FK(users),
  session_id: STRING,
  event_name: STRING,
  event_properties: JSONB,
  timestamp: TIMESTAMP
)
```

### Scrolls Metadata Table

```sql
scrolls (
  id: STRING PRIMARY KEY,
  title: STRING,
  description: TEXT,
  content_path: STRING,
  tier_required: ENUM('free', 'starter', 'pro', 'legacy'),
  category: STRING,
  tags: STRING[],
  view_count: INTEGER,
  share_count: INTEGER
)
```

---

## 🌐 API Structure (Phase 6 - Planned)

### Authentication

```
POST   /api/auth/signup              # Create account
POST   /api/auth/login               # Get JWT token
POST   /api/auth/logout              # Invalidate token
GET    /api/auth/me                  # Get current user
```

### Subscriptions

```
POST   /api/subscriptions/create     # Start subscription
GET    /api/subscriptions/status     # Check status
PUT    /api/subscriptions/upgrade    # Change tier
POST   /api/subscriptions/cancel     # Cancel subscription
```

### Referrals

```
GET    /api/referrals/my-code        # Get user's referral code
GET    /api/referrals/stats          # View earnings & conversions
POST   /api/referrals/generate       # Generate new code
```

### Scrolls

```
GET    /api/scrolls                  # List all scrolls
GET    /api/scrolls/:id              # Get scroll content
POST   /api/scrolls/:id/view         # Track view
POST   /api/scrolls/:id/share        # Track share
```

### Analytics

```
POST   /api/analytics/track          # Send event batch
GET    /api/analytics/dashboard      # Get user analytics
```

### Webhooks (Incoming)

```
POST   /webhooks/paystack            # Payment events
POST   /webhooks/stripe              # Subscription events
```

---

## 🔐 Security Considerations

### Current (Phase 5)

- CSP headers configured in `vercel.json`
- XSS protection headers
- HSTS enabled
- Client-side access control (mock)

### Planned (Phase 6)

- JWT authentication
- API rate limiting
- CSRF protection
- Input validation & sanitization
- Encrypted payment data
- Webhook signature verification

---

## 🚀 Build & Deployment

### Build Process

```bash
vite build
  ↓
src/ compiled to dist/
  ↓
Code splitting:
  - react-vendor.js (React core)
  - markdown.js (react-markdown)
  - analytics.js (mixpanel-browser)
  - [page].js (lazy-loaded pages)
  ↓
Minification via esbuild
  ↓
Assets hashed for cache busting
```

### Deployment (Vercel)

```
Git push to main
  ↓
Vercel webhook triggers build
  ↓
npm run build
  ↓
Deploy to vauntico.vercel.app
  ↓
Custom domain (if configured)
```

### Environment Variables

```env
# Analytics
VITE_GA4_ID=G-30N4CHF6JR
VITE_MIXPANEL_TOKEN=xxxxx

# Payments (Phase 6)
# ⚠️ Public keys only - Add to .env file (NOT committed to git)
VITE_STRIPE_PUBLIC_KEY=pk_xxxxx
VITE_PAYSTACK_PUBLIC_KEY=pk_xxxxx
# Note: Secret keys should ONLY be in backend/serverless functions

# API (Phase 6)
VITE_API_BASE_URL=https://api.vauntico.com
```

---

## 🧪 Testing Strategy (Planned)

### Unit Tests

- Utility functions (pricing, analytics, syndication)
- React hooks (useAccess, useSubscription)

### Integration Tests

- Access control flows
- Payment processing
- Referral attribution

### E2E Tests

- User signup → scroll view → upgrade flow
- Referral link → conversion → commission tracking

---

## 📈 Performance Optimization

### Current Optimizations

- Lazy loading all pages except Home
- Code splitting (vendor, markdown, analytics)
- Image optimization (WebP format)
- CSS purging via Tailwind
- Event batching for analytics

### Planned Optimizations

- CDN for scroll content
- Image CDN (Cloudinary/Imgix)
- Service worker for offline scrolls
- Virtualized scroll gallery
- Preload critical fonts

---

## 🔄 Key Dependencies & Versions

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "6.21.0",
  "vite": "5.0.8",
  "tailwindcss": "3.4.0",
  "react-markdown": "10.1.0",
  "mixpanel-browser": "2.71.0",
  "crypto-js": "4.2.0"
}
```

---

**Status:** 🚀 Phase 6 In Progress - R2,000 Challenge Content Delivery System  
**Next Update:** After member dashboard and 60-day content structure complete

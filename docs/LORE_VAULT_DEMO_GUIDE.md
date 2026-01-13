# 📚 LORE VAULT - Demo & Navigation Guide

## 🎬 Quick Demo Script (2 minutes)

### 1. Landing Experience (15 seconds)

**Navigate to:** `http://localhost:5173/lore`

**What you'll see:**

- Hero section with vault icon and mythic copy
- "The Lore Vault - Sacred Knowledge Repository"
- Three vault principles (Mythic, Empowering, Legacy-Focused)
- Choose Your Path section

### 2. Role Selection (20 seconds)

**Action:** Click one of three role cards

**Roles:**

- 👨‍💻 **Solo Creator** → Building your empire
- 🏢 **Agency Partner** → Scale your services
- 👥 **Team Lead** → Organize your squad

**What happens:**

- Each role shows unique description
- Scroll count displayed
- Recommended path indicated
- Role-specific scroll access

### 3. Scroll Gallery (30 seconds)

**What you'll see:**

- Category filters (All, Foundation, Agency, Advanced)
- ⭐ Recommended scrolls at top
- Full library below
- Each scroll shows:
  - Icon + title + subtitle
  - Description
  - Tier badge (Free, Pro, Legacy)
  - Read time estimate
  - Lock/unlock status

**Try this:**

- Filter by category
- Hover over scroll cards
- Notice locked scrolls (🔒 icon)
- Check tier badges

### 4. Scroll Reading (45 seconds)

**Action:** Click an unlocked scroll (try "Master Index")

**What you'll see:**

- Scroll header with meta info
- Beautifully rendered markdown
- Code blocks with syntax highlighting
- Tables, lists, blockquotes
- Copy link / Print buttons
- Back navigation

**Try this:**

- Scroll through content
- Click internal links
- Copy a code snippet
- Test print preview

### 5. Access Gating (10 seconds)

**Action:** Try clicking a locked scroll

**What you'll see:**

- "Requires Pro Tier" message
- Upgrade to Creator Pass prompt
- Benefits listed
- CTA button to /creator-pass

---

## 🎯 User Journeys to Demo

### Journey 1: Solo Creator Discovery

```
1. Land on /lore
2. See "Choose Your Path"
3. Click "Solo Creator"
4. See curated scrolls (Index, Creator Pass, Ascension)
5. Click "Master Index" (free)
6. Read overview of scroll library
7. Click "Creator Pass" scroll
8. Learn about subscription tiers
9. Notice "Ascension Scroll" is locked (Legacy tier)
10. Click upgrade prompt → Navigate to /creator-pass
```

**Key points to highlight:**

- Role-based curation
- Progressive disclosure of features
- Clear upgrade path

---

### Journey 2: Agency Partner Exploration

```
1. Choose "Agency Partner" role
2. See 4 recommended scrolls
3. Notice "Agency Scroll" and "CLI Quickstart" are Pro tier
4. If no Creator Pass → See lock icons
5. Read "Master Index" (free)
6. Click "Agency Scroll" (if locked → upgrade prompt)
7. If unlocked → See complete white-label framework
8. Click "CLI Quickstart"
9. Learn command reference
```

**Key points to highlight:**

- Agency-specific content
- White-label opportunities
- CLI power features

---

### Journey 3: Team Lead Navigation

```
1. Choose "Team Lead" role
2. See team-focused recommendations
3. Filter by "Foundation" category
4. Read Creator Pass scroll (team pricing)
5. Learn about collaboration features
6. Check CLI Quickstart for workflows
7. Explore full library via "All Scrolls"
```

**Key points to highlight:**

- Team collaboration tools
- Workflow automation
- Scalable systems

---

## 🧪 Testing Scenarios

### Access Control Testing

**Scenario 1: Free User**

```js
// Simulate free tier
localStorage.removeItem('vauntico_creator_pass')
localStorage.removeItem('vauntico_creator_pass_tier')

// Expected access:
✅ 00-index.md
✅ creator-pass.md
🔒 10-agency-scroll.md
🔒 AGENCY_CLI_QUICKSTART.md
🔒 ASCENSION_SCROLL.md
```

**Scenario 2: Starter Tier**

```js
// Simulate starter tier
localStorage.setItem('vauntico_creator_pass', 'true')
localStorage.setItem('vauntico_creator_pass_tier', 'starter')

// Expected access:
✅ All free scrolls
🔒 Agency/CLI scrolls (Pro+ required)
🔒 Ascension (Legacy required)
```

**Scenario 3: Pro Tier**

```js
// Simulate pro tier
localStorage.setItem('vauntico_creator_pass', 'true')
localStorage.setItem('vauntico_creator_pass_tier', 'pro')

// Expected access:
✅ All free scrolls
✅ 10-agency-scroll.md
✅ AGENCY_CLI_QUICKSTART.md
🔒 ASCENSION_SCROLL.md (Legacy only)
```

**Scenario 4: Legacy Tier**

```js
// Simulate legacy tier
localStorage.setItem('vauntico_creator_pass', 'true')
localStorage.setItem('vauntico_creator_pass_tier', 'legacy')

// Expected access:
✅ ALL SCROLLS UNLOCKED
```

### UI Testing

**Responsive Design:**

- [ ] Desktop (1920px) → 3-column grid
- [ ] Tablet (768px) → 2-column grid
- [ ] Mobile (375px) → 1-column, stacked
- [ ] Navigation sticky on scroll
- [ ] Cards readable at all sizes

**Interactions:**

- [ ] Role cards hover effect
- [ ] Scroll cards hover + scale
- [ ] Category filter active state
- [ ] Lock icon visibility
- [ ] Upgrade prompt appears correctly
- [ ] Back buttons work
- [ ] Copy link shows confirmation
- [ ] Print opens print dialog

**Loading States:**

- [ ] Skeleton loader while fetching scroll
- [ ] Error state if scroll not found
- [ ] Graceful fallback content

---

## 🎨 Visual Design Highlights

### Color System

```
Free Tier:    Gray (📖)
Starter Tier: Blue (⚡)
Pro Tier:     Purple gradient (💎)
Legacy Tier:  Gold gradient (👑)
```

### Typography

- **Headers:** Plus Jakarta Sans (bold, mythic)
- **Body:** Inter (clean, readable)
- **Code:** Monospace (tech authenticity)

### Spacing

- **Cards:** 24px padding, 16px gap
- **Sections:** 64px vertical spacing
- **Content:** 1.75 line-height for readability

### Animations

- Fade-in on page load
- Scale on card hover (105%)
- Smooth transitions (200ms)

---

## 🔧 Developer Quick Reference

### Simulate Tiers via Console

```js
// Free tier (default)
localStorage.clear();

// Starter tier
localStorage.setItem("vauntico_creator_pass", "true");
localStorage.setItem("vauntico_creator_pass_tier", "starter");

// Pro tier
localStorage.setItem("vauntico_creator_pass", "true");
localStorage.setItem("vauntico_creator_pass_tier", "pro");

// Legacy tier
localStorage.setItem("vauntico_creator_pass", "true");
localStorage.setItem("vauntico_creator_pass_tier", "legacy");

// Reload page to see changes
window.location.reload();
```

### Add New Scroll (5 steps)

1. Create `public/docs/lore/scrolls/my-scroll.md`
2. Add metadata to `ScrollGallery.jsx` scrolls array
3. Assign to role in `RoleSelector.jsx` (optional)
4. Set tier: `free | starter | pro | legacy`
5. Refresh page → Scroll appears

### Debug Tips

```js
// Check current tier
console.log(localStorage.getItem("vauntico_creator_pass_tier"));

// Check scroll access
import { canAccessScroll } from "./ScrollGallery.jsx";
console.log(canAccessScroll(scrollObject));

// Force re-check access
window.dispatchEvent(new Event("vauntico_access_changed"));
```

---

## 📸 Screenshot Checklist

Capture these views for documentation:

1. **Hero Landing** (`/lore`)
   - Full viewport with hero + principles
2. **Role Selection**
   - All 3 role cards visible
   - Hover state on one card

3. **Scroll Gallery** (Agency role)
   - Category filters
   - Recommended scrolls section
   - Mix of locked/unlocked cards
   - Tier badges visible

4. **Scroll Viewer** (Agency Scroll)
   - Header with meta info
   - Markdown content (show code block)
   - Copy/print buttons
   - Back navigation

5. **Lock State**
   - Locked scroll card with 🔒
   - Upgrade prompt modal/section

6. **Mobile View**
   - Stack layout
   - Navigation still functional

---

## 🎤 Pitch Points for Demos

### For Potential Users

> "The Lore Vault isn't just documentation—it's your personalized learning path. Choose your role, and we curate the knowledge you need, when you need it."

### For Investors

> "We've gamified documentation. Users don't wade through a knowledge base—they embark on a hero's journey. This increases engagement and reduces churn."

### For Agency Partners

> "Agency partners get white-labeled scrolls. Your clients see your branding, your methodology—powered by Vauntico's engine. You become the oracle."

### For Content Marketers

> "Every scroll is SEO-optimized, shareable content. We're not just building a product—we're building a content ecosystem."

---

## ✅ Demo Checklist

Before showing to stakeholders:

**Content:**

- [ ] All 5 scrolls exist and render correctly
- [ ] No broken markdown or images
- [ ] Links work (internal + external)
- [ ] Code blocks formatted properly
- [ ] Tables display correctly

**Functionality:**

- [ ] All 3 roles work
- [ ] Category filters work
- [ ] Lock/unlock logic correct
- [ ] Back navigation works everywhere
- [ ] Upgrade prompts display
- [ ] Copy/print functions work

**Performance:**

- [ ] Page loads < 2 seconds
- [ ] Scroll rendering < 1 second
- [ ] No console errors
- [ ] Mobile responsive

**Aesthetics:**

- [ ] Colors match brand
- [ ] Spacing consistent
- [ ] Icons render
- [ ] Hover effects smooth
- [ ] Typography readable

---

## 🚀 Launch Preparation

### Pre-Launch

1. Test all user flows (30 min)
2. Fix any console errors
3. Check mobile experience
4. Add analytics tracking
5. Prepare social media posts

### Launch Day

1. Announce on Twitter/LinkedIn
2. Post in Discord community
3. Email existing users
4. Update main nav to highlight 📚 Lore
5. Monitor analytics for first impressions

### Post-Launch

1. Gather user feedback
2. Track scroll view metrics
3. Identify most popular scrolls
4. Optimize upgrade conversion
5. Plan next scrolls to create

---

## 🎁 Bonus Features (Future)

- **Scroll search** (Cmd+K interface)
- **Reading progress bars**
- **Bookmarks/favorites**
- **Scroll discussions** (comments)
- **Completion badges**
- **Scroll recommendation engine**
- **Dark mode**
- **Export as PDF**
- **Audio versions** (text-to-speech)
- **Multi-language support**

---

_Ready to demo. Ready to ship. The Lore Vault is open._  
_Begin your ascension at `/lore` 🔥_

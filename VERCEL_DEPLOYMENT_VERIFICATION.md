# Vercel Deployment Verification Checklist
**Commit:** `94a64578`  
**Branch:** `main`  
**Repo:** `Tygertbone/vauntico-mvp`

## ✅ Pre-Deployment Configuration (Complete)

### Project Structure ✓
- ✅ Root directory contains `package.json`, `vite.config.js`, `vercel.json`
- ✅ Source code in `./src/`
- ✅ Build output configured to `./dist/`
- ✅ Entry point: `index.html` → `/src/main.jsx` → `App.jsx`

### Vercel Configuration ✓
**File:** `vercel.json`
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Build Configuration ✓
**File:** `package.json`
- ✅ Build script: `"build": "vite build"`
- ✅ Package manager: `pnpm@10.4.1`
- ✅ Framework: Vite + React

**File:** `vite.config.js`
- ✅ Output directory: `dist`
- ✅ React plugin enabled
- ✅ TailwindCSS plugin enabled
- ✅ Path aliases configured

---

## 🔍 Vercel Dashboard Verification

### 1. Root Directory Setting
**Navigate to:** Project Settings → General → Root Directory

**Expected:** `./` (or leave blank/empty)  
**NOT:** `vauntico-mvp` or `vauntico-mvp-cursur-build`

**Why:** Your `package.json`, `vercel.json`, and `src/` folder are in the repository root.

---

### 2. Build & Development Settings
**Navigate to:** Project Settings → General → Build & Development Settings

**Framework Preset:** Vite  
**Build Command:** `pnpm run build` (should auto-detect from vercel.json)  
**Output Directory:** `dist` (should auto-detect from vercel.json)  
**Install Command:** `pnpm install` (should auto-detect from vercel.json)

---

### 3. Environment Variables
**Navigate to:** Project Settings → Environment Variables

**Required Variables:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://your-backend.com
```

**Optional Variables:**
```
VITE_ENABLE_ANALYTICS=true
VITE_NOTION_WORKSPACE_ID=...
```

**Check:**
- ✅ All `VITE_*` prefixed variables are present
- ✅ Applied to "Production" environment
- ✅ No syntax errors in values (no trailing spaces, quotes, etc.)

---

### 4. Build Logs Analysis
**Navigate to:** Deployments → Latest Deployment → Build Logs

**Expected Steps:**
```
1. Cloning repository
   ✓ git clone https://github.com/Tygertbone/vauntico-mvp.git

2. Installing dependencies
   ✓ pnpm install
   ✓ Lockfile is up to date, resolution step is skipped
   ✓ Dependencies installed successfully

3. Building application
   ✓ pnpm run build
   ✓ vite build
   ✓ Building for production...
   ✓ Transforming...
   ✓ Rendering chunks...
   ✓ Computing gzip size...
   ✓ dist/index.html              [size]
   ✓ dist/assets/index-[hash].js  [size]
   ✓ dist/assets/index-[hash].css [size]

4. Uploading build artifacts
   ✓ Uploading dist/ to Lambda
   ✓ Build completed successfully
```

**Check for:**
- ✅ No `ENOENT` errors (missing files)
- ✅ No `Module not found` errors
- ✅ No TypeScript/ESLint errors blocking build
- ✅ No `Failed to load config` errors
- ✅ Build time < 3 minutes

**Red Flags:**
- ❌ "Could not find package.json"
- ❌ "Build directory is empty"
- ❌ "Failed to compile"
- ❌ Using wrong node_modules or incorrect path

---

### 5. Deployment Output
**Navigate to:** Deployments → Latest Deployment → Deployment Summary

**Expected:**
- ✅ Status: Ready (green checkmark)
- ✅ Type: Production
- ✅ Domain: `vauntico.vercel.app` or custom domain
- ✅ Build time: 1-3 minutes
- ✅ Output directory: `dist`

---

## 🌐 Live Site Verification

### Homepage Test (`/`)
**URL:** `https://vauntico.vercel.app/` or `https://vauntico.com/`

**Expected:**
1. ✅ Page loads without errors
2. ✅ Vauntico branding visible
3. ✅ Hero section with tagline: "Premium AI Prompts for Founders"
4. ✅ Navigation menu functional
5. ✅ Sidebar renders correctly
6. ✅ Styling (Tailwind) applied correctly
7. ✅ No `404` or blank white screen
8. ✅ No "Welcome to Vite" placeholder content

**Browser Console Check:**
- ✅ No JavaScript errors
- ✅ No 404 errors for assets
- ✅ React DevTools detects React app

---

### Route Tests
**Test all routes:**

| Route | Expected Page | Status |
|-------|---------------|--------|
| `/` | Homepage (PromptVaultPage) | ⬜ |
| `/prompt-vault` | PromptVaultPage | ⬜ |
| `/vaults` | VaultsPage | ⬜ |
| `/creator-pass` | CreatorPassPage | ⬜ |
| `/vault-success` | VaultSuccessPage | ⬜ |
| `/dashboard` | VaultDashboard | ⬜ |
| `/workshop` | WorkshopPage (Notion embed) | ⬜ |
| `/audit-service` | AuditServicePage | ⬜ |

**Routing Check:**
- ✅ SPA routing works (no full page reloads)
- ✅ Direct URL navigation works (refresh on `/workshop` loads correctly)
- ✅ Browser back/forward buttons work
- ✅ No 404 errors on route changes

---

### Payment Flow Test
**Navigate to:** `/vaults` → Select Vault → Click "Get Vault"

**Expected:**
1. ✅ Stripe payment modal opens
2. ✅ Checkout form loads with correct product
3. ✅ Test card (`4242 4242 4242 4242`) works in test mode
4. ✅ Redirect to `/vault-success` after payment
5. ✅ Success page displays confirmation

**Environment Variables Check:**
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` is injected
- ✅ Stripe SDK loads without errors

---

### Notion Embed Test (`/workshop`)
**Navigate to:** `/workshop`

**Expected:**
1. ✅ Notion iframe loads
2. ✅ Notion workspace content visible
3. ✅ No CORS errors in console
4. ✅ Page is scrollable and interactive
5. ✅ Notion branding visible (if public page)

**Fallback Check:**
- ✅ If embed fails, error message displays
- ✅ Link to open Notion in new tab works

---

## 🚨 Common Issues & Fixes

### Issue 1: Blank White Screen
**Cause:** JavaScript bundle not loading  
**Fix:**
1. Check browser console for errors
2. Verify `dist/assets/` files uploaded
3. Check `index.html` loads correctly
4. Verify environment variables injected

### Issue 2: 404 on Routes
**Cause:** SPA routing not configured  
**Fix:**
- Verify `vercel.json` has `"rewrites": [{ "source": "/(.*)", "destination": "/" }]`
- Redeploy if vercel.json was updated

### Issue 3: Styles Missing
**Cause:** CSS not bundled or wrong path  
**Fix:**
1. Check `dist/assets/index-[hash].css` exists
2. Verify Tailwind config in `vite.config.js`
3. Check `index.css` imports in `main.jsx`

### Issue 4: Environment Variables Not Working
**Cause:** Missing `VITE_` prefix or not set in Vercel  
**Fix:**
1. Prefix all client-side env vars with `VITE_`
2. Set in Vercel dashboard → Environment Variables
3. Redeploy after adding env vars

---

## ✅ Final Checklist

**Before marking as complete:**
- [ ] Vercel root directory = `./`
- [ ] Build logs show successful build
- [ ] `dist/` folder uploaded to Lambda
- [ ] Homepage loads with React app
- [ ] All routes accessible
- [ ] Stripe payment flow works
- [ ] Notion embed loads on `/workshop`
- [ ] No console errors on any page
- [ ] Environment variables injected

---

## 📊 Testing Commands

### Local Build Test (Run before deployment)
```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Vercel CLI Test (Optional)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📞 Next Steps

1. **Check Vercel Dashboard** for build status
2. **Visit live URL** and test homepage
3. **Test all routes** from the table above
4. **Test payment flow** with Stripe
5. **Verify Notion embed** on `/workshop`
6. **Report back** with results

**If issues found:**
- Share build logs
- Share browser console errors
- Share screenshots of the issue
- I'll provide targeted fixes

---

**Deployment Time:** [YOUR TIME]  
**Build Status:** [PENDING/SUCCESS/FAILED]  
**Live URL:** [URL]  
**Verified By:** [YOUR NAME]

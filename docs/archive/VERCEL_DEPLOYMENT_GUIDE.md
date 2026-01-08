# 🚀 Vercel Deployment Guide - Vauntico MVP

## Current Status: ✅ READY TO DEPLOY

Your project is properly configured with:
- ✅ `vite.config.js` - React + Vite setup
- ✅ `vercel.json` - Deployment configuration
- ✅ `package.json` - Build scripts and dependencies
- ✅ `index.html` - Entry point with SEO meta tags
- ✅ Public assets and routing setup

---

## 🎯 Step-by-Step Deployment

### 1. Confirm Vercel Settings

From your current Vercel import screen:

```
✅ Project Name: vauntico-mvp
✅ Framework Preset: Vite (correct - locked due to vite.config.js)
✅ Root Directory: ./ (correct - app lives in root)
✅ Build Command: pnpm run build (from vercel.json)
✅ Output Directory: dist (from vercel.json)
✅ Install Command: pnpm install (from vercel.json)
```

**ACTION:** Leave all settings as-is. They're correctly auto-detected.

---

### 2. Configure Environment Variables

**CRITICAL:** Add these before clicking Deploy:

#### Required for Production:
```env
# Paystack Live Keys (replace with your actual keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# App Configuration
VITE_APP_NAME=Vauntico Prompt Vault
VITE_APP_URL=https://vault.vauntico.com
VITE_NOTION_EMBED_URL=https://classy-uranium-c6b.notion.site/Vauntico-Prompt-Vault-Founders-Edition-26a81beec93980c88b4ec6eefe61082c

# Payment Configuration
VITE_PRODUCT_PRICE=97
VITE_CURRENCY=NGN
```

#### Optional (Add if you have these services):
```env
# Email Marketing
VITE_BUTTONDOWN_API_KEY=your_key
VITE_MAILERLITE_API_KEY=your_key
VITE_EMAIL_LIST_ID=your_id

# Analytics
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_VERCEL_ANALYTICS_ID=your_id
VITE_HOTJAR_ID=your_id

# Error Tracking
VITE_SENTRY_DSN=your_dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=false
VITE_ENABLE_EMAIL_SERVICE=true
```

**Where to add:**
1. Click "Environment Variables" dropdown on Vercel screen
2. Add each variable (Name → Value)
3. Select "Production" environment
4. Click "Add" for each

---

### 3. Deploy the Project

**ACTION:** Click the **"Deploy"** button at the bottom of the screen.

Vercel will:
1. ✅ Clone your GitHub repo
2. ✅ Install dependencies with `pnpm install`
3. ✅ Run `pnpm run build` (Vite build)
4. ✅ Output to `dist/` directory
5. ✅ Assign a `.vercel.app` domain
6. ✅ Enable automatic SSL

**Expected Build Time:** 2-4 minutes

---

### 4. Monitor the Build

Watch the deployment logs for:
- ✅ Dependencies installed successfully
- ✅ Build completed without errors
- ✅ All routes properly configured
- ✅ Assets uploaded to CDN

**Common Build Issues:**
```bash
# If build fails, check:
- All environment variables are prefixed with VITE_
- No console.log errors in code
- All imports are correct
```

---

### 5. Bind Custom Domain (vault.vauntico.com)

After successful deployment:

#### A. Remove from Old Project (if needed)
1. Go to Vercel Dashboard
2. Find old project using `vault.vauntico.com`
3. Settings → Domains → Remove domain

#### B. Add to New Project
1. Go to your new `vauntico-mvp` project
2. Settings → Domains
3. Click "Add Domain"
4. Enter: `vault.vauntico.com`
5. Click "Add"

#### C. Configure DNS (if not auto-detected)

**Option 1: Vercel Nameservers (Recommended)**
```
Update your domain's nameservers to:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option 2: CNAME Record**
```
Type: CNAME
Name: vault
Value: cname.vercel-dns.com
```

**Option 3: A Record**
```
Type: A
Name: vault
Value: 76.76.21.21
```

#### D. Wait for Verification
- DNS propagation: 5 minutes - 48 hours
- SSL certificate: Auto-issued by Vercel
- Status: Check Settings → Domains

---

### 6. Validate the Live Site

Visit `https://vault.vauntico.com` and verify:

#### ✅ Core Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes)
- [ ] Latest scrolls/CLI visible
- [ ] Responsive design (mobile + desktop)
- [ ] HTTPS active (green lock icon)

#### ✅ Payment Flow
- [ ] "Buy Access" button works
- [ ] Paystack popup appears
- [ ] Test payment succeeds
- [ ] Redirects to success page
- [ ] Notion embed loads

#### ✅ Technical Checks
Open Browser DevTools (F12):

**Console Tab:**
```javascript
// Should see no errors
// May see info logs if analytics enabled
```

**Network Tab:**
```
✅ index.html - 200 OK
✅ main.js - 200 OK
✅ main.css - 200 OK
✅ favicon.ico - 200 OK
✅ All API calls successful
```

**Performance:**
- First Load: < 3 seconds
- Lighthouse Score: > 90

---

## 🔧 Post-Deployment Configuration

### 1. Automatic Deployments
Vercel automatically deploys on:
- ✅ Push to `main` branch
- ✅ Pull request previews
- ✅ GitHub commits

**Configure:**
Settings → Git → Production Branch → `main`

### 2. Paystack Webhook Setup

**Add Webhook URL:**
```
https://vault.vauntico.com/api/paystack/webhook
```

**Note:** You'll need to create this endpoint if backend verification is needed.

### 3. Enable Analytics

**Vercel Analytics:**
1. Settings → Analytics
2. Enable Web Analytics
3. Add to your code (optional - Vercel auto-injects)

**Add to code (optional):**
```javascript
// src/main.jsx
import { inject } from '@vercel/analytics';
inject();
```

### 4. Set Up Monitoring

**Vercel Logs:**
- Settings → Functions → View Logs
- Monitor errors and performance

**Speed Insights:**
- Settings → Speed Insights
- Enable real user monitoring

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module 'X'"**
```bash
# Fix: Check package.json dependencies
pnpm install
pnpm run build  # Test locally first
```

**Error: "Environment variable not found"**
```bash
# Fix: Add VITE_ prefix
# ❌ PAYSTACK_KEY
# ✅ VITE_PAYSTACK_KEY
```

### Domain Not Working

**"Domain already in use"**
```
1. Find old project in Vercel dashboard
2. Remove domain from old project
3. Wait 5 minutes
4. Add to new project
```

**SSL Certificate Pending**
```
1. Wait 10-20 minutes
2. Check DNS propagation: whatsmydns.net
3. Contact Vercel support if > 24 hours
```

### 404 Errors on Routes

**Issue:** `/vault-access` returns 404

**Fix:** Already handled in `vercel.json`:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/" }
]
```

If still failing:
1. Check `vercel.json` is in root
2. Redeploy with Settings → Deployments → Redeploy

---

## 📋 Pre-Deployment Checklist

Before clicking Deploy:

- [ ] GitHub repo is up to date
- [ ] All environment variables added (especially Paystack keys)
- [ ] Test build works locally (`pnpm run build`)
- [ ] Paystack account is in LIVE mode (not test)
- [ ] Custom domain DNS is ready
- [ ] Old domain removed from previous project
- [ ] Content is production-ready (no test data)
- [ ] Analytics IDs configured (if using)
- [ ] Notion embed URL is public
- [ ] Favicon exists in `/public`

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ `https://vault.vauntico.com` loads instantly  
✅ HTTPS lock icon is green  
✅ All pages navigate correctly  
✅ Payment flow works end-to-end  
✅ Mobile responsive  
✅ No console errors  
✅ Lighthouse score > 85  
✅ Auto-deploys on git push  

---

## 🆘 Emergency Rollback

If something breaks:

1. Go to Vercel Dashboard
2. Deployments → Find last working deployment
3. Click "..." → "Promote to Production"
4. Fix issue locally
5. Redeploy when ready

---

## 📞 Support Contacts

**Vercel Support:**
- Dashboard → Help → Contact Support
- Twitter: @vercel
- Discord: vercel.com/discord

**Payment Issues:**
- Paystack: support@paystack.com
- Check webhook logs in Paystack dashboard

**Domain Issues:**
- Your domain registrar support
- Use DNS checker: dnschecker.org

---

## 🚀 Next Steps After Deployment

1. **Test Everything:**
   - Run through complete user journey
   - Test on multiple devices/browsers
   - Verify analytics tracking

2. **Set Up Monitoring:**
   - Enable Vercel Analytics
   - Configure error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)

3. **Marketing:**
   - Submit to search engines
   - Update social media links
   - Share with beta users

4. **Optimization:**
   - Review Lighthouse report
   - Optimize images (if any)
   - Enable caching headers (already in vercel.json)

---

## 📊 Expected Performance

With your current setup:

| Metric | Target | Your Config |
|--------|--------|-------------|
| First Load | < 3s | ✅ Vite optimized |
| Lighthouse | > 90 | ✅ SSG + CDN |
| Build Time | < 5min | ✅ ~2-3 min |
| Deploy Time | < 1min | ✅ Edge network |
| Uptime | 99.9% | ✅ Vercel SLA |

---

## ✅ You're Ready!

Your project is configured correctly. Just:

1. **Add environment variables** (especially Paystack keys)
2. **Click Deploy**
3. **Wait 2-4 minutes**
4. **Add custom domain**
5. **Test thoroughly**

**Good luck with your deployment! 🎉**

---

*Last Updated: 2025-01-XX*  
*Project: Vauntico MVP*  
*Platform: Vercel + Vite + React*

# ⚡ Phase 5 Quick Start: Deploy in 10 Minutes

## 🎯 Goal
Get Vauntico live with analytics and syndication in under 10 minutes.

---

## ✅ Pre-Flight Checklist

```bash
# 1. Verify all dependencies installed
npm install

# 2. Test build locally
npm run build

# 3. Test dev mode
npm run dev
```

**Check these pages work:**
- ✅ http://localhost:5173/ (Dashboard)
- ✅ http://localhost:5173/lore (Lore Vault)
- ✅ http://localhost:5173/ascend (Soul Stack - NEW!)
- ✅ http://localhost:5173/creator-pass (Pricing)

---

## 🚀 Deploy Steps

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**That's it!** Vercel auto-detects Vite and configures everything.

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/vauntico",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. Deploy:
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## 📊 Enable Analytics (Optional - 5 min)

### Google Analytics 4

1. Get your GA4 Measurement ID from Google Analytics
2. Edit `src/utils/analytics.js`:
```javascript
const ANALYTICS_CONFIG = {
  providers: {
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-XXXXXXXXXX' // Your ID here
    }
  }
}
```

3. Add to `index.html` before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics

1. Edit `src/utils/analytics.js`:
```javascript
const ANALYTICS_CONFIG = {
  providers: {
    plausible: {
      enabled: true,
      domain: 'yourdomain.com'
    }
  }
}
```

2. Add to `index.html` before `</head>`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🔗 Test Syndication Features

### 1. Get Your Referral Code
```javascript
// Open browser console on your live site
window.VaunticoSyndication.getMyCode()
// Copy the code shown
```

### 2. Test Share Links

1. Visit `/lore` on your live site
2. Click any scroll
3. Click "Share" button (if integrated)
4. OR manually test:
```javascript
// Browser console
window.VaunticoSyndication.viewStats()
// Copy the Creator Pass link and share it!
```

### 3. Test Analytics

```javascript
// Browser console
window.VaunticoAnalytics.logState()
// Should show session ID, user ID, etc.
```

---

## 🎯 Post-Deploy Actions (5 min)

### 1. Update Social Links
- Share on Twitter/X: "Just launched Vauntico! Check it out: [your-url]"
- Post on LinkedIn
- Share in relevant communities

### 2. Set Up Referral Tracking
- Get your referral code from console
- Create branded link: `yourdomain.com/creator-pass?ref=YOUR-CODE`
- Track in spreadsheet or notion

### 3. Test Mobile
- Open site on phone
- Test `/ascend` page
- Verify animations work
- Check share modal

---

## 🐛 Common Issues

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Analytics Not Working
1. Check console for errors
2. Verify provider IDs are correct
3. Check Network tab for tracking requests
4. Enable debug mode in `analytics.js`

### Referral Links Don't Work
1. Check localStorage: `localStorage.getItem('vauntico_my_referral_code')`
2. Generate new code: `window.VaunticoSyndication.resetCode()`
3. Verify URL parameters are preserved

---

## 📈 Monitor Your Launch

### Day 1 Checklist
- [ ] Site loads without errors
- [ ] Analytics tracking events (check provider dashboard)
- [ ] Share 3 scrolls on social media
- [ ] Send to 5 friends/colleagues
- [ ] Monitor console for errors

### Week 1 Checklist
- [ ] 100+ page views
- [ ] 10+ scroll shares
- [ ] 1+ subscription (if pricing live)
- [ ] No critical bugs reported
- [ ] Analytics showing data

---

## 🔧 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Deployment
vercel --prod                  # Deploy to Vercel
netlify deploy --prod          # Deploy to Netlify

# Testing
window.VaunticoAnalytics.logState()      # Check analytics
window.VaunticoSyndication.getMyCode()   # Get referral code
window.VaunticoDev.logState()            # Check pricing state
```

---

## 🎉 You're Live!

Your deployment URL should look like:
- **Vercel**: `https://vauntico.vercel.app`
- **Netlify**: `https://vauntico.netlify.app`
- **Custom**: `https://yourdomain.com`

### Share Your Launch:
```
🚀 Just launched Vauntico - AI-powered content creation platform!

✨ Features:
- Interactive scroll library
- CLI onboarding system
- Soul stack progression
- Referral rewards

Check it out: [your-url]
```

---

## 📞 Need Help?

- Check `PHASE_5_DEPLOYMENT_GUIDE.md` for detailed instructions
- Review `PHASE_5_COMPLETE.md` for full feature list
- Test with dev tools in browser console
- Verify all files are committed to git

---

**Total Time:** ~10 minutes
**Status:** ✅ Production Ready
**Next:** Share and activate syndication!

🎊 **Congrats on shipping Phase 5!**

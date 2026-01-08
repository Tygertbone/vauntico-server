# 🚀 Vauntico MVP - Production Deployment Guide

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Code Cleanup (COMPLETED)
- ✅ **Dev Tools Gated**: `window.VaunticoDev` only available in development mode
- ✅ **PricingDemo Route**: NOT included in production App.jsx routes
- ✅ **Build Configuration**: Optimized for production (minification, no sourcemaps)
- ✅ **SEO Meta Tags**: Added comprehensive SEO and social media tags
- ✅ **Production Logging**: Clean console output in production mode

### 2. Environment Variables
No `.env` files required for MVP. All configuration is:
- Pricing logic: Hardcoded in `src/utils/pricing.js`
- Regional currency: Auto-detected via browser locale
- Access control: LocalStorage (development) → API (future)

⚠️ **Future**: When integrating payment APIs, create `.env.production` with:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_API_BASE_URL=https://api.vauntico.com
```

### 3. Final QA Checklist

#### Pricing Logic
- [ ] Visit `/pricing` - Verify prices display correctly
- [ ] Visit `/creator-pass` - Check subscription flow
- [ ] Visit `/workshop-kit` - Validate access gate
- [ ] Visit `/audit-service` - Confirm pricing tiers display
- [ ] Test regional currency (ZAR vs USD detection)

#### Access Gates
- [ ] `/workshop-kit` shows paywall without access
- [ ] `/audit-service` shows subscription gate
- [ ] Access badges display correct states
- [ ] Creator Pass promo banners appear correctly

#### Audit Validator & Scrolls
- [ ] Navigate to Vaults section
- [ ] Test scroll opening animation
- [ ] Verify scroll content renders properly
- [ ] Check audit validator functionality
- [ ] Confirm scroll access permissions work

#### Navigation & UX
- [ ] All navigation links work
- [ ] Mobile responsive design
- [ ] Loading states appear/disappear
- [ ] No console errors
- [ ] Footer links functional

---

## 🏗️ BUILD FOR PRODUCTION

### Step 1: Install Dependencies (if needed)
```bash
npm install
# or
pnpm install
```

### Step 2: Run Production Build
```bash
npm run build
```

Expected output:
```
✓ build completed in X.XXs
✓ dist folder created with optimized assets
```

### Step 3: Preview Production Build Locally
```bash
npm run preview
```
Test all functionality on `http://localhost:4173`

### Step 4: Build Verification
Check the `dist/` folder:
- ✅ `index.html` exists
- ✅ `assets/` folder contains minified JS/CSS
- ✅ No `.map` sourcemap files (security)
- ✅ File sizes are reasonable (<500KB total JS)

---

## 🌐 DEPLOYMENT OPTIONS

### Option A: Vercel (Recommended - Zero Config)

#### Automatic Deployment (Git-based)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Production deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects `vercel.json` settings
   - Click "Deploy"

3. **Verify Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: 18.x

#### Manual Deployment (CLI)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Netlify

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Select your Git repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Deploy**:
   - Click "Deploy site"
   - Monitor build logs

### Option C: Self-Hosted (VPS/Cloud)

#### Prerequisites
- Ubuntu/Debian server
- Node.js 18+
- Nginx installed
- Domain pointed to server IP

#### Deployment Steps

1. **Build Locally**:
   ```bash
   npm run build
   ```

2. **Copy to Server**:
   ```bash
   scp -r dist/* user@your-server:/var/www/vauntico
   ```

3. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name vauntico.com;
       
       root /var/www/vauntico;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d vauntico.com
   ```

5. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Live Site Checks
Visit your production URL and verify:

- [ ] **Homepage loads** without errors
- [ ] **HTTPS is active** (padlock icon in browser)
- [ ] **Meta tags present** (View Page Source → check `<head>`)
- [ ] **Mobile responsive** (test on phone or browser DevTools)

### 2. Functional Testing

#### Test Pricing Display
1. Visit `/pricing`
2. Check prices show in correct currency
3. Verify Creator Pass features list

#### Test Access Control
1. Open browser console
2. Verify NO dev tools are exposed: `window.VaunticoDev` should be `undefined`
3. LocalStorage should be empty initially

#### Test Navigation
1. Click all navigation links
2. Test Services dropdown menu
3. Click all footer links
4. Verify no 404 errors

#### Test Scroll & Vault Features
1. Navigate to `/vaults`
2. Open a vault scroll
3. Verify animations work
4. Test audit validator

### 3. Performance Checks

Use [PageSpeed Insights](https://pagespeed.web.dev/):
- [ ] Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

Use [GTmetrix](https://gtmetrix.com/):
- [ ] Page load time < 3s
- [ ] Total page size < 2MB

### 4. SEO Verification

Use [Google Search Console](https://search.google.com/search-console):
- [ ] Submit sitemap
- [ ] Request indexing
- [ ] Check mobile usability

Test meta tags with [Meta Tags Checker](https://metatags.io/):
- [ ] Title displays correctly
- [ ] Description displays correctly
- [ ] Open Graph images load

### 5. Regional Pricing Test

Test from different locations:
- **ZAR Region** (South Africa):
  - Prices should show: R499, R999, R29/month
  
- **USD Region** (USA/International):
  - Prices should show: $29, $59, etc.

**How to Test**:
- Use VPN to change location, OR
- Manually set browser locale:
  - Chrome: Settings → Languages → Add "Afrikaans (South Africa)"
  - Firefox: about:config → `intl.accept_languages` → `af-ZA,af`

---

## 🐛 TROUBLESHOOTING

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Routing Issues (404 on refresh)
- **Vercel**: Should work automatically with `vercel.json`
- **Netlify**: Add `_redirects` file to `public/`:
  ```
  /*    /index.html   200
  ```
- **Nginx**: Ensure `try_files` directive is correct

### Prices Not Showing Correctly
- Check browser console for errors
- Verify `getUserCurrency()` returns correct currency
- Test with different browser locales

### Access Gates Not Working
- LocalStorage might be disabled
- Check browser console for errors
- Verify `useAccess` hooks are imported correctly

### HTTPS Not Working
- Check DNS records point to hosting provider
- Wait 24-48 hours for DNS propagation
- Verify SSL certificate is active

---

## 📊 MONITORING & ANALYTICS

### Recommended Setup

1. **Google Analytics**:
   Add to `index.html` before `</head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

2. **Error Tracking** (Sentry):
   ```bash
   npm install @sentry/react
   ```
   Configure in `main.jsx`

3. **Uptime Monitoring**:
   - [UptimeRobot](https://uptimerobot.com/) (Free)
   - [Pingdom](https://www.pingdom.com/)

---

## 🔄 CONTINUOUS DEPLOYMENT

### Vercel Auto-Deploy
Already configured! Every push to `main` branch automatically deploys.

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run test # If you add tests
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment is successful when**:
1. Live site accessible via HTTPS
2. No console errors on any page
3. All pricing displays correctly
4. Access gates function properly
5. Scroll animations work smoothly
6. Mobile responsive design works
7. PageSpeed score > 90
8. SEO meta tags present
9. Regional currency auto-detection works
10. No dev tools exposed in production

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **React Router**: https://reactrouter.com/en/main

---

## 🚨 ROLLBACK PLAN

If production has critical issues:

### Vercel/Netlify
1. Go to Deployments tab
2. Select previous working deployment
3. Click "Promote to Production"

### Self-Hosted
```bash
# Keep backups of previous builds
cp -r dist dist-backup-$(date +%Y%m%d)

# Rollback if needed
rm -rf /var/www/vauntico
cp -r dist-backup-YYYYMMDD /var/www/vauntico
sudo systemctl restart nginx
```

---

**Last Updated**: 2024
**Version**: 1.0.0 MVP
**Status**: Ready for Production Deployment ✅

# 🚀 VERCEL CLEANUP & DOMAIN CONSOLIDATION - ACTION PLAN

## 🎯 OBJECTIVE
Consolidate 5 Vercel deployments into ONE production site at `vauntico.com` with proper redirects and SEO configuration.

---

## 📊 CURRENT STATE

### Active Deployments
1. ✅ **vauntico-mvp-cursur-build** (PRODUCTION - Keep this)
   - URL: vauntico-mvp-cursur-build.vercel.app
   - Status: Live, verified, optimized
   - Build: 279KB, 9s deployment
   
2. ⚠️ **vauntico-mvp** → www.vauntico.com
   - Currently pointing to custom domain
   - Needs to be retired/redirected
   
3. ❌ **vauntico-mvp1** → vault.vauntico.com
   - Subdomain deployment
   - Archive unless vault feature requires separate deployment
   
4. ❌ **vauntico_mvp_1.0** → vauntico-mvp10.vercel.app
   - Old version, archive
   
5. ❌ **vauntico_mvp_ignite** → vaunticomvpignite.vercel.app
   - Old version, archive

---

## 🎬 PHASE 1: DOMAIN CONFIGURATION (30 minutes)

### Step 1: Access Vercel Dashboard
```bash
# Open browser
https://vercel.com/dashboard

# Or use CLI
vercel login
vercel list
```

### Step 2: Link vauntico.com to Production Project

**Via Vercel Dashboard (Recommended):**

1. Navigate to: `vauntico-mvp-cursur-build` project
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `vauntico.com`
5. Click **Add**
6. Copy the DNS instructions provided

**Via Vercel CLI (Alternative):**
```bash
cd /path/to/vauntico-mvp
vercel link
# Select: vauntico-mvp-cursur-build
vercel domains add vauntico.com
```

---

### Step 3: Configure DNS Records

**Go to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

**Add these DNS records:**

#### For Apex Domain (vauntico.com)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: AAAA (IPv6)
Name: @
Value: 2606:4700:10::6816:1515
TTL: 3600
```

#### For WWW Subdomain (www.vauntico.com)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### Delete Old Records
- Remove any existing A/CNAME records pointing to old Vercel deployments
- Remove vault.vauntico.com CNAME (unless keeping it)

---

### Step 4: Verify DNS Propagation

**Wait 5-10 minutes**, then test:

```bash
# Check apex domain
dig vauntico.com

# Check www redirect
dig www.vauntico.com

# Check HTTPS
curl -I https://vauntico.com
```

**Expected Results:**
- `vauntico.com` → Points to Vercel IPs
- `www.vauntico.com` → CNAME to Vercel
- HTTPS certificate auto-issued (may take 10 minutes)

---

## 🔀 PHASE 2: SET UP REDIRECTS (15 minutes)

### Step 1: Update vercel.json

**File:** `vercel.json`

**Replace entire contents with:**

```json
{
  "redirects": [
    {
      "source": "https://www.vauntico.com/:path*",
      "destination": "https://vauntico.com/:path*",
      "permanent": true
    },
    {
      "source": "https://vauntico-mvp-cursur-build.vercel.app/:path*",
      "destination": "https://vauntico.com/:path*",
      "permanent": true
    },
    {
      "source": "https://vauntico-mvp10.vercel.app/:path*",
      "destination": "https://vauntico.com/:path*",
      "permanent": true
    },
    {
      "source": "https://vaunticomvpignite.vercel.app/:path*",
      "destination": "https://vauntico.com/:path*",
      "permanent": true
    },
    {
      "source": "https://vault.vauntico.com/:path*",
      "destination": "https://vauntico.com/:path*",
      "permanent": true
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Accept"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Step 2: Commit and Deploy

```bash
git add vercel.json
git commit -m "feat: Configure domain redirects and HSTS"
git push origin main
```

**Vercel will auto-deploy** (wait 1-2 minutes)

---

## 🗑️ PHASE 3: ARCHIVE OLD DEPLOYMENTS (15 minutes)

### Step 1: Test New Domain First

**Before deleting anything**, verify vauntico.com works:

```bash
# Test all routes
curl https://vauntico.com
curl https://vauntico.com/pricing
curl https://vauntico.com/about
curl https://www.vauntico.com  # Should redirect to apex
```

### Step 2: Archive Old Projects

**Via Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. For each old project:
   - Click project name
   - Settings → General
   - Scroll to **Delete Project**
   - Type project name to confirm
   - Click **Delete**

**Projects to Delete:**
- ❌ `vauntico-mvp` (if not in use)
- ❌ `vauntico-mvp1`
- ❌ `vauntico_mvp_1.0`
- ❌ `vauntico_mvp_ignite`

**Keep:**
- ✅ `vauntico-mvp-cursur-build` (production)

---

## 🔍 PHASE 4: SEO & ANALYTICS UPDATE (10 minutes)

### Step 1: Update Google Search Console

1. Go to: https://search.google.com/search-console
2. Add property: `vauntico.com`
3. Verify ownership (DNS TXT record or HTML file)
4. Submit sitemap: `https://vauntico.com/sitemap.xml` (generate one)
5. Mark old URLs as 301 redirects

### Step 2: Update Google Analytics

1. Go to: https://analytics.google.com
2. Find your property: `G-30N4CHF6JR`
3. Admin → Property Settings → Website URL
4. Update to: `https://vauntico.com`

### Step 3: Update Social Media Links

**Update these platforms:**
- Twitter/X bio
- LinkedIn company page
- GitHub README
- Any marketing materials

---

## ✅ PHASE 5: VERIFICATION CHECKLIST

### Domain & Redirects
- [ ] `https://vauntico.com` loads correctly
- [ ] `https://www.vauntico.com` redirects to apex
- [ ] HTTPS certificate is valid (green padlock)
- [ ] Old Vercel URLs redirect to new domain
- [ ] All pages work (/pricing, /about, /lore, etc.)

### SEO
- [ ] Page title shows new positioning
- [ ] Meta description updated
- [ ] OG tags correct in source code
- [ ] Twitter cards display properly
- [ ] Google Search Console verified

### Analytics
- [ ] GA4 tracking works (check Real-Time)
- [ ] Page views recorded
- [ ] Events firing correctly

### Performance
- [ ] Lighthouse score > 90
- [ ] Page load < 3s
- [ ] No console errors
- [ ] Mobile responsive

---

## 🚨 ROLLBACK PROCEDURE

**If something breaks:**

### Option 1: Revert DNS
1. Go to domain registrar
2. Change A record back to old Vercel deployment
3. Wait 5-10 minutes for propagation

### Option 2: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 3: Vercel Rollback
1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click ⋯ → Promote to Production

---

## 📊 SUCCESS METRICS

**You'll know it worked when:**
- ✅ Only ONE Vercel project remains
- ✅ vauntico.com is your primary URL
- ✅ All old URLs redirect properly
- ✅ SEO chaos is resolved (no duplicate content)
- ✅ Analytics track to one domain
- ✅ No 404 errors on old links

---

## 🎯 ESTIMATED TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | Domain Configuration | 30 min |
| 2 | Set Up Redirects | 15 min |
| 3 | Archive Old Deployments | 15 min |
| 4 | SEO & Analytics Update | 10 min |
| 5 | Verification | 10 min |
| **TOTAL** | | **80 min (1h 20m)** |

---

## 📞 SUPPORT

**If you get stuck:**
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- DNS Checker: https://dnschecker.org
- HTTPS Checker: https://www.ssllabs.com/ssltest/

**Common Issues:**
- **DNS not propagating**: Wait 30 min, try `dig vauntico.com`
- **HTTPS certificate pending**: Vercel auto-issues, wait 10 min
- **Redirects not working**: Clear browser cache, test in incognito
- **Old URLs still live**: Delete old Vercel projects

---

## ✨ NEXT STEPS AFTER CLEANUP

1. [ ] Generate sitemap.xml
2. [ ] Set up monitoring (UptimeRobot, etc.)
3. [ ] Configure CDN caching rules
4. [ ] Add backup domain (vauntico.app?)
5. [ ] Plan Phase 6: Backend integration

---

**Status:** Ready to Execute  
**Risk Level:** Low (easy rollback)  
**Confidence:** High ✅  

**Start Time:** ___________  
**Completion Time:** ___________  
**Verified By:** ___________

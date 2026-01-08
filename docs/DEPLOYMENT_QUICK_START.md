# ⚡ Quick Start: Deploy to Vercel NOW

## 🎯 5-Minute Deployment

### Step 1: Environment Variables (2 min)
On the Vercel import screen, click "Environment Variables" and add:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
VITE_PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
VITE_APP_URL=https://vault.vauntico.com
VITE_NOTION_EMBED_URL=https://classy-uranium-c6b.notion.site/Vauntico-Prompt-Vault-Founders-Edition-26a81beec93980c88b4ec6eefe61082c
VITE_PRODUCT_PRICE=97
VITE_CURRENCY=NGN
```

### Step 2: Deploy (2 min)
1. Click **"Deploy"** button
2. Wait for build to complete
3. Get your `.vercel.app` URL

### Step 3: Add Domain (1 min)
1. Settings → Domains
2. Add `vault.vauntico.com`
3. Configure DNS (CNAME to `cname.vercel-dns.com`)

### Step 4: Test
Visit `https://vault.vauntico.com`:
- ✅ Homepage loads
- ✅ Payment works
- ✅ HTTPS enabled

---

## 🔑 Critical Environment Variables

**Minimum Required:**
- `VITE_PAYSTACK_PUBLIC_KEY` - Your Paystack public key
- `VITE_PAYSTACK_SECRET_KEY` - Your Paystack secret key

**Highly Recommended:**
- `VITE_APP_URL` - Your custom domain
- `VITE_PRODUCT_PRICE` - Product price (default: 97)
- `VITE_CURRENCY` - Currency code (default: NGN)

---

## 🚨 Common Mistakes to Avoid

❌ Using test keys in production  
✅ Use `pk_live_` and `sk_live_` keys

❌ Forgetting `VITE_` prefix  
✅ All variables must start with `VITE_`

❌ Wrong root directory  
✅ Use `./` (current setup is correct)

❌ Wrong domain configuration  
✅ Remove from old project first

---

## 📱 DNS Configuration Options

### Option 1: CNAME (Recommended)
```
Type: CNAME
Name: vault
Value: cname.vercel-dns.com
```

### Option 2: A Record
```
Type: A
Name: vault
Value: 76.76.21.21
```

### Option 3: Vercel Nameservers
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

---

## ✅ Current Config Status

Your project files are **ready**:
- ✅ `vercel.json` - Optimized for Vite
- ✅ `vite.config.js` - React + Tailwind
- ✅ `package.json` - pnpm scripts
- ✅ Routes configured (SPA rewrites)
- ✅ SEO meta tags added
- ✅ Public assets ready

**You can deploy right now!**

---

## 🎉 That's It!

No code changes needed. Just:
1. Add env vars
2. Click Deploy
3. Add domain
4. Test

**Deploy Time:** < 5 minutes  
**Auto-Deploy:** Enabled on push to main  
**SSL:** Auto-provisioned  
**CDN:** Global edge network

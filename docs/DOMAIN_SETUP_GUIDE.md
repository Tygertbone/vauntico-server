# 🌐 Domain Setup Guide: vauntico.com

Complete guide to point your domain to the Vercel deployment.

---

## 📋 **Prerequisites**

- ✅ Access to your domain registrar (where you bought vauntico.com)
- ✅ Vercel account with deployed project
- ✅ GitHub repository connected to Vercel

---

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Add Domain in Vercel** (2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **vauntico-mvp** project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `vauntico.com`
6. Click **Add**
7. Repeat for `www.vauntico.com`

**Vercel will show you DNS records to configure.**

---

### **Step 2: Configure DNS Records** (5 minutes)

Go to your domain registrar's DNS management panel and add these records:

| Type  | Name/Host | Value                    | TTL  |
|-------|-----------|--------------------------|------|
| A     | @         | `76.76.21.21`           | 3600 |
| CNAME | www       | `cname.vercel-dns.com`  | 3600 |

**Important:**
- Delete any existing A or CNAME records for `@` and `www` first
- `@` means the root domain (vauntico.com)
- TTL can be 3600 (1 hour) or Auto

---

### **Step 3: Wait for Propagation** (5-60 minutes)

1. DNS changes can take **5-60 minutes** to propagate globally
2. Vercel will **automatically provision SSL certificate**
3. You'll see a ✅ **SSL Certificate Issued** in Vercel dashboard

**Check propagation:**
```bash
# Windows (PowerShell)
nslookup vauntico.com

# Should show: 76.76.21.21
```

---

## 📱 **Registrar-Specific Instructions**

### **Namecheap**

1. Log in to Namecheap
2. Dashboard → Domain List → **Manage** (next to vauntico.com)
3. **Advanced DNS** tab
4. **Add New Record**:
   - Type: **A Record**
   - Host: **@**
   - Value: **76.76.21.21**
   - TTL: **Automatic**
5. **Add New Record**:
   - Type: **CNAME Record**
   - Host: **www**
   - Value: **cname.vercel-dns.com**
   - TTL: **Automatic**
6. Click **Save All Changes**

**Screenshot locations:**
- Advanced DNS is at the top tabs
- Click green "+ Add New Record" button

---

### **GoDaddy**

1. Log in to GoDaddy
2. **My Products** → Domain → **DNS** (next to vauntico.com)
3. Click **Add** button
4. Add **A Record**:
   - Name: **@**
   - Value: **76.76.21.21**
   - TTL: **1 Hour**
5. Add **CNAME**:
   - Name: **www**
   - Value: **cname.vercel-dns.com**
   - TTL: **1 Hour**
6. Click **Save**

---

### **Cloudflare**

1. Log in to Cloudflare
2. Select **vauntico.com** domain
3. **DNS** tab
4. Click **Add record**
5. Add **A Record**:
   - Type: **A**
   - Name: **@** (or leave blank for root)
   - IPv4 address: **76.76.21.21**
   - Proxy status: **DNS only** (gray cloud) ← IMPORTANT
   - TTL: **Auto**
6. Add **CNAME**:
   - Type: **CNAME**
   - Name: **www**
   - Target: **cname.vercel-dns.com**
   - Proxy status: **DNS only** (gray cloud) ← IMPORTANT
   - TTL: **Auto**
7. Click **Save**

**After SSL is issued in Vercel:**
- You can enable **Proxy** (orange cloud) for both records
- This adds Cloudflare CDN and security features

---

### **Google Domains**

1. Log in to Google Domains
2. Click **Manage** next to vauntico.com
3. **DNS** (left menu)
4. **Custom resource records**
5. Add **A Record**:
   - Name: **@**
   - Type: **A**
   - TTL: **1h**
   - Data: **76.76.21.21**
6. Add **CNAME**:
   - Name: **www**
   - Type: **CNAME**
   - TTL: **1h**
   - Data: **cname.vercel-dns.com**
7. Click **Add**

---

### **Other Registrars**

**General steps work for most registrars:**
1. Find "DNS Management" or "DNS Settings"
2. Add A record: `@` → `76.76.21.21`
3. Add CNAME record: `www` → `cname.vercel-dns.com`
4. Save changes

---

## 🔐 **SSL Certificate Setup**

### **Automatic (Recommended)**

Vercel automatically provisions SSL using **Let's Encrypt**:

1. After DNS records propagate, Vercel detects them
2. SSL certificate is issued automatically (2-10 minutes)
3. Certificate auto-renews every 90 days
4. No action needed from you!

### **Custom SSL (Advanced)**

If you have your own SSL certificate:

1. Vercel Dashboard → Settings → Domains
2. Click on your domain → **SSL Certificate**
3. Upload **Certificate** and **Private Key**

---

## ✅ **Verification Checklist**

After setup, verify everything works:

### **1. DNS Propagation**
```bash
# Check A record
nslookup vauntico.com
# Should show: 76.76.21.21

# Check CNAME
nslookup www.vauntico.com
# Should show: cname.vercel-dns.com
```

### **2. HTTP → HTTPS Redirect**
- Visit `http://vauntico.com` → Should redirect to `https://vauntico.com`
- Visit `http://www.vauntico.com` → Should redirect to `https://vauntico.com`

### **3. SSL Certificate**
- Click padlock icon in browser address bar
- Should show **Valid** certificate
- Issued by: **Let's Encrypt** or **Vercel**

### **4. All Pages Load**
Test these URLs:
- ✅ https://vauntico.com
- ✅ https://vauntico.com/creator-pass
- ✅ https://vauntico.com/lore
- ✅ https://vauntico.com/ascend
- ✅ https://vauntico.com/pricing

---

## 🛠️ **Troubleshooting**

### **"Invalid Configuration" in Vercel**

**Cause:** DNS records not propagated yet  
**Fix:** Wait 10-30 minutes, then click **Refresh** in Vercel

### **"Nameservers" Message**

**Cause:** Domain using wrong nameservers  
**Fix:**
- If using Cloudflare, nameservers should point to Cloudflare
- If using registrar DNS, use registrar's nameservers
- Vercel **does not require** changing nameservers

### **SSL Not Issuing**

**Cause:** CAA records blocking Let's Encrypt  
**Fix:** Add CAA record:
```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
```

### **www Not Working**

**Cause:** CNAME record missing or incorrect  
**Fix:** Ensure CNAME record is:
- Name: **www**
- Value: **cname.vercel-dns.com** (NOT vauntico.com)

### **Old Site Still Showing**

**Cause:** Browser cache or DNS cache  
**Fix:**
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Try incognito/private window
4. Flush DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   ```

---

## 📊 **Post-Setup Configuration**

### **Update Environment Variables in Vercel**

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Add these variables (if not already added):

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_APP_URL` | `https://vauntico.com` | Production |
| `VITE_MIXPANEL_TOKEN` | `f8d19eae67c8d6bef4f547d72d4b4b57` | Production |
| `VITE_GA4_ID` | `G-30N4CHF6JR` | Production |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` (when ready) | Production |

3. Click **Save**
4. **Redeploy** your project to apply changes

### **Redirect www → non-www (Optional)**

Vercel handles this automatically! Both will work:
- `www.vauntico.com` → Redirects to → `vauntico.com`
- `vauntico.com` → Works directly

No extra configuration needed.

---

## 🎯 **Final Checklist**

Before announcing your site:

- [ ] Domain resolves to Vercel (nslookup check)
- [ ] SSL certificate issued and valid
- [ ] HTTP → HTTPS redirect works
- [ ] www → root redirect works
- [ ] All pages load without errors
- [ ] Analytics tracking works (check Mixpanel dashboard)
- [ ] Mobile responsive (test on phone)
- [ ] Forms work (email capture, etc.)
- [ ] Navigation works (all links)
- [ ] Console has no errors (F12 → Console tab)

---

## 📞 **Need Help?**

### **Vercel Support**
- [Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Community](https://github.com/vercel/vercel/discussions)
- [Status Page](https://www.vercel-status.com)

### **DNS Propagation Checker**
- https://dnschecker.org
- Enter `vauntico.com` to see global propagation status

### **SSL Checker**
- https://www.ssllabs.com/ssltest/
- Test your SSL configuration and security score

---

## 🎉 **You're Live!**

Once DNS propagates and SSL is issued:

✅ Your site is live at **https://vauntico.com**  
✅ Secure connection with automatic SSL  
✅ Global CDN via Vercel  
✅ Automatic deployments on Git push  
✅ Analytics tracking active  

**Share your launch:**
- Twitter: "Just launched vauntico.com 🚀"
- LinkedIn: Post about your new platform
- Communities: Share in relevant groups

---

**Last Updated:** January 2025  
**Deployment Status:** ✅ Ready for Production

*Questions? Check the troubleshooting section above or contact Vercel support.*

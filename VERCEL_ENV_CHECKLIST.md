# 🔐 Vercel Environment Variables Checklist

## Copy-Paste Ready Variables

Use this checklist when adding environment variables in Vercel.

---

## ✅ REQUIRED (Must Add Before Deploy)

### Paystack Payment Configuration
```
Name: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_live_[YOUR_LIVE_PUBLIC_KEY]
Environment: Production, Preview
```

```
Name: VITE_PAYSTACK_SECRET_KEY
Value: sk_live_[YOUR_LIVE_SECRET_KEY]
Environment: Production
⚠️  IMPORTANT: Only add to Production, NOT Preview!
```

### App Configuration
```
Name: VITE_APP_URL
Value: https://vault.vauntico.com
Environment: Production, Preview
```

```
Name: VITE_APP_NAME
Value: Vauntico Prompt Vault
Environment: Production, Preview
```

### Notion Integration
```
Name: VITE_NOTION_EMBED_URL
Value: https://classy-uranium-c6b.notion.site/Vauntico-Prompt-Vault-Founders-Edition-26a81beec93980c88b4ec6eefe61082c
Environment: Production, Preview
```

### Payment Details
```
Name: VITE_PRODUCT_PRICE
Value: 97
Environment: Production, Preview
```

```
Name: VITE_CURRENCY
Value: NGN
Environment: Production, Preview
```

---

## 🎯 OPTIONAL (Add If You Have These Services)

### Email Marketing

#### Buttondown
```
Name: VITE_BUTTONDOWN_API_KEY
Value: [YOUR_BUTTONDOWN_API_KEY]
Environment: Production
```

#### MailerLite
```
Name: VITE_MAILERLITE_API_KEY
Value: [YOUR_MAILERLITE_API_KEY]
Environment: Production
```

```
Name: VITE_EMAIL_LIST_ID
Value: [YOUR_EMAIL_LIST_ID]
Environment: Production
```

### Analytics

#### Google Analytics
```
Name: VITE_GOOGLE_ANALYTICS_ID
Value: G-XXXXXXXXXX
Environment: Production, Preview
```

#### Vercel Analytics
```
Name: VITE_VERCEL_ANALYTICS_ID
Value: [YOUR_VERCEL_ANALYTICS_ID]
Environment: Production
```

#### Hotjar
```
Name: VITE_HOTJAR_ID
Value: [YOUR_HOTJAR_ID]
Environment: Production
```

### Error Tracking

#### Sentry
```
Name: VITE_SENTRY_DSN
Value: https://[YOUR_SENTRY_DSN]@sentry.io/[PROJECT_ID]
Environment: Production
```

### Feature Flags

```
Name: VITE_ENABLE_ANALYTICS
Value: true
Environment: Production, Preview
```

```
Name: VITE_ENABLE_ERROR_TRACKING
Value: true
Environment: Production
```

```
Name: VITE_ENABLE_EMAIL_SERVICE
Value: true
Environment: Production
```

---

## 🚨 Critical Reminders

### 1. VITE_ Prefix Required
All environment variables MUST start with `VITE_` to be accessible in the frontend.

❌ Wrong:
```
PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

✅ Correct:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

### 2. Use LIVE Keys in Production
❌ Wrong (Test Keys):
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_PAYSTACK_SECRET_KEY=sk_test_xxx
```

✅ Correct (Live Keys):
```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxx
```

### 3. Secret Key Security
```
⚠️  VITE_PAYSTACK_SECRET_KEY should ONLY be in:
   - Production environment (NOT Preview)
   - Backend/API routes (if you add them later)
   
⚠️  Frontend usage is OK for MVP but consider backend verification for production scale
```

### 4. Environment Selection
For each variable, select appropriate environments:

- **Production only:** Secret keys, live API keys
- **Production + Preview:** Public keys, app URLs, feature flags
- **Development:** Use `.env.local` file instead

---

## 📋 Quick Add Instructions

### In Vercel Dashboard:

1. **During Initial Import:**
   - Scroll to "Environment Variables" section
   - Click to expand
   - Add each variable one by one
   - Select environment(s)
   - Click "Add"

2. **After Deployment:**
   - Go to Project → Settings → Environment Variables
   - Click "Add New"
   - Enter Name, Value, Environment
   - Click "Save"
   - **Redeploy** to apply changes

### Testing Environment Variables:

After deployment, test by opening browser console on your site:
```javascript
// These should NOT be undefined
console.log(import.meta.env.VITE_APP_URL);
console.log(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
```

---

## 🔄 How to Update Variables

1. Settings → Environment Variables
2. Click "..." on the variable
3. Select "Edit"
4. Update value
5. Save
6. **Important:** Trigger a new deployment for changes to take effect

**Quick Redeploy:**
- Deployments tab → Latest deployment → "..." → "Redeploy"

---

## 🧪 Test vs Live Keys

### During Development/Testing:
Use test keys in Preview environment:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
VITE_PAYSTACK_SECRET_KEY=sk_test_xxx
```

### In Production:
Use live keys in Production environment:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxx
```

---

## 📱 Where to Find These Values

### Paystack Keys
1. Login to [paystack.com](https://dashboard.paystack.com)
2. Settings → API Keys & Webhooks
3. Toggle "Live Mode" ON
4. Copy Public Key and Secret Key

### Notion Embed URL
1. Open your Notion page
2. Click "Share" → "Publish to web"
3. Copy the public URL
4. Format: `https://xxx.notion.site/Page-Name-xxx`

### Analytics IDs
- **Google Analytics:** Admin → Data Streams → Measurement ID
- **Hotjar:** Settings → Sites & Organizations → Site ID
- **Sentry:** Project Settings → Client Keys (DSN)

---

## ✅ Verification Checklist

Before clicking Deploy, verify:

- [ ] All REQUIRED variables added
- [ ] Using LIVE Paystack keys (pk_live_ and sk_live_)
- [ ] All variables have VITE_ prefix
- [ ] Correct environments selected (Production for secrets)
- [ ] VITE_APP_URL matches your custom domain
- [ ] Notion URL is public and accessible
- [ ] No typos in variable names
- [ ] Values copied correctly (no extra spaces)

---

## 🆘 Common Issues

### Issue: "Cannot read property 'VITE_X' of undefined"
**Fix:** Add VITE_ prefix to variable name

### Issue: "Paystack public key is invalid"
**Fix:** 
1. Check you're using `pk_live_` not `pk_test_`
2. Copy key again from Paystack dashboard
3. No extra spaces or quotes

### Issue: "Changes not reflected after deploy"
**Fix:** Redeploy after changing environment variables

### Issue: "Secret key exposed in frontend"
**Warning:** This is OK for MVP but plan backend verification for scale

---

## 📝 Quick Copy Template

Use this for adding to Vercel:

```plaintext
VITE_PAYSTACK_PUBLIC_KEY=pk_live_
VITE_PAYSTACK_SECRET_KEY=sk_live_
VITE_APP_URL=https://vault.vauntico.com
VITE_APP_NAME=Vauntico Prompt Vault
VITE_NOTION_EMBED_URL=https://classy-uranium-c6b.notion.site/Vauntico-Prompt-Vault-Founders-Edition-26a81beec93980c88b4ec6eefe61082c
VITE_PRODUCT_PRICE=97
VITE_CURRENCY=NGN
```

Replace the values after `=` with your actual credentials.

---

## 🎉 You're Set!

Once all REQUIRED variables are added:
1. ✅ Click Deploy
2. ✅ Wait for build
3. ✅ Test the site
4. ✅ Add custom domain

**Deployment should take 2-4 minutes.**

---

*Keep this checklist open while configuring Vercel!*

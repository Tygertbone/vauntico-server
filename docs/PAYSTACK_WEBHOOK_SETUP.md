# 🔔 PAYSTACK WEBHOOK SETUP GUIDE

## ✅ WHAT'S A WEBHOOK?

A webhook is an automatic notification Paystack sends to your server when important events happen (like successful payments, subscription renewals, etc.).

**Why you need it:**
- Get notified immediately when payments succeed
- Automatically grant access to customers
- Track subscription renewals
- Handle failed payments
- No manual verification needed!

---

## 🎯 STEP-BY-STEP SETUP

### **Step 1: Get Your Webhook URL**

Your webhook URL will be:
```
https://vauntico-mvp-cursur-build.vercel.app/api/paystack-webhook
```

*(Replace with your actual Vercel domain if different)*

---

### **Step 2: Configure in Paystack Dashboard**

1. **Go to:** https://dashboard.paystack.com/settings/developer

2. **Scroll down to the "Webhooks" section**

3. **Click "Add Webhook URL"**

4. **Enter your webhook URL:**
   ```
   https://vauntico-mvp-cursur-build.vercel.app/api/paystack-webhook
   ```

5. **Select these events:**
   - ✅ **charge.success** - Payment completed successfully
   - ✅ **subscription.create** - New subscription started
   - ✅ **subscription.not_renew** - Subscription won't renew (user cancelled)
   - ✅ **subscription.disable** - Subscription cancelled
   - ✅ **invoice.payment_failed** - Payment plan installment failed

6. **Click "Save"**

---

### **Step 3: Note Your Webhook Secret**

After saving, Paystack will show you a **Webhook Secret Key**.

**IMPORTANT:** Copy this key! You'll need it to verify webhook signatures.

It looks like: `sk_webhook_xxxxxxxxxxxxxxxxxx`

---

## 🛠️ NEXT: I'LL BUILD THE WEBHOOK HANDLER

Now that you know how to set it up, I'll build the actual webhook endpoint that receives these notifications.

**What it will do:**
1. Receive webhook from Paystack
2. Verify the signature (security!)
3. Handle different event types
4. Update user access automatically
5. Send welcome emails
6. Log everything for debugging

---

## 📋 CHECKLIST

- [ ] Add webhook URL in Paystack dashboard
- [ ] Select the 5 events listed above
- [ ] Copy the webhook secret key
- [ ] Give me the webhook secret (I'll add to Vercel env)
- [ ] I'll build the webhook handler
- [ ] We'll test it together

---

## ⚠️ IMPORTANT SECURITY NOTE

The webhook secret is used to verify that requests are really from Paystack (not hackers).

**Never:**
- ❌ Commit it to Git
- ❌ Share it publicly
- ❌ Use it in frontend code

**Always:**
- ✅ Store in environment variables
- ✅ Keep it secret
- ✅ Verify signatures on every webhook

---

## 🎯 READY?

**Two options:**

### Option A: Set it up now (5 mins)
Follow steps above and give me the webhook secret

### Option B: Set it up after deployment (~2 hours)
We can add it once the site is live

**Which do you prefer?**

---

## 📝 FOR LATER: WEBHOOK EVENTS EXPLAINED

### **charge.success**
Triggers when: Any payment completes  
We'll use it to: Grant immediate access, send welcome email

### **subscription.create**
Triggers when: Payment plan starts  
We'll use it to: Track subscription ID, set up renewal reminders

### **subscription.not_renew**
Triggers when: User cancels before next payment  
We'll use it to: Send "sorry to see you go" email, stop reminders

### **subscription.disable**
Triggers when: Subscription is terminated  
We'll use it to: Revoke access (after grace period)

### **invoice.payment_failed**
Triggers when: Payment plan installment fails  
We'll use it to: Send "payment failed" email, retry payment

---

## 🚀 WHAT'S NEXT

Once you set up the webhook:
1. ✅ I'll build the handler endpoint
2. ✅ I'll add the secret to Vercel
3. ✅ I'll test webhook delivery
4. ✅ I'll add email sending to webhook
5. ✅ You'll receive automatic notifications!

---

**Ready to continue?** Let me know! 🎉

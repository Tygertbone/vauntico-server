# 🔒 Paystack Live Key Security Rollback Procedure

## 🚨 EMERGENCY RESPONSE FOR EXPOSED SECRETS

This document provides step-by-step instructions for responding to Paystack live key exposure incidents.

---

## 🔴 IMMEDIATE ACTIONS (First 5 Minutes)

### 1. **CONTAIN THE BREACH**
```bash
# If keys were committed to git:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server-v2/.env .vercel/.env.development.local" \
  --prune-empty --tag-name-filter cat -- --all

# Remove from working directory (backup first)
cp server-v2/.env server-v2/.env.backup
cp .vercel/.env.development.local .vercel/.env.development.local.backup

# Remove the actual files
rm server-v2/.env
rm .vercel/.env.development.local
```

### 2. **ROTATE ALL COMPROMISED KEYS**
1. **Paystack Dashboard Actions:**
   - Login to [Paystack Dashboard](https://dashboard.paystack.com/)
   - Navigate to **Settings → API Keys & Webhooks**
   - **Immediately regenerate** both:
     - Secret Key (`sk_live_...`)
     - Public Key (`pk_live_...`)
   - Update all webhook signatures if webhooks are configured

2. **Other Services (if exposed):**
   - Stripe keys
   - Resend API keys
   - Anthropic API keys
   - Database credentials
   - JWT secrets

---

## 🔧 ENVIRONMENT MANAGER UPDATES

### **Vercel Configuration**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update all variables containing the old keys:
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - Any other compromised variables

### **GitHub Actions Secrets**
1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Update all secrets with new values

### **Local Development**
1. Create new `.env` files with placeholder values:
```env
# server-v2/.env
PAYSTACK_SECRET_KEY=sk_live_replace_with_new_key
PAYSTACK_PUBLIC_KEY=pk_live_replace_with_new_key

# .vercel/.env.development.local
PAYSTACK_SECRET_KEY=sk_live_replace_with_new_key
PAYSTACK_PUBLIC_KEY=pk_live_replace_with_new_key
```

---

## 🛡️ POST-INCIDENT SECURITY HARDENING

### 1. **Verify Git Ignore Rules**
```bash
# Check that .env files are properly ignored
git check-ignore -v server-v2/.env
git check-ignore -v .vercel/.env.development.local

# Should output:
# server-v2/.gitignore:12:.env    server-v2/.env
```

### 2. **Update .gitignore**
Ensure these patterns are in your `.gitignore`:
```
# Environment files
.env
.env.*
!.env.example
!.env.template

# Vercel environment files
.vercel/.env*.local
```

### 3. **Test Pre-commit Hooks**
```bash
# Test the security hook
echo "PAYSTACK_SECRET_KEY=sk_live_test123" > test-secret.txt
git add test-secret.txt
git commit -m "Test security hook"
# Should be blocked by pre-commit hook
rm test-secret.txt
```

---

## 🔍 MONITORING AND AUDITING

### 1. **Check Git History for Exposure**
```bash
# Search entire git history for live keys
git log -p --all | grep -E '(sk_live_|pk_live_)' | head -20

# If found, you may need to rewrite history (advanced)
git filter-repo --force --invert-paths --path server-v2/.env
```

### 2. **Audit Logs for Key Usage**
- Check Paystack dashboard for unusual API activity
- Review server logs for unauthorized access attempts
- Monitor for suspicious transactions

---

## 📋 PREVENTION CHECKLIST

### **Development Workflow**
- [ ] Use `.env.example` files with placeholder values
- [ ] Never commit actual secrets to version control
- [ ] Use environment managers (Vercel/GitHub Actions) for production secrets
- [ ] Rotate test keys regularly during development

### **Code Review**
- [ ] Add `sk_live_` and `pk_live_` to code review blocklist
- [ ] Require approval for any changes to environment-related files
- [ ] Use automated secret scanning tools

### **Automated Protection**
- [ ] Git pre-commit hooks (already implemented)
- [ ] CI/CD secret scanning
- [ ] Regular dependency security audits

---

## 📚 REFERENCE: SECURE ENVIRONMENT VARIABLE PATTERNS

### **Safe Patterns (✅)**
```env
# Use placeholder values in committed files
PAYSTACK_SECRET_KEY=sk_live_your_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_key_here

# Or use environment-specific prefixes
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
```

### **Dangerous Patterns (❌)**
```env
# Never commit actual keys
PAYSTACK_SECRET_KEY=sk_live_your_actual_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_key_here
```

---

## 🆘 EMERGENCY CONTACTS

**Paystack Support:** support@paystack.com
**Vercel Security:** security@vercel.com
**GitHub Security:** security@github.com

**Response Time Targets:**
- Key rotation: < 5 minutes
- Environment updates: < 15 minutes
- Full audit completion: < 1 hour

---

## 🔄 REGULAR MAINTENANCE SCHEDULE

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Test key rotation | Monthly | DevOps Team |
| Secret scanning | Weekly (automated) | CI/CD Pipeline |
| Dependency audit | Monthly | Security Team |
| Access review | Quarterly | Compliance Team |

**Last Updated:** 2026-01-10
**Next Review:** 2026-02-10

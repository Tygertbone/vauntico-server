# 🚀 Deployment Checklist - Post-Audit

## Pre-Deployment

### Code Quality

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` - test production build locally
- [ ] No console errors in production build
- [ ] All TODO comments reviewed and prioritized

### Testing

- [ ] Test all routes (/, /creator-pass, /lore, /pricing, /ascend)
- [ ] Test Creator Pass subscription flow
- [ ] Test scroll access gating (locked vs unlocked)
- [ ] Test referral link generation
- [ ] Test regional pricing (USD vs ZAR)
- [ ] Mobile responsiveness check (iOS, Android)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Analytics

- [ ] Verify GA4 tracking ID is set
- [ ] Verify Mixpanel token is set
- [ ] Test page view tracking
- [ ] Test event tracking (scroll views, upgrades)
- [ ] Check analytics in browser console
- [ ] Verify no PII is being tracked

### SEO

- [ ] Meta tags present on all pages
- [ ] OpenGraph images uploaded
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Canonical URLs set

### Performance

- [ ] Images optimized (WebP format)
- [ ] Core Web Vitals check (PageSpeed Insights)
- [ ] Lighthouse score > 90 (Performance)
- [ ] Bundle size < 500KB gzipped
- [ ] No render-blocking resources

### Security

- [ ] Environment variables secured
- [ ] No API keys in client code
- [ ] HTTPS enabled
- [ ] CSP headers configured (if applicable)
- [ ] Rate limiting on forms

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Build locally first
npm run build

# Deploy to production
vercel --prod

# OR use git push (auto-deploy)
git add .
git commit -m "Post-audit improvements: social proof, SEO, mobile optimization"
git push origin main
```

### Configuration Check

- [ ] `vercel.json` configured for SPA routing
- [ ] Environment variables set in Vercel dashboard
  - [ ] `VITE_GA4_ID`
  - [ ] `VITE_MIXPANEL_TOKEN`
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active

---

## Post-Deployment

### Smoke Tests (First 5 Minutes)

- [ ] Visit homepage - loads correctly
- [ ] Visit /creator-pass - pricing displays
- [ ] Visit /lore - scrolls load
- [ ] Test sign-up flow (create account)
- [ ] Test Creator Pass upgrade (test mode)
- [ ] Check mobile responsiveness
- [ ] Verify analytics firing (GA4 Real-Time)

### Analytics Verification (First Hour)

```js
// Open browser console on live site
window.VaunticoAnalytics.logState();
window.VaunticoAnalytics.flush();

// Check Mixpanel
window.mixpanel.get_distinct_id();
```

- [ ] Page views appearing in GA4
- [ ] Events appearing in Mixpanel
- [ ] No console errors
- [ ] Session tracking working

### Monitoring (First 24 Hours)

- [ ] Check Vercel logs for errors
- [ ] Monitor GA4 Real-Time for traffic
- [ ] Check Mixpanel for event flow
- [ ] Review Core Web Vitals (Search Console)
- [ ] Monitor server response times

### Critical Paths to Test

1. **New User Journey**
   - [ ] Land on homepage
   - [ ] Browse scrolls
   - [ ] Hit paywall
   - [ ] View Creator Pass
   - [ ] Sign up

2. **Upgrade Journey**
   - [ ] Existing user logs in
   - [ ] Views locked scroll
   - [ ] Clicks upgrade
   - [ ] Completes payment

3. **Referral Journey**
   - [ ] User generates referral link
   - [ ] Shares on social
   - [ ] New user clicks link
   - [ ] Attribution tracked

---

## Rollback Plan

### If Critical Issues Found

```bash
# Option 1: Rollback to previous deployment
vercel rollback

# Option 2: Redeploy from specific commit
git checkout <previous-commit-hash>
vercel --prod

# Option 3: Hotfix and redeploy
git checkout main
# Make fix
git add .
git commit -m "Hotfix: [issue description]"
git push origin main
```

### Critical Issue Indicators

- [ ] Homepage not loading
- [ ] Checkout flow broken
- [ ] Analytics not tracking
- [ ] Major console errors
- [ ] Mobile completely broken
- [ ] SEO meta tags missing

---

## Communication Plan

### Internal Team

- [ ] Notify team of deployment time
- [ ] Share deployment URL
- [ ] Assign monitoring responsibilities
- [ ] Schedule post-deploy review call

### Users (if applicable)

- [ ] Announce new features (email, social)
- [ ] Update changelog
- [ ] Post on Product Hunt (if major update)
- [ ] Share on Twitter/LinkedIn

---

## Optimization Checklist (Week 1 Post-Deploy)

### Day 1

- [ ] Monitor error rates
- [ ] Check conversion funnel
- [ ] Review bounce rates
- [ ] Identify hot spots (heatmaps)

### Day 3

- [ ] Analyze A/B test results
- [ ] Review user feedback
- [ ] Check loading times across regions
- [ ] Update based on findings

### Day 7

- [ ] Full analytics review
- [ ] Compare pre/post audit metrics
- [ ] Document learnings
- [ ] Plan next sprint

---

## Success Metrics (First Week)

### Traffic

- **Baseline**: Establish current daily visits
- **Goal**: No drop in traffic post-deploy
- **Stretch**: +10% organic traffic from SEO improvements

### Conversion

- **Homepage → Sign-up**: Track baseline, aim for 5%+
- **Sign-up → Paid**: Track baseline, aim for 10%+
- **Scroll Lock → Upgrade**: Track baseline, optimize

### Performance

- **Page Load Time**: < 3 seconds (target)
- **Core Web Vitals**: All "Good" (green)
- **Lighthouse Score**: > 90

### Engagement

- **Avg Session Duration**: > 3 minutes
- **Pages per Session**: > 3
- **Bounce Rate**: < 50%

---

## Emergency Contacts

### Technical

- **Vercel Support**: https://vercel.com/support
- **DNS Provider**: [Your DNS provider]
- **CDN**: Vercel Edge Network (auto)

### Analytics

- **GA4**: https://analytics.google.com
- **Mixpanel**: https://mixpanel.com

### Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Search Console**: https://search.google.com/search-console

---

## Post-Deploy Review Template

**Date**: ****\_****  
**Deployed By**: ****\_****  
**Version**: ****\_****

### What Went Well

-

### What Didn't Go Well

-

### Metrics Summary

- **Traffic**: Before **_ → After _**
- **Conversion**: Before **_% → After _**%
- **Performance**: Before **_ → After _**

### Action Items

1.
2.
3.

---

## Quick Commands Reference

```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Set environment variable
vercel env add VITE_GA4_ID

# Force rebuild
vercel --force

# Check build time
vercel inspect [deployment-url]
```

---

✅ **Ready to Deploy!**

When you're ready:

```bash
npm run build && vercel --prod
```

Then run through this checklist systematically.

---

_Last Updated: January 2025_

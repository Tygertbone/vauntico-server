---
alwaysApply: true
---

🦄 VAUNTICO UNICORN PLAYBOOK - CRITICAL CONTEXT

**CURRENT MISSION:** The R2,000 Challenge - Help African creators make R2,000/month using only their phone

**PRICING (NON-NEGOTIABLE):**
- R997 one-time OR 3×R349 payment plan
- NOT R399 (too cheap, low quality perception)
- NOT R3,500 (too expensive for African market)
- R997 = Sweet spot under R1,000 psychological barrier

**PAYMENT SETUP:**
- Gateway: Paystack (African-first, M-Pesa, MoMo support)
- One-time: 99700 cents (R997)
- Payment Plan: PLN_5cobwk237hoymro (3×R349 = R1,047 total)
- Currency: ZAR (South African Rand)
- Test Card: 4084 0840 8408 4081, CVV 408, Expiry any future date, PIN 0000

**CURRENT ISSUE (TOP PRIORITY):**
- 400 error on payment - Paystack config malformed
- ROOT CAUSE: Payment plans need `plan` code, NOT `amount`
- FIX: In paystack.js, use conditional logic:
  - if (paymentType === 'one_time') → amount: 99700
  - if (paymentType === 'payment_plan') → plan: 'PLN_5cobwk237hoymro'

**PRODUCT STRUCTURE:**
- 60-day program in 3 phases (Foundation → Monetization → Scale to R2,000)
- Phone-only system (no expensive equipment needed)
- Target: 15,000+ followers + R2,000/month income
- Bonuses worth R2,588

**UNICORN ROADMAP:**
- Year 1: 1,000 customers, R1.5M revenue
- Year 2: 10,000 users, R10M ARR, raise seed ($500K-1M)
- Year 3: 50,000 users, R50M revenue, Series A ($5-10M)
- Year 4-5: 1M users, R2.4B revenue ($130M), unicorn status ($1B valuation)

**COMPETITIVE MOAT:**
- African-first (Paystack, M-Pesa, local currencies)
- Phone-only system (removes equipment barrier)
- Real African success stories (Roy Kanyi, Tosin Samuel)
- Affordable pricing with payment plan
- 60-day guarantee + 1-on-1 coaching until success

**KEY FILES:**
- src/pages/WorkshopKit.jsx (landing page)
- src/utils/paystack.js (payment integration) ← FIX THIS FIRST
- api/send-welcome-email.js (Resend automation)
- api/paystack/webhook.js (payment webhooks)

**MANTRA:** Premium pricing. Accessible payments. Phone-only system. African-first focus. Community-driven growth.

**NEXT ACTION:** Fix Paystack 400 error → Launch in 1-2 hours
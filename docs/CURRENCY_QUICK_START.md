# 🌍 Regional Currency - Quick Start Guide

## What Changed?

Vauntico now automatically displays prices in the right currency:

- 🇿🇦 **South African users** see prices in **ZAR (R)**
- 🇺🇸 **International users** see prices in **USD ($)**
- 💡 Both currencies show an approximate conversion

---

## For End Users

### What You'll See

#### South African User (ZAR)

```
Workshop Kit
R499
≈ $29
One-time payment
```

#### International User (USD)

```
Workshop Kit
$29
≈ R499
One-time payment
```

### Pages Affected

- `/pricing` - Main pricing page
- `/workshop-kit` - Workshop Kit details
- `/audit-service` - Audit Service plans
- `/creator-pass` - Creator Pass subscription
- `/pricing-demo` - Testing interface

---

## For Developers

### Quick Testing (Browser Console)

#### Switch to ZAR Pricing

```javascript
window.VaunticoDev.setLocale("ZAR");
location.reload();
```

#### Switch to USD Pricing

```javascript
window.VaunticoDev.setLocale("USD");
location.reload();
```

#### Clear Override (Use Auto-Detection)

```javascript
window.VaunticoDev.clearLocale();
location.reload();
```

#### Check Current State

```javascript
window.VaunticoDev.logState();
```

---

## Using in Your Code

### 1. Get Localized Price for Any Product

```javascript
import { getLocalizedPrice, PRICING } from "../utils/pricing";
import { useMemo } from "react";

function MyComponent() {
  const price = useMemo(() => getLocalizedPrice(PRICING.WORKSHOP_KIT), []);

  return <div>Price: {price.formatted}</div>;
  // Output: "Price: R499" or "Price: $29"
}
```

### 2. Show Approximate Conversion

```javascript
import { getLocalizedPrice, getApproximatePrice } from "../utils/pricing";
import { useMemo } from "react";

function MyComponent() {
  const price = useMemo(() => getLocalizedPrice(PRICING.WORKSHOP_KIT), []);

  const approx = useMemo(() => {
    if (price.currency === "ZAR") {
      return getApproximatePrice(price.price, "ZAR", "USD");
    } else {
      return getApproximatePrice(price.price, "USD", "ZAR");
    }
  }, [price]);

  return (
    <div>
      <div className="text-4xl font-bold">{price.formatted}</div>
      {approx && (
        <div className="text-sm text-gray-400">≈ {approx.formatted}</div>
      )}
    </div>
  );
}
```

### 3. Get Current User's Currency

```javascript
import { getUserCurrency } from "../utils/pricing";

const currency = getUserCurrency();
console.log(currency); // 'USD' or 'ZAR'
```

### 4. Format a Price Manually

```javascript
import { formatPrice, getCurrencySymbol } from "../utils/pricing";

const formatted = formatPrice(499, "ZAR");
console.log(formatted); // "R499"

const symbol = getCurrencySymbol("ZAR");
console.log(symbol); // "R"
```

---

## Testing Scenarios

### Scenario 1: Test as South African User

1. Open browser console
2. Run: `window.VaunticoDev.setLocale('ZAR')`
3. Refresh page
4. All prices should show in Rand (R)
5. Check Workshop Kit: Should show **R499**
6. Check Creator Pass: Should show **R499/month**
7. Check Audit Service: Should show **R999/month**

### Scenario 2: Test as International User

1. Open browser console
2. Run: `window.VaunticoDev.setLocale('USD')`
3. Refresh page
4. All prices should show in Dollars ($)
5. Check Workshop Kit: Should show **$29**
6. Check Creator Pass: Should show **$29/month**
7. Check Audit Service: Should show **$59/month**

### Scenario 3: Test Auto-Detection

1. Open browser console
2. Run: `window.VaunticoDev.clearLocale()`
3. Refresh page
4. System should detect based on browser locale/timezone
5. Check console for: `💰 Current currency: XXX`

---

## Price Reference Table

| Product                      | USD         | ZAR            | Notes                |
| ---------------------------- | ----------- | -------------- | -------------------- |
| Creator Pass                 | $29/mo      | R499/mo        | Monthly subscription |
| Workshop Kit                 | $29         | R499           | One-time payment     |
| Audit Service (Starter)      | $29         | R499           | One-time             |
| Audit Service (Professional) | $59/mo      | R999/mo        | Monthly subscription |
| Audit Service (Enterprise)   | Custom      | Custom         | Contact sales        |
| Auto-Fix Add-on              | $19/mo      | R299/mo        | Monthly              |
| Custom Reporting             | $12/mo      | R199/mo        | Monthly              |
| Team Training                | $89/session | R1,499/session | Per session          |
| Emergency Audit              | $169        | R2,999         | One-time             |

---

## Troubleshooting

### Prices Not Updating?

1. Clear browser cache
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Check console for errors
4. Verify locale setting: `window.VaunticoDev.logState()`

### Wrong Currency Showing?

1. Check manual override: `localStorage.getItem('vauntico_locale')`
2. Clear override: `window.VaunticoDev.clearLocale()`
3. Verify browser locale: `navigator.language`
4. Check timezone: `Intl.DateTimeFormat().resolvedOptions().timeZone`

### Approximate Conversion Missing?

- This is normal for some displays
- Approximate prices only show where there's room in the UI
- Main price is always localized correctly

---

## Dev Console Commands Cheat Sheet

```javascript
// CURRENCY MANAGEMENT
window.VaunticoDev.setLocale("ZAR"); // 🇿🇦 Set to Rand
window.VaunticoDev.setLocale("USD"); // 🇺🇸 Set to Dollar
window.VaunticoDev.clearLocale(); // 🌍 Auto-detect

// ACCESS MANAGEMENT (Existing)
window.VaunticoDev.toggleCreatorPass(); // Toggle Creator Pass
window.VaunticoDev.toggleWorkshopKit(); // Toggle Workshop Kit
window.VaunticoDev.setAuditSubscription("pro"); // Enable audit subscription

// DEBUGGING
window.VaunticoDev.logState(); // View all access + currency
window.VaunticoDev.clearAll(); // Reset everything
```

---

## Integration with Payment Systems

When integrating with payment gateways (Stripe, PayPal, etc.):

```javascript
import { getUserCurrency, getLocalizedPrice } from "../utils/pricing";

async function initiatePayment(product) {
  const currency = getUserCurrency();
  const price = getLocalizedPrice(product);

  // Send to payment gateway
  const paymentData = {
    amount: price.price,
    currency: price.currency,
    description: product.name,
  };

  // Process payment...
}
```

---

## FAQ

**Q: Can users manually select their currency?**  
A: Not yet in the UI, but developers can use `setLocale()` for testing. A UI selector could be added in future.

**Q: Are these real-time exchange rates?**  
A: No, currently using fixed conversion rates. Real-time API integration can be added.

**Q: What happens if my browser locale is neither US nor ZA?**  
A: System defaults to USD for international users.

**Q: Do prices update automatically if exchange rates change?**  
A: Currently no, prices are fixed. Real-time forex integration needed for dynamic rates.

**Q: Can I add more currencies?**  
A: Yes! Add to `localizedPrices` in PRICING object and update `getUserCurrency()` logic.

---

## Need Help?

1. **Check console:** Look for errors or warnings
2. **Use dev tools:** `window.VaunticoDev.logState()`
3. **Check documentation:** See `REGIONAL_CURRENCY_IMPLEMENTATION.md`
4. **Ask the team:** Reach out on Slack/Discord

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** ✅ Production Ready

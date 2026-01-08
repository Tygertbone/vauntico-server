# 💱 Regional Currency Cheatsheet

## Quick Commands (Browser Console)

```javascript
// Switch to ZAR (South African Rand)
window.VaunticoDev.setLocale('ZAR'); location.reload()

// Switch to USD (US Dollar)  
window.VaunticoDev.setLocale('USD'); location.reload()

// Clear override (auto-detect)
window.VaunticoDev.clearLocale(); location.reload()

// Check current state
window.VaunticoDev.logState()
```

---

## Price Reference

| Product | USD | ZAR |
|---------|-----|-----|
| **Creator Pass** | $29/mo | R499/mo |
| **Workshop Kit** | $29 | R499 |
| **Audit (Starter)** | $29 | R499 |
| **Audit (Professional)** | $59/mo | R999/mo |
| **Auto-Fix Add-on** | $19/mo | R299/mo |
| **Custom Reporting** | $12/mo | R199/mo |
| **Team Training** | $89/session | R1,499/session |
| **Emergency Audit** | $169 | R2,999 |

---

## Code Snippets

### Get Localized Price
```javascript
import { getLocalizedPrice, PRICING } from '../utils/pricing'
import { useMemo } from 'react'

const price = useMemo(() => getLocalizedPrice(PRICING.WORKSHOP_KIT), [])
// Returns: { price, currency, formatted, symbol }
```

### Show with Approximate
```jsx
<div className="text-4xl">{price.formatted}</div>
{approx && <div className="text-sm">≈ {approx.formatted}</div>}
```

### Get Current Currency
```javascript
import { getUserCurrency } from '../utils/pricing'

const currency = getUserCurrency() // 'USD' or 'ZAR'
```

---

## Where to Look

### Updated Files
1. `src/utils/pricing.js` - Core logic
2. `src/pages/WorkshopKit.jsx`
3. `src/pages/AuditService.jsx`
4. `src/pages/CreatorPass.jsx`
5. `src/pages/PricingDemo.jsx`
6. `src/pages/Pricing.jsx`

### Documentation
1. `REGIONAL_CURRENCY_IMPLEMENTATION.md` - Full details
2. `CURRENCY_QUICK_START.md` - Quick start guide
3. `BEFORE_AFTER_COMPARISON.md` - Visual changes
4. `CURRENCY_CHEATSHEET.md` - This file

---

## Common Tasks

### Test ZAR Pricing
```javascript
window.VaunticoDev.setLocale('ZAR')
location.reload()
// Visit /workshop-kit - should show R499
```

### Test USD Pricing
```javascript
window.VaunticoDev.setLocale('USD')
location.reload()
// Visit /workshop-kit - should show $29
```

### Debug Currency Detection
```javascript
console.log('Locale:', navigator.language)
console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)
console.log('Detected:', getUserCurrency())
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Wrong currency showing | `window.VaunticoDev.clearLocale()` |
| Prices not updating | Hard refresh (Ctrl+Shift+R) |
| Console errors | Check browser console for details |
| Approximate not showing | This is normal in some layouts |

---

## URLs to Test

- http://localhost:3002/pricing
- http://localhost:3002/workshop-kit
- http://localhost:3002/audit-service
- http://localhost:3002/creator-pass
- http://localhost:3002/pricing-demo

---

**Quick Test:**
```javascript
// Copy-paste this entire block
window.VaunticoDev.setLocale('ZAR'); 
setTimeout(() => location.reload(), 100);
```

---

*Version 1.0 | 2024*

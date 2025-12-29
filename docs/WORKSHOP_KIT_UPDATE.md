# Workshop Kit Page Update - Implementation Plan

## Changes Made:

### 1. **App.jsx** ✅
- Added maintenance banner at top
- Message: "⚠️ Payment system upgrade in progress..."

### 2. **Paystack.js** ✅
- Updated Workshop Kit pricing: R3,500 ZAR / $199 USD
- Fixed `checkoutWorkshopKit()` function
- Added currency support
- Stores payment locally after success
- Shows success message with reference
- Redirects to thank you page

## Next Steps to Complete:

### 3. Update WorkshopKit.jsx

**Replace the purchase handler with:**

```javascript
import { checkoutWorkshopKit, PAYSTACK_PRICING } from '../utils/paystack'

const [email, setEmail] = useState('')
const [name, setName] = useState('')
const [currency, setCurrency] = useState('ZAR')
const [isPurchasing, setIsPurchasing] = useState(false)

const handlePurchase = async () => {
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address')
    return
  }

  setIsPurchasing(true)
  
  try {
    await checkoutWorkshopKit(email, currency, name)
  } catch (error) {
    alert('Failed to open payment window. Please try again.')
    console.error(error)
  } finally {
    setIsPurchasing(false)
  }
}
```

**Simplified CTA section:**

```jsx
{/* Email capture form */}
<div className="max-w-md mx-auto mb-8">
  <input
    type="text"
    placeholder="Your Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
  />
  <input
    type="email"
    placeholder="Your Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
  />
  
  {/* Currency selector */}
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => setCurrency('ZAR')}
      className={`flex-1 py-2 px-4 rounded-lg ${
        currency === 'ZAR'
          ? 'bg-vault-purple text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      🇿🇦 R3,500 ZAR
    </button>
    <button
      onClick={() => setCurrency('USD')}
      className={`flex-1 py-2 px-4 rounded-lg ${
        currency === 'USD'
          ? 'bg-vault-purple text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      🌍 $199 USD
    </button>
  </div>
</div>

{/* Single CTA button */}
<button
  onClick={handlePurchase}
  disabled={isPurchasing || !email}
  className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPurchasing
    ? '⏳ Opening Payment...'
    : `🎁 Get Workshop Kit - ${currency === 'ZAR' ? 'R3,500' : '$199'}`}
</button>
```

### 4. Update Environment Variables

Add to `.env`:
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

**Use your REAL Paystack keys** (you mentioned you have them)

### 5. Remove All Other CTAs

- Remove "Access Gate" CTAs
- Remove "Creator Pass Promo" banner
- Remove bottom duplicate CTAs
- Keep only ONE CTA per page section

### 6. Add Thank You Page

Create redirect after purchase shows payment reference and next steps.

### 7. Test Flow

1. User enters email
2. Selects currency (ZAR or USD)
3. Clicks "Get Workshop Kit"
4. Paystack modal opens
5. User pays with test card: **4084 0840 8408 4081**
6. Success → Shows alert with reference
7. Redirects to /workshop-kit?purchased=true

## Files to Update:

1. ✅ `src/App.jsx` - Banner added
2. ✅ `src/utils/paystack.js` - Updated
3. ⏳ `src/pages/WorkshopKit.jsx` - Needs update
4. ⏳ `.env` - Add Paystack key
5. ⏳ `src/pages/CreatorPass.jsx` - Add "Coming February 2025" banner

## Test Card Details:

**Paystack Test Cards:**
- Success: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`

## Manual Fulfillment Process:

After user purchases:
1. Check payment in Paystack Dashboard
2. Email customer with access details
3. Manually send Workshop Kit materials
4. Mark as fulfilled in your tracking system

---

**Status:** ⏳ Ready to implement - waiting for Paystack keys


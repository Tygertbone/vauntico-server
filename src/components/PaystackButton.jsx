import { useState } from 'react'
import { initializePaystackPayment, redirectToSuccess, verifyPayment } from '../utils/paystack'
import ErrorAlert from './ui/error-alert'

const PaystackButton = ({
  amount,
  email = '',
  className = 'vauntico-btn',
  children = 'Buy with Apple Pay'
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [userEmail, setUserEmail] = useState(email)
  const [error, setError] = useState(null)

  const handlePayment = () => {
    if (!userEmail) {
      setShowEmailInput(true)
      return
    }

    setIsLoading(true)
    setError(null)
    
    initializePaystackPayment(
      userEmail,
      amount,
      async (response) => {
        // Payment successful - verify payment
        console.log('Payment successful:', response)
        
        try {
          const verification = await verifyPayment(response.reference)
          if (verification.success) {
            redirectToSuccess()
          } else {
            console.error('Payment verification failed:', verification.message)
            setError({
              title: 'Payment Verification Failed',
              message: 'Please contact support if this issue persists.'
            })
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          setError({
            title: 'Payment Error',
            message: 'An error occurred during payment verification. Please try again or contact support.'
          })
          setIsLoading(false)
        }
      },
      () => {
        // Payment cancelled
        console.log('Payment cancelled')
        setIsLoading(false)
      }
    )
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (userEmail) {
      setShowEmailInput(false)
      handlePayment()
    }
  }

  if (showEmailInput) {
    return (
      <div className="space-y-3">
        {error && (
          <ErrorAlert 
            title={error.title}
            message={error.message}
            onClose={() => setError(null)}
          />
        )}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email for checkout"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--vauntico-gold)]"
            required
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className={className}
              disabled={!userEmail}
            >
              Continue to Payment
            </button>
            <button
              type="button"
              onClick={() => setShowEmailInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <ErrorAlert 
          title={error.title}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}
      <button 
        onClick={handlePayment}
        disabled={isLoading}
        className={className}
        aria-label={isLoading ? 'Processing payment...' : 'Start payment process'}
      >
        {isLoading ? 'Processing...' : children}
      </button>
    </div>
  )
}

export default PaystackButton

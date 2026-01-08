/**
 * EmailCapture Component
 * 
 * Lead generation component with free scroll offer
 * Captures emails before scroll unlock paywall
 * 
 * TODO:
 * - Integrate with email service (SendGrid, Mailgun, ConvertKit)
 * - Add double opt-in confirmation
 * - Track conversion rate
 * - A/B test different lead magnets
 */

import { useState } from 'react'
import { trackEmailCapture } from '../utils/analytics'

const EmailCapture = ({ 
  variant = 'inline', 
  leadMagnet = 'Free Starter Scroll',
  onSuccess,
  onClose 
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call to your email service
      // Example integrations:
      
      // Option 1: SendGrid
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, source: 'scroll_unlock' })
      // })

      // Option 2: ConvertKit
      // await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ api_key: 'YOUR_API_KEY', email })
      // })

      // Option 3: Mailchimp
      // await fetch('/api/mailchimp/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ email })
      // })

      // For now, store locally and show success
      const subscribers = JSON.parse(localStorage.getItem('vauntico_subscribers') || '[]')
      subscribers.push({
        email,
        timestamp: new Date().toISOString(),
        source: 'email_capture',
        leadMagnet
      })
      localStorage.setItem('vauntico_subscribers', JSON.stringify(subscribers))

      // Track conversion
      trackEmailCapture(email, leadMagnet, 'scroll_unlock')

      // Show success
      setIsSuccess(true)
      
      // Grant temporary access to free scroll
      localStorage.setItem('vauntico_free_scroll_access', 'true')
      
      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(email)
        }, 2000)
      }

    } catch (err) {
      console.error('Email capture error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={`${variant === 'modal' ? 'card' : ''} text-center py-8 animate-fade-in`}>
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2">Check Your Inbox!</h3>
        <p className="text-gray-600 mb-4">
          We've sent your free scroll to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Plus exclusive creator tips you won't find anywhere else.
        </p>
        <button onClick={onClose} className="btn-primary">
          Start Reading →
        </button>
      </div>
    )
  }

  // Inline variant (embedded in page)
  if (variant === 'inline') {
    return (
      <div className="card bg-gradient-to-br from-vault-purple/10 to-vault-blue/10 border-2 border-vault-purple/20">
        <div className="flex items-start space-x-4">
          <div className="text-5xl">📬</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">
              Unlock Your First Scroll <span className="text-gradient">Free</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Get instant access to our Starter Scroll plus weekly creator insights
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-purple focus:border-transparent"
                  disabled={isSubmitting}
                  required
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  '🔓 Get Free Access'
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Modal variant (popup/overlay)
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-slide-up">
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-3xl font-bold mb-2">
              Before You Go...
            </h3>
            <p className="text-gray-600">
              Unlock your first scroll absolutely free!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-purple focus:border-transparent"
                disabled={isSubmitting}
                autoFocus
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : '🔓 Unlock Free Scroll'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-500 mr-2">✓</span>
              <span>Instant access to Starter Scroll</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-500 mr-2">✓</span>
              <span>Weekly creator tips & strategies</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-500 mr-2">✓</span>
              <span>Exclusive early access to new scrolls</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    )
  }

  // Banner variant (top of page)
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-vault-purple to-vault-blue text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎁</span>
            <p className="text-sm font-medium">
              <strong>Free Scroll:</strong> Get our Starter Guide + weekly creator tips
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="px-3 py-1.5 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              disabled={isSubmitting}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-vault-purple px-4 py-1.5 rounded font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'Get Free Access'}
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default EmailCapture

/**
 * INTEGRATION GUIDE:
 * 
 * 1. INLINE (in LoreVault or ScrollGallery)
 * <EmailCapture 
 *   variant="inline"
 *   leadMagnet="Starter Scroll"
 *   onSuccess={(email) => {
 *     // Redirect to scroll or unlock content
 *     window.location.href = '/lore/starter-scroll'
 *   }}
 * />
 * 
 * 2. MODAL (exit-intent or on scroll lock click)
 * <EmailCapture 
 *   variant="modal"
 *   onSuccess={(email) => setShowModal(false)}
 *   onClose={() => setShowModal(false)}
 * />
 * 
 * 3. BANNER (top of page)
 * <EmailCapture variant="banner" />
 * 
 * 
 * BACKEND SETUP:
 * 
 * Create API route: /api/subscribe
 * 
 * Example with SendGrid:
 * ```js
 * import sgMail from '@sendgrid/mail'
 * 
 * export default async function handler(req, res) {
 *   const { email } = req.body
 *   
 *   // Add to email list
 *   await sgMail.send({
 *     to: email,
 *     from: 'hello@vauntico.com',
 *     templateId: 'YOUR_TEMPLATE_ID',
 *     dynamicTemplateData: {
 *       scrollUrl: 'https://vauntico.com/scrolls/starter'
 *     }
 *   })
 *   
 *   res.json({ success: true })
 * }
 * ```
 */

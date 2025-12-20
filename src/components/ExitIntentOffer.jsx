import { useState, useEffect } from 'react'

export default function ExitIntentOffer({ onClose, onAccept }) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed or accepted
    if (hasShown || localStorage.getItem('exit_offer_dismissed')) return

    const handleMouseLeave = (e) => {
      // Trigger when mouse leaves viewport from top (common exit behavior)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true)
        setHasShown(true)
        
        // Track event
        if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
          window.VaunticoAnalytics.trackEvent('exit_intent_triggered', {
            page: 'workshop_kit'
          })
        }
      }
    }

    document.addEventListener('mouseout', handleMouseLeave)
    return () => document.removeEventListener('mouseout', handleMouseLeave)
  }, [hasShown])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('exit_offer_dismissed', 'true')
    if (onClose) onClose()
    
    // Track dismissal
    if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('exit_offer_dismissed')
    }
  }

  const handleAccept = () => {
    setIsVisible(false)
    if (onAccept) onAccept()
    
    // Track acceptance
    if (window.VaunticoAnalytics && window.VaunticoAnalytics.trackEvent) {
      window.VaunticoAnalytics.trackEvent('exit_offer_accepted')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg mx-4 p-8 relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-br from-purple-100 to-green-100 rounded-full p-6 mb-4">
            <span className="text-5xl">⏰</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Wait! Before You Go...</h2>
          <p className="text-lg text-gray-600">
            We noticed you're interested but not quite ready. How about this?
          </p>
        </div>

        {/* Offer */}
        <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-6 border-2 border-purple-200 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg animate-pulse">
              🔥 SPECIAL OFFER
            </span>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-700 text-lg mb-2">
              Get <strong className="text-purple-600 text-2xl">R50 OFF</strong> your payment plan!
            </p>
            <p className="text-sm text-gray-600">
              Pay only <strong>R333/month x 3</strong> instead of R349/month
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Regular Payment Plan:</span>
              <span className="text-gray-500 line-through">R349 x 3</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-purple-600">Your Special Price:</span>
              <span className="text-green-600">R333 x 3</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Save R50 total • Only for the next 10 minutes
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Full 60-day R2,000 Challenge access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>All R2,588 worth of bonuses included</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>60-day money-back guarantee</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Instant access after payment</span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold text-lg py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎉 Claim My R50 Discount Now
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            No thanks, I'll pay full price
          </button>
        </div>

        {/* Urgency Timer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 italic">
            ⏰ This offer expires in 10 minutes or when you leave this page
          </p>
        </div>
      </div>
    </div>
  )
}

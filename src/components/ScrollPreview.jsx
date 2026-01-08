/**
 * ScrollPreview Component
 * 
 * Shows a preview/teaser of locked scrolls to entice upgrades
 * 
 * TODO: 
 * - Add blur effect for locked content
 * - Implement "Read More" expansion
 * - Track preview views vs unlock conversions
 * - Add AI-generated summaries for long scrolls
 * 
 * Priority: HIGH - Critical for conversion funnel
 */

import { useState } from 'react'
import { trackScrollView, trackScrollLockClick } from '../utils/analytics'

const ScrollPreview = ({ scroll, hasAccess = false, onUpgrade }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Generate preview text (first 200 chars)
  const previewText = scroll.description || scroll.excerpt || 'Unlock this scroll to reveal powerful insights...'
  const isLocked = !hasAccess

  const handlePreviewClick = () => {
    if (isLocked) {
      trackScrollLockClick(scroll.id, scroll.title, scroll.tier || 'pro', 'free')
      if (onUpgrade) {
        onUpgrade(scroll)
      }
    } else {
      setIsExpanded(!isExpanded)
      if (!isExpanded) {
        trackScrollView(scroll.id, scroll.title, scroll.tier || 'free')
      }
    }
  }

  return (
    <div className="card relative group hover:shadow-2xl transition-all">
      {/* Lock Badge */}
      {isLocked && (
        <div className="absolute top-4 right-4 bg-vault-purple text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 z-10">
          <span>🔒</span>
          <span>{scroll.tier || 'PRO'}</span>
        </div>
      )}

      {/* Scroll Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-vault-purple to-vault-blue rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
          {scroll.icon || '📜'}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">{scroll.title}</h3>
          <p className="text-sm text-gray-500">
            {scroll.category} • {scroll.readTime || '5 min read'}
          </p>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`relative ${isLocked ? 'max-h-32 overflow-hidden' : ''}`}>
        <p className="text-gray-700 leading-relaxed mb-4">
          {previewText}
        </p>

        {/* Blur Overlay for Locked Scrolls */}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
        )}
      </div>

      {/* Key Features Preview */}
      {scroll.features && scroll.features.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-600 mb-2">What You'll Learn:</h4>
          <ul className="space-y-1">
            {scroll.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="text-vault-purple mr-2">•</span>
                <span className={isLocked ? 'blur-sm' : ''}>{feature}</span>
              </li>
            ))}
            {scroll.features.length > 3 && isLocked && (
              <li className="text-sm text-gray-400 italic">
                + {scroll.features.length - 3} more insights...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="mr-1">👁️</span>
            {scroll.views || '2.4k'} views
          </span>
          <span className="flex items-center">
            <span className="mr-1">⭐</span>
            {scroll.rating || '4.8'}/5
          </span>
        </div>
        <div className="text-xs px-2 py-1 bg-gray-100 rounded">
          {scroll.difficulty || 'Intermediate'}
        </div>
      </div>

      {/* CTA */}
      {isLocked ? (
        <button
          onClick={handlePreviewClick}
          className="btn-primary w-full group-hover:scale-105 transition-transform"
        >
          🔓 Unlock with {scroll.tier || 'Pro'} Pass
        </button>
      ) : (
        <button
          onClick={handlePreviewClick}
          className="btn-outline w-full"
        >
          {isExpanded ? 'Show Less' : 'Read Full Scroll'} →
        </button>
      )}

      {/* Social Proof */}
      {isLocked && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Join {scroll.unlockedBy || '1,200+'} creators who unlocked this scroll
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * ScrollPreviewGrid - Display multiple scroll previews
 */
export const ScrollPreviewGrid = ({ scrolls, hasAccess = false, onUpgrade }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scrolls.map((scroll) => (
        <ScrollPreview
          key={scroll.id}
          scroll={scroll}
          hasAccess={hasAccess}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  )
}

/**
 * ScrollPreviewCarousel - Horizontal scrolling preview
 */
export const ScrollPreviewCarousel = ({ scrolls, hasAccess = false, onUpgrade }) => {
  return (
    <div className="overflow-x-auto hide-scrollbar">
      <div className="flex space-x-6 pb-4">
        {scrolls.map((scroll) => (
          <div key={scroll.id} className="w-80 flex-shrink-0">
            <ScrollPreview
              scroll={scroll}
              hasAccess={hasAccess}
              onUpgrade={onUpgrade}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScrollPreview

/**
 * AUDIT TODO LIST:
 * 
 * 1. CONTENT OPTIMIZATION
 *    - [ ] Auto-generate scroll summaries with AI
 *    - [ ] Add reading time estimation algorithm
 *    - [ ] Implement content tagging system
 *    - [ ] Add related scrolls recommendations
 * 
 * 2. CONVERSION TRACKING
 *    - [ ] Track preview → unlock conversion rate
 *    - [ ] Track time spent on preview
 *    - [ ] Track scroll-through rate (did they read preview?)
 *    - [ ] A/B test blur intensity
 * 
 * 3. UX ENHANCEMENTS
 *    - [ ] Add hover preview expansion
 *    - [ ] Add "Save for Later" bookmark feature
 *    - [ ] Add share preview link
 *    - [ ] Add progress indicators for multi-part scrolls
 * 
 * 4. PERSONALIZATION
 *    - [ ] Recommend scrolls based on user role
 *    - [ ] Highlight scrolls in user's tier
 *    - [ ] Add "Popular in your tier" badge
 *    - [ ] Surface scrolls based on browsing history
 * 
 * 5. MONETIZATION
 *    - [ ] Add "Unlock just this scroll" option (micro-transaction)
 *    - [ ] Bundle related scrolls at discount
 *    - [ ] Add gift/share scroll access
 *    - [ ] Create scroll completion badges
 */

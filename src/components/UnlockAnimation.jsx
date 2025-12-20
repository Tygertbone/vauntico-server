import { useState, useEffect } from 'react'

/**
 * Unlock Animation Component
 * Displays animated scroll opening with visual flourish
 */
function UnlockAnimation({ scroll, onComplete, autoPlay = true }) {
  const [stage, setStage] = useState('idle') // idle -> unlocking -> opened -> complete

  useEffect(() => {
    if (autoPlay) {
      startAnimation()
    }
  }, [autoPlay])

  const startAnimation = () => {
    // Stage 1: Unlocking (lock breaks)
    setStage('unlocking')
    
    setTimeout(() => {
      // Stage 2: Scroll opens
      setStage('opened')
    }, 800)
    
    setTimeout(() => {
      // Stage 3: Complete and fade
      setStage('complete')
      setTimeout(() => {
        onComplete && onComplete()
      }, 500)
    }, 2000)
  }

  if (stage === 'idle') {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
      stage === 'complete' ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="relative">
        {/* Lock Breaking Animation */}
        {stage === 'unlocking' && (
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4 animate-pulse">🔓</div>
            <div className="text-white text-xl font-bold">Unlocking...</div>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-vault-purple rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-vault-blue rounded-full animate-ping delay-100"></div>
              <div className="w-2 h-2 bg-vault-cyan rounded-full animate-ping delay-200"></div>
            </div>
          </div>
        )}

        {/* Scroll Opening Animation */}
        {stage === 'opened' && (
          <div className="text-center animate-fade-in">
            <div className="relative">
              {/* Scroll unfurling */}
              <div className="relative inline-block">
                <div className="text-9xl animate-unfurl">📜</div>
                
                {/* Sparkle effects */}
                <div className="absolute -top-4 -left-4 text-3xl animate-sparkle">✨</div>
                <div className="absolute -top-4 -right-4 text-3xl animate-sparkle delay-200">✨</div>
                <div className="absolute -bottom-4 -left-4 text-3xl animate-sparkle delay-400">✨</div>
                <div className="absolute -bottom-4 -right-4 text-3xl animate-sparkle delay-600">✨</div>
              </div>

              {/* Scroll title reveal */}
              <div className="mt-6 animate-slide-up">
                <div className="text-6xl mb-3">{scroll.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">{scroll.title}</h2>
                <p className="text-lg text-gray-300">{scroll.subtitle}</p>
                
                {/* Success badge */}
                <div className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold shadow-lg">
                  <span>✓</span>
                  <span>Scroll Unlocked</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Lock Shake Animation
 * Displays when user clicks locked scroll
 */
export function LockShakeAnimation({ onAnimationEnd }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd && onAnimationEnd()
    }, 600)
    return () => clearTimeout(timer)
  }, [onAnimationEnd])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className="text-6xl animate-shake">🔒</div>
    </div>
  )
}

/**
 * Mini unlock indicator for scroll cards
 */
export function UnlockIndicator({ isUnlocking }) {
  if (!isUnlocking) return null

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-vault-purple/20 to-vault-blue/20 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-bounce">🔓</div>
        <div className="text-sm font-semibold text-vault-purple">Unlocking...</div>
      </div>
    </div>
  )
}

export default UnlockAnimation

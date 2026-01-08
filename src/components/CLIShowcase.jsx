import { useState, useEffect } from 'react'

function CLIShowcase() {
  const [typedText, setTypedText] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const command = 'vauntico generate landing-page --product "Fitness App" --style modern'
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Show instantly without animation
      setTypedText(command)
      setShowOutput(true)
      return
    }
    
    // Animated typing effect
    let index = 0
    const timer = setInterval(() => {
      if (index < command.length) {
        setTypedText(command.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setShowOutput(true), 500)
      }
    }, 50)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mb-20">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          See the CLI in Action
        </h2>
        <p className="text-xl text-gray-600">
          One command. Complete infrastructure. Watch it happen.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Terminal Window */}
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-gray-400 text-sm">terminal</div>
          </div>
          
          {/* Terminal Content */}
          <div className="p-6 font-mono text-sm">
            {/* Command Input */}
            <div className="flex items-start mb-4">
              <span className="text-green-400 mr-2">$</span>
              <span className="text-white">{typedText}</span>
              <span className="text-white animate-pulse">|</span>
            </div>
            
            {/* Output */}
            {showOutput && (
              <div className="space-y-2 animate-fadeIn">
                <div className="text-cyan-400">🚀 Vauntico CLI v2.1.0</div>
                <div className="text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="text-white">✓ Analyzing product requirements...</div>
                <div className="text-white">✓ Generating hero section</div>
                <div className="text-white">✓ Creating features grid</div>
                <div className="text-white">✓ Building pricing table</div>
                <div className="text-white">✓ Adding testimonials</div>
                <div className="text-white">✓ Optimizing SEO metadata</div>
                <div className="text-gray-400 mt-4">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="text-green-400 font-bold">✅ Generated in 12.4 seconds</div>
                <div className="text-gray-400 mt-2">
                  📁 Output: ./fitness-app-landing.html<br />
                  📊 3,547 words | 12 sections | SEO optimized
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Feature Highlights Below Terminal */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="card border-2 border-vault-purple/20">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-1">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Complete pages in seconds, not hours</p>
          </div>
          <div className="card border-2 border-vault-blue/20">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold mb-1">Context-Aware</h3>
            <p className="text-sm text-gray-600">Learns your brand voice and style</p>
          </div>
          <div className="card border-2 border-vault-cyan/20">
            <div className="text-3xl mb-2">🔓</div>
            <h3 className="font-bold mb-1">Export Everything</h3>
            <p className="text-sm text-gray-600">No lock-in. Own your content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CLIShowcase

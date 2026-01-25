'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'

interface HeroProps {
  variant?: 'A' | 'B' | 'C'
}

export function Hero({ variant = 'A' }: HeroProps) {
  const [terminalText, setTerminalText] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [outputs, setOutputs] = useState<{ text: string; delay: number }[]>([])
  const heroRef = useRef<HTMLDivElement>(null)

  const command = '$ vauntico generate landing-page --workshop "creator-monetization"'

  const variants = {
    A: {
      headline: 'Build Your Creator Business',
      subheading: 'in Minutes, Not Months',
      description: 'CLI automation meets trust scoring. Ship landing pages, workshops, and payment flows—AI handles the code, you handle the vision.'
    },
    B: {
      headline: 'AI-Powered Creator Platform.',
      subheading: 'Terminal-Fast. Human-Enlightened.',
      description: 'Generate workshops, trust scores, and payment systems through your terminal. Built for creators who move fast.'
    },
    C: {
      headline: 'Ship Landing Pages, Workshops',
      subheading: '& Payment Flows—Through Your Terminal',
      description: 'AI automation for the creator economy. No code required. Deploy production-ready platforms in minutes.'
    }
  }

  // Enhanced terminal animation with realistic typing
  useEffect(() => {
    let i = 0
    const typingSpeed = 50 // ms per character

    const typeInterval = setInterval(() => {
      if (i < command.length) {
        setTerminalText(command.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        // Show output after delay
        setTimeout(() => setShowOutput(true), 500)
      }
    }, typingSpeed)

    return () => clearInterval(typeInterval)
  }, [])

  // Sequential output animation
  useEffect(() => {
    if (showOutput) {
      const outputsList = [
        { text: '✓ Analyzing workshop content...', delay: 0 },
        { text: '✓ Generating trust score algorithm...', delay: 400 },
        { text: '✓ Building payment integration...', delay: 800 },
        { text: '✓ Creating email sequences...', delay: 1200 },
      ]
      setOutputs(outputsList)
    }
  }, [showOutput])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

      {/* 🎨 Animated Gradient Background - Ultra Premium */}
      <div className="absolute inset-0">
        {/* Primary flowing gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-shift blur-3xl opacity-30"/>
        {/* Secondary gradient layers for depth */}
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-gradient-to-br from-cyan-500/5 to-transparent animate-gradient-x blur-3xl"/>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-fuchsia-600/5 to-transparent animate-gradient-y blur-2xl"/>
        {/* Grid overlay for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-20">

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight mb-6"
          >
            {variants[variant].headline}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-primaryHover">
              {variants[variant].subheading}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {variants[variant].description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="primary" size="lg" href="#get-started">
              Start Building Free
            </Button>
            <Button variant="secondary" size="lg" href="#demo">
              Watch Demo (2 min)
            </Button>
          </motion.div>

          {/* Trust Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-text-tertiary"
          >
            Used by 500+ creators · Trusted by agencies · Open source components
          </motion.div>

        </motion.div>

        {/* Terminal Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <div className="max-w-6xl mx-auto">

            {/* Split Layout: Terminal Left, Output Right */}
            <div className="grid md:grid-cols-2 gap-8 items-start">

              {/* Enhanced Terminal with Glow Effect */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="relative"
              >
                <div className="
                  relative
                  bg-black
                  border border-white/10
                  rounded-2xl
                  overflow-hidden
                  shadow-[0_0_50px_rgba(102,126,234,0.3)]
                ">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"/>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"/>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"/>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">terminal — vauntico</span>
                  </div>

                  {/* Terminal Content with Enhanced Animation */}
                  <div className="p-8 font-mono text-sm">
                    <div className="mb-6">
                      {/* Animated command typing */}
                      <motion.span
                        className="text-cyan-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                      >
                        {terminalText}
                      </motion.span>
                      {/* Blinking cursor */}
                      <motion.span
                        className="animate-pulse"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        _
                      </motion.span>
                    </div>

                    {/* Sequential output animations */}
                    {showOutput && (
                      <div className="space-y-2">
                        {outputs.map((output, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: output.delay / 1000, duration: 0.4 }}
                            className="text-gray-400 flex items-center gap-2"
                          >
                            <motion.span
                              className="text-green-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (output.delay + 200) / 1000 }}
                            >
                              ✓
                            </motion.span>
                            {output.text}
                          </motion.div>
                        ))}

                        {/* Final success message with glow */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.0 }}
                          className="mt-6 pt-4 border-t border-white/10"
                        >
                          <motion.span
                            className="text-green-400 text-lg animate-pulse"
                            animate={{
                              textShadow: [
                                "0 0 5px rgba(16, 185, 129, 0.5)",
                                "0 0 20px rgba(16, 185, 129, 0.8)",
                                "0 0 5px rgba(16, 185, 129, 0.5)"
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            🚀
                          </motion.span>
                          <span className="text-gray-300 ml-2">Landing page deployed: </span>
                          <motion.span
                            className="text-cyan-400 underline decoration-cyan-400/50 underline-offset-2"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                          >
                            yoursite.vercel.app
                          </motion.span>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Output Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="bg-background-surface border border-border-default rounded-xl p-6 md:p-8 space-y-6"
              >
                <div className="text-sm text-text-tertiary font-medium">
                  Generated Output Preview
                </div>

                {/* Mockup of generated landing page */}
                <div className="bg-background-primary rounded-lg p-6 space-y-4 shadow-lg">

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-primaryHover rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">V</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-background-elevated rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-border-default rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="h-8 bg-accent-primary/20 rounded w-3/4"></div>
                    <div className="h-4 bg-border-default rounded w-full"></div>
                    <div className="h-4 bg-border-default rounded w-4/5"></div>
                    <div className="h-4 bg-border-default rounded w-2/3"></div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <div className="h-12 bg-gradient-to-r from-accent-primary to-accent-primaryHover rounded-lg w-36"></div>
                  </div>

                </div>

                {/* Trust Score Widget */}
                <div className="bg-background-primary border border-border-default rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text-secondary">Trust Score</span>
                    <span className="text-lg font-bold text-green-400">87/100</span>
                  </div>
                  <div className="h-2 bg-border-default rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Generated by AI analysis
                  </div>
                </div>

                <div className="text-xs text-text-tertiary pt-2 border-t border-border-default">
                  Complete with trust scoring, payment flows, and email automation
                </div>
              </motion.div>

            </div>

          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="mt-20 text-center"
        >
          <p className="text-text-tertiary mb-6">
            Ready to ship production-ready creator platforms?
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <span>Try Vauntico free for 14 days</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

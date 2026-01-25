'use client'

import { useState, useEffect } from 'react'

interface TerminalProps {
  command?: string
  output?: string[]
  className?: string
}

export function Terminal({ command = '$ vauntico generate landing-page --workshop "creator-monetization"', className = '' }: TerminalProps) {
  const [displayedCommand, setDisplayedCommand] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [currentOutputLine, setCurrentOutputLine] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)

  const output = [
    '✓ Analyzing workshop content...',
    '✓ Generating trust score algorithm...',
    '✓ Building payment integration...',
    '✓ Creating email sequences...'
  ]

  // Typewriter effect for command
  useEffect(() => {
    let index = 0
    const typingSpeed = 50

    const typeCharacter = () => {
      if (index < command.length) {
        setDisplayedCommand(command.slice(0, index + 1))
        index++
        setTimeout(typeCharacter, typingSpeed)
      } else {
        // Command complete, start output after delay
        setTimeout(() => setShowOutput(true), 500)
      }
    }

    const timer = setTimeout(typeCharacter, 1000)
    return () => clearTimeout(timer)
  }, [command])

  // Animate output lines
  useEffect(() => {
    if (!showOutput) return

    if (currentOutputLine < output.length) {
      const timer = setTimeout(() => {
        setCurrentOutputLine(prev => prev + 1)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [showOutput, currentOutputLine, output.length])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`bg-background-surface border border-border-default rounded-xl overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-background-primary border-b border-border-default px-4 py-3 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-xs text-text-tertiary ml-2 font-mono">terminal</span>
      </div>

      {/* Terminal Content */}
      <div className="p-6 font-mono text-sm">
        {/* Command line */}
        <div className="text-cyan-400 mb-4">
          <span className="text-cyan-400">{displayedCommand}</span>
          <span className={`ml-0.5 ${displayedCommand.length === command.length && cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
        </div>

        {/* Output */}
        {showOutput && (
          <div className="space-y-2 text-text-secondary">
            {output.slice(0, currentOutputLine).map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        {/* Final success message */}
        {showOutput && currentOutputLine >= output.length && (
          <div className="mt-4 text-green-400">
            🚀 Landing page deployed:{' '}
            <span className="underline text-accent-primary hover:text-accent-primaryHover">
              yoursite.vercel.app
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Shield, Code, Zap, Heart, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

interface Vulnerability {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  code: string
  line: number
  sanctified: boolean
}

interface SanctificationRitual {
  id: string
  name: string
  description: string
  power: number
  lore: string
}

interface CodeSanctificationProps {
  className?: string
}

const CodeSanctification: React.FC<CodeSanctificationProps> = ({ className = '' }) => {
  const { triggerHaptic } = useHapticFeedback()
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    {
      id: '1',
      type: 'SQL Injection',
      severity: 'critical',
      description: 'Unsanitized user input in database query',
      code: 'SELECT * FROM users WHERE id = ' + 'userInput',
      line: 42,
      sanctified: false
    },
    {
      id: '2',
      type: 'XSS Vulnerability',
      severity: 'high',
      description: 'Cross-site scripting in user-generated content',
      code: 'document.write(userContent)',
      line: 127,
      sanctified: false
    },
    {
      id: '3',
      type: 'Hardcoded Secret',
      severity: 'high',
      description: 'API key exposed in source code',
      code: 'const API_KEY = "sk-1234567890abcdef"',
      line: 8,
      sanctified: false
    },
    {
      id: '4',
      type: 'Insecure Hash',
      severity: 'medium',
      description: 'Using MD5 for password hashing',
      code: 'hash = md5(password)',
      line: 89,
      sanctified: false
    },
    {
      id: '5',
      type: 'Open Redirect',
      severity: 'low',
      description: 'Unvalidated redirect in navigation',
      code: 'res.redirect(req.query.redirect)',
      line: 156,
      sanctified: false
    }
  ])

  const [sanctificationRituals] = useState<SanctificationRitual[]>([
    {
      id: 'fire',
      name: 'Flame Purification',
      description: 'Burn away vulnerabilities with sacred fire',
      power: 95,
      lore: 'In the flame of purification, code becomes pure as gold'
    },
    {
      id: 'shield',
      name: 'Shield of Protection',
      description: 'Wrap code in protective Ubuntu energy',
      power: 85,
      lore: 'We protect each other, so our code protects all users'
    },
    {
      id: 'heart',
      name: 'Heart-centered Security',
      description: 'Infuse code with compassionate security',
      power: 90,
      lore: 'Security born from love harms none and protects all'
    }
  ])

  const [selectedRitual, setSelectedRitual] = useState<SanctificationRitual | null>(null)
  const [isSanctifying, setIsSanctifying] = useState(false)
  const [sanctificationProgress, setSanctificationProgress] = useState(0)
  const [completedRituals, setCompletedRituals] = useState<string[]>([])

  const sanctificationCeremonies = [
    { id: 'ubuntu-blessing', name: 'Ubuntu Blessing', description: 'Collective security wisdom' },
    { id: 'ancestor-codes', name: 'Ancestor Codes', description: 'Learn from past vulnerabilities' },
    { id: 'future-guardians', name: 'Future Guardians', description: 'Protect tomorrow\'s users' }
  ]

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, vulnerability: Vulnerability) => {
    // Check if this is actually a drag event with dataTransfer
    if (e.dataTransfer) {
      e.dataTransfer.setData('vulnerability', JSON.stringify(vulnerability))
      triggerHaptic({ pattern: [10, 50, 10] })
    }
  }, [triggerHaptic])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, ritual: SanctificationRitual) => {
    e.preventDefault()
    const vulnerabilityData = e.dataTransfer.getData('vulnerability')
    
    if (vulnerabilityData) {
      const vulnerability = JSON.parse(vulnerabilityData)
      setSelectedRitual(ritual)
      performSanctification(ritual, vulnerability)
    }
  }, [])

  const performSanctification = async (ritual: SanctificationRitual, vulnerability: Vulnerability) => {
    setIsSanctifying(true)
    setSanctificationProgress(0)
    
    // Animate sanctification progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setSanctificationProgress(i)
    }
    
    // Mark vulnerability as sanctified
    setVulnerabilities(prev => 
      prev.map(v => v.id === vulnerability.id ? { ...v, sanctified: true } : v)
    )
    
    // Add to completed rituals
    setCompletedRituals(prev => [...prev, ritual.id])
    
    triggerHaptic({ pattern: [100] })
    setIsSanctifying(false)
    setSanctificationProgress(0)
  }

  const generateLoreCommit = () => {
    const sanctifiedCount = vulnerabilities.filter(v => v.severity === 'critical' && v.sanctified).length
    const loreMessages = [
      `feat: sanctify ${sanctifiedCount} critical vulnerabilities with Ubuntu wisdom`,
      `chore: purify codebase through sacred security rituals`,
      `fix: transform vulnerabilities into strengths through collective protection`,
      `security: bless code with ancestral knowledge and future guardian protection`
    ]
    
    return loreMessages[Math.floor(Math.random() * loreMessages.length)]
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const allSanctified = vulnerabilities.every(v => v.sanctified)

  return (
    <div className={`max-w-7xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-gold-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Code Sanctification Simulator
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Transform vulnerabilities into strengths through sacred security rituals
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vulnerabilities Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
                Vulnerabilities to Sanctify
              </h2>
              <span className="text-sm text-gray-500">
                {vulnerabilities.filter(v => !v.sanctified).length} remaining
              </span>
            </div>

            <div className="space-y-4">
              {vulnerabilities.map((vulnerability, index) => (
                <div
                  key={vulnerability.id}
                  draggable={!vulnerability.sanctified}
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, vulnerability)}
                  className={`p-4 rounded-lg border-2 cursor-move transition-all ${
                    vulnerability.sanctified 
                      ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700 opacity-60' 
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md dark:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Code className="w-4 h-4 text-gray-500" />
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(vulnerability.severity)}`}>
                          {vulnerability.severity.toUpperCase()}
                        </span>
                        {vulnerability.sanctified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {vulnerability.type}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {vulnerability.description}
                      </p>
                      
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-xs">
                        <div className="text-gray-500">Line {vulnerability.line}:</div>
                        <div className="text-gray-800 dark:text-gray-200">{vulnerability.code}</div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!vulnerability.sanctified ? (
                        <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
                      ) : (
                        <Shield className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sanctification Rituals */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Flame className="w-6 h-6 mr-2 text-red-500" />
              Sanctification Rituals
            </h2>

            <div className="space-y-4">
              {sanctificationRituals.map((ritual, index) => (
                <motion.div
                  key={ritual.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onDragOver={handleDragOver}
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, ritual)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedRitual?.id === ritual.id
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-300 dark:border-gray-600'
                  } ${completedRituals.includes(ritual.id) ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ritual.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">Power:</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
                          style={{ width: `${ritual.power}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {ritual.description}
                  </p>
                  
                  <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                    "{ritual.lore}"
                  </p>
                  
                  {completedRituals.includes(ritual.id) && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ritual Complete
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Ubuntu Ceremonies */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Ubuntu Ceremonies
              </h3>
              <div className="space-y-2">
                {sanctificationCeremonies.map((ceremony) => (
                  <div
                    key={ceremony.id}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {ceremony.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {ceremony.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sanctification Progress */}
      <AnimatePresence>
        {isSanctifying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Sanctification in Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Channeling Ubuntu wisdom to purify your code...
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${sanctificationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  {sanctificationProgress}% Complete
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State */}
      {allSanctified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-purple-100 to-gold-100 dark:from-purple-900/20 dark:to-gold-900/20 rounded-2xl p-8">
            <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Code Sanctified!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your code is now protected by Ubuntu wisdom and sacred security practices
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 font-mono text-sm text-left">
              <div className="text-gray-500 mb-1"># Generated Lore Commit:</div>
              <div className="text-green-600">{generateLoreCommit()}</div>
            </div>
            
            <button
              onClick={() => {
                setVulnerabilities(prev => prev.map(v => ({ ...v, sanctified: false })))
                setCompletedRituals([])
              }}
              className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-gold-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start New Ceremony</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Ubuntu Wisdom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500 italic">
          "In sanctification, we protect not just our code, but all who depend on it. Ubuntu in action."
        </p>
      </motion.div>
    </div>
  )
}

export default CodeSanctification

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Trees, Zap, Award, Heart, Sparkles } from 'lucide-react'

interface PredictionNode {
  id: string
  label: string
  value: number
  prediction: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface SvgPath {
  path: string
  color: string
  opacity: number
  label: string
  value: number
}

interface AbundanceHarvesterProps {
  trustScore?: number
  className?: string
}

const AbundanceHarvester: React.FC<AbundanceHarvesterProps> = ({ 
  trustScore = 75, 
  className = '' 
}) => {
  const [nodes, setNodes] = useState<PredictionNode[]>([
    {
      id: 'revenue',
      label: 'Revenue Projection',
      value: 50000,
      prediction: 75000,
      confidence: 85,
      trend: 'up',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'community',
      label: 'Community Growth',
      value: 1200,
      prediction: 2500,
      confidence: 72,
      trend: 'up',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: 68,
      prediction: 85,
      confidence: 90,
      trend: 'up',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'trust',
      label: 'Trust Score Impact',
      value: trustScore,
      prediction: Math.min(95, trustScore + 15),
      confidence: 78,
      trend: 'up',
      color: 'from-yellow-500 to-gold-600'
    }
  ])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const generateTreeVisualization = useCallback(() => {
    const svgPaths: SvgPath[] = []
    const centerX = 150
    const centerY = 150
    const radius = 80

    // Generate tree branches based on nodes
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2
      const endX = centerX + Math.cos(angle) * radius
      const endY = centerY + Math.sin(angle) * radius
      
      // Branch path
      const path = `M ${centerX} ${centerY} Q ${centerX + radius/2} ${centerY - radius/3} ${endX} ${endY}`
      svgPaths.push({
        path,
        color: node.color,
        opacity: node.confidence / 100,
        label: node.label,
        value: node.prediction
      })
    })

    return svgPaths
  }, [nodes])

  const [treePaths, setTreePaths] = useState(generateTreeVisualization())

  useEffect(() => {
    setTreePaths(generateTreeVisualization())
  }, [generateTreeVisualization, nodes])

  const triggerPrediction = useCallback(() => {
    setIsAnimating(true)
    
    // Simulate prediction calculation
    setTimeout(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        value: node.prediction,
        prediction: node.prediction + (Math.random() - 0.5) * node.prediction * 0.2,
        confidence: Math.min(95, node.confidence + Math.random() * 10)
      })))
      
      setIsAnimating(false)
    }, 2000)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingUp className="w-4 h-4 rotate-180" />
      default: return <div className="w-4 h-4" />
    }
  }

  return (
    <div className={`max-w-6xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-gold-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Abundance Harvester
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Predictive abundance trees powered by sacred algorithms
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Tree Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Trees className="w-6 h-6 mr-2 text-green-500" />
                Abundance Tree
              </h2>
              <button
                onClick={triggerPrediction}
                disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-gold-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnimating ? (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Harvest Predictions</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="300" height="300" viewBox="0 0 300 300" className="w-full h-auto">
                  {/* Central hub */}
                  <circle cx="150" cy="150" r="8" fill="url(#centerGradient)" />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>

                  {/* Tree branches */}
                  <AnimatePresence>
                    {treePaths.map((branch, index) => (
                      <motion.g key={index}>
                        <motion.path
                          d={branch.path}
                          fill="none"
                          stroke="url(#branchGradient)"
                          strokeWidth="2"
                          opacity={branch.opacity}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: index * 0.1 }}
                        />
                        
                        {/* Node labels */}
                        <motion.text
                          x={branch.path.split(' ')[2].split(',')[0]}
                          y={branch.path.split(' ')[2].split(',')[1]}
                          fontSize="10"
                          fill="#4B5563"
                          textAnchor="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 + index * 0.1 }}
                        >
                          {branch.value.toFixed(0)}
                        </motion.text>
                      </motion.g>
                    ))}
                  </AnimatePresence>
                </svg>

                {/* Floating particles */}
                <AnimatePresence>
                  {isAnimating && [...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                      className="absolute w-2 h-2 bg-gold-400 rounded-full"
                      style={{
                        left: `${50 + Math.random() * 200}px`,
                        top: `${50 + Math.random() * 200}px`
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Community</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Trust</span>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-gold-500" />
              Predictions
            </h3>

            <div className="space-y-4">
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: nodes.indexOf(node) * 0.1 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedNode === node.id
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {node.label}
                    </span>
                    <div className={`p-1 rounded-full bg-gradient-to-r ${node.color} text-white text-xs`}>
                      {getTrendIcon(node.trend)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {node.id === 'trust' ? `${node.value}%` : node.value.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Predicted</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {node.id === 'trust' ? `${node.prediction.toFixed(0)}%` : node.prediction.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Confidence</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {node.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${node.confidence}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ubuntu Wisdom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Sacred Harvest Wisdom
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic max-w-2xl mx-auto">
            "Like a sacred tree, your abundance grows with each season. Nurture your roots, strengthen your branches, and watch your fruits multiply across the community."
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default AbundanceHarvester

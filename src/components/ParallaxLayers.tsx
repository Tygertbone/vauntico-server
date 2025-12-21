import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ParallaxLayersProps {
  children: React.ReactNode
  className?: string
}

interface Layer {
  id: string
  speed: number
  children: React.ReactNode
  className?: string
}

const ParallaxLayers: React.FC<ParallaxLayersProps> = ({ children, className = '' }) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'background-geometry',
      speed: 0.2,
      children: (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold-500/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-500/20 rounded-full rotate-45" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-gold-500/30 rounded-full rotate-12" />
        </div>
      )
    },
    {
      id: 'sacred-symbols',
      speed: 0.5,
      children: (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 right-32 text-6xl opacity-20 animate-pulse">✧</div>
          <div className="absolute bottom-32 left-32 text-6xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>◆</div>
          <div className="absolute top-1/3 left-1/4 text-4xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}>⬟</div>
          <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-15 animate-pulse" style={{ animationDelay: '3s' }}>❋</div>
        </div>
      )
    },
    {
      id: 'floating-particles',
      speed: 0.8,
      children: (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      )
    }
  ])

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Parallax Background Layers */}
      {layers.map((layer) => (
        <motion.div
          key={layer.id}
          className="absolute inset-0"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, layer.speed * 500])
          }}
        >
          {layer.children}
        </motion.div>
      ))}
      
      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ParallaxLayers

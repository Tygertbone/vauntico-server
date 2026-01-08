import React, { useState, useEffect } from 'react';
import GradientMesh from './GradientMesh';
import TypewriterCLI from './TypewriterCLI';
import TrustOracle from './TrustOracle';
import { RitualCTACollection } from './RitualCTA';
import { Sparkles, Eye, Heart, Infinity, Circle, Star, Terminal } from 'lucide-react';
import { CustomIcons } from './CustomIcons';

export default function Hero() {
  const [currentPhase, setCurrentPhase] = useState('awakening');
  const [showOracle, setShowOracle] = useState(false);
  const [showCTAs, setShowCTAs] = useState(false);

  const phases = ['awakening', 'clarity', 'abundance'];
  const sacredSymbols = {
    awakening: ['🌅', '✨', '🌟', '💫'],
    clarity: ['🔮', '💎', '👁️', '🌊'],
    abundance: ['🌈', '💰', '🏆', '🎯']
  };

  const phaseContent = {
    awakening: {
      title: "Awaken Your",
      highlight: "Creator Legacy",
      subtitle: "Stand at the threshold of transformation",
      wisdom: "Every great journey begins with a single conscious step"
    },
    clarity: {
      title: "Find Your",
      highlight: "Sacred Purpose", 
      subtitle: "Discover the trust that flows through authentic creation",
      wisdom: "Clarity comes when we align our actions with our values"
    },
    abundance: {
      title: "Build Your",
      highlight: "Ecosystem of Flow",
      subtitle: "Create prosperity that lifts entire communities",
      wisdom: "True abundance multiplies when shared with others"
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase(prev => {
        const currentIndex = phases.indexOf(prev);
        return phases[(currentIndex + 1) % phases.length];
      });
    }, 4000);

    // Show components progressively
    setTimeout(() => setShowOracle(true), 1000);
    setTimeout(() => setShowCTAs(true), 2000);

    return () => clearInterval(interval);
  }, []);

  const currentContent = phaseContent[currentPhase as keyof typeof phaseContent];

  const handleRitualAction = (action: string) => {
    console.log(`Ritual action triggered: ${action}`);
    // Handle different ritual actions
    switch(action) {
      case 'primary':
        // Navigate to initiation flow
        window.location.href = '/signup';
        break;
      case 'secondary':
        // Navigate to vaults
        window.location.href = '/vaults';
        break;
      case 'community':
        // Navigate to lore vault
        window.location.href = '/lore';
        break;
      case 'wisdom':
        // Navigate to workshop
        window.location.href = '/workshop';
        break;
      default:
        break;
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      <GradientMesh />
      
      {/* Animated Sacred Symbols Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {(sacredSymbols[currentPhase as keyof typeof sacredSymbols] || []).map((symbol, index) => (
          <div
            key={index}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              top: `${15 + index * 20}%`,
              left: `${5 + index * 25}%`,
              animationDelay: `${index * 0.7}s`,
              animationDuration: `${6 + index * 2}s`
            }}
          >
            {symbol}
          </div>
        ))}
        
        {/* Sacred Geometry Overlays */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-purple-400/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border border-yellow-400/10 rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          {/* Phase Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {phases.map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentPhase === phase 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110' 
                    : 'bg-white/10'
                }`}>
                  {phase === 'awakening' && <Eye className="w-5 h-5 text-white" />}
                  {phase === 'clarity' && <Circle className="w-5 h-5 text-white" />}
                  {phase === 'abundance' && <Star className="w-5 h-5 text-white" />}
                </div>
                {index < phases.length - 1 && <div className="w-6 h-px bg-white/20 mx-2"></div>}
              </div>
            ))}
          </div>

          {/* Sacred Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="block text-white mb-2">{currentContent.title}</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-shimmer">
              {currentContent.highlight}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {currentContent.subtitle}
          </p>

        {/* Ubuntu Wisdom */}
        <div className="mb-12 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Heart className="w-5 h-5 text-pink-400" />
            <Infinity className="w-5 h-5 text-purple-400" />
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-lg text-gray-300 italic">
            "{currentContent.wisdom}"
          </p>
        </div>

        {/* Animated CLI Demo */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Terminal className="w-6 h-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Live Trust Creation Demo</h3>
            </div>
            <p className="text-gray-400">Watch as AI transforms your vision into a thriving creator ecosystem</p>
          </div>
          <div className="relative">
            <TypewriterCLI />
            <div className="absolute -bottom-2 -right-2">
              <CustomIcons.SacredGeometry className="w-8 h-8 text-purple-400/30 animate-spin-slow" />
            </div>
          </div>
        </div>
      </div>

        {/* Trust Oracle Integration */}
        {showOracle && (
          <div className="mb-16 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Discover Your Trust Score</h2>
              <p className="text-gray-400">Reveal the credibility that flows through your creative essence</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <TrustOracle />
            </div>
          </div>
        )}

        {/* Ritual CTAs */}
        {showCTAs && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Choose Your Path</h2>
              <p className="text-gray-400">Every journey begins with a single sacred step</p>
            </div>
            <RitualCTACollection onAction={handleRitualAction} />
          </div>
        )}

        {/* Ubuntu Philosophy Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-full border border-white/10">
            <span className="text-sm text-gray-400">Ubuntu Philosophy:</span>
            <span className="text-sm text-white font-medium">"I am because we are"</span>
          </div>
        </div>
      </div>

    </section>
  );
}

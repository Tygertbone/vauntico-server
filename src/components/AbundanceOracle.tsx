import React, { useState, useEffect, useRef } from 'react';
import { Gem, Sparkles, TrendingUp, Eye, Heart, Zap, X } from 'lucide-react';
import { CustomIcons } from './CustomIcons';
import { useHapticHover } from '../hooks/useHapticFeedback';

interface Scenario {
  id: string;
  text: string;
  baseScore: number;
  multiplier: number;
  timeframe: string;
  visualization: 'vines' | 'hearts' | 'stars' | 'lotus';
}

const scenarios: Scenario[] = [
  {
    id: 'daily-post',
    text: 'If I post daily?',
    baseScore: 75,
    multiplier: 1.3,
    timeframe: '3 months',
    visualization: 'vines'
  },
  {
    id: 'weekly-workshop',
    text: 'If I host weekly workshops?',
    baseScore: 82,
    multiplier: 1.5,
    timeframe: '6 months',
    visualization: 'hearts'
  },
  {
    id: 'monthly-collaboration',
    text: 'If I collaborate monthly?',
    baseScore: 68,
    multiplier: 1.4,
    timeframe: '4 months',
    visualization: 'stars'
  },
  {
    id: 'daily-meditation',
    text: 'If I meditate daily before creating?',
    baseScore: 71,
    multiplier: 1.6,
    timeframe: '2 months',
    visualization: 'lotus'
  }
];

export default function AbundanceOracle() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { handleHover } = useHapticHover();

  useEffect(() => {
    if (!isOpen) {
      setSelectedScenario(null);
      setCurrentScore(0);
      setTargetScore(0);
    }
  }, [isOpen]);

  const calculateFuture = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setTargetScore(Math.min(99, scenario.baseScore * scenario.multiplier));
    setIsAnimating(true);

    // Simulate calculation time
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  useEffect(() => {
    if (currentScore < targetScore && isAnimating) {
      const timer = setTimeout(() => {
        setCurrentScore(prev => Math.min(prev + 2, targetScore));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentScore, targetScore, isAnimating]);

  // Canvas animation for visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedScenario) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 200;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      switch (selectedScenario.visualization) {
        case 'vines':
          drawVines(ctx, centerX, centerY, time);
          break;
        case 'hearts':
          drawHearts(ctx, centerX, centerY, time);
          break;
        case 'stars':
          drawStars(ctx, centerX, centerY, time);
          break;
        case 'lotus':
          drawLotus(ctx, centerX, centerY, time);
          break;
      }

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [selectedScenario]);

  const drawVines = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 40 + Math.sin(time + i) * 20;
      const endX = centerX + Math.cos(angle) * length;
      const endY = centerY + Math.sin(angle) * length;

      // Draw vine
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.quadraticCurveTo(
        centerX + Math.cos(angle + 0.5) * length * 0.5,
        centerY + Math.sin(angle + 0.5) * length * 0.5,
        endX,
        endY
      );
      ctx.strokeStyle = `hsla(${120 + i * 20}, 70%, 50%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw leaves
      for (let j = 0; j < 3; j++) {
        const leafX = centerX + Math.cos(angle) * (length * (j + 1) / 3);
        const leafY = centerY + Math.sin(angle) * (length * (j + 1) / 3);
        ctx.beginPath();
        ctx.arc(leafX, leafY, 3 + Math.sin(time + i + j) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${120 + i * 20}, 70%, 60%, 0.8)`;
        ctx.fill();
      }
    }
  };

  const drawHearts = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 30 + Math.sin(time + i) * 15;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = 8 + Math.sin(time * 2 + i) * 3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 4);
      
      // Draw heart shape
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.bezierCurveTo(-size / 2, -size, -size, -size / 3, -size, 0);
      ctx.bezierCurveTo(-size, size / 3, -size / 2, size, 0, size / 2);
      ctx.bezierCurveTo(size / 2, size, size, size / 3, size, 0);
      ctx.bezierCurveTo(size, -size / 3, size / 2, -size, 0, -size / 2);
      ctx.fillStyle = `hsla(${340 + i * 10}, 80%, 60%, 0.7)`;
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawStars = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 35 + Math.sin(time + i * 0.5) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = 2 + Math.sin(time * 3 + i) * 1.5;

      // Draw star
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time + i);
      
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const starAngle = (j / 5) * Math.PI * 2 - Math.PI / 2;
        const starX = Math.cos(starAngle) * size;
        const starY = Math.sin(starAngle) * size;
        
        if (j === 0) {
          ctx.moveTo(starX, starY);
        } else {
          ctx.lineTo(starX, starY);
        }
        
        const innerAngle = ((j + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
        const innerX = Math.cos(innerAngle) * (size * 0.5);
        const innerY = Math.sin(innerAngle) * (size * 0.5);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fillStyle = `hsla(${45 + i * 15}, 100%, 70%, 0.8)`;
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawLotus = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const petalLength = 25 + Math.sin(time + i * 0.5) * 10;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Draw petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        petalLength * 0.5, -petalLength * 0.3,
        petalLength, 0
      );
      ctx.quadraticCurveTo(
        petalLength * 0.5, petalLength * 0.3,
        0, 0
      );
      ctx.fillStyle = `hsla(${280 + i * 10}, 70%, 60%, 0.6)`;
      ctx.fill();
      
      ctx.restore();
    }
    
    // Center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(45, 100%, 80%, 0.9)';
    ctx.fill();
  };

  return (
    <>
      {/* Floating Oracle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => handleHover()}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open Abundance Oracle"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
              <Gem className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      )}

      {/* Oracle Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Gem className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Abundance Oracle</h2>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => handleHover()}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close oracle"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {!selectedScenario ? (
                /* Scenarios */
                <div className="space-y-4">
                  <p className="text-gray-300 mb-6 text-center">
                    Explore potential futures based on your sacred commitments
                  </p>
                  
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => calculateFuture(scenario)}
                      onMouseEnter={() => handleHover()}
                      disabled={isAnimating}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 rounded-xl transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{scenario.text}</span>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{scenario.timeframe}</span>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Results */
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedScenario.text}
                    </h3>
                    <p className="text-gray-400">
                      Projected timeline: {selectedScenario.timeframe}
                    </p>
                  </div>

                  {/* Score Display */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <Eye className="w-8 h-8 text-purple-400" />
                      <div className="text-4xl font-bold text-white">
                        {Math.round(currentScore)}
                      </div>
                      <Heart className="w-8 h-8 text-pink-400" />
                    </div>
                    
                    {isAnimating && (
                      <div className="flex items-center justify-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                        <span className="text-yellow-400">Calculating quantum possibilities...</span>
                      </div>
                    )}
                    
                    {!isAnimating && (
                      <div className="text-sm text-gray-300">
                        <span>Base: {selectedScenario.baseScore}</span>
                        <span className="mx-2">→</span>
                        <span>Potential: {Math.round(targetScore)}</span>
                      </div>
                    )}
                  </div>

                  {/* Visualization Canvas */}
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="rounded-xl border border-purple-400/20"
                      style={{ background: 'radial-gradient(circle at center, #1a1a2e, #0a0a0a)' }}
                    />
                  </div>

                  {/* Ubuntu Wisdom */}
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                    <CustomIcons.Ubuntu className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300 italic">
                      "Your future is a garden of infinite possibilities. Nurture it with intention."
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedScenario(null);
                        setCurrentScore(0);
                        setTargetScore(0);
                      }}
                      onMouseEnter={() => handleHover()}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-gray-300 transition-colors"
                    >
                      Try Another
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => handleHover()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      Embrace This Path
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Shield, Zap, Eye, Heart, Infinity } from 'lucide-react';

const TrustOracle = () => {
  const [currentScore, setCurrentScore] = useState(0);
  const [targetScore, setTargetScore] = useState(85);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quickMetrics, setQuickMetrics] = useState({
    authenticity: 75,
    consistency: 80,
    engagement: 3.5,
    reach: 5000
  });
  const [showBreakdown, setShowBreakdown] = useState(false);

  const sacredLevels = [
    { min: 90, name: 'Legendary', emoji: '🏆', color: 'from-yellow-500 to-orange-500' },
    { min: 80, name: 'Elite', emoji: '👑', color: 'from-purple-500 to-pink-500' },
    { min: 70, name: 'Verified', emoji: '💎', color: 'from-blue-500 to-indigo-500' },
    { min: 60, name: 'Rising', emoji: '⭐', color: 'from-green-500 to-teal-500' },
    { min: 0, name: 'Emerging', emoji: '🌱', color: 'from-gray-500 to-blue-500' }
  ];

  const getCurrentLevel = (score) => {
    return sacredLevels.find(level => score >= level.min) || sacredLevels[sacredLevels.length - 1];
  };

  const calculateQuickScore = () => {
    setIsCalculating(true);
    
    // Simulate the sophisticated scoring algorithm
    setTimeout(() => {
      const calculated = Math.round(
        (quickMetrics.authenticity * 0.35) +
        (quickMetrics.consistency * 0.25) +
        (quickMetrics.engagement * 5) +
        (Math.log10(quickMetrics.reach) * 10)
      );
      
      let displayScore = 0;
      const interval = setInterval(() => {
        displayScore += 2;
        setCurrentScore(Math.min(displayScore, calculated));
        if (displayScore >= calculated) {
          clearInterval(interval);
          setIsCalculating(false);
          setShowBreakdown(true);
        }
      }, 30);
      
      setTargetScore(calculated);
    }, 1000);
  };

  const level = getCurrentLevel(currentScore);
  const progressPercentage = (currentScore / 100) * 100;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 relative overflow-hidden">
      {/* Sacred Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-10 rounded-3xl`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Trust Oracle</h3>
              <p className="text-sm text-gray-400">Reveal your creator credibility</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${level.color} text-white text-sm font-semibold flex items-center space-x-2`}>
            <span>{level.emoji}</span>
            <span>{level.name}</span>
          </div>
        </div>

        {/* Quick Input Section */}
        {!showBreakdown && (
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Authenticity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={quickMetrics.authenticity}
                  onChange={(e) => setQuickMetrics({...quickMetrics, authenticity: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-right text-sm text-purple-400">{quickMetrics.authenticity}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Activity className="inline w-4 h-4 mr-1" />
                  Consistency
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={quickMetrics.consistency}
                  onChange={(e) => setQuickMetrics({...quickMetrics, consistency: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-right text-sm text-blue-400">{quickMetrics.consistency}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Heart className="inline w-4 h-4 mr-1" />
                  Engagement Rate
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={quickMetrics.engagement}
                  onChange={(e) => setQuickMetrics({...quickMetrics, engagement: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="text-right text-sm text-pink-400">{quickMetrics.engagement}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Infinity className="inline w-4 h-4 mr-1" />
                  Reach
                </label>
                <select
                  value={quickMetrics.reach}
                  onChange={(e) => setQuickMetrics({...quickMetrics, reach: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                >
                  <option value="1000">1K Followers</option>
                  <option value="5000">5K Followers</option>
                  <option value="10000">10K Followers</option>
                  <option value="50000">50K Followers</option>
                  <option value="100000">100K+ Followers</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculateQuickScore}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center text-lg"
            >
              {isCalculating ? (
                <>
                  <div className="w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Consulting the Oracle...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  Reveal Trust Score
                </>
              )}
            </button>
          </div>
        )}

        {/* Score Display */}
        {(currentScore > 0 || isCalculating) && (
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center">
              {/* Animated Circle */}
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#oracleGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(progressPercentage / 100) * 553} 553`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="oracleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-white">{currentScore}</div>
                <div className="text-sm text-gray-400">Trust Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown */}
        {showBreakdown && !isCalculating && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sacred Breakdown
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Authenticity (35%)</span>
                <span className="text-purple-400">+{Math.round(quickMetrics.authenticity * 0.35)} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Consistency (25%)</span>
                <span className="text-blue-400">+{Math.round(quickMetrics.consistency * 0.25)} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Engagement (20%)</span>
                <span className="text-pink-400">+{Math.round(quickMetrics.engagement * 5)} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reach (20%)</span>
                <span className="text-orange-400">+{Math.round(Math.log10(quickMetrics.reach) * 10)} pts</span>
              </div>
            </div>

            {/* Sacred Wisdom */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
              <p className="text-sm text-gray-300 italic">
                "{level.name === 'Legendary' ? 'Your trust shines like a beacon for all creators to follow.' :
                  level.name === 'Elite' ? 'You walk the sacred path of authentic creation.' :
                  level.name === 'Verified' ? 'Your voice carries the weight of genuine connection.' :
                  level.name === 'Rising' ? 'Your journey toward creator mastery has begun.' :
                  'Every great legacy starts with a single authentic step.'}"
              </p>
            </div>
          </div>
        )}

        {/* Ubuntu Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            "Trust grows when we give generously to our community" • Ubuntu Wisdom
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrustOracle;

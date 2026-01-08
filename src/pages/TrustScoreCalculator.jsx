import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FullLogo } from '../components/Logo';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  Brain,
  Shield,
  Zap,
  Clock,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

const TrustScoreCalculator = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(85);
  const [isCalculating, setIsCalculating] = useState(false);
  const [metrics, setMetrics] = useState({
    followers: 5000,
    engagement: 4.2,
    consistency: 85,
    authenticity: 92,
    growth: 12
  });

  const calculateScore = () => {
    setIsCalculating(true);
    let currentScore = 0;
    
    setTimeout(() => {
      const score = Math.round(
        (metrics.authenticity * 0.35) +
        (metrics.consistency * 0.25) +
        (metrics.engagement * 5) +
        (Math.log10(metrics.followers) * 10) +
        (metrics.growth * 0.5)
      );
      
      const interval = setInterval(() => {
        currentScore += 2;
        setScore(Math.min(currentScore, score));
        if (currentScore >= score) {
          clearInterval(interval);
          setIsCalculating(false);
        }
      }, 30);
    }, 1500);
  };

  const getScoreLevel = (score) => {
    if (score >= 90) return { level: 'Legendary', color: 'from-yellow-500 to-orange-500', icon: '🏆' };
    if (score >= 80) return { level: 'Elite', color: 'from-purple-500 to-pink-500', icon: '👑' };
    if (score >= 70) return { level: 'Verified', color: 'from-blue-500 to-indigo-500', icon: '💎' };
    if (score >= 60) return { level: 'Rising', color: 'from-green-500 to-teal-500', icon: '⭐' };
    return { level: 'Emerging', color: 'from-gray-500 to-blue-500', icon: '🌱' };
  };

  const recommendations = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Increase Engagement Rate",
      description: "Post consistently and interact with your audience to boost engagement to 6%+",
      impact: "+15 points"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Maintain Consistency",
      description: "Post at least 3x per week on the same schedule for better consistency scores",
      impact: "+10 points"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Grow Your Audience",
      description: "Focus on organic growth strategies to increase follower count",
      impact: "+8 points"
    }
  ];

  const scoreLevel = getScoreLevel(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <FullLogo size="lg" />
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/pricing" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-600/20 rounded-full px-4 py-2 border border-purple-500/30">
            <Calculator className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Trust Score Calculator</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            <span className="block text-white">Calculate Your</span>
            <span className="block text-gradient">Trust Score</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get instant insights into your creator credibility and discover ways to improve your digital reputation
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'insights' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Insights
            </button>
          </div>
        </div>

        {activeTab === 'calculator' && (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Input Form */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <Brain className="w-6 h-6 mr-3" />
                  Your Metrics
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Followers Count
                    </label>
                    <input
                      type="number"
                      value={metrics.followers}
                      onChange={(e) => setMetrics({...metrics, followers: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Enter your follower count"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Engagement Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={metrics.engagement}
                      onChange={(e) => setMetrics({...metrics, engagement: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Average likes + comments per follower"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Consistency Score (%)
                    </label>
                    <input
                      type="number"
                      value={metrics.consistency}
                      onChange={(e) => setMetrics({...metrics, consistency: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Posting regularity score"
                    />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                      Authenticity Score (%)
                    </label>
                    <input
                      type="number"
                      value={metrics.authenticity}
                      onChange={(e) => setMetrics({...metrics, authenticity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Content authenticity score"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Growth (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={metrics.growth}
                      onChange={(e) => setMetrics({...metrics, growth: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Monthly follower growth rate"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateScore}
                  disabled={isCalculating}
                  className="w-full btn-primary text-lg py-4 flex items-center justify-center disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Calculate Trust Score
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right - Score Display */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Your Trust Score</h2>
                
                {/* Score Circle */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${scoreLevel.color} rounded-full blur-2xl opacity-30 animate-pulse-glow`}></div>
                  
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 754} 754`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-white">{score}</div>
                    <div className="text-sm text-gray-400">/ 100</div>
                    <div className={`mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${scoreLevel.color} text-white text-sm font-medium flex items-center`}>
                      <span className="mr-2">{scoreLevel.icon}</span>
                      {scoreLevel.level}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Authenticity (35%)</span>
                    <span className="text-green-400">+{Math.round(metrics.authenticity * 0.35)} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Consistency (25%)</span>
                    <span className="text-blue-400">+{Math.round(metrics.consistency * 0.25)} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Engagement (20%)</span>
                    <span className="text-purple-400">+{Math.round(metrics.engagement * 5)} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Reach (15%)</span>
                    <span className="text-orange-400">+{Math.round(Math.log10(metrics.followers) * 10)} pts</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Growth (5%)</span>
                    <span className="text-pink-400">+{Math.round(metrics.growth * 0.5)} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            {/* Recommendations */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3" />
                Improvement Recommendations
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center text-purple-400 mb-3">
                      {rec.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{rec.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{rec.description}</p>
                    <div className="flex items-center text-green-400 font-semibold">
                      <ArrowRight className="w-4 h-4 mr-1" />
                      {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Score */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3" />
                Score Progress
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Current Score</span>
                    <span className="text-2xl font-bold text-white">{score}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Target Score</span>
                    <input
                      type="number"
                      value={targetScore}
                      onChange={(e) => setTargetScore(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Gap to Close</span>
                    <span className="text-xl font-bold text-purple-400">
                      {Math.max(0, targetScore - score)} points
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 space-y-6">
              <Activity className="w-16 h-16 text-white mx-auto animate-bounce" />
              <h2 className="text-3xl font-bold text-white">
                Ready to Track Your Trust Score?
              </h2>
              <p className="text-xl text-white/90">
                Get real-time monitoring, fraud detection, and growth analytics
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                  Start Free Trial
                </Link>
                <Link to="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCalculator;

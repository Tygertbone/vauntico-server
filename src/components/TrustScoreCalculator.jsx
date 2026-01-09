import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Users, Shield, Star, Zap, Target } from 'lucide-react';

const TrustScoreCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    platform: '',
    followers: '',
    engagement: '',
    content: '',
    verification: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: '🎥', weight: 1.2 },
    { id: 'instagram', name: 'Instagram', icon: '📸', weight: 1.0 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', weight: 1.1 },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', weight: 0.9 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', weight: 0.8 }
  ];

  const engagementLevels = [
    { id: 'low', label: 'Low (<2%)', score: 20 },
    { id: 'medium', label: 'Medium (2-5%)', score: 40 },
    { id: 'high', label: 'High (5-10%)', score: 60 },
    { id: 'very-high', label: 'Very High (>10%)', score: 80 }
  ];

  const contentFrequencies = [
    { id: 'rare', label: 'Rare (<1/week)', score: 15 },
    { id: 'occasional', label: 'Occasional (1-3/week)', score: 30 },
    { id: 'regular', label: 'Regular (4-7/week)', score: 50 },
    { id: 'frequent', label: 'Frequent (8+/week)', score: 70 }
  ];

  const verificationLevels = [
    { id: 'none', label: 'Not Verified', score: 0 },
    { id: 'basic', label: 'Basic Verification', score: 25 },
    { id: 'advanced', label: 'Advanced Verification', score: 50 },
    { id: 'verified', label: 'Fully Verified', score: 75 }
  ];

  const getTrustTier = (score) => {
    if (score >= 850) return { name: 'Master', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 750) return { name: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 650) return { name: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 500) return { name: 'Beginner', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { name: 'Developing', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const calculateScore = () => {
    setIsCalculating(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.platform) newErrors.platform = 'Please select a platform';
    if (!formData.followers || parseInt(formData.followers) < 0) newErrors.followers = 'Please enter valid follower count';
    if (!formData.engagement) newErrors.engagement = 'Please select engagement level';
    if (!formData.content) newErrors.content = 'Please select content frequency';
    if (!formData.verification) newErrors.verification = 'Please select verification level';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsCalculating(false);
      return;
    }

    // Simulate calculation with animation
    setTimeout(() => {
      const platform = platforms.find(p => p.id === formData.platform);
      const engagement = engagementLevels.find(e => e.id === formData.engagement);
      const content = contentFrequencies.find(c => c.id === formData.content);
      const verification = verificationLevels.find(v => v.id === formData.verification);

      // Calculate base score
      let baseScore = 0;
      
      // Platform weight (30% of score)
      baseScore += (platform.weight * 100) * 0.3;
      
      // Follower count (25% of score)
      const followers = parseInt(formData.followers);
      const followerScore = Math.min(100, Math.log10(followers + 1) * 20);
      baseScore += followerScore * 0.25;
      
      // Engagement rate (25% of score)
      baseScore += engagement.score * 0.25;
      
      // Content frequency (15% of score)
      baseScore += content.score * 0.15;
      
      // Verification status (5% of score)
      baseScore += verification.score * 0.05;

      // Add some randomness for realism
      const finalScore = Math.round(baseScore + (Math.random() * 20 - 10));
      const tier = getTrustTier(finalScore);

      setResults({
        score: finalScore,
        tier,
        breakdown: {
          platform: { name: platform.name, score: Math.round((platform.weight * 100) * 0.3) },
          followers: { count: followers, score: Math.round(followerScore * 0.25) },
          engagement: { name: engagement.label, score: Math.round(engagement.score * 0.25) },
          content: { name: content.label, score: Math.round(content.score * 0.15) },
          verification: { name: verification.label, score: Math.round(verification.score * 0.05) }
        },
        recommendations: generateRecommendations(finalScore, tier.name)
      });

      setIsCalculating(false);
      setCurrentStep(3);
    }, 2000);
  };

  const generateRecommendations = (score, tier) => {
    const recommendations = [];
    
    if (score < 500) {
      recommendations.push({
        icon: Target,
        title: 'Focus on Consistency',
        description: 'Post regularly and engage with your audience to build momentum'
      });
      recommendations.push({
        icon: Users,
        title: 'Grow Your Following',
        description: 'Collaborate with other creators and use relevant hashtags'
      });
    }
    
    if (score >= 500 && score < 750) {
      recommendations.push({
        icon: TrendingUp,
        title: 'Optimize Content Strategy',
        description: 'Analyze your top-performing content and create more like it'
      });
      recommendations.push({
        icon: Shield,
        title: 'Get Verified',
        description: 'Platform verification significantly boosts trust scores'
      });
    }
    
    if (score >= 750) {
      recommendations.push({
        icon: Star,
        title: 'Monetize Your Influence',
        description: 'Your high trust score opens doors to premium opportunities'
      });
      recommendations.push({
        icon: Zap,
        title: 'Join Vauntico Pro',
        description: 'Advanced analytics and automation tools for top creators'
      });
    }
    
    return recommendations;
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setFormData({
      platform: '',
      followers: '',
      engagement: '',
      content: '',
      verification: ''
    });
    setResults(null);
    setErrors({});
  };

  const shareResults = () => {
    const text = `My Creator Trust Score is ${results.score}/1000 (${results.tier.name})! Calculate yours at vauntico.com`;
    const url = `https://vauntico.com?trust=${results.score}&tier=${results.tier.name}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Creator Trust Score',
        text: text,
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Know Your <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Creator Trust Score</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Calculate credibility in 60 seconds. Build trust, automate workflows, monetize faster.
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-purple-600 font-semibold' : ''}>Input</span>
            <span className={currentStep >= 2 ? 'text-purple-600 font-semibold' : ''}>Analysis</span>
            <span className={currentStep >= 3 ? 'text-purple-600 font-semibold' : ''}>Results</span>
          </div>
        </div>

        {/* Step 1: Input */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Tell us about your creator presence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Platform *</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: platform.id })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.platform === platform.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.platform && <p className="text-red-600 text-sm mt-1">{errors.platform}</p>}
              </div>

              {/* Follower Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Count *</label>
                <input
                  type="number"
                  value={formData.followers}
                  onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                  placeholder="e.g., 10000"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.followers ? 'border-red-600' : 'border-gray-200'
                  }`}
                />
                {errors.followers && <p className="text-red-600 text-sm mt-1">{errors.followers}</p>}
              </div>

              {/* Engagement Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate *</label>
                <select
                  value={formData.engagement}
                  onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.engagement ? 'border-red-600' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select engagement level</option>
                  {engagementLevels.map((level) => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </select>
                {errors.engagement && <p className="text-red-600 text-sm mt-1">{errors.engagement}</p>}
              </div>

              {/* Content Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Frequency *</label>
                <select
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.content ? 'border-red-600' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select frequency</option>
                  {contentFrequencies.map((freq) => (
                    <option key={freq.id} value={freq.id}>{freq.label}</option>
                  ))}
                </select>
                {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
              </div>

              {/* Verification Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {verificationLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, verification: level.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.verification === level.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{level.label}</span>
                    </button>
                  ))}
                </div>
                {errors.verification && <p className="text-red-600 text-sm mt-1">{errors.verification}</p>}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.platform || !formData.followers || !formData.engagement || !formData.content || !formData.verification}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate My Trust Score
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analysis */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 border-4 border-white border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Analyzing Your Creator Trust Score</h2>
              <p className="text-gray-600 mb-6">
                Our AI is analyzing your platform presence, engagement patterns, and verification status...
              </p>
              
              {/* Animated Progress */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Platform influence calculated</span>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Engagement patterns analyzed</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-700">Calculating trust score...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && results && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              {/* Score Display */}
              <div className="mb-8">
                <div className={`inline-flex items-center px-6 py-3 rounded-full ${results.tier.bg} ${results.tier.color} font-bold text-2xl mb-4`}>
                  {results.tier.name} Creator
                </div>
                <div className="text-5xl md:text-6xl font-black mb-2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {results.score}
                  </span>
                  <span className="text-gray-500 text-3xl">/1000</span>
                </div>
                <p className="text-gray-600">
                  Your trust score puts you in the top {Math.round((1 - results.score/1000) * 100)}% of creators
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.entries(results.breakdown).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1 capitalize">{key}</div>
                    <div className="font-semibold text-lg">{value.score || value.name}</div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">Recommendations to Grow Your Trust Score</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.recommendations.map((rec, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <rec.icon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-gray-600 text-sm">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={shareResults}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Share My Score
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Calculate Another Score
                </button>
              </div>
            </div>
        )}

        {/* Trust Score Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold mb-4 text-center">How Trust Scores Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Analysis</h4>
                  <p className="text-gray-600 text-sm">
                    Our algorithms analyze multiple factors to calculate your creator credibility
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Dynamic Scoring</h4>
                  <p className="text-gray-600 text-sm">
                    Scores update based on your latest performance and engagement
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Industry Standard</h4>
                  <p className="text-gray-600 text-sm">
                    Trusted by brands and platforms for creator verification
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Privacy First</h4>
                  <p className="text-gray-600 text-sm">
                    Your data is secure and never shared without consent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

              {/* Ubuntu Philosophy Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-purple-50 rounded-full border border-purple-200">
            <span className="text-sm text-purple-700 font-medium">Ubuntu Philosophy:</span>
            <span className="text-sm text-purple-900 font-semibold">"I am because we are"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCalculator;

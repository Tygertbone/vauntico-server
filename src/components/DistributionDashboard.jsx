import React, { useState, useEffect } from 'react';
import { DistributionLayer } from '../utils/distributionLayer';

const DistributionDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await DistributionLayer.analytics.getReport('30d');
    setAnalyticsData(data);
    setLoading(false);
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distribution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📡 Distribution Command Center
          </h1>
          <p className="text-gray-600">
            Mission control for your content empire
          </p>
        </div>

        {/* Performance Score */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Overall Performance Score
              </h2>
              <p className="text-purple-100">
                Last {analyticsData.timeframe}
              </p>
            </div>
            <div className="text-6xl font-bold">
              {analyticsData.performanceScore}/10
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['overview', 'platforms', 'seo', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab data={analyticsData} />}
        {activeTab === 'platforms' && <PlatformsTab />}
        {activeTab === 'seo' && <SEOTab />}
        {activeTab === 'analytics' && <AnalyticsTab data={analyticsData} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ data }) => {
  const { syndication, topPerformers, insights } = data;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📊"
          label="Total Publications"
          value={syndication.totalPublications}
          trend="+12%"
        />
        <StatCard
          icon="👁️"
          label="Total Reach"
          value={syndication.totalReach.toLocaleString()}
          trend="+34%"
        />
        <StatCard
          icon="❤️"
          label="Engagement Rate"
          value={`${syndication.engagementRate}%`}
          trend="+2.1%"
        />
        <StatCard
          icon="🔗"
          label="Traffic Driven"
          value={syndication.trafficDriven.toLocaleString()}
          trend="+47%"
        />
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🏆 Top Performers
        </h3>
        <div className="space-y-4">
          {topPerformers.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {item.platform}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {item.conversions} conversions
                </div>
                <div className="text-sm text-gray-600">
                  {item.impressions.toLocaleString()} impressions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          💡 AI Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-white rounded-lg"
            >
              <span className="text-2xl">✨</span>
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlatformsTab = () => {
  const platforms = [
    { name: 'Twitter/X', connected: true, icon: '🐦', posts: 42, engagement: 4.2 },
    { name: 'LinkedIn', connected: true, icon: '💼', posts: 18, engagement: 6.8 },
    { name: 'Medium', connected: true, icon: '📝', posts: 8, engagement: 3.1 },
    { name: 'Instagram', connected: false, icon: '📱', posts: 0, engagement: 0 },
    { name: 'Email', connected: true, icon: '📧', posts: 15, engagement: 41.3 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6">Platform Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border-2 transition-all ${
                platform.connected
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{platform.name}</h4>
                    {platform.connected && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {platform.connected ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posts:</span>
                    <span className="font-semibold">{platform.posts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement:</span>
                    <span className="font-semibold">{platform.engagement}%</span>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">
                    Manage
                  </button>
                </div>
              ) : (
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Connect Platform
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SEOTab = () => {
  const [targetScroll, setTargetScroll] = useState('');
  const [seoScore, setSeoScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSEO = async () => {
    if (!targetScroll) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const result = DistributionLayer.seo.analyze(targetScroll);
      setSeoScore(result);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* SEO Analyzer */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">🔍 SEO Analyzer</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter scroll path or URL..."
            value={targetScroll}
            onChange={(e) => setTargetScroll(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600"
          />
          <button
            onClick={analyzeSEO}
            disabled={loading || !targetScroll}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* SEO Results */}
      {seoScore && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Discoverability Score</h3>
            <div className="text-4xl font-bold text-purple-600">
              {seoScore.score}/100
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                ✅ Strengths
              </h4>
              <ul className="space-y-2">
                {seoScore.strengths.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div>
              <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                ⚠️ Opportunities
              </h4>
              <ul className="space-y-2">
                {seoScore.opportunities.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Wins */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-3">🚀 Quick Wins</h4>
            <div className="space-y-2">
              {seoScore.quickWins.map((win, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <span className="text-sm">{win.action}</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {win.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6">📊 Detailed Analytics</h3>
        
        {/* Conversion Funnel */}
        <div className="mb-8">
          <h4 className="font-bold text-gray-900 mb-4">Conversion Funnel</h4>
          <div className="space-y-3">
            <FunnelStep label="Impressions" value="243,847" percentage="100%" />
            <FunnelStep label="Clicks" value="9,274" percentage="3.8%" />
            <FunnelStep label="Visits" value="3,891" percentage="1.6%" />
            <FunnelStep label="Conversions" value="109" percentage="2.8%" />
          </div>
        </div>

        {/* Platform Breakdown */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Platform Performance</h4>
          <div className="space-y-3">
            {data.topPerformers.map((platform, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h5 className="font-semibold capitalize">{platform.platform}</h5>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>{platform.impressions.toLocaleString()} views</span>
                    <span>{platform.clicks} clicks</span>
                    <span>{platform.conversions} conversions</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {((platform.conversions / platform.clicks) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">CVR</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-3xl">{icon}</span>
      {trend && (
        <span className="text-sm font-semibold text-green-600">
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const FunnelStep = ({ label, value, percentage }) => (
  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <div className="flex items-center gap-4">
      <span className="font-bold text-gray-900">{value}</span>
      <span className="text-sm text-gray-600 min-w-[60px] text-right">
        {percentage}
      </span>
    </div>
  </div>
);

export default DistributionDashboard;

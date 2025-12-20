import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FullLogo } from '../components/Logo';
import {
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
  Shield,
  Zap,
  Target,
  Star,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Bell,
  Settings,
  User,
  LogOut,
  Brain,
  Heart,
  MessageSquare,
  Share2,
  Download,
  Filter,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    trustScore: 87,
    engagement: 4.2,
    followers: 5234,
    posts: 156,
    revenue: 2340
  });

  const [activities] = useState([
    {
      id: 1,
      type: 'achievement',
      title: 'Trust Score Milestone',
      description: 'Reached 85+ trust score! You\'re now in the Elite tier.',
      time: '2 hours ago',
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      color: 'bg-yellow-500/20 border-yellow-500/30'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Engagement Drop',
      description: 'Your engagement rate dropped 12% this week. Consider posting more consistently.',
      time: '6 hours ago',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      color: 'bg-red-500/20 border-red-500/30'
    },
    {
      id: 3,
      type: 'success',
      title: 'Fraud Detection Alert',
      description: 'Our system blocked 3 suspicious activities on your account this week.',
      time: '1 day ago',
      icon: <Shield className="w-5 h-5 text-green-500" />,
      color: 'bg-green-500/20 border-green-500/30'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Consistency Badge',
      description: 'You\'ve posted consistently for 30 days straight! Keep it up!',
      time: '2 days ago',
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-500/20 border-blue-500/30'
    }
  ]);

  const [metrics] = useState([
    { name: 'Authenticity', value: 92, change: 2.3, color: 'text-green-400' },
    { name: 'Consistency', value: 85, change: -1.2, color: 'text-yellow-400' },
    { name: 'Engagement', value: 4.2, change: 0.8, color: 'text-purple-400' },
    { name: 'Growth', value: 12, change: 3.4, color: 'text-blue-400' }
  ]);

  const [recentPosts] = useState([
    {
      id: 1,
      title: '10 Tips for Better Content Engagement',
      platform: 'Instagram',
      engagement: 234,
      reach: 5200,
      posted: '2 hours ago',
      trend: 'up'
    },
    {
      id: 2,
      title: 'Behind the Scenes: My Creative Process',
      platform: 'YouTube',
      engagement: 567,
      reach: 8900,
      posted: '1 day ago',
      trend: 'up'
    },
    {
      id: 3,
      title: 'Q3 Goals and Progress Update',
      platform: 'TikTok',
      engagement: 189,
      reach: 3400,
      posted: '3 days ago',
      trend: 'down'
    }
  ]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-purple-500 to-pink-500';
    return 'from-orange-500 to-red-500';
  };

  const scoreColor = getScoreColor(stats.trustScore);

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
              <FullLogo size="md" />
            </Link>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all w-64"
                  />
                </div>
                
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/profile" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        Profile
                      </div>
                    </Link>
                    <Link to="/settings" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </div>
                    </Link>
                    <button className="w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-b-lg text-left">
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Monitor your trust score, engagement metrics, and growth analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 overflow-x-auto">
          {['overview', 'analytics', 'content', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Trust Score</h3>
                  <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${scoreColor} text-xs font-medium`}>
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.trustScore}</div>
                <div className="text-sm text-gray-400">Elite Creator</div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Engagement Rate</h3>
                  <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.engagement}%</div>
                <div className="text-sm text-gray-400">Above average</div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Followers</h3>
                  <div className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.followers.toLocaleString()}</div>
                <div className="text-sm text-gray-400">+12% this month</div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Posts</h3>
                  <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                    <ArrowUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.posts}</div>
                <div className="text-sm text-gray-400">This month</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3" />
                  Performance Metrics
                </h2>
                <div className="space-y-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
                        <div className={`flex items-center text-sm ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metric.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          <span>{Math.abs(metric.change)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className={`flex items-start space-x-3 p-4 rounded-lg ${activity.color}`}>
                      <div className="flex-shrink-0 mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-300">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Growth Analytics</h2>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-400">Analytics charts coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Content</h2>
                <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-400' :
                          post.platform === 'YouTube' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {post.platform}
                        </span>
                        {post.trend === 'up' ? (
                          <ArrowUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400 mb-1">Engagement</div>
                        <div className="text-xl font-bold text-white">{post.engagement}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 mb-1">Reach</div>
                        <div className="text-xl font-bold text-white">{post.reach.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 mb-1">Posted</div>
                        <div className="text-sm text-gray-300">{post.posted}</div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">All Activity</h2>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className={`flex items-start space-x-3 p-4 rounded-lg ${activity.color}`}>
                    <div className="flex-shrink-0 mt-1">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

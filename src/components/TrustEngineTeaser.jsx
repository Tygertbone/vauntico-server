import React, { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Zap,
  Server,
  Clock,
  TrendingUp,
  Eye,
  Heart,
} from "lucide-react";

const TrustEngineTeaser = () => {
  const [liveMetrics, setLiveMetrics] = useState({
    uptime: "99.97%",
    responseTime: "127ms",
    requestsPerSecond: "1,247",
    trustScoreCalculations: "84.2K/sec",
    activeVaults: "2,847",
    fraudDetectionRate: "0.02%",
  });

  const [currentSystemStatus, setCurrentSystemStatus] = useState("optimal");

  const systemStatuses = ["optimal", "performing", "scaling", "maintenance"];
  const statusColors = {
    optimal: "from-green-500 to-emerald-500",
    performing: "from-blue-500 to-indigo-500",
    scaling: "from-yellow-500 to-orange-500",
    maintenance: "from-gray-500 to-slate-500",
  };

  const statusIcons = {
    optimal: Shield,
    performing: Activity,
    scaling: TrendingUp,
    maintenance: Clock,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live metric updates
      setLiveMetrics((prev) => ({
        ...prev,
        responseTime: `${Math.floor(120 + Math.random() * 20)}ms`,
        requestsPerSecond: `${Math.floor(1200 + Math.random() * 100).toLocaleString()}`,
        trustScoreCalculations: `${Math.floor(84 + Math.random() * 5).toFixed(1)}K/sec`,
        activeVaults: `${Math.floor(2800 + Math.random() * 200).toLocaleString()}`,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      const statuses = [
        "optimal",
        "performing",
        "optimal",
        "scaling",
        "optimal",
      ];
      setCurrentSystemStatus(
        statuses[Math.floor(Math.random() * statuses.length)],
      );
    }, 8000);

    return () => clearInterval(statusInterval);
  }, []);

  const StatusIcon = statusIcons[currentSystemStatus];

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 relative overflow-hidden">
      {/* Sacred Glow Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${statusColors[currentSystemStatus]} opacity-5 rounded-3xl animate-pulse-slow`}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Trust Engine</h3>
              <p className="text-sm text-gray-400">Live System Performance</p>
            </div>
          </div>

          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${statusColors[currentSystemStatus]} text-white text-sm font-semibold`}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{currentSystemStatus.toUpperCase()}</span>
          </div>
        </div>

        {/* Ubuntu Wisdom */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
          <p className="text-sm text-gray-300 italic text-center">
            "Our systems breathe with the rhythm of trust, ensuring every
            creator's journey is protected by sacred algorithms and community
            vigilance"
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Uptime */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400 font-semibold">
                SYSTEM HEALTH
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.uptime}
            </div>
            <div className="text-sm text-gray-400">Platform Uptime</div>
            <div className="mt-3 w-full bg-green-500/20 rounded-full h-2">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: liveMetrics.uptime }}
              ></div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold">
                SPEED
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.responseTime}
            </div>
            <div className="text-sm text-gray-400">Avg Response Time</div>
            <div className="mt-3 flex space-x-1">
              <div className="flex-1 bg-yellow-500/20 rounded-full h-2"></div>
              <div className="flex-1 bg-yellow-500/20 rounded-full h-2 animate-pulse-slow"></div>
              <div className="flex-1 bg-yellow-500/20 rounded-full h-2"></div>
            </div>
          </div>

          {/* Trust Calculations */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-purple-400 font-semibold">
                TRUST PROCESSING
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.trustScoreCalculations}
            </div>
            <div className="text-sm text-gray-400">Trust Calculations/sec</div>
            <div className="mt-3 w-full bg-purple-500/20 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-shimmer"></div>
            </div>
          </div>

          {/* Active Vaults */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">
                ECOSYSTEM
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.activeVaults}
            </div>
            <div className="text-sm text-gray-400">Active Creator Vaults</div>
            <div className="mt-3 w-full bg-blue-500/20 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full ubuntu-flow"></div>
            </div>
          </div>

          {/* Request Volume */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-orange-400 font-semibold">
                TRAFFIC
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.requestsPerSecond}
            </div>
            <div className="text-sm text-gray-400">Requests/Second</div>
            <div className="mt-3 w-full bg-orange-500/20 rounded-full h-2">
              <div className="h-full bg-orange-500 rounded-full animate-pulse-slow"></div>
            </div>
          </div>

          {/* Fraud Prevention */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-xs text-red-400 font-semibold">
                PROTECTION
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {liveMetrics.fraudDetectionRate}
            </div>
            <div className="text-sm text-gray-400">Fraud Detection Rate</div>
            <div className="mt-3 w-full bg-red-500/20 rounded-full h-2">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: "99.98%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Architecture Insight */}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-purple-800/50 rounded-xl border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-purple-400" />
            Sacred Architecture
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">4</div>
              <div className="text-xs text-gray-400">Services</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-pink-400 mb-1">99.9%</div>
              <div className="text-xs text-gray-400">Uptime</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {"<300ms"}
              </div>
              <div className="text-xs text-gray-400">Response</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">
                0.02%
              </div>
              <div className="text-xs text-gray-400">Fraud Rate</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400 text-center">
            Built on sacred principles: Peace, Love, Abundance • Ubuntu
            Engineering
          </p>
        </div>

        {/* Trust Engine Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Transparency</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Reliability</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span>Trust</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustEngineTeaser;

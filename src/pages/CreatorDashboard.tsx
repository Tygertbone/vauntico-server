import React, { useState } from "react";
import { Menu, X, Bell, User, Settings, LogOut } from "lucide-react";
import { clsx } from "clsx";
import TrustScoreCard from "../components/TrustScoreCard";
import TrustScoreTrend from "../components/TrustScoreTrend";
import SacredFeatures from "../components/SacredFeatures";

interface CreatorData {
  name: string;
  email: string;
  trustScore: number;
  trustScoreTrend: "up" | "down" | "stable";
  trustScoreChange: number;
  level: "bronze" | "silver" | "gold" | "platinum";
  joinDate: string;
  revenue: number;
  subscribers: number;
  contentCount: number;
}

const CreatorDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in real app, this would come from API
  const creatorData: CreatorData = {
    name: "Alex Creator",
    email: "alex@example.com",
    trustScore: 78,
    trustScoreTrend: "up",
    trustScoreChange: 5.2,
    level: "silver",
    joinDate: "2024-01-15",
    revenue: 1247.5,
    subscribers: 847,
    contentCount: 42,
  };

  const trustScoreHistory = [
    { date: "2026-01-10", score: 65, benchmark: 70 },
    { date: "2026-01-11", score: 68, benchmark: 70 },
    { date: "2026-01-12", score: 70, benchmark: 71 },
    { date: "2026-01-13", score: 72, benchmark: 71 },
    { date: "2026-01-14", score: 75, benchmark: 72 },
    { date: "2026-01-15", score: 76, benchmark: 73 },
    { date: "2026-01-16", score: 78, benchmark: 74 },
  ];

  const sacredFeatures = [
    {
      id: "premium-content",
      name: "Premium Content",
      description:
        "Create exclusive content for your most loyal supporters with advanced monetization options.",
      icon: <Settings className="w-6 h-6" />,
      status: "active" as const,
      sacredLevel: "silver" as const,
      progress: 85,
    },
    {
      id: "analytics-pro",
      name: "Analytics Pro",
      description:
        "Advanced insights about your audience, engagement patterns, and revenue optimization.",
      icon: <Bell className="w-6 h-6" />,
      status: "active" as const,
      sacredLevel: "silver" as const,
    },
    {
      id: "collaboration-hub",
      name: "Collaboration Hub",
      description:
        "Connect with other creators and collaborate on exclusive content projects.",
      icon: <User className="w-6 h-6" />,
      status: "locked" as const,
      sacredLevel: "gold" as const,
      progress: 45,
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      description:
        "Get AI-powered suggestions for content creation and audience growth.",
      icon: <Settings className="w-6 h-6" />,
      status: "coming-soon" as const,
      sacredLevel: "platinum" as const,
    },
    {
      id: "merchandise-store",
      name: "Merchandise Store",
      description: "Open your own merchandise store with zero inventory risk.",
      icon: <Settings className="w-6 h-6" />,
      status: "locked" as const,
      sacredLevel: "gold" as const,
      progress: 20,
    },
    {
      id: "priority-support",
      name: "Priority Support",
      description: "Get 24/7 priority support from our creator success team.",
      icon: <Bell className="w-6 h-6" />,
      status: "active" as const,
      sacredLevel: "silver" as const,
    },
  ];

  const navigation = [
    { id: "overview", label: "Overview", icon: <User className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <Bell className="w-5 h-5" /> },
    { id: "content", label: "Content", icon: <Settings className="w-5 h-5" /> },
    { id: "community", label: "Community", icon: <User className="w-5 h-5" /> },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vauntico</h1>
              <p className="text-sm text-gray-500">Creator Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {creatorData.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {creatorData.name}
                </p>
                <p className="text-xs text-gray-500">{creatorData.email}</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {creatorData.name}! 🎉
                </h2>
                <p className="text-gray-600">
                  Your creator journey is flourishing. Here's your latest
                  overview.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-bold text-lg">
                        💰
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(creatorData.revenue)}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-bold text-lg">
                        👥
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">Subscribers</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {creatorData.subscribers.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 font-bold text-lg">
                        📝
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Content Pieces
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {creatorData.contentCount}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <span className="text-indigo-600 font-bold text-lg">
                        📅
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">Member Since</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(creatorData.joinDate)}
                  </div>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="flex justify-center">
                <TrustScoreCard
                  score={creatorData.trustScore}
                  trend={creatorData.trustScoreTrend}
                  change={creatorData.trustScoreChange}
                  lastUpdated={new Date().toISOString()}
                />
              </div>

              {/* Trust Score Trend */}
              <TrustScoreTrend data={trustScoreHistory} timeframe="30d" />

              {/* Sacred Features */}
              <SacredFeatures
                features={sacredFeatures}
                userLevel={creatorData.level}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreatorDashboard;

import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  BarChart3,
  Users,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";

// Import enhanced components
import {
  DashboardCard,
  StatCard,
  Button,
  Badge,
  Skeleton,
  Progress,
} from "../components/dashboard/UIkit";
import { ThemeToggle } from "../components/ThemeToggle";
import { ErrorBoundary } from "../components/ErrorBoundary";
import TrustScoreCard from "../components/TrustScoreCard";
import TrustScoreTrend from "../components/TrustScoreTrend";
import SacredFeatures from "../components/SacredFeatures";

// Import custom hooks
import { useTheme } from "../context/ThemeContext";
import { useTrustScore } from "../hooks/useTrustScore";
import { useTrend } from "../hooks/useTrend";
import { useFeatures } from "../hooks/useFeatures";

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
  const { theme } = useTheme();

  // Use custom hooks for data fetching
  const {
    data: trustScoreData,
    loading: trustScoreLoading,
    error: trustScoreError,
  } = useTrustScore({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  const {
    data: trendData,
    loading: trendLoading,
    error: trendError,
  } = useTrend({
    timeframe: "30d",
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });

  const {
    features,
    loading: featuresLoading,
    error: featuresError,
    unlockedCount,
    totalCount,
  } = useFeatures({
    userLevel: trustScoreData?.tier || "silver",
    autoRefresh: true,
    refreshInterval: 120000, // 2 minutes
  });

  // Mock creator data
  const creatorData: CreatorData = {
    name: "Alex Creator",
    email: "alex@example.com",
    trustScore: trustScoreData?.score || 78,
    trustScoreTrend: trustScoreData?.trend || "up",
    trustScoreChange: trustScoreData?.change || 5.2,
    level: trustScoreData?.tier || "silver",
    joinDate: "2024-01-15",
    revenue: 1247.5,
    subscribers: 847,
    contentCount: 42,
  };

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "content",
      label: "Content",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "features",
      label: "Features",
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(creatorData.revenue)}
                icon="💰"
                trend={{
                  value: 12.5,
                  direction: creatorData.trustScoreTrend,
                }}
              />
              <StatCard
                title="Subscribers"
                value={creatorData.subscribers.toLocaleString()}
                icon="👥"
                trend={{
                  value: 8.3,
                  direction: "up",
                }}
              />
              <StatCard
                title="Content Pieces"
                value={creatorData.contentCount}
                icon="📝"
                trend={{
                  value: 15.2,
                  direction: "up",
                }}
              />
              <StatCard
                title="Member Since"
                value={formatDate(creatorData.joinDate)}
                icon="📅"
              />
            </div>

            {/* Trust Score Card */}
            {trustScoreLoading ? (
              <div className="flex justify-center">
                <DashboardCard className="w-96 h-64">
                  <div className="flex items-center justify-center h-full">
                    <Skeleton lines={3} height="h-4" className="w-full mb-4" />
                    <Skeleton
                      lines={1}
                      height="h-8"
                      className="w-24 h-8 mx-auto"
                    />
                  </div>
                </DashboardCard>
              </div>
            ) : trustScoreError ? (
              <DashboardCard className="text-center">
                <div className="text-red-600 mb-4">
                  ⚠️ Failed to load trust score
                </div>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </DashboardCard>
            ) : (
              <div className="flex justify-center">
                <TrustScoreCard
                  score={creatorData.trustScore}
                  trend={creatorData.trustScoreTrend}
                  change={creatorData.trustScoreChange}
                  lastUpdated={
                    trustScoreData?.calculatedAt || new Date().toISOString()
                  }
                  animated={true}
                  showDetails={true}
                />
              </div>
            )}

            {/* Trust Score Trend */}
            {trendLoading ? (
              <div className="flex justify-center">
                <DashboardCard className="w-full h-64">
                  <Skeleton lines={2} height="h-4" className="w-full" />
                </DashboardCard>
              </div>
            ) : trendError ? (
              <DashboardCard className="text-center">
                <div className="text-red-600 mb-4">
                  ⚠️ Failed to load trend data
                </div>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </DashboardCard>
            ) : (
              <TrustScoreTrend
                data={trendData}
                timeframe="30d"
                showExport={true}
                showZoom={true}
                interactive={true}
                height={400}
              />
            )}

            {/* Sacred Features */}
            {featuresLoading ? (
              <div className="flex justify-center">
                <DashboardCard className="w-full h-64">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton lines={1} height="h-4" className="w-3/4" />
                        <Skeleton lines={2} height="h-3" className="w-full" />
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              </div>
            ) : featuresError ? (
              <DashboardCard className="text-center">
                <div className="text-red-600 mb-4">
                  ⚠️ Failed to load features
                </div>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </DashboardCard>
            ) : (
              <SacredFeatures
                features={features}
                userLevel={creatorData.level}
                interactive={true}
                showProgress={true}
              />
            )}
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <DashboardCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed analytics coming soon...
              </p>
            </DashboardCard>
          </div>
        );
      case "content":
        return (
          <div className="space-y-6">
            <DashboardCard>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Content management tools coming soon...
              </p>
            </DashboardCard>
          </div>
        );
      case "features":
        return (
          <div className="space-y-6">
            <DashboardCard>
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <Badge variant="success" className="text-lg">
                      {creatorData.level.charAt(0).toUpperCase() +
                        creatorData.level.slice(1)}
                    </Badge>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                      {unlockedCount} of {totalCount} features unlocked
                    </span>
                  </div>
                  <Progress
                    value={(unlockedCount / totalCount) * 100}
                    max={100}
                    variant="success"
                    showLabel={true}
                    className="max-w-md mx-auto"
                  />
                </div>
                <SacredFeatures
                  features={features}
                  userLevel={creatorData.level}
                  interactive={true}
                  showProgress={true}
                />
              </div>
            </DashboardCard>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div
        className={clsx(
          "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50",
          "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        )}
      >
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div
          className={clsx(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out",
            "lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Vauntico
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Creator Dashboard
                </p>
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
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 border border-indigo-200 dark:border-indigo-800"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {creatorData.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {creatorData.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {creatorData.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  /* Handle sign out */
                }}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {creatorData.name}! 🎉
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your creator journey is flourishing. Here's your latest
                    overview.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      /* Handle notifications */
                    }}
                    className="relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      /* Handle settings */
                    }}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {trustScoreLoading || trendLoading || featuresLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Loading dashboard data...
                  </p>
                </div>
              </div>
            ) : (
              renderContent()
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreatorDashboard;

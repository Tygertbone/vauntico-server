import { useState, useEffect, useCallback } from "react";

export interface SacredFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "locked" | "coming-soon";
  sacredLevel: "bronze" | "silver" | "gold" | "platinum";
  progress?: number;
  unlockDate?: string;
  category?: string;
  benefits?: string[];
  requirements?: string[];
}

export interface UseFeaturesOptions {
  userId?: string;
  userLevel?: "bronze" | "silver" | "gold" | "platinum";
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseFeaturesReturn {
  features: SacredFeature[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  userLevel: string;
  unlockedCount: number;
  totalCount: number;
}

const mockFeatures: SacredFeature[] = [
  {
    id: "premium-content",
    name: "Premium Content",
    description:
      "Create exclusive content for your most loyal supporters with advanced monetization options.",
    icon: "📝",
    status: "active",
    sacredLevel: "silver",
    progress: 85,
    category: "content",
    benefits: [
      "Higher revenue per supporter",
      "Exclusive content tools",
      "Advanced analytics",
    ],
    requirements: [
      "Silver tier or higher",
      "Complete onboarding",
      "Verify identity",
    ],
  },
  {
    id: "analytics-pro",
    name: "Analytics Pro",
    description:
      "Advanced insights about your audience, engagement patterns, and revenue optimization.",
    icon: "📊",
    status: "active",
    sacredLevel: "silver",
    category: "analytics",
    benefits: [
      "Detailed audience insights",
      "Revenue optimization",
      "Custom reports",
    ],
    requirements: ["Silver tier or higher", "30 days activity"],
  },
  {
    id: "collaboration-hub",
    name: "Collaboration Hub",
    description:
      "Connect with other creators and collaborate on exclusive content projects.",
    icon: "🤝",
    status: "locked",
    sacredLevel: "gold",
    progress: 45,
    category: "community",
    benefits: [
      "Creator network access",
      "Collaborative projects",
      "Revenue sharing",
    ],
    requirements: [
      "Gold tier or higher",
      "Active community presence",
      "Content quality score >80",
    ],
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description:
      "Get AI-powered suggestions for content creation and audience growth.",
    icon: "🤖",
    status: "coming-soon",
    sacredLevel: "platinum",
    category: "ai",
    benefits: [
      "AI content suggestions",
      "Growth recommendations",
      "Automated scheduling",
    ],
    requirements: ["Platinum tier", "Beta program enrollment"],
  },
  {
    id: "merchandise-store",
    name: "Merchandise Store",
    description: "Open your own merchandise store with zero inventory risk.",
    icon: "🛍️",
    status: "locked",
    sacredLevel: "gold",
    progress: 20,
    category: "commerce",
    benefits: [
      "Zero inventory risk",
      "Custom merch designs",
      "Integrated payments",
    ],
    requirements: [
      "Gold tier or higher",
      "Brand verification",
      "Minimum 1000 supporters",
    ],
  },
  {
    id: "priority-support",
    name: "Priority Support",
    description: "Get 24/7 priority support from our creator success team.",
    icon: "⭐",
    status: "active",
    sacredLevel: "silver",
    category: "support",
    benefits: [
      "24/7 support",
      "Dedicated account manager",
      "Priority response",
    ],
    requirements: ["Silver tier or higher"],
  },
  {
    id: "advanced-insights",
    name: "Advanced Insights",
    description:
      "Deep dive into your creator analytics with predictive modeling.",
    icon: "🔍",
    status: "locked",
    sacredLevel: "gold",
    progress: 60,
    category: "analytics",
    benefits: [
      "Predictive analytics",
      "Trend forecasting",
      "Competitive analysis",
    ],
    requirements: [
      "Gold tier or higher",
      "90 days activity",
      "Minimum 5000 subscribers",
    ],
  },
  {
    id: "community-ambassador",
    name: "Community Ambassador",
    description: "Become a recognized leader in the creator community.",
    icon: "👑",
    status: "locked",
    sacredLevel: "platinum",
    category: "recognition",
    benefits: ["Community leadership", "Exclusive events", "Revenue bonuses"],
    requirements: [
      "Platinum tier",
      "Community contribution",
      "Mentorship program",
    ],
  },
];

export const useFeatures = (
  options: UseFeaturesOptions = {}
): UseFeaturesReturn => {
  const {
    userId = "demo-user",
    userLevel = "silver",
    autoRefresh = true,
    refreshInterval = 600000, // 10 minutes
  } = options;

  const [features, setFeatures] = useState<SacredFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // In production, this would be:
      // const response = await fetch(`/api/v1/sacred-features?userId=${userId}`, {
      //   headers: { "X-API-Key": process.env.REACT_APP_API_KEY },
      // });
      // const result = await response.json();

      // Filter and process features based on user level
      const processedFeatures = mockFeatures.map((feature) => {
        const levelHierarchy = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
        const userLevelValue = levelHierarchy[userLevel];
        const featureLevelValue = levelHierarchy[feature.sacredLevel];

        let status: SacredFeature["status"] = feature.status;

        if (
          userLevelValue >= featureLevelValue &&
          feature.status === "locked"
        ) {
          status = "active";
        }

        return { ...feature, status };
      });

      setFeatures(processedFeatures);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch features");
    } finally {
      setLoading(false);
    }
  }, [userId, userLevel]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFeatures();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchFeatures]);

  const unlockedCount = features.filter((f) => f.status === "active").length;
  const totalCount = features.length;

  return {
    features,
    loading,
    error,
    refetch: fetchFeatures,
    lastUpdated,
    userLevel,
    unlockedCount,
    totalCount,
  };
};

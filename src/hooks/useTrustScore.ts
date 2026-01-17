import { useState, useEffect, useCallback } from "react";

export interface TrustScoreData {
  score: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  factors: {
    engagement: number;
    consistency: number;
    quality: number;
    community: number;
  };
  calculatedAt: string;
  expiresAt: string;
  trend: "up" | "down" | "stable";
  change: number;
}

export interface UseTrustScoreOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseTrustScoreReturn {
  data: TrustScoreData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

const mockTrustScore: TrustScoreData = {
  score: 78,
  tier: "silver",
  factors: {
    engagement: 85,
    consistency: 72,
    quality: 88,
    community: 67,
  },
  calculatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  trend: "up",
  change: 5.2,
};

export const useTrustScore = (
  options: UseTrustScoreOptions = {}
): UseTrustScoreReturn => {
  const {
    userId = "demo-user",
    autoRefresh = true,
    refreshInterval = 60000,
  } = options;

  const [data, setData] = useState<TrustScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrustScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, this would be:
      // const response = await fetch(`/api/v1/trust-score?userId=${userId}`, {
      //   headers: { 'X-API-Key': process.env.REACT_APP_API_KEY }
      // });
      // const result = await response.json();

      setData(mockTrustScore);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trust score"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTrustScore();
  }, [fetchTrustScore]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTrustScore();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTrustScore]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrustScore,
    lastUpdated,
  };
};

import { useState, useEffect, useCallback } from "react";

export interface TrendDataPoint {
  date: string;
  score: number;
  benchmark: number;
}

export interface UseTrendOptions {
  userId?: string;
  timeframe?: "7d" | "30d" | "90d" | "1y";
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseTrendReturn {
  data: TrendDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  timeframe: string;
}

const generateMockTrendData = (timeframe: string): TrendDataPoint[] => {
  const now = new Date();
  const dataPoints: TrendDataPoint[] = [];
  let days = 7;

  switch (timeframe) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "1y":
      days = 365;
      break;
  }

  let currentScore = 65;
  let currentBenchmark = 70;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // Simulate realistic trend with some randomness
    const scoreChange = (Math.random() - 0.3) * 3;
    const benchmarkChange = (Math.random() - 0.4) * 2;

    currentScore = Math.max(0, Math.min(100, currentScore + scoreChange));
    currentBenchmark = Math.max(
      0,
      Math.min(100, currentBenchmark + benchmarkChange)
    );

    dataPoints.push({
      date: date.toISOString().split("T")[0],
      score: Math.round(currentScore * 10) / 10,
      benchmark: Math.round(currentBenchmark * 10) / 10,
    });
  }

  return dataPoints;
};

export const useTrend = (options: UseTrendOptions = {}): UseTrendReturn => {
  const {
    userId = "demo-user",
    timeframe = "30d",
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrendData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In production, this would be:
      // const response = await fetch(
      //   `/api/v1/trust-score/${userId}/history?timeframe=${timeframe}`,
      //   {
      //     headers: { "X-API-Key": process.env.REACT_APP_API_KEY },
      //   }
      // );
      // const result = await response.json();
      // setData(result.history);

      const mockData = generateMockTrendData(timeframe);
      setData(mockData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trend data"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, timeframe]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTrendData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTrendData]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrendData,
    lastUpdated,
    timeframe,
  };
};

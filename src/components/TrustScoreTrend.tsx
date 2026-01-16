import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { clsx } from "clsx";

interface TrustScoreTrendProps {
  data: Array<{
    date: string;
    score: number;
    benchmark: number;
  }>;
  timeframe: "7d" | "30d" | "90d";
}

const TrustScoreTrend: React.FC<TrustScoreTrendProps> = ({
  data,
  timeframe,
}) => {
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      default:
        return "Last 30 Days";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getAverageScore = () => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / data.length);
  };

  const getTrendDirection = () => {
    if (data.length < 2) return "neutral";
    const recent = data.slice(-3);
    const earlier = data.slice(0, 3);
    const recentAvg =
      recent.reduce((acc, item) => acc + item.score, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((acc, item) => acc + item.score, 0) / earlier.length;

    if (recentAvg > earlierAvg + 2) return "up";
    if (recentAvg < earlierAvg - 2) return "down";
    return "stable";
  };

  const trendDirection = getTrendDirection();
  const averageScore = getAverageScore();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {formatDate(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Your Score:{" "}
              <span className="font-semibold text-indigo-600">
                {payload[0].value}
              </span>
            </p>
            {payload[0].payload.benchmark && (
              <p className="text-sm text-gray-600">
                Benchmark:{" "}
                <span className="font-semibold text-gray-900">
                  {payload[0].payload.benchmark}
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-lg border border-gray-200 p-6",
        "transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Trust Score Trend
            </h3>
            <p className="text-sm text-gray-500">{getTimeframeLabel()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
          <div
            className={clsx(
              "text-sm font-medium flex items-center gap-1 justify-end",
              trendDirection === "up" && "text-green-600",
              trendDirection === "down" && "text-red-600",
              trendDirection === "stable" && "text-gray-600"
            )}
          >
            {trendDirection === "up" && <TrendingUp className="w-4 h-4" />}
            {trendDirection === "down" && (
              <TrendingUp className="w-4 h-4 rotate-180" />
            )}
            <span>
              {trendDirection === "up" && "Improving"}
              {trendDirection === "down" && "Declining"}
              {trendDirection === "stable" && "Stable"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              className="text-xs text-gray-500"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, className: "fill-indigo-600" }}
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            Daily measurements • Benchmarks updated weekly •
            <span className="font-medium text-gray-900">
              {" "}
              {data.length} data points
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreTrend;

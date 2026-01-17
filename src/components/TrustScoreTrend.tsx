import React, { useState, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Download, ZoomIn, ZoomOut, Calendar } from "lucide-react";
import { DashboardCard, Button } from "./dashboard/UIkit";
import { TrendDataPoint } from "../hooks/useTrend";

interface TrustScoreTrendProps {
  data: TrendDataPoint[];
  timeframe: string;
  className?: string;
  showExport?: boolean;
  showZoom?: boolean;
  interactive?: boolean;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {new Date(label || "").toLocaleDateString()}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Your Score: <strong>{data.score}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Benchmark: <strong>{data.benchmark}</strong>
            </span>
          </div>
          {data.score > data.benchmark && (
            <div className="text-xs text-green-600 font-medium pt-1">
              Above benchmark by {(data.score - data.benchmark).toFixed(1)}{" "}
              points
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const TrustScoreTrend: React.FC<TrustScoreTrendProps> = ({
  data,
  timeframe,
  className,
  showExport = true,
  showZoom = true,
  interactive = true,
  height = 300,
}) => {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    if (data.length < 2) return;

    const currentDomain = zoomDomain || [
      new Date(data[0].date).getTime(),
      new Date(data[data.length - 1].date).getTime(),
    ];
    const range = currentDomain[1] - currentDomain[0];
    const newRange = range * 0.8;
    const center = (currentDomain[0] + currentDomain[1]) / 2;

    setZoomDomain([center - newRange / 2, center + newRange / 2]);
  }, [data, zoomDomain]);

  const handleZoomOut = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const exportData = useCallback(() => {
    const csvContent = [
      ["Date", "Score", "Benchmark"].join(","),
      ...data.map((item) =>
        [
          new Date(item.date).toLocaleDateString(),
          item.score,
          item.benchmark,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trust-score-trend-${timeframe}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, timeframe]);

  const exportImage = useCallback(() => {
    if (!chartRef.current) return;

    // Create canvas from the chart
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // This is a simplified export - in production you'd use html2canvas or similar
    canvas.width = 800;
    canvas.height = 400;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `trust-score-trend-${timeframe}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [timeframe]);

  const getDateDomain = () => {
    if (zoomDomain) {
      return [new Date(zoomDomain[0]), new Date(zoomDomain[1])];
    }
    return [
      new Date(data[0]?.date || new Date()),
      new Date(data[data.length - 1]?.date || new Date()),
    ];
  };

  const filteredData = zoomDomain
    ? data.filter(
        (item) =>
          new Date(item.date).getTime() >= zoomDomain[0] &&
          new Date(item.date).getTime() <= zoomDomain[1]
      )
    : data;

  return (
    <DashboardCard className={className}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Trust Score Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {timeframe} overview
          </p>
        </div>

        {showExport && (
          <div className="flex items-center gap-2">
            {showZoom && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomDomain !== null}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomDomain === null}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              aria-label="Export data as CSV"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div ref={chartRef} className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="benchmarkGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.3}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
              stroke="#6b7280"
              fontSize={12}
            />

            <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              name="Your Score"
            />

            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Benchmark"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zoom Controls */}
      {zoomDomain && (
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            Reset Zoom
          </Button>
        </div>
      )}

      {/* Keyboard Navigation */}
      <div className="sr-only" aria-live="polite">
        Chart showing {filteredData.length} data points.{" "}
        {zoomDomain ? "Zoomed in" : "Showing full range"}. Use zoom controls or
        keyboard shortcuts to navigate.
      </div>
    </DashboardCard>
  );
};

export default TrustScoreTrend;

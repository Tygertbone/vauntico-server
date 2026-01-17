import React from "react";
import { Shield, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import { DashboardCard, Badge, Progress } from "./dashboard/UIkit";

interface TrustScoreCardProps {
  score: number;
  trend: "up" | "down" | "stable";
  change: number;
  lastUpdated: string;
  className?: string;
  showDetails?: boolean;
  animated?: boolean;
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  score,
  trend,
  change,
  lastUpdated,
  className,
  showDetails = true,
  animated = true,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-600 to-green-400";
    if (score >= 75) return "from-blue-600 to-blue-400";
    if (score >= 60) return "from-orange-600 to-orange-400";
    return "from-red-600 to-red-400";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <TrendingUp className="w-5 h-5 text-green-600" aria-hidden="true" />
        );
      case "down":
        return (
          <TrendingDown className="w-5 h-5 text-red-600" aria-hidden="true" />
        );
      default:
        return <Minus className="w-5 h-5 text-gray-600" aria-hidden="true" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);
  const scoreLevel = getScoreLevel(score);
  const trendColor = getTrendColor();

  return (
    <DashboardCard
      className={className}
      variant={animated ? "elevated" : "default"}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trust Score
          </h3>
        </div>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Trend information"
        >
          {getTrendIcon()}
          <span
            className={clsx("text-sm font-medium", trendColor)}
            aria-label={`Trend is ${trend} with ${change}% change`}
          >
            {trend === "up" ? "+" : ""}
            {change}%
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="text-center mb-4">
        <div
          className={clsx(
            "text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
            scoreGradient,
            animated && "transition-all duration-500"
          )}
          role="img"
          aria-label={`Trust score of ${score} out of 100, which is ${scoreLevel}`}
          tabIndex={0}
        >
          {score}
        </div>
        <div
          className="flex items-center justify-center gap-1 mt-2"
          role="img"
          aria-label={`${Math.floor(score / 20)} out of 5 stars`}
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={clsx(
                "w-4 h-4 transition-colors",
                i < Math.floor(score / 20)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 fill-gray-300"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Level Badge */}
      <div className="flex justify-center mb-4">
        <Badge
          variant={score >= 80 ? "success" : score >= 60 ? "warning" : "error"}
          aria-label={`Score level: ${scoreLevel}`}
        >
          {scoreLevel}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress
        value={score}
        max={100}
        variant={score >= 80 ? "success" : score >= 60 ? "warning" : "error"}
        showLabel={false}
        className="mb-4"
        aria-label={`Trust score progress: ${score} out of 100`}
      />

      {/* Additional Details */}
      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>Last updated: {new Date(lastUpdated).toLocaleDateString()}</div>
          <div>
            Score calculated based on engagement, consistency, quality, and
            community factors
          </div>
        </div>
      )}

      {/* Accessibility Info */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Trust score is {score} out of 100, which is considered {scoreLevel}. The
        trend is {trend} with a {change}% change from previous period.
        {Math.floor(score / 20)} out of 5 stars achieved.
      </div>
    </DashboardCard>
  );
};

export default TrustScoreCard;

import React from "react";
import { Shield, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

interface TrustScoreCardProps {
  score: number;
  trend: "up" | "down" | "stable";
  change: number;
  lastUpdated: string;
}

const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  score,
  trend,
  change,
  lastUpdated,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-500 to-green-400";
    if (score >= 75) return "from-blue-500 to-blue-400";
    if (score >= 60) return "from-orange-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  const getProgressBarGradient = (score: number) => {
    if (score >= 90) return "bg-gradient-to-r from-green-500 to-green-400";
    if (score >= 75) return "bg-gradient-to-r from-blue-500 to-blue-400";
    if (score >= 60) return "bg-gradient-to-r from-orange-500 to-orange-400";
    return "bg-gradient-to-r from-red-500 to-red-400";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div
      className={clsx(
        "relative bg-white rounded-3xl shadow-xl border border-white/80 backdrop-blur-lg",
        "transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl",
        "p-6 max-w-sm mx-auto"
      )}
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-900">Trust Score</h3>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={clsx("text-sm font-medium", getChangeColor())}>
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
            getScoreGradient(score)
          )}
        >
          {score}
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={clsx(
                "w-4 h-4",
                i < Math.floor(score / 20)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 fill-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500 ease-out",
              getProgressBarGradient(score)
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default TrustScoreCard;

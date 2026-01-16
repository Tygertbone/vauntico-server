import React from "react";
import {
  Sparkles,
  Shield,
  Heart,
  Zap,
  Crown,
  Lock,
  Eye,
  Star,
} from "lucide-react";
import { clsx } from "clsx";

interface SacredFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "locked" | "coming-soon";
  progress?: number;
  sacredLevel: "bronze" | "silver" | "gold" | "platinum";
}

interface SacredFeaturesProps {
  features: SacredFeature[];
  userLevel: "bronze" | "silver" | "gold" | "platinum";
}

const SacredFeatures: React.FC<SacredFeaturesProps> = ({
  features,
  userLevel,
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "bronze":
        return "from-amber-600 to-amber-500";
      case "silver":
        return "from-gray-500 to-gray-400";
      case "gold":
        return "from-yellow-500 to-yellow-400";
      case "platinum":
        return "from-purple-600 to-purple-500";
      default:
        return "from-gray-500 to-gray-400";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case "bronze":
        return "bg-amber-50";
      case "silver":
        return "bg-gray-50";
      case "gold":
        return "bg-yellow-50";
      case "platinum":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case "bronze":
        return "border-amber-200";
      case "silver":
        return "border-gray-200";
      case "gold":
        return "border-yellow-200";
      case "platinum":
        return "border-purple-200";
      default:
        return "border-gray-200";
    }
  };

  const getStatusOverlay = (status: string) => {
    switch (status) {
      case "active":
        return null;
      case "locked":
        return (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white/80" />
          </div>
        );
      case "coming-soon":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white/90 font-medium text-sm">Coming Soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <Eye className="w-3 h-3" />
            Active
          </span>
        );
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            <Sparkles className="w-3 h-3" />
            Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <Crown
            className={clsx(
              "w-8 h-8",
              `text-${getLevelColor(userLevel).split(" ")[0]}`
            )}
          />
          <h2
            className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${getLevelColor(userLevel).replace("from-", "#").replace(" to-", ", #")})`,
            }}
          >
            Sacred Features
          </h2>
        </div>
        <div
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            getLevelBg(userLevel),
            getLevelBorder(userLevel),
            "border"
          )}
        >
          <Star className="w-4 h-4" />
          <span className="capitalize">{userLevel} Level</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={clsx(
              "relative bg-white rounded-2xl shadow-lg border p-6",
              "transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
              getLevelBorder(feature.sacredLevel),
              "border-2"
            )}
          >
            {/* Status Overlay */}
            {getStatusOverlay(feature.status)}

            {/* Content */}
            <div className="relative z-10">
              {/* Icon and Name */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={clsx(
                    "p-2 rounded-lg",
                    getLevelBg(feature.sacredLevel)
                  )}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {feature.name}
                  </h3>
                  {getStatusBadge(feature.status)}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Progress Bar (if applicable) */}
              {feature.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{feature.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-500",
                        `bg-gradient-to-r ${getLevelColor(feature.sacredLevel)}`
                      )}
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sacred Level Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield
                    className={clsx(
                      "w-4 h-4",
                      `text-${getLevelColor(feature.sacredLevel).split(" ")[0]}`
                    )}
                  />
                  <span
                    className={clsx(
                      "text-xs font-medium capitalize",
                      `text-${getLevelColor(feature.sacredLevel).split(" ")[0]}`
                    )}
                  >
                    {feature.sacredLevel}
                  </span>
                </div>
                {feature.status === "active" && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">Enabled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
          <Heart className="w-4 h-4 text-indigo-600" />
          <p className="text-sm text-indigo-700 font-medium">
            Unlock more features as you build trust and level up
          </p>
        </div>
      </div>
    </div>
  );
};

export default SacredFeatures;

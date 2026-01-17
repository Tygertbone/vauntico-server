import React, { useState } from "react";
import { Lock, Check, Clock, Star, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { DashboardCard, Badge, Button, Progress } from "./dashboard/UIkit";
import { SacredFeature } from "../hooks/useFeatures";

interface SacredFeaturesProps {
  features: SacredFeature[];
  userLevel: "bronze" | "silver" | "gold" | "platinum";
  className?: string;
  interactive?: boolean;
  showProgress?: boolean;
}

const SacredFeatures: React.FC<SacredFeaturesProps> = ({
  features,
  userLevel,
  className,
  interactive = true,
  showProgress = true,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const getStatusIcon = (status: SacredFeature["status"]) => {
    switch (status) {
      case "active":
        return <Check className="w-5 h-5 text-green-600" aria-hidden="true" />;
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />;
      case "coming-soon":
        return <Clock className="w-5 h-5 text-yellow-500" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SacredFeature["status"]) => {
    switch (status) {
      case "active":
        return { variant: "success" as const, text: "Active" };
      case "locked":
        return { variant: "default" as const, text: "Locked" };
      case "coming-soon":
        return { variant: "warning" as const, text: "Coming Soon" };
      default:
        return { variant: "default" as const, text: "Unknown" };
    }
  };

  const getLevelColor = (level: SacredFeature["sacredLevel"]) => {
    const levels = {
      bronze: "text-amber-600 border-amber-200",
      silver: "text-blue-600 border-blue-200",
      gold: "text-yellow-600 border-yellow-200",
      platinum: "text-purple-600 border-purple-200",
    };
    return levels[level] || levels.bronze;
  };

  const canAccessFeature = (feature: SacredFeature) => {
    const levelHierarchy = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    const userLevelValue = levelHierarchy[userLevel];
    const featureLevelValue = levelHierarchy[feature.sacredLevel];
    return userLevelValue >= featureLevelValue && feature.status === "active";
  };

  const filteredFeatures = features.filter(
    (feature) => feature.sacredLevel === "bronze" || canAccessFeature(feature)
  );

  const handleFeatureClick = (featureId: string) => {
    if (!interactive) return;

    const feature = features.find((f) => f.id === featureId);
    if (!feature || !canAccessFeature(feature)) return;

    setSelectedFeature(featureId === selectedFeature ? null : featureId);
  };

  return (
    <DashboardCard className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Sacred Features
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unlock powerful creator tools as you level up
          </p>
        </div>

        <Badge variant="info" className="text-xs">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
        </Badge>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feature) => {
          const isAccessible = canAccessFeature(feature);
          const statusBadge = getStatusBadge(feature.status);
          const levelColor = getLevelColor(feature.sacredLevel);

          return (
            <div
              key={feature.id}
              className={clsx(
                "relative border rounded-lg p-4 transition-all duration-200",
                isAccessible
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-75"
              )}
              onClick={() => handleFeatureClick(feature.id)}
              role="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={`${feature.name} - ${statusBadge.text.toLowerCase()}`}
              aria-describedby={`feature-${feature.id}-details`}
            >
              {/* Feature Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl" aria-hidden="true">
                    {typeof feature.icon === "string" ? (
                      <span className="text-2xl">{feature.icon}</span>
                    ) : (
                      feature.icon
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {feature.name}
                    </h4>
                    <Badge
                      variant={statusBadge.variant}
                      className="mt-1 text-xs"
                    >
                      {statusBadge.text}
                    </Badge>
                  </div>
                </div>

                <div
                  className={clsx(
                    "px-2 py-1 rounded text-xs font-medium",
                    levelColor
                  )}
                >
                  {feature.sacredLevel.charAt(0).toUpperCase() +
                    feature.sacredLevel.slice(1)}
                </div>
              </div>

              {/* Feature Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {feature.description}
              </p>

              {/* Progress Bar */}
              {showProgress && feature.progress && (
                <div className="mb-3">
                  <Progress
                    value={feature.progress}
                    max={100}
                    variant="default"
                    showLabel={true}
                    size="sm"
                    aria-label={`Progress: ${feature.progress}%`}
                  />
                </div>
              )}

              {/* Requirements */}
              {feature.requirements && feature.requirements.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Requirements:
                  </h5>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    {feature.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <Check
                          className="w-3 h-3 text-green-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {feature.benefits && feature.benefits.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Benefits:
                  </h5>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <Star
                          className="w-3 h-3 text-yellow-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Call to Action */}
              {interactive && (
                <Button
                  variant={isAccessible ? "primary" : "outline"}
                  size="sm"
                  className="w-full"
                  disabled={!isAccessible}
                  aria-label={
                    isAccessible
                      ? `Use ${feature.name}`
                      : `${feature.name} is locked - requires ${feature.sacredLevel} level`
                  }
                >
                  {isAccessible ? (
                    <>
                      Use Feature
                      <ArrowRight className="w-3 h-3 ml-2" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-2" aria-hidden="true" />
                      Requires {feature.sacredLevel}
                    </>
                  )}
                </Button>
              )}

              {/* Expandable Details */}
              {selectedFeature === feature.id && (
                <div
                  id={`feature-${feature.id}-details`}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-2">
                    {feature.unlockDate && (
                      <div className="text-sm">
                        <strong>Available since:</strong>{" "}
                        {new Date(feature.unlockDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-sm">
                      <strong>Category:</strong> {feature.category || "General"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Count Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            {filteredFeatures.filter((f) => f.status === "active").length} of{" "}
            {filteredFeatures.length} features unlocked
          </span>
          <Badge variant="info" className="text-xs">
            {Math.round(
              (filteredFeatures.filter((f) => f.status === "active").length /
                filteredFeatures.length) *
                100
            )}
            %
          </Badge>
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        You have unlocked{" "}
        {filteredFeatures.filter((f) => f.status === "active").length} out of{" "}
        {filteredFeatures.length} sacred features. Current level: {userLevel}.
        Navigate through features using arrow keys or screen reader.
      </div>
    </DashboardCard>
  );
};

export default SacredFeatures;

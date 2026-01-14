import React, { useState, useEffect } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface PeaceModeProps {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

const PeaceMode: React.FC<PeaceModeProps> = ({
  isActive,
  onToggle,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("peace-mode");
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    } else {
      document.body.classList.remove("peace-mode");
    }
  }, [isActive]);

  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive
          ? "bg-green-100 text-green-700 border-green-300"
          : "bg-gray-100 text-gray-700 border-gray-300"
      } border ${className}`}
      title={isActive ? "Disable Peace Mode" : "Enable Peace Mode"}
    >
      {isAnimating ? (
        <div className="flex items-center space-x-1">
          <Pause className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium">Activating...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          {isActive ? (
            <>
              <VolumeX className="w-5 h-5" />
              <span className="text-sm font-medium">Peace Mode</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span className="text-sm font-medium">Normal Mode</span>
            </>
          )}
        </div>
      )}
    </button>
  );
};

export default PeaceMode;

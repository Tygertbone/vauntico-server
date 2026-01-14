import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Infinity,
  Eye,
  Crown,
  Gem,
} from "lucide-react";

const RitualCTA = ({ onAction, variant = "primary" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const sacredActions = {
    primary: {
      text: "Begin Your Legacy",
      subtext: "Join the sacred circle of creators",
      icon: Crown,
      gradient: "from-purple-600 via-pink-600 to-orange-600",
      hoverGradient: "from-purple-700 via-pink-700 to-orange-700",
      glowColor: "purple",
    },
    secondary: {
      text: "Explore the Vault",
      subtext: "Discover sacred creator tools",
      icon: Gem,
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      hoverGradient: "from-blue-700 via-indigo-700 to-purple-700",
      glowColor: "blue",
    },
    community: {
      text: "Join the Circle",
      subtext: "Connect with fellow creators",
      icon: Heart,
      gradient: "from-pink-600 via-red-600 to-orange-600",
      hoverGradient: "from-pink-700 via-red-700 to-orange-700",
      glowColor: "pink",
    },
    wisdom: {
      text: "Receive Wisdom",
      subtext: "Learn sacred creator practices",
      icon: Eye,
      gradient: "from-yellow-600 via-orange-600 to-red-600",
      hoverGradient: "from-yellow-700 via-orange-700 to-red-700",
      glowColor: "yellow",
    },
  };

  const currentAction = sacredActions[variant] || sacredActions.primary;
  const Icon = currentAction.icon;

  const ubuntuPhrases = [
    "I am because we are",
    "Together we create abundance",
    "My success lifts others",
    "Community is my foundation",
    "We rise by lifting others",
  ];

  const [ubuntuPhrase] = useState(
    ubuntuPhrases[Math.floor(Math.random() * ubuntuPhrases.length)],
  );

  const handleClick = () => {
    // Create ripple effect
    const button = document.getElementById("ritual-cta-button");
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 200);
    }

    if (onAction) {
      onAction(variant);
    }
  };

  return (
    <div className="relative group">
      {/* Sacred Glow Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentAction.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-500`}
      ></div>

      {/* Floating Sacred Symbols */}
      <div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 animate-bounce">
        ✨
      </div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 animate-bounce delay-100">
        💫
      </div>

      <button
        id="ritual-cta-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-full px-8 py-4 rounded-2xl font-bold text-white text-lg
          bg-gradient-to-r ${currentAction.gradient}
          hover:bg-gradient-to-r ${currentAction.hoverGradient}
          transition-all duration-300 transform hover:scale-[1.02]
          flex items-center justify-center space-x-3
          shadow-lg hover:shadow-2xl
          border border-white/20 hover:border-white/40
          overflow-hidden
        `}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>

        {/* Icon Container */}
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${isHovered ? "rotate-12" : ""}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-left">
          <div className="font-bold text-lg">{currentAction.text}</div>
          {isHovered && (
            <div className="text-sm opacity-90 animate-fade-in">
              {currentAction.subtext}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight
          className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
        />
      </button>

      {/* Ubuntu Wisdom Footer */}
      <div className="mt-3 text-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-sm text-gray-400 italic flex items-center justify-center space-x-2">
          <Heart className="w-3 h-3 text-pink-400" />
          <span>{ubuntuPhrase}</span>
          <Infinity className="w-3 h-3 text-purple-400" />
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
};

export default RitualCTA;

// Sacred CTA Collection Component
export const RitualCTACollection = ({ onAction }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <RitualCTA variant="primary" onAction={onAction} />
        <RitualCTA variant="secondary" onAction={onAction} />
      </div>
      <div className="space-y-4">
        <RitualCTA variant="community" onAction={onAction} />
        <RitualCTA variant="wisdom" onAction={onAction} />
      </div>

      {/* Centered Unity Symbol */}
      <div className="md:col-span-2 flex justify-center mt-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-yellow-400/30 flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full border border-purple-400/20 animate-spin-slow"></div>
        </div>
      </div>
    </div>
  );
};

// Individual Sacred Actions
export const BeginLegacyCTA = ({ onAction }) => (
  <RitualCTA variant="primary" onAction={onAction} />
);

export const ExploreVaultCTA = ({ onAction }) => (
  <RitualCTA variant="secondary" onAction={onAction} />
);

export const JoinCircleCTA = ({ onAction }) => (
  <RitualCTA variant="community" onAction={onAction} />
);

export const ReceiveWisdomCTA = ({ onAction }) => (
  <RitualCTA variant="wisdom" onAction={onAction} />
);

<style jsx>{`
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`}</style>;

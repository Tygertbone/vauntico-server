import React, { useState, useRef, useEffect } from "react";
import {
  Code,
  Zap,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";
import { CustomIcons } from "./CustomIcons";
import { useHapticHover } from "../hooks/useHapticFeedback";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  trustBoost?: number;
  isComingSoon?: boolean;
}

const features: FeatureCard[] = [
  {
    id: "trust-scoring",
    title: "AI Trust Scoring",
    description: "Advanced algorithmic credibility assessment",
    icon: <CustomIcons.TrustFlow className="w-8 h-8" />,
    gradient: "from-purple-600 to-pink-600",
    features: [
      "Real-time reputation analysis",
      "ML-powered threat detection",
      "Social proof verification",
      "Trust trend predictions",
    ],
    trustBoost: 25,
  },
  {
    id: "workshops",
    title: "Sacred Workshops",
    description: "Interactive creator education platforms",
    icon: <CustomIcons.SacredGeometry className="w-8 h-8" />,
    gradient: "from-blue-600 to-cyan-600",
    features: [
      "Live streaming capabilities",
      "Interactive whiteboard",
      "Recording & archiving",
      "Participant analytics",
    ],
    trustBoost: 15,
  },
  {
    id: "content-vaults",
    title: "Lore Vaults",
    description: "Immutable content storage",
    icon: <CustomIcons.LegacyTree className="w-8 h-8" />,
    gradient: "from-green-600 to-emerald-600",
    features: [
      "Blockchain verification",
      "NFT integration",
      "Content monetization",
      "Version control history",
    ],
    trustBoost: 20,
  },
  {
    id: "community",
    title: "Ubuntu Circle",
    description: "Collective abundance network",
    icon: <CustomIcons.Ubuntu className="w-8 h-8" />,
    gradient: "from-orange-600 to-red-600",
    features: [
      "Community trust scoring",
      "Collaborative rituals",
      "Shared resource pools",
      "Ubuntu governance",
    ],
    trustBoost: 30,
  },
  {
    id: "analytics",
    title: "Abundance Analytics",
    description: "Advanced performance metrics",
    icon: <TrendingUp className="w-8 h-8" />,
    gradient: "from-indigo-600 to-purple-600",
    features: [
      "Real-time revenue tracking",
      "LTV predictions",
      "Engagement analytics",
      "ROI calculations",
    ],
    trustBoost: 10,
  },
  {
    id: "security",
    title: "Quantum Security",
    description: "Advanced protection systems",
    icon: <Shield className="w-8 h-8" />,
    gradient: "from-gray-600 to-slate-600",
    features: [
      "End-to-end encryption",
      "Biometric authentication",
      "Quantum key management",
      "Zero-knowledge architecture",
    ],
    trustBoost: 35,
  },
];

export default function BentoGrid() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { handleHover } = useHapticHover();

  const handleCardHover = (cardId: string) => {
    setHoveredCard(cardId);
    handleHover();
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Sacred Features
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Premium tools and services designed to amplify your creative impact
            and build lasting legacy
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 transition-all duration-300 hover:scale-105 ${
                hoveredCard === feature.id ? "ring-2 ring-purple-400/50" : ""
              }`}
              onMouseEnter={() => handleCardHover(feature.id)}
              onMouseLeave={handleCardLeave}
            >
              {/* Glassmorphism Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-3xl`}
              />

              {/* Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0" />
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white">
                      {feature.icon}
                    </div>
                  </div>
                </div>

                {/* Title & Trust Boost */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  {feature.trustBoost && (
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full px-3 py-1">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">
                        +{feature.trustBoost} Trust Score
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-3">
                      <div className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    feature.isComingSoon
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105"
                  }`}
                  disabled={feature.isComingSoon}
                >
                  {feature.isComingSoon ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Coming Soon</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>
                        {feature.id === "trust-scoring"
                          ? "Calculate Score"
                          : feature.id === "workshops"
                            ? "Host Workshop"
                            : feature.id === "content-vaults"
                              ? "Create Vault"
                              : feature.id === "community"
                                ? "Join Circle"
                                : feature.id === "analytics"
                                  ? "View Analytics"
                                  : "Explore Security"}
                      </span>
                      <Zap className="w-5 h-5" />
                    </div>
                  )}
                </button>
              </div>

              {/* Hover Glow Effect */}
              {hoveredCard === feature.id && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-600 to-transparent opacity-20 rounded-3xl" />
              )}
            </div>
          ))}
        </div>

        {/* Ubuntu Philosophy Integration */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <CustomIcons.Ubuntu className="w-10 h-10 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">
                Ubuntu Philosophy
              </h3>
              <Heart className="w-8 h-8 text-pink-400" />
              <CustomIcons.Ubuntu className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              "I am because we are. Each feature in this grid represents our
              collective commitment to elevating every creator's potential
              through sacred technology and community support."
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <Users className="w-6 h-6 text-blue-400" />
              <Star className="w-6 h-6 text-yellow-400" />
              <Globe className="w-6 h-6 text-green-400" />
              <Code className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl animate-bounce" />
      </div>
    </section>
  );
}

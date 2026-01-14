import React, { useState } from "react";
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  Heart,
  Infinity,
  Star,
  Gem,
} from "lucide-react";
import { CustomIcons } from "./CustomIcons";
import { useHapticHover } from "../hooks/useHapticFeedback";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  trustBonus?: number;
  nftIncluded?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "basic",
    name: "Creator Initiate",
    price: 0,
    originalPrice: 29,
    features: [
      "Trust Score Calculator",
      "Basic Lore Vault Access",
      "Community Forum Access",
      "Monthly Sacred Rituals",
      "Email Support",
    ],
    trustBonus: 0,
    nftIncluded: false,
  },
  {
    id: "pro",
    name: "Creator Pro",
    price: 29,
    originalPrice: 79,
    features: [
      "Everything in Basic, plus:",
      "AI-Generated Mantras",
      "Advanced Trust Analytics",
      "Premium Lore Templates",
      "Workshop Integration Tools",
      "Priority Support",
      "Custom Branding Kit",
    ],
    popular: true,
    trustBonus: 15,
    nftIncluded: true,
  },
  {
    id: "enterprise",
    name: "Creator Enterprise",
    price: 999,
    originalPrice: 299,
    features: [
      "Everything in Pro, plus:",
      "White-Glove Service Guarantee",
      "Blockchain Verification Badge",
      "API Access & Webhooks",
      "Dedicated Account Manager",
      "Custom Sacred Geometry Branding",
      "SLA - 99.9% Uptime",
      "Unlimited Lore Storage",
      "Global CDN Distribution",
      "Advanced AI Ritual Generator",
    ],
    highlighted: true,
    trustBonus: 50,
    nftIncluded: true,
  },
];

export default function SacredPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [selectedTier, setSelectedTier] = useState<string>("pro");
  const { handleHover } = useHapticHover();

  const formatPrice = (price: number, cycle: "monthly" | "annual") => {
    if (cycle === "annual") {
      return `$${(price * 12 * 0.8).toFixed(0)}/year`;
    }
    return `$${price}/month`;
  };

  const calculateSavings = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleBillingToggle = (cycle: "monthly" | "annual") => {
    setBillingCycle(cycle);
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Sacred Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-pink-900/5 to-blue-900/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <CustomIcons.Lotus className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block text-white mb-2">Sacred Investment</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                in Your Legacy
              </span>
            </h1>
            <CustomIcons.HeartVine className="w-12 h-12 text-pink-400" />
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose your path to abundance with pricing that scales with your
            spiritual growth
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-1 inline-flex">
            <button
              onClick={() => handleBillingToggle("monthly")}
              onMouseEnter={() => handleHover()}
              className={`px-6 py-3 rounded-l-xl font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingToggle("annual")}
              onMouseEnter={() => handleHover()}
              className={`px-6 py-3 rounded-r-xl font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Annual <span className="text-yellow-400 text-sm">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`relative bg-white/5 backdrop-blur-xl rounded-3xl border-2 p-8 transition-all hover:scale-105 hover:border-purple-400/30 ${
                selectedTier === tier.id ? "ring-2 ring-purple-400" : ""
              }`}
              onClick={() => handleTierSelect(tier.id)}
              onMouseEnter={() => handleHover()}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              {/* Enterprise Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ENTERPRISE
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  {tier.id === "enterprise" && (
                    <Crown className="w-8 h-8 text-yellow-400" />
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  {tier.nftIncluded && (
                    <div className="flex items-center space-x-2">
                      <Gem className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 text-sm">
                        NFT Included
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold text-white mb-4">
                  {formatPrice(tier.price, billingCycle)}
                  {tier.originalPrice && (
                    <span className="block text-lg text-gray-400 line-through">
                      ${formatPrice(tier.originalPrice, billingCycle)}
                    </span>
                  )}
                </div>

                {/* Trust Bonus */}
                {tier.trustBonus && tier.trustBonus > 0 && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Star className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        +{tier.trustBonus} Trust Score Bonus
                      </span>
                    </div>
                  </div>
                )}

                {/* Savings */}
                {tier.originalPrice && (
                  <div className="text-center">
                    <span className="text-green-400 font-semibold">
                      Save {calculateSavings(tier.originalPrice, tier.price)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleTierSelect(tier.id)}
                onMouseEnter={() => handleHover()}
                className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    : tier.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                }`}
              >
                {tier.id === "basic"
                  ? "Start Free Journey"
                  : tier.id === "pro"
                    ? "Unlock Pro Features"
                    : "Transform Enterprise"}
              </button>
            </div>
          ))}
        </div>

        {/* Ubuntu Philosophy Integration */}
        <div className="mt-16 p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl border border-purple-400/20">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CustomIcons.Ubuntu className="w-8 h-8 text-purple-400" />
              <Infinity className="w-6 h-6 text-pink-400" />
              <Heart className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Sacred Investment Philosophy
            </h3>
            <p className="text-gray-300 italic text-lg leading-relaxed">
              "Your investment in self creates ripples of abundance that uplift
              the entire community. When one creator rises, we all rise
              together."
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 font-semibold">
                  Sacred Geometry NFTs
                </p>
                <p className="text-gray-300 text-sm">
                  Mint unique sacred geometries as proof of your journey
                </p>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-400 font-semibold">
                  Blockchain Verification
                </p>
                <p className="text-gray-300 text-sm">
                  Immutable trust scores on the blockchain
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Score Integration */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3">
            <CustomIcons.TrustFlow className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold">
              Higher Tiers Include Trust Score Bonuses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { TreePine, Heart, Sparkles, Users, ArrowRight } from "lucide-react";

const SacredFeaturesShowcase = () => {
  const features = [
    {
      id: "legacy-tree",
      name: "Legacy Tree",
      description:
        "Build your creator legacy with AI-powered lineage tracking and historical credibility mapping.",
      icon: TreePine,
      status: "Beta",
      color: "from-green-400 to-emerald-600",
      link: "/legacy-tree",
    },
    {
      id: "love-loops",
      name: "Love Loops",
      description:
        "Create meaningful engagement cycles that strengthen creator-audience relationships and community bonds.",
      icon: Heart,
      status: "Beta",
      color: "from-pink-400 to-rose-600",
      link: "/love-loops",
    },
    {
      id: "lore-generator",
      name: "Lore Generator",
      description:
        "Transform your trust data into compelling narratives that showcase your creator journey and achievements.",
      icon: Sparkles,
      status: "Beta",
      color: "from-purple-400 to-indigo-600",
      link: "/lore-vault",
    },
    {
      id: "ubuntu-echo",
      name: "Ubuntu Echo",
      description:
        "Amplify your community impact through collective resonance and shared creator wisdom.",
      icon: Users,
      status: "Beta",
      color: "from-blue-400 to-cyan-600",
      link: "/ubuntu-echo",
    },
  ];

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Sacred{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Technology Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with Ubuntu philosophy. We live by what we give.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Beta Badge */}
              <div className="absolute -top-4 -right-4 z-10">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                  {feature.status}
                </span>
              </div>

              {/* Feature Icon */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
              </div>

              {/* Feature Content */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Link */}
                <a
                  href={feature.link}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 group-hover:translate-x-1"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-2" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Ubuntu Philosophy Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 px-8 py-4 bg-purple-50 rounded-2xl border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
              <Users className="w-6 h-6 text-purple-600" />
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                Ubuntu Philosophy
              </h3>
              <p className="text-purple-700 font-medium">
                "I am because we are"
              </p>
              <p className="text-purple-600 text-sm mt-2">
                We believe that creator success is collective. When one creator
                rises, we all rise together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SacredFeaturesShowcase;

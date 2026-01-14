import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  Heart,
  Coins,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

interface Branch {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: Branch[];
  action?: string;
  reward?: string;
  color: string;
}

interface LegacyTreeProps {
  onBranchSelect?: (branch: Branch) => void;
  className?: string;
}

const LegacyTree: React.FC<LegacyTreeProps> = ({
  onBranchSelect,
  className = "",
}) => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [animatingBranch, setAnimatingBranch] = useState<string | null>(null);

  const treeData: Branch = {
    id: "root",
    title: "Your Sacred Journey",
    description: "Choose your path to abundance and legacy",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-purple-500 to-gold-500",
    children: [
      {
        id: "monetize",
        title: "Monetize Workshops",
        description: "Transform wisdom into wealth through sacred commerce",
        icon: <Coins className="w-5 h-5" />,
        color: "from-gold-500 to-yellow-600",
        children: [
          {
            id: "premium-content",
            title: "Premium Content Creation",
            description: "Craft high-value sacred offerings",
            icon: <Heart className="w-4 h-4" />,
            color: "from-pink-500 to-rose-600",
            reward: "+15% Trust Score",
            action: "Create Premium Workshop",
          },
          {
            id: "community-pricing",
            title: "Community-Based Pricing",
            description: "Ubuntu-inspired flexible pricing tiers",
            icon: <Users className="w-4 h-4" />,
            color: "from-blue-500 to-indigo-600",
            reward: "+20% Community Growth",
            action: "Set Ubuntu Pricing",
          },
        ],
      },
      {
        id: "community",
        title: "Build Community",
        description: "Gather your tribe through shared purpose",
        icon: <Users className="w-5 h-5" />,
        color: "from-blue-500 to-purple-600",
        children: [
          {
            id: "sacred-circles",
            title: "Sacred Circles",
            description: "Host transformative group rituals",
            icon: <Heart className="w-4 h-4" />,
            color: "from-rose-500 to-pink-600",
            reward: "+25% Engagement",
            action: "Start Sacred Circle",
          },
          {
            id: "mentorship",
            title: "Mentorship Programs",
            description: "Guide others on their spiritual journey",
            icon: <Sparkles className="w-4 h-4" />,
            color: "from-purple-500 to-indigo-600",
            reward: "+30% Impact Score",
            action: "Become Mentor",
          },
        ],
      },
      {
        id: "innovation",
        title: "Innovation & Tech",
        description: "Blend ancient wisdom with modern technology",
        icon: <Zap className="w-5 h-5" />,
        color: "from-cyan-500 to-blue-600",
        children: [
          {
            id: "ai-rituals",
            title: "AI-Powered Rituals",
            description: "Personalized sacred experiences",
            icon: <Sparkles className="w-4 h-4" />,
            color: "from-purple-500 to-cyan-600",
            reward: "+40% Innovation Score",
            action: "Create AI Ritual",
          },
          {
            id: "blockchain-legacy",
            title: "Blockchain Legacy",
            description: "Immortalize your wisdom on-chain",
            icon: <Coins className="w-4 h-4" />,
            color: "from-yellow-500 to-gold-600",
            reward: "NFT Certificate",
            action: "Mint Legacy NFT",
          },
        ],
      },
    ],
  };

  const handleBranchClick = (branch: Branch, path: string[]) => {
    setAnimatingBranch(branch.id);
    setTimeout(() => setAnimatingBranch(null), 500);

    if (branch.children && branch.children.length > 0) {
      setSelectedPath([...path, branch.id]);
      setCurrentBranch(branch);
    } else {
      // Final branch selected - execute action
      if (onBranchSelect) {
        onBranchSelect(branch);
      }
    }
  };

  const navigateBack = () => {
    if (selectedPath.length > 0) {
      const newPath = selectedPath.slice(0, -1);
      setSelectedPath(newPath);

      // Find the parent branch
      let current = treeData;
      for (const id of newPath) {
        current = current.children?.find((b) => b.id === id) || current;
      }
      setCurrentBranch(current);
    }
  };

  const getCurrentBranches = (): Branch[] => {
    if (currentBranch && currentBranch.children) {
      return currentBranch.children;
    }
    return treeData.children || [];
  };

  const Breadcrumb = () => (
    <div className="flex items-center space-x-2 mb-6 text-sm">
      <button
        onClick={() => {
          setSelectedPath([]);
          setCurrentBranch(null);
        }}
        className="text-purple-600 hover:text-purple-800 transition-colors"
      >
        Journey Start
      </button>
      {selectedPath.map((id, index) => {
        const branch =
          index === 0
            ? treeData.children?.find((b) => b.id === id)
            : currentBranch?.children?.find((b) => b.id === id);

        return (
          <React.Fragment key={id}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => {
                setSelectedPath(selectedPath.slice(0, index + 1));
                setCurrentBranch(branch || null);
              }}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              {branch?.title}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-gold-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Legacy Tree
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Choose your sacred path to infinite abundance
        </motion.p>
      </div>

      <Breadcrumb />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {getCurrentBranches().map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: animatingBranch === branch.id ? 1.05 : 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div
                onClick={() => handleBranchClick(branch, selectedPath)}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl ${animatingBranch === branch.id ? "ring-4 ring-purple-400 ring-opacity-50" : ""}`}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                  borderColor:
                    animatingBranch === branch.id ? "#9333ea" : "transparent",
                }}
              >
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${branch.color} opacity-10`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${branch.color} text-white`}
                    >
                      {branch.icon}
                    </div>
                    {branch.reward && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {branch.reward}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {branch.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {branch.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {branch.children
                        ? `${branch.children.length} paths`
                        : "Final destination"}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>

                  {branch.action && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-gold-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-gold-700 transition-colors">
                        {branch.action}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {selectedPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <button
            onClick={navigateBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to Previous Path</span>
          </button>
        </motion.div>
      )}

      {/* Ubuntu Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500 italic">
          "I am because we are. Your legacy lifts the collective."
        </p>
      </motion.div>
    </div>
  );
};

export default LegacyTree;

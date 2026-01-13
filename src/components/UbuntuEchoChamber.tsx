import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Users,
  Sparkles,
  Send,
  Zap,
  Share2,
  Volume2,
} from "lucide-react";
import { useHapticFeedback } from "../hooks/useHapticFeedback";

interface Echo {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  likes: number;
  isUbuntu: boolean;
  sentiment: "positive" | "neutral" | "ceremonial";
}

interface AbundanceMeter {
  collective: number;
  individual: number;
  ripple: number;
}

interface UbuntuEchoChamberProps {
  className?: string;
}

const UbuntuEchoChamber: React.FC<UbuntuEchoChamberProps> = ({
  className = "",
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [echoes, setEchoes] = useState<Echo[]>([
    {
      id: "1",
      author: "Ubuntu Guide",
      message:
        "Together we rise, individually we flourish. The collective abundance grows with each shared wisdom.",
      timestamp: new Date(Date.now() - 3600000),
      likes: 42,
      isUbuntu: true,
      sentiment: "ceremonial",
    },
    {
      id: "2",
      author: "Sacred Creator",
      message:
        "My trust score increased by 15% after implementing the sanctification rituals. Pure magic!",
      timestamp: new Date(Date.now() - 7200000),
      likes: 28,
      isUbuntu: false,
      sentiment: "positive",
    },
    {
      id: "3",
      author: "Community Guardian",
      message:
        "Ubuntu blessing activated: May your code be secure and your heart be open.",
      timestamp: new Date(Date.now() - 10800000),
      likes: 36,
      isUbuntu: true,
      sentiment: "ceremonial",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [abundanceMeter, setAbundanceMeter] = useState<AbundanceMeter>({
    collective: 75,
    individual: 60,
    ripple: 85,
  });
  const [ripples, setRipples] = useState<number[]>([]);

  const ceremonialResponses = [
    "Ubuntu blessing activated: May your abundance overflow into the collective.",
    "Sacred ritual completed: Your energy joins the eternal flow.",
    "Collective wisdom received: We are stronger together.",
    "Ancestral approval: Your path is blessed with prosperity.",
    "Community resonance: Your vibration lifts all who surround you.",
  ];

  const ubuntuPhrases = [
    "I am because we are",
    "Together we flourish",
    "Unity in diversity",
    "Collective abundance",
    "Shared prosperity",
    "Community first",
  ];

  const generateEcho = useCallback(() => {
    const isUbuntu = Math.random() > 0.5;
    const response = isUbuntu
      ? ceremonialResponses[
          Math.floor(Math.random() * ceremonialResponses.length)
        ]
      : `The ${ubuntuPhrases[Math.floor(Math.random() * ubuntuPhrases.length)]} principle guides us forward.`;

    const newEcho: Echo = {
      id: Date.now().toString(),
      author: isUbuntu ? "Ubuntu Spirit" : "Community Member",
      message: response,
      timestamp: new Date(),
      likes: Math.floor(Math.random() * 50),
      isUbuntu,
      sentiment: isUbuntu ? "ceremonial" : "positive",
    };

    setEchoes((prev) => [newEcho, ...prev].slice(0, 10));
    triggerHaptic({ intensity: "light" });

    // Update abundance meter
    setAbundanceMeter((prev) => ({
      collective: Math.min(100, prev.collective + Math.random() * 5),
      individual: Math.min(100, prev.individual + Math.random() * 3),
      ripple: Math.min(100, prev.ripple + Math.random() * 7),
    }));
  }, [triggerHaptic]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const echo: Echo = {
        id: Date.now().toString(),
        author: "You",
        message: newMessage,
        timestamp: new Date(),
        likes: 0,
        isUbuntu: false,
        sentiment: "positive",
      };

      setEchoes((prev) => [echo, ...prev]);
      setNewMessage("");
      triggerHaptic({ intensity: "medium" });

      // Simulate community response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          generateEcho();
          setIsTyping(false);
        }, 2000);
      }, 1000);
    }
  };

  const handleLike = (echoId: string) => {
    setEchoes((prev) =>
      prev.map((echo) =>
        echo.id === echoId ? { ...echo, likes: echo.likes + 1 } : echo,
      ),
    );
    triggerHaptic({ intensity: "light" });

    // Create ripple effect
    setRipples((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 1000);
  };

  const shareEcho = (echo: Echo) => {
    triggerHaptic({ intensity: "medium" });
    // Simulate share functionality
    alert(`Sharing: "${echo.message.substring(0, 50)}..."`);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "ceremonial":
        return "from-purple-500 to-gold-500";
      case "positive":
        return "from-green-500 to-emerald-500";
      default:
        return "from-blue-500 to-indigo-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "ceremonial":
        return <Sparkles className="w-4 h-4" />;
      case "positive":
        return <Heart className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        generateEcho();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [generateEcho]);

  return (
    <div className={`max-w-6xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-gold-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ubuntu Echo Chamber
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Where collective wisdom creates abundance ripples
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Echo Chamber */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Volume2 className="w-6 h-6 mr-2 text-purple-500" />
                Sacred Echoes
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>

            {/* Echo Stream */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {echoes.map((echo, index) => (
                  <motion.div
                    key={echo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      echo.isUbuntu
                        ? "bg-gradient-to-r from-purple-50 to-gold-50 border-purple-200 dark:from-purple-900/20 dark:to-gold-900/20 dark:border-purple-700"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${getSentimentColor(echo.sentiment)} text-white`}
                        >
                          {getSentimentIcon(echo.sentiment)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                            {echo.author}
                            {echo.isUbuntu && (
                              <Sparkles className="w-4 h-4 ml-1 text-purple-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {echo.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => shareEcho(echo)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {echo.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleLike(echo.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{echo.likes}</span>
                      </button>

                      {echo.isUbuntu && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Ubuntu Blessing
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-gray-500">
                    Ubuntu Spirit is responding...
                  </span>
                </motion.div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Share your wisdom with the collective..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-gold-700 transition-colors flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Abundance Meter & Stats */}
        <div className="space-y-6">
          {/* Abundance Meter */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Abundance Meter
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Collective
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(abundanceMeter.collective)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${abundanceMeter.collective}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Individual
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(abundanceMeter.individual)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${abundanceMeter.individual}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Ripple Effect
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(abundanceMeter.ripple)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${abundanceMeter.ripple}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ubuntu Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Community Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Active Members
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  1,234
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Ubuntu Blessings
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  567
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Abundance Ripples
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {ripples.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Collective Energy
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  High
                </span>
              </div>
            </div>
          </div>

          {/* Ubuntu Wisdom */}
          <div className="bg-gradient-to-r from-purple-100 to-gold-100 dark:from-purple-900/20 dark:to-gold-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Ubuntu Wisdom
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "I am because we are. In this sacred chamber, every echo
              strengthens the collective and every individual voice contributes
              to our shared abundance."
            </p>
          </div>
        </div>
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-purple-400 rounded-full pointer-events-none"
            style={{ zIndex: 1000 + ripple }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UbuntuEchoChamber;

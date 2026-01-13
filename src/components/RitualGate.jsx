import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Infinity, Circle, Eye } from "lucide-react";

const RitualGate = ({ onRitualComplete }) => {
  const [mantra, setMantra] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);
  const [generatedMantra, setGeneratedMantra] = useState("");
  const [currentPhase, setCurrentPhase] = useState("peace"); // peace, love, abundance

  const sacredSymbols = {
    peace: ["🕊️", "🌊", "🌸", "🌿"],
    love: ["❤️", "💫", "🔥", "✨"],
    abundance: ["🌟", "💎", "🏆", "🌈"],
  };

  const mantraTemplates = {
    peace: [
      "I create with peaceful intention and clarity",
      "My work brings calm to the digital chaos",
      "Peace flows through every line of code I write",
      "I build sanctuaries of trust in the digital realm",
    ],
    love: [
      "My creations connect hearts across digital spaces",
      "Love guides every feature I build",
      "I code with compassion for every user",
      "My work strengthens the bonds of community",
    ],
    abundance: [
      "Prosperity flows through my creative channels",
      "I build ecosystems of shared abundance",
      "My success creates abundance for others",
      "I harvest value from every interaction",
    ],
  };

  useEffect(() => {
    const phases = ["peace", "love", "abundance"];
    const interval = setInterval(() => {
      setCurrentPhase((prev) => {
        const currentIndex = phases.indexOf(prev);
        return phases[(currentIndex + 1) % phases.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateSacredMantra = () => {
    const phases = ["peace", "love", "abundance"];
    const selectedPhase = phases[Math.floor(Math.random() * phases.length)];
    const templates = mantraTemplates[selectedPhase];
    const baseMantra = templates[Math.floor(Math.random() * templates.length)];

    const sacredPrefixes = ["🧿", "✨", "🌟", "💫", "🔮"];
    const prefix =
      sacredPrefixes[Math.floor(Math.random() * sacredPrefixes.length)];

    return `${prefix} ${baseMantra}`;
  };

  const handleRitualBegin = () => {
    setIsRevealing(true);
    const newMantra = generateSacredMantra();
    setGeneratedMantra(newMantra);

    setTimeout(() => {
      setIsRevealing(false);
      onRitualComplete({
        mantra: newMantra,
        phase: currentPhase,
        timestamp: new Date().toISOString(),
      });
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated Sacred Geometry Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating Sacred Symbols */}
        {sacredSymbols[currentPhase].map((symbol, index) => (
          <div
            key={index}
            className="absolute text-4xl opacity-30 animate-float"
            style={{
              top: `${20 + index * 25}%`,
              left: `${10 + index * 30}%`,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* Main Ritual Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Sacred Gate Visual */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 rounded-full border-4 border-yellow-500/30 flex items-center justify-center animate-pulse-glow">
            <Circle className="w-16 h-16 text-yellow-400" />
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-spin-slow"></div>
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-bounce" />
          <Heart className="absolute -bottom-4 -left-4 w-8 h-8 text-pink-400 animate-bounce delay-1000" />
        </div>

        {/* Ritual Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6">
          <span className="block text-white mb-2">Enter the</span>
          <span className="block bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vault of Legacy
          </span>
        </h1>

        {/* Phase Indicator */}
        <div className="flex items-center space-x-4 mb-8">
          {["peace", "love", "abundance"].map((phase, index) => (
            <div key={phase} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentPhase === phase
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-110"
                    : "bg-white/10"
                }`}
              >
                {phase === "peace" && <Eye className="w-6 h-6 text-white" />}
                {phase === "love" && <Heart className="w-6 h-6 text-white" />}
                {phase === "abundance" && (
                  <Infinity className="w-6 h-6 text-white" />
                )}
              </div>
              {index < 2 && <div className="w-8 h-px bg-white/20 mx-2"></div>}
            </div>
          ))}
        </div>

        {/* Ritual Text */}
        <div className="text-center max-w-2xl mb-12">
          <p className="text-xl text-gray-300 mb-4">
            You stand at the threshold of transformation.
          </p>
          <p className="text-lg text-gray-400">
            Speak your intention, receive your sacred mantra, and join the
            legacy of creators building with purpose.
          </p>
        </div>

        {/* Mantra Input Section */}
        {!isRevealing && (
          <div className="w-full max-w-md mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What is your creator intention?
              </label>
              <textarea
                value={mantra}
                onChange={(e) => setMantra(e.target.value)}
                placeholder="I create to..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <button
                onClick={handleRitualBegin}
                disabled={!mantra.trim()}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Begin Ritual
              </button>
            </div>
          </div>
        )}

        {/* Revelation Animation */}
        {isRevealing && (
          <div className="w-full max-w-2xl">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-yellow-400/30 flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                Your Sacred Mantra
              </h3>
              <div className="text-xl text-yellow-300 mb-6 animate-fade-in">
                {generatedMantra}
              </div>

              <div className="text-gray-400">
                <p>Carry this intention in your heart</p>
                <p>Let it guide your creative journey</p>
              </div>
            </div>
          </div>
        )}

        {/* Ubuntu Philosophy Footer */}
        <div className="absolute bottom-8 text-center">
          <p className="text-sm text-gray-500 italic">
            "I am because we are" • Ubuntu Philosophy
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(250, 204, 21, 0.6);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default RitualGate;

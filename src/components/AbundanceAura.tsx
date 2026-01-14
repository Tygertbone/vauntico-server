import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Download, Share2, RefreshCw, Zap } from "lucide-react";
import { CustomIcons } from "./CustomIcons";

interface AuraPoint {
  x: number;
  y: number;
  radius: number;
  color: string;
  angle: number;
  speed: number;
  opacity: number;
}

const promptExamples = [
  "Creative soul painting dreams",
  "Tech wizard building worlds",
  "Healing artist sharing light",
  "Musical storyteller spreading joy",
  "Teacher inspiring generations",
];

const colorPalettes = {
  peaceful: ["#60A5FA", "#A78BFA", "#C084FC", "#E879F9"],
  abundance: ["#34D399", "#10B981", "#14B8A6", "#06B6D4"],
  love: ["#F472B6", "#EC4899", "#DB2777", "#BE185D"],
  legacy: ["#F59E0B", "#F97316", "#EF4444", "#DC2626"],
};

export default function AbundanceAura() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [auraPoints, setAuraPoints] = useState<AuraPoint[]>([]);
  const [currentPalette, setCurrentPalette] = useState(colorPalettes.abundance);
  const [shareUrl, setShareUrl] = useState("");

  const generateAuraFromPrompt = useCallback((inputPrompt: string) => {
    if (!inputPrompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const seed = inputPrompt
        .toLowerCase()
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const paletteKey = Object.keys(colorPalettes)[
        seed % 4
      ] as keyof typeof colorPalettes;
      setCurrentPalette(colorPalettes[paletteKey]);

      const newPoints: AuraPoint[] = [];
      const numPoints = 12 + (seed % 8);

      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radiusVariation = 80 + (seed % 40);
        const radius = radiusVariation + Math.sin(seed + i) * 20;

        newPoints.push({
          x: 150 + Math.cos(angle) * radius,
          y: 150 + Math.sin(angle) * radius,
          radius: 3 + (i % 4),
          color:
            colorPalettes[paletteKey][i % colorPalettes[paletteKey].length],
          angle: angle,
          speed: 0.01 + (seed % 10) * 0.001,
          opacity: 0.3 + (i % 5) * 0.1,
        });
      }

      setAuraPoints(newPoints);
      setIsGenerating(false);

      // Generate shareable URL
      const encodedPrompt = btoa(inputPrompt.substring(0, 50));
      setShareUrl(`${window.location.origin}/aura/${encodedPrompt}`);
    }, 2000);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center glow
    const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 100);
    gradient.addColorStop(0, `${currentPalette[0]}40`);
    gradient.addColorStop(0.5, `${currentPalette[1]}20`);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and update aura points
    setAuraPoints((points) =>
      points.map((point, index) => {
        // Update position
        const newAngle = point.angle + point.speed;
        const radiusVariation = 80 + Math.sin(Date.now() * 0.001 + index) * 15;
        const newX = 150 + Math.cos(newAngle) * radiusVariation;
        const newY = 150 + Math.sin(newAngle) * radiusVariation;

        // Draw connecting lines
        points.forEach((otherPoint, otherIndex) => {
          if (otherIndex <= index) return;

          const distance = Math.sqrt(
            Math.pow(newX - otherPoint.x, 2) + Math.pow(newY - otherPoint.y, 2),
          );

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(newX, newY);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            ctx.strokeStyle = `${point.color}${Math.floor(
              (1 - distance / 100) * 30,
            )
              .toString(16)
              .padStart(2, "0")}`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw point with glow
        const pointGradient = ctx.createRadialGradient(
          newX,
          newY,
          0,
          newX,
          newY,
          point.radius * 3,
        );
        pointGradient.addColorStop(0, point.color);
        pointGradient.addColorStop(0.5, `${point.color}80`);
        pointGradient.addColorStop(1, "transparent");

        ctx.fillStyle = pointGradient;
        ctx.beginPath();
        ctx.arc(newX, newY, point.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(newX, newY, point.radius, 0, Math.PI * 2);
        ctx.fill();

        return {
          ...point,
          x: newX,
          y: newY,
          angle: newAngle,
        };
      }),
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [currentPalette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Abundance Aura",
        text: `Check out my abundance aura based on: "${prompt}"`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // Could show a toast here
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `abundance-aura-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleRandomPrompt = () => {
    const randomPrompt =
      promptExamples[Math.floor(Math.random() * promptExamples.length)];
    setPrompt(randomPrompt);
    generateAuraFromPrompt(randomPrompt);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <CustomIcons.SacredGeometry className="w-full h-full text-purple-400" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Abundance Aura
          </h3>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-gray-400">
          Transform your creative essence into a visual manifestation of
          prosperity
        </p>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-2xl border-2 border-purple-400/20 shadow-2xl shadow-purple-500/20"
            style={{
              background: "radial-gradient(circle at center, #0a0a0a, #000000)",
            }}
          />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                <p className="text-white">Channeling cosmic energy...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your creator vibe..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
            maxLength={100}
          />
          <button
            onClick={() => generateAuraFromPrompt(prompt)}
            disabled={!prompt.trim() || isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleRandomPrompt}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm"
        >
          🎲 Try a random prompt
        </button>
      </div>

      {/* Action Buttons */}
      {auraPoints.length > 0 && (
        <div className="flex space-x-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Save Aura</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      )}

      {/* Ubuntu Wisdom */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
        <div className="flex items-center space-x-2 mb-2">
          <CustomIcons.Ubuntu className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">
            Sacred Insight
          </span>
        </div>
        <p className="text-sm text-gray-300 italic">
          "Your unique vibrational signature creates ripples of abundance across
          the collective consciousness."
        </p>
      </div>
    </div>
  );
}

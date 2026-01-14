import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Palette,
  Share2,
  Download,
  Sparkles,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import { useHapticFeedback } from "../hooks/useHapticFeedback";

interface Doodle {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: Date;
  author?: string;
  sentiment?: "positive" | "loving" | "abundant" | "sacred";
}

interface LoveLoopsCanvasProps {
  className?: string;
}

const LoveLoopsCanvas: React.FC<LoveLoopsCanvasProps> = ({
  className = "",
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [currentDoodle, setCurrentDoodle] = useState<Doodle | null>(null);
  const [selectedColor, setSelectedColor] = useState("#D4AF37");
  const [brushSize, setBrushSize] = useState(3);
  const [isCollaborative, setIsCollaborative] = useState(true);
  const [showSentiment, setShowSentiment] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [sharedDoodles, setSharedDoodles] = useState<Doodle[]>([]);

  const abundanceColors = [
    "#D4AF37", // Gold
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#3B82F6", // Blue
  ];

  const sacredSymbols = ["❋", "✧", "◆", "⬟", "❈", "✦"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Redraw all doodles
    redrawCanvas();

    // Simulate collaborative doodles
    if (isCollaborative) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          generateCollaborativeDoodle();
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [doodles, isCollaborative]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all doodles
    doodles.forEach((doodle) => {
      if (doodle.points.length < 2) return;

      ctx.strokeStyle = doodle.color;
      ctx.lineWidth = doodle.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(doodle.points[0].x, doodle.points[0].y);

      for (let i = 1; i < doodle.points.length; i++) {
        ctx.lineTo(doodle.points[i].x, doodle.points[i].y);
      }

      ctx.stroke();
    });

    // Draw current doodle
    if (currentDoodle && currentDoodle.points.length > 1) {
      ctx.strokeStyle = currentDoodle.color;
      ctx.lineWidth = currentDoodle.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(currentDoodle.points[0].x, currentDoodle.points[0].y);

      for (let i = 1; i < currentDoodle.points.length; i++) {
        ctx.lineTo(currentDoodle.points[i].x, currentDoodle.points[i].y);
      }

      ctx.stroke();
    }
  }, [doodles, currentDoodle]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      setCurrentDoodle({
        id: Date.now().toString(),
        points: [{ x, y }],
        color: selectedColor,
        width: brushSize,
        timestamp: new Date(),
        author: "You",
      });
      triggerHaptic({ pattern: [10, 50, 10] });
    },
    [selectedColor, brushSize, triggerHaptic],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentDoodle) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentDoodle((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, { x, y }],
        };
      });

      redrawCanvas();
    },
    [isDrawing, currentDoodle, redrawCanvas],
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentDoodle && currentDoodle.points.length > 1) {
      setDoodles((prev) => [...prev, currentDoodle]);
      analyzeSentiment(currentDoodle);
    }

    setIsDrawing(false);
    setCurrentDoodle(null);
    triggerHaptic({ pattern: [10] });
  }, [isDrawing, currentDoodle, triggerHaptic]);

  const analyzeSentiment = useCallback((doodle: Doodle) => {
    const sentiments = ["positive", "loving", "abundant", "sacred"] as const;
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

    const analyses = [
      "Pure abundance flowing through every stroke",
      "Sacred geometry forming in the collective consciousness",
      "Love loops connecting hearts across dimensions",
      "Ubuntu energy manifesting through creative expression",
      "Collective dreams taking visual form",
    ];

    setAiAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);
    setShowSentiment(true);

    setTimeout(() => setShowSentiment(false), 3000);
  }, []);

  const generateCollaborativeDoodle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.random() * 100 + 50;
    const points = [];

    // Generate a love loop or sacred symbol
    const numPoints = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius + Math.sin(angle * 3) * 20;
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }

    const collaborativeDoodle: Doodle = {
      id: Date.now().toString(),
      points,
      color:
        abundanceColors[Math.floor(Math.random() * abundanceColors.length)],
      width: Math.random() * 4 + 1,
      timestamp: new Date(),
      author: "Collective",
      sentiment: "sacred",
    };

    setDoodles((prev) => [...prev, collaborativeDoodle]);
    triggerHaptic({ pattern: [20, 30, 20, 30] });
  }, [abundanceColors, triggerHaptic]);

  const clearCanvas = useCallback(() => {
    setDoodles([]);
    setCurrentDoodle(null);
    triggerHaptic({ pattern: [50, 50, 50] });
  }, [triggerHaptic]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `love-loops-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    triggerHaptic({ pattern: [100] });
  }, [triggerHaptic]);

  const shareDoodle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simulate sharing
    setSharedDoodles((prev) => [...prev, ...doodles.slice(-5)]);
    triggerHaptic({ pattern: [30, 30, 30, 30] });
  }, [doodles, triggerHaptic]);

  const addSacredSymbol = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const symbol =
      sacredSymbols[Math.floor(Math.random() * sacredSymbols.length)];

    const symbolDoodle: Doodle = {
      id: Date.now().toString(),
      points: [{ x: centerX, y: centerY }],
      color: selectedColor,
      width: brushSize * 2,
      timestamp: new Date(),
      author: "Sacred",
    };

    setDoodles((prev) => [...prev, symbolDoodle]);
    triggerHaptic({ pattern: [50, 100, 50] });
  }, [selectedColor, brushSize, triggerHaptic]);

  return (
    <div className={`max-w-7xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-gold-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Love Loops Canvas
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Co-create abundance through collaborative art
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Palette className="w-6 h-6 mr-2 text-purple-500" />
                Collective Canvas
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCollaborative(!isCollaborative)}
                  className={`p-2 rounded-lg transition-colors ${
                    isCollaborative
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isCollaborative ? (
                    <Unlock className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </button>
                <span className="text-sm text-gray-500">
                  {isCollaborative ? "Collaborative" : "Solo"}
                </span>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden mb-4">
              <canvas
                ref={canvasRef}
                className="w-full h-96 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />

              {/* AI Analysis Overlay */}
              <AnimatePresence>
                {showSentiment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-4 bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-lg text-sm"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    {aiAnalysis}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center justify-between">
              {/* Color Palette */}
              <div className="flex items-center space-x-2">
                {abundanceColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Brush Size */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Size:
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-4">
                  {brushSize}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={addSacredSymbol}
                  className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  title="Add Sacred Symbol"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  onClick={shareDoodle}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Share Doodle"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Clear Canvas"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Canvas Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Canvas Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Doodles
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {doodles.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Collaborative
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {doodles.filter((d) => d.author !== "You").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Love Loops
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {Math.floor(doodles.length * 0.7)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Sacred Symbols
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {doodles.filter((d) => d.author === "Sacred").length}
                </span>
              </div>
            </div>
          </div>

          {/* Shared Doodles */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Recent Shares
            </h3>

            <div className="space-y-2">
              {sharedDoodles
                .slice(-3)
                .reverse()
                .map((doodle, index) => (
                  <div
                    key={doodle.id}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {doodle.author || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doodle.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: doodle.color }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {doodle.points.length} points
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Ubuntu Wisdom */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Ubuntu Canvas
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Every stroke connects us, every color expresses our collective
              love. In this sacred space, we create abundance together."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveLoopsCanvas;

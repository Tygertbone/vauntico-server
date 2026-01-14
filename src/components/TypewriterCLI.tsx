import React, { useEffect, useState } from "react";

const script = [
  '$ vauntico create workshop "Creator Monetization"',
  "⚡ Analyzing your brand voice...",
  "🤖 AI is generating your landing page...",
  "✓ Page created: vauntico.com/workshop-123",
  "✓ Payment integration: Active",
  "✓ SEO optimized: 95/100",
  "🚀 Deployed in 47 seconds",
];

export default function TypewriterCLI() {
  const [lineIndex, setLineIndex] = useState(0);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (lineIndex >= script.length) return;
    let charIndex = 0;
    const line = script[lineIndex];
    const interval = setInterval(() => {
      setDisplay((prev) => prev + line[charIndex]);
      charIndex++;
      if (charIndex >= line.length) {
        clearInterval(interval);
        setTimeout(() => {
          setDisplay((prev) => prev + "\n");
          setLineIndex((i) => i + 1);
        }, 600);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [lineIndex]);

  return (
    <pre
      className="rounded-lg border border-white/10 bg-black/70 p-4 text-green-300 shadow-lg backdrop-blur-sm overflow-x-auto whitespace-pre-wrap"
      style={{
        fontFamily: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {display}
    </pre>
  );
}

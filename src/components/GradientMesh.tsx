import React from 'react';

export default function GradientMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(ellipse 1200px 800px at 20% 30%, rgba(0, 255, 200, 0.25), transparent 50%),
          radial-gradient(ellipse 1000px 600px at 80% 20%, rgba(0, 150, 255, 0.20), transparent 50%),
          radial-gradient(ellipse 800px 500px at 50% 70%, rgba(100, 255, 150, 0.15), transparent 50%),
          radial-gradient(ellipse 900px 400px at 30% 80%, rgba(0, 200, 255, 0.18), transparent 50%),
          linear-gradient(135deg, 
            rgba(10, 16, 24, 0.95) 0%, 
            rgba(20, 30, 48, 0.9) 25%, 
            rgba(30, 40, 60, 0.85) 50%, 
            rgba(20, 30, 48, 0.9) 75%, 
            rgba(10, 16, 24, 0.95) 100%
          )
        `,
        filter: 'saturate(140%) blur(0.3px)',
      }}
    />
  );
}

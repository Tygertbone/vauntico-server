import React from 'react';

export default function GradientMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          'radial-gradient(1200px 500px at 20% 20%, rgba(0, 255, 200, 0.15), transparent 60%), radial-gradient(900px 400px at 80% 30%, rgba(80, 100, 255, 0.18), transparent 60%), linear-gradient(180deg, rgba(10, 16, 24, 0.85), rgba(10, 16, 24, 0.85))',
        filter: 'saturate(120%) blur(0.2px)',
      }}
    />
  );
}

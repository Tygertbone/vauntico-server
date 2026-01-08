'use client';
import React, { useEffect, useState } from 'react';

export function AnimatedScore({ target = 92 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v += 2;
      setValue(v);
      if (v >= target) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [target]);
  return <span className="text-3xl font-bold text-teal-400">{value}/100</span>;
}

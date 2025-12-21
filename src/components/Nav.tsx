'use client';
import React, { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition ${scrolled ? 'backdrop-blur-md bg-black/30 border-b border-white/10' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="font-bold text-white">Vauntico</a>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-white/80 hover:text-white transition">Features</a>
          <a href="#pricing" className="text-white/80 hover:text-white transition">Pricing</a>
          <button onClick={() => setDark(d => !d)} className="rounded-md border border-white/20 px-3 py-2 text-white hover:bg-white/10 transition">
            {dark ? 'Light' : 'Dark'}
          </button>
          <a href="/login" className="rounded-md border border-white/20 px-4 py-2 text-white hover:bg-white/10 transition">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

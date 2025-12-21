import React from 'react';
import GradientMesh from './GradientMesh';
import TypewriterCLI from './TypewriterCLI';

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 text-center">
      <GradientMesh />
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
        Build Your Creator Business in Minutes, Not Months
      </h1>
      <p className="mt-4 text-lg md:text-xl text-white/80">
        Stop juggling 10 tools. Generate, deploy, and monetize with Vauntico's Creator OS.
      </p>
      <div className="mt-10 mx-auto max-w-3xl">
        <TypewriterCLI />
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <a href="#try" className="rounded-md bg-teal-500 px-6 py-3 font-semibold text-black hover:scale-[1.02] hover:shadow-lg transition">
          Start Free
        </a>
        <a href="#demo" className="rounded-md border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10 transition">
          Watch Demo
        </a>
      </div>
    </section>
  );
}

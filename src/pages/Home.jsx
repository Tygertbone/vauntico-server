import React from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Bento from '../sections/Bento';
import Journey from '../sections/Journey';
import TrustScoreCalculator from './TrustScoreCalculator';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0A1018] text-white">
      <Nav />
      <Hero />
      <section id="try" className="mx-auto max-w-5xl px-6 py-16">
        <TrustScoreCalculator />
      </section>
      <Bento />
      <Journey />
    </main>
  );
}

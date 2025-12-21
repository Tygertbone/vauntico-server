import React from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Bento from '../sections/Bento';
import Journey from '../sections/Journey';
import TestimonialsSection from '../components/TestimonialsSection';
import TrustLayer from '../components/TrustLayer';
import TrustEngineTeaser from '../components/TrustEngineTeaser';
import CreatorsInFlow from '../components/CreatorsInFlow';
import AbundanceAura from '../components/AbundanceAura';
import AbundanceOracle from '../components/AbundanceOracle';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Nav />
      <Hero />
      <TrustEngineTeaser />
      <CreatorsInFlow />
      <AbundanceAura />
      <Bento />
      <TestimonialsSection />
      <TrustLayer />
      <Journey />
      <AbundanceOracle />
    </main>
  );
}

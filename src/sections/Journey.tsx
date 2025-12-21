import React from 'react';

export default function Journey() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">From Idea to Income in Minutes</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Awakening</h3>
          <p className="mt-2 text-white/80">Peace in creation: clarify your story and offer.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Connection</h3>
          <p className="mt-2 text-white/80">Love in sharing: build community and trust.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Harvest</h3>
          <p className="mt-2 text-white/80">Abundance in flow: launch, monetize, iterate.</p>
        </div>
      </div>
    </section>
  );
}

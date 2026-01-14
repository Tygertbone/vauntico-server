import React from "react";
import { FeatureCard } from "../components/FeatureCard";

export default function Bento() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl px-6 py-24 grid gap-6 md:grid-cols-3"
    >
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Trust Scoring</h3>
        <p className="mt-2 text-white/80">
          Signal-rich credibility with live score animation.
        </p>
      </FeatureCard>
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Workshops</h3>
        <p className="mt-2 text-white/80">
          Generate and deploy workshops in minutes.
        </p>
      </FeatureCard>
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Payments</h3>
        <p className="mt-2 text-white/80">
          Stripe integration with one-click setup.
        </p>
      </FeatureCard>
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Automation</h3>
        <p className="mt-2 text-white/80">
          AI flows that ship content while you sleep.
        </p>
      </FeatureCard>
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Community</h3>
        <p className="mt-2 text-white/80">
          Creator circles and shared rituals.
        </p>
      </FeatureCard>
      <FeatureCard>
        <h3 className="text-xl font-semibold text-white">Analytics</h3>
        <p className="mt-2 text-white/80">
          Actionable metrics and trust insights.
        </p>
      </FeatureCard>
    </section>
  );
}

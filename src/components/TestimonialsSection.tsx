import React from 'react';
import { FeatureCard } from './FeatureCard';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      content: "Vauntico transformed my creative process. What used to take weeks now happens in minutes.",
      avatar: "🎨"
    },
    {
      name: "Marcus Rodriguez",
      role: "Course Creator", 
      content: "The trust scoring feature helped me double my course sales. Students feel more confident buying.",
      avatar: "🎓"
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      content: "Finally, a platform that gets creators. The workshop generator is pure magic.",
      avatar: "✨"
    }
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Trusted by Thousands of Creators
        </h2>
        <p className="text-lg text-white/80 max-w-3xl mx-auto">
          Join creators who've transformed their businesses with Vauntico's Creator OS
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {testimonials.map((testimonial, index) => (
          <FeatureCard key={index}>
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">{testimonial.avatar}</div>
              <div>
                <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
                <p className="text-white/60">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              "{testimonial.content}"
            </p>
          </FeatureCard>
        ))}
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center gap-4 text-white/80">
          <div className="text-2xl mb-2">⭐⭐⭐⭐⭐⭐</div>
          <div>
            <p className="font-semibold">4.9/5 Stars</p>
            <p className="text-sm">From 2,847+ reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}

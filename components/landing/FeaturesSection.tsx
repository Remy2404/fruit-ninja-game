'use client';

import { featureItems } from '@/lib/landing/content';
import { FeatureCard } from './FeatureCard';
import { Reveal } from './Reveal';

export function FeaturesSection() {
  return (
    <section id="features" className="section-shell py-20 sm:py-24">
      <Reveal>
        <span className="section-label">Features</span>
        <h2 className="section-title mt-6 max-w-3xl text-balance">Built like a modern product surface, not a rushed promo page.</h2>
        <p className="section-copy mt-5">
          The feature grid stays lightweight, accessible, and responsive while still carrying enough motion to feel game-adjacent.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureItems.map((feature, index) => (
          <Reveal key={feature.title} delay={0.1 + index * 0.06}>
            <FeatureCard feature={feature} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import type { FeatureItem } from '@/lib/landing/content';

interface FeatureCardProps {
  feature: FeatureItem;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const reduceMotion = useReducedMotionPreference();
  const Icon = feature.icon;

  return (
    <motion.article
      className="group subtle-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6"
      whileHover={reduceMotion ? undefined : { y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accentClass}`} />
      <motion.div
        aria-hidden="true"
        className={`absolute inset-y-8 left-[-28%] w-2/5 -rotate-[28deg] bg-gradient-to-r ${feature.accentClass} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-35`}
        animate={reduceMotion ? undefined : { x: ['0%', '220%'] }}
        transition={{ duration: 3.5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
      />

      <div className="relative">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--surface-strong)] text-[color:var(--foreground)] shadow-[0_18px_28px_-22px_rgba(var(--shadow-rgb),0.6)]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">{feature.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">{feature.description}</p>
      </div>
    </motion.article>
  );
}

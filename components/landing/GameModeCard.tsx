'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import type { ModeCard } from '@/lib/landing/content';
import { cn } from '@/lib/utils';
import { ActionButton } from './ActionButton';

interface GameModeCardProps {
  mode: ModeCard;
}

const difficultyStyles: Record<ModeCard['difficulty'], string> = {
  Easy: 'bg-[rgba(108,204,99,0.18)] text-[color:var(--accent-green)]',
  Medium: 'bg-[rgba(244,200,74,0.22)] text-[#b67d12]',
  Hard: 'bg-[rgba(255,154,62,0.18)] text-[color:var(--accent-orange)]',
  Expert: 'bg-[rgba(255,104,72,0.18)] text-[color:var(--accent-red)]',
};

export function GameModeCard({ mode }: GameModeCardProps) {
  const reduceMotion = useReducedMotionPreference();

  return (
    <motion.article
      className="group glass-panel min-w-[84vw] snap-center overflow-hidden rounded-[1.85rem] p-5 sm:min-w-[24rem] sm:p-6 md:min-w-0"
      whileHover={reduceMotion ? undefined : { y: -8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', mode.gradientClass)} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--foreground-muted)]">
                {mode.previewLabel}
              </span>
              <span className={cn('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', difficultyStyles[mode.difficulty])}>
                {mode.difficulty}
              </span>
            </div>
            <h3 className="mt-4 font-display text-3xl tracking-[-0.05em] text-[color:var(--foreground)]">{mode.name}</h3>
          </div>

          <motion.div
            className="fruit-glow rounded-full bg-[color:var(--surface)] p-3"
            animate={reduceMotion ? undefined : { rotate: [0, 12, -8, 0], y: [0, -4, 0] }}
            transition={{ duration: 6.8, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="relative h-[78px] w-[78px]">
              <Image alt="" className="object-contain" fill sizes="78px" src={mode.assetSrc} />
            </div>
          </motion.div>
        </div>

        <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">{mode.tagline}</p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">{mode.description}</p>
        <p className="mt-4 text-sm text-[color:var(--foreground-soft)]">{mode.metricLabel}</p>

        <div className="mt-6">
          <ActionButton
            className="w-full justify-between"
            href={`/play?mode=${mode.id}&autostart=1`}
            icon={ArrowRight}
            label="Start this mode"
            variant="secondary"
          />
        </div>
      </div>
    </motion.article>
  );
}

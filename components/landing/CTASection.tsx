'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { ActionButton } from './ActionButton';
import { Reveal } from './Reveal';

const particleFruits = [
  { left: '8%', size: 70, src: '/assets/apple.svg', top: '20%' },
  { left: '22%', size: 54, src: '/assets/banana.svg', top: '70%' },
  { left: '74%', size: 66, src: '/assets/orange.svg', top: '18%' },
  { left: '86%', size: 80, src: '/assets/watermelon.svg', top: '62%' },
];

export function CTASection() {
  const reduceMotion = useReducedMotionPreference();

  return (
    <section className="section-shell py-20 sm:py-24">
      <Reveal className="relative overflow-hidden rounded-[2.4rem] border border-white/20 bg-[linear-gradient(135deg,rgba(255,104,72,0.96),rgba(255,154,62,0.92),rgba(108,204,99,0.86))] px-6 py-12 text-white shadow-[0_38px_90px_-40px_rgba(255,104,72,0.9)] sm:px-10 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22),transparent_28%)]" />
        {particleFruits.map((fruit, index) => (
          <motion.div
            key={fruit.src}
            aria-hidden="true"
            className="absolute hidden rounded-full bg-white/12 p-2 backdrop-blur-sm md:block"
            style={{ left: fruit.left, top: fruit.top }}
            animate={reduceMotion ? undefined : { y: [0, index % 2 === 0 ? -16 : 14, 0], rotate: [0, 12, -8, 0] }}
            transition={{ duration: 7 + index, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            <Image alt="" height={fruit.size} src={fruit.src} width={fruit.size} />
          </motion.div>
        ))}

        <div className="relative max-w-3xl">
          <span className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
            Final CTA
          </span>
          <h2 className="mt-6 font-display text-4xl tracking-[-0.05em] text-balance sm:text-6xl">
            Ready to become a slicing master?
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Launch into the arena, chase precision cuts, and see how far your reflexes really go.
          </p>

          <div className="mt-8">
            <ActionButton
              className="bg-white text-[#0f1722] shadow-[0_24px_50px_-26px_rgba(10,16,24,0.65)]"
              href="/play?autostart=1"
              icon={ArrowRight}
              label="Play Now"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clapperboard, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { heroStats } from '@/lib/landing/content';
import { ActionButton } from './ActionButton';
import { Reveal } from './Reveal';

const floatingFruits = [
  {
    className: 'left-[-0.25rem] top-24 h-14 w-14 sm:left-8 sm:top-28 sm:h-16 sm:w-16 lg:left-0',
    delay: 0.1,
    duration: 6.5,
    rotate: [0, 8, -4, 0],
    src: '/assets/apple.svg',
    translateY: [0, -14, 0],
  },
  {
    className: 'right-4 top-18 h-12 w-12 sm:right-12 sm:top-20 sm:h-14 sm:w-14 lg:right-10',
    delay: 0.5,
    duration: 7.2,
    rotate: [0, -10, 6, 0],
    src: '/assets/orange.svg',
    translateY: [0, -18, 0],
  },
  {
    className: 'bottom-10 left-[12%] h-12 w-12 sm:h-14 sm:w-14',
    delay: 0.25,
    duration: 7.8,
    rotate: [0, 10, -8, 0],
    src: '/assets/banana.svg',
    translateY: [0, 16, 0],
  },
  {
    className: 'bottom-18 right-[16%] h-12 w-12 sm:h-16 sm:w-16',
    delay: 0.7,
    duration: 8.4,
    rotate: [0, -12, 6, 0],
    src: '/assets/dragonfruit.svg',
    translateY: [0, 14, 0],
  },
];

const hudStats = [
  { label: 'Score', value: '128,940' },
  { label: 'Combo', value: '18x' },
  { label: 'Accuracy', value: '97%' },
];

export function HeroSection() {
  const reduceMotion = useReducedMotionPreference();

  return (
    <section id="hero" className="relative overflow-hidden pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[40rem]"
        style={{
          background:
            'radial-gradient(circle at top, rgba(255,255,255,0.42), transparent 44%), linear-gradient(135deg, rgba(255,136,74,0.16), transparent 42%), linear-gradient(225deg, rgba(104,190,80,0.12), transparent 40%)',
        }}
      />

      {floatingFruits.map((fruit) => (
        <motion.div
          key={fruit.src}
          aria-hidden="true"
          className={`pointer-events-none absolute hidden rounded-full bg-white/30 p-2 backdrop-blur-sm sm:block ${fruit.className}`}
          animate={reduceMotion ? undefined : { rotate: fruit.rotate, y: fruit.translateY }}
          transition={{
            delay: fruit.delay,
            duration: fruit.duration,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'mirror',
          }}
        >
          <Image alt="" height={80} src={fruit.src} width={80} />
        </motion.div>
      ))}

      <div className="section-shell relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="section-label">
            <Sparkles className="h-4 w-4 text-[color:var(--accent-orange)]" />
            Browser Arcade Landing
          </span>
          <h1 className="section-title mt-6 text-balance">Slice Fast. Think Faster.</h1>
          <p className="section-copy mx-auto mt-5">
            Experience the ultimate fruit slicing arcade game in your browser. Responsive controls, clean
            feedback, and mode variety turn every session into a score chase.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <ActionButton href="/play?autostart=1" icon={ArrowRight} label="Play Now" />
            <ActionButton href="#gameplay" icon={Clapperboard} label="Watch Trailer" variant="secondary" />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <Reveal className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7" delay={0.1}>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,104,72,0.18),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(104,190,80,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_60%)]"
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--foreground-soft)]">
                    Above the fold
                  </p>
                  <p className="mt-2 font-display text-2xl tracking-[-0.04em] sm:text-3xl">Arcade energy, product clarity.</p>
                </div>
                <span className="rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground-muted)]">
                  Live HUD mock
                </span>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-white/30 bg-[linear-gradient(180deg,rgba(13,20,31,0.9),rgba(21,32,45,0.82))] p-4 text-white shadow-[0_30px_70px_-35px_rgba(5,8,12,0.9)] sm:p-5">
                <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                  <span>Fruit frenzy live</span>
                  <span>precision mode</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
                  <div className="relative rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4">
                    <div className="absolute inset-x-6 top-8 h-px bg-white/15" />
                    <div className="absolute left-1/3 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,175,102,0.34),transparent_70%)] blur-2xl" />
                    <div className="absolute right-10 top-1/4 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(120,220,138,0.34),transparent_72%)] blur-xl" />

                    <div className="relative flex min-h-52 items-end justify-center">
                      <motion.div
                        className="absolute left-[18%] top-10 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/70"
                        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                        transition={{ duration: 5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
                      >
                        Combo surge
                      </motion.div>

                      <motion.div
                        className="absolute left-[8%] top-[45%]"
                        animate={reduceMotion ? undefined : { x: [0, 14, 0], y: [0, -10, 0], rotate: [0, -8, 4, 0] }}
                        transition={{ duration: 7.5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Image alt="" height={92} src="/assets/kiwi.svg" width={92} />
                      </motion.div>

                      <motion.div
                        className="absolute right-[10%] top-[18%]"
                        animate={reduceMotion ? undefined : { x: [0, -10, 0], y: [0, 18, 0], rotate: [0, 14, -10, 0] }}
                        transition={{ duration: 8.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Image alt="" height={94} src="/assets/watermelon.svg" width={94} />
                      </motion.div>

                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-x-[16%] top-[48%] h-[2px] origin-left rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.96),rgba(255,171,95,1),rgba(255,255,255,0))] shadow-[0_0_22px_rgba(255,160,74,0.95)]"
                        animate={reduceMotion ? undefined : { rotate: [-18, -12, -18], scaleX: [0.92, 1.08, 0.92] }}
                        transition={{ duration: 2.6, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
                      />

                      <div className="absolute inset-x-0 bottom-0 h-24 rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_70%)]" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] bg-white/8 p-4">
                      <div className="flex items-center justify-between gap-3">
                        {hudStats.map((stat) => (
                          <div key={stat.label}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                              {stat.label}
                            </p>
                            <p className="mt-2 font-display text-2xl tracking-[-0.04em] text-white">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.35rem] bg-white/6 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Blade trail</p>
                        <p className="mt-2 text-sm leading-6 text-white/78">
                          Micro-bursts, soft glows, and score pops make every swipe legible.
                        </p>
                      </div>
                      <div className="rounded-[1.35rem] bg-white/6 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Progression</p>
                        <p className="mt-2 text-sm leading-6 text-white/78">
                          The landing page communicates depth before the first slice happens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {heroStats.map((stat, index) => (
              <Reveal
                key={stat.label}
                className="subtle-panel rounded-[1.75rem] p-5 sm:p-6"
                delay={0.18 + index * 0.08}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-soft)]">
                  {stat.label}
                </p>
                <p className="mt-3 font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">{stat.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { gameplayPreviewCards } from '@/lib/landing/content';
import { Reveal } from './Reveal';

export function GameplayPreviewSection() {
  const reduceMotion = useReducedMotionPreference();

  return (
    <section id="gameplay" className="section-shell py-20 sm:py-24">
      <Reveal>
        <span className="section-label">Gameplay Preview</span>
        <h2 className="section-title mt-6 max-w-3xl text-balance">A landing page that shows the feel, not just the feature list.</h2>
        <p className="section-copy mt-5">
          The preview block uses motion, spacing, and contrast to communicate tempo before the player ever opens the game.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="glass-panel relative overflow-hidden rounded-[2rem] p-4 sm:p-5" delay={0.08}>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,104,72,0.1),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(104,190,80,0.18),transparent_30%)]" />
          <div className="relative rounded-[1.7rem] border border-white/25 bg-[linear-gradient(180deg,rgba(9,15,22,0.95),rgba(19,30,41,0.88))] p-4 text-white shadow-[0_35px_80px_-42px_rgba(0,0,0,0.95)] sm:p-6">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.22em] text-white/55">
              <span>Gameplay teaser</span>
              <span>Trailer-ready frame</span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div className="space-y-3">
                <div className="rounded-[1.4rem] bg-white/8 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">Preview promise</p>
                  <p className="mt-3 font-display text-2xl tracking-[-0.04em] text-white">Every swipe reads instantly.</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/8 p-4">
                  <p className="text-sm leading-6 text-white/75">
                    Hover states slash diagonally through the content to echo the core mechanic instead of using generic card lifts.
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.55rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>

                <div className="relative mt-8 min-h-72 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                  <motion.div
                    className="absolute left-[12%] top-[18%]"
                    animate={reduceMotion ? undefined : { y: [0, 14, 0], rotate: [0, -8, 5, 0] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  >
                    <Image alt="" height={92} src="/assets/strawberry.svg" width={92} />
                  </motion.div>

                  <motion.div
                    className="absolute right-[12%] top-[36%]"
                    animate={reduceMotion ? undefined : { y: [0, -18, 0], rotate: [0, 10, -6, 0] }}
                    transition={{ duration: 7.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  >
                    <Image alt="" height={108} src="/assets/pineapple.svg" width={108} />
                  </motion.div>

                  <motion.div
                    className="absolute left-[36%] top-[58%]"
                    animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 12, -8, 0] }}
                    transition={{ duration: 6.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  >
                    <Image alt="" height={82} src="/assets/peach.svg" width={82} />
                  </motion.div>

                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-x-[14%] top-[45%] h-[3px] origin-left rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.95),rgba(255,175,102,1),rgba(255,255,255,0))] shadow-[0_0_28px_rgba(255,170,92,0.95)]"
                    animate={reduceMotion ? undefined : { rotate: [-20, -13, -20], scaleX: [0.92, 1.06, 0.92] }}
                    transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="rounded-[1.2rem] bg-black/24 p-4 backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                        <span>Live combo feed</span>
                        <span>+24 streak</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#ff8750,#ffd15c,#6ccc63)]"
                          animate={reduceMotion ? undefined : { width: ['24%', '84%', '52%'] }}
                          transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4">
          {gameplayPreviewCards.map((card, index) => (
            <Reveal key={card.title} delay={0.15 + index * 0.08}>
              <motion.article
                className="group subtle-panel relative overflow-hidden rounded-[1.75rem] p-5"
                whileHover={reduceMotion ? undefined : { y: -6 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accentClass}`} />
                <motion.div
                  aria-hidden="true"
                  className={`absolute inset-y-8 left-[-30%] w-1/2 -rotate-[28deg] bg-gradient-to-r ${card.accentClass} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-35`}
                  animate={reduceMotion ? undefined : { x: ['0%', '180%'] }}
                  transition={{
                    delay: index * 0.6,
                    duration: 3.2,
                    ease: 'easeInOut',
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="max-w-xs">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--foreground-soft)]">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-3 font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">{card.description}</p>
                    <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">{card.metric}</p>
                  </div>

                  <div className="fruit-glow rounded-full bg-[color:var(--surface)] p-3">
                    <Image alt="" height={76} src={card.fruitSrc} width={76} />
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { leaderboardEntries, statHighlights } from '@/lib/landing/content';
import { AnimatedCounter } from './AnimatedCounter';
import { Reveal } from './Reveal';

export function LeaderboardSection() {
  return (
    <section id="leaderboard" className="section-shell py-20 sm:py-24">
      <Reveal>
        <span className="section-label">Leaderboard & Stats</span>
        <h2 className="section-title mt-6 max-w-4xl text-balance">Competitive UI, even when the numbers are mocked.</h2>
        <p className="section-copy mt-5">
          The leaderboard is treated like a product-quality surface with readable ranks, strong spacing, and animated counters that respect motion settings.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Reveal className="glass-panel rounded-[2rem] p-5 sm:p-6" delay={0.08}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--foreground-soft)]">Top blades</p>
              <h3 className="mt-2 font-display text-3xl tracking-[-0.04em] text-[color:var(--foreground)]">Global fake board</h3>
            </div>
            <span className="rounded-full bg-[rgba(255,154,62,0.16)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-orange)]">
              Updated live
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {leaderboardEntries.map((entry) => (
              <div
                key={entry.rank}
                className="subtle-panel flex items-center justify-between gap-4 rounded-[1.45rem] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-red),var(--accent-yellow))] text-base font-black text-white shadow-[0_16px_28px_-18px_rgba(255,104,72,0.85)]">
                    #{entry.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">{entry.player}</p>
                    <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{entry.signature}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                    score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {statHighlights.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Reveal key={stat.label} className="subtle-panel rounded-[1.8rem] p-5 sm:p-6" delay={0.12 + index * 0.05}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--surface-strong)] text-[color:var(--foreground)] shadow-[0_16px_28px_-20px_rgba(var(--shadow-rgb),0.6)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--foreground-soft)]">
                  {stat.label}
                </p>
                <p className="mt-4 font-display text-4xl tracking-[-0.05em] text-[color:var(--foreground)]">
                  <AnimatedCounter formatOptions={stat.format} suffix={stat.suffix} value={stat.value} />
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

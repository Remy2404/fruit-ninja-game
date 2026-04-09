import {
  spawnMathComparison,
  spawnMathDistribution,
  spawnMathFormulaCards,
  spawnMathInsights,
  spawnMathModeOverrides,
} from '@/lib/landing/content';
import { MathMarkdown } from './MathMarkdown';
import { Reveal } from './Reveal';

export function SpawnProbabilitySection() {
  return (
    <section id="spawn-math" className="section-shell py-20 sm:py-24">
      <Reveal>
        <span className="section-label">Spawn Probability Mathematics</span>
        <h2 className="section-title mt-6 max-w-4xl text-balance">The spawn system is tuned by math, not guesswork.</h2>
        <p className="section-copy mt-5 max-w-3xl">
          This section turns the spawn model into readable product UI. The formulas, caps, and late-game distributions come
          from the current implementation and explain why the game stays tense without collapsing into random noise.
        </p>
        <p className="mt-4 text-sm font-medium text-[color:var(--foreground-soft)]">
          Source: <span className="font-mono">docs/spawn-probability-math.md</span>
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {spawnMathFormulaCards.map((card, index) => (
          <Reveal key={card.id} className="glass-panel rounded-[1.9rem] p-5 sm:p-6" delay={0.08 + index * 0.05}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-soft)]">
              {card.caption}
            </p>
            <h3 className="mt-3 font-display text-3xl tracking-[-0.04em] text-[color:var(--foreground)]">{card.title}</h3>
            <div className="mt-4 overflow-hidden rounded-[1.35rem] bg-[color:var(--surface-strong)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] sm:px-4">
              <MathMarkdown className="text-sm sm:text-base" content={card.formulaMarkdown} />
            </div>
            <MathMarkdown className="mt-4 text-sm text-[color:var(--foreground-muted)]" content={card.noteMarkdown} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
        <Reveal className="glass-panel min-w-0 rounded-[2rem] p-5 sm:p-6" delay={0.12}>
          <div className="flex flex-col gap-5">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-soft)]">
                Late-game group distribution
              </p>
              <h3 className="mt-3 font-display text-3xl tracking-[-0.04em] text-[color:var(--foreground)]">
                At N_max = 5, singles still dominate.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">
                The U1 * U2 draw makes small groups much more likely than a flat random roll, preserving the original Fruit
                Ninja pacing even when the mode is fully ramped.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {spawnMathInsights.map((insight) => (
                <div key={insight.label} className="subtle-panel rounded-[1.35rem] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                    {insight.label}
                  </p>
                  <p className="mt-3 font-display text-[1.65rem] leading-tight tracking-[-0.04em] text-[color:var(--foreground)]">
                    {insight.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {spawnMathDistribution.map((entry) => (
              <div key={entry.count} className="space-y-2">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{entry.count} fruit</p>
                    <p className="text-xs text-[color:var(--foreground-soft)]">{entry.ratio}</p>
                  </div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{entry.probability}%</p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface-strong)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-red),var(--accent-orange),var(--accent-yellow))]"
                    style={{ width: `${entry.probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid min-w-0 gap-5">
          <Reveal className="glass-panel min-w-0 rounded-[2rem] p-5 sm:p-6" delay={0.16}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-soft)]">
              Bug fix impact
            </p>
            <h3 className="mt-3 max-w-[18ch] font-display text-3xl tracking-[-0.04em] text-[color:var(--foreground)]">
              Per-wave bomb rolls stopped group size from cheating the odds.
            </h3>

            <div className="mt-5 space-y-3 md:hidden">
              {spawnMathComparison.map((row) => (
                <div key={row.groupSize} className="subtle-panel rounded-[1.35rem] px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                      Group size
                    </span>
                    <span className="font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">
                      {row.groupSize}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                        Old system
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{row.oldPerObject}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                        Current system
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--accent-orange)]">{row.newPerWave}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 hidden overflow-hidden rounded-[1.35rem] border border-[color:var(--border-strong)] md:block">
              <div className="grid grid-cols-[0.9fr_1fr_1fr] gap-4 bg-[color:var(--surface-strong)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-soft)]">
                <span>Group size</span>
                <span>Old system</span>
                <span>Current system</span>
              </div>
              {spawnMathComparison.map((row) => (
                <div
                  key={row.groupSize}
                  className="grid grid-cols-[0.9fr_1fr_1fr] gap-4 border-t border-[color:var(--border-strong)] px-4 py-4 text-sm text-[color:var(--foreground)]"
                >
                  <span className="font-semibold">{row.groupSize}</span>
                  <span className="text-[color:var(--foreground-muted)]">{row.oldPerObject}</span>
                  <span className="font-semibold text-[color:var(--accent-orange)]">{row.newPerWave}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="glass-panel min-w-0 rounded-[2rem] p-5 sm:p-6" delay={0.2}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--foreground-soft)]">
              Mode overrides
            </p>
            <h3 className="mt-3 max-w-[20ch] font-display text-3xl tracking-[-0.04em] text-[color:var(--foreground)]">
              Each ruleset bends the same formulas differently.
            </h3>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {spawnMathModeOverrides.map((override) => (
                <div key={override.mode} className="subtle-panel rounded-[1.35rem] px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">{override.mode}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      <span className="rounded-full bg-[rgba(255,154,62,0.16)] px-3 py-1 text-[color:var(--accent-orange)]">
                        Bomb {override.bombWindow}
                      </span>
                      <span className="rounded-full bg-[rgba(95,184,255,0.16)] px-3 py-1 text-[#2c74d8]">
                        Interval {override.intervalWindow}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--foreground-muted)]">{override.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

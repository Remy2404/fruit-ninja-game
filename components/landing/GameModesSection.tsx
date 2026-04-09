import { modeCards } from '@/lib/landing/content';
import { GameModeCard } from './GameModeCard';
import { Reveal } from './Reveal';

export function GameModesSection() {
  return (
    <section id="modes" className="section-shell py-20 sm:py-24">
      <Reveal>
        <span className="section-label">Game Modes</span>
        <h2 className="section-title mt-6 max-w-4xl text-balance">Twelve modes, each with a different scoring pressure and pacing profile.</h2>
        <p className="section-copy mt-5">
          The cards are sourced from the actual mode configuration so the marketing surface stays aligned with the game logic instead of drifting into fake copy.
        </p>
      </Reveal>

      <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
        <div className="flex snap-x gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-5">
          {modeCards.map((mode, index) => (
            <Reveal key={mode.id} delay={0.08 + index * 0.03}>
              <GameModeCard mode={mode} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

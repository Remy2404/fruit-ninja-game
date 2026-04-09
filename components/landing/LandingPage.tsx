import { CTASection } from './CTASection';
import { FeaturesSection } from './FeaturesSection';
import { Footer } from './Footer';
import { GameModesSection } from './GameModesSection';
import { GameplayPreviewSection } from './GameplayPreviewSection';
import { HeroSection } from './HeroSection';
import { LeaderboardSection } from './LeaderboardSection';
import { Navbar } from './Navbar';
import { SlicingCursor } from './SlicingCursor';

export function LandingPage() {
  return (
    <>
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[90] -translate-y-20 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <SlicingCursor />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <GameplayPreviewSection />
        <FeaturesSection />
        <GameModesSection />
        <LeaderboardSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

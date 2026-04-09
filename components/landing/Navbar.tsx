'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { navigationItems } from '@/lib/landing/content';
import { cn } from '@/lib/utils';
import { ActionButton } from './ActionButton';
import { PreferenceControls } from './PreferenceControls';

export function Navbar() {
  const [activeHref, setActiveHref] = useState<string>('#hero');
  const [menuOpen, setMenuOpen] = useState(false);

  const sectionIds = useMemo(
    () => ['hero', ...navigationItems.map((item) => item.href.replace('#', ''))],
    [],
  );

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        setActiveHref(`#${visibleEntry.target.id}`);
      },
      {
        rootMargin: '-30% 0px -48% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass-panel section-shell flex items-center justify-between rounded-full px-4 py-3 sm:px-5">
        <Link href="#hero" className="inline-flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent-red),var(--accent-yellow))] text-lg font-black text-white shadow-[0_14px_30px_-18px_rgba(255,104,72,0.9)]">
            F
          </span>
          <span className="font-display text-base tracking-[-0.03em] sm:text-lg">Fruit Ninja</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeHref === item.href
                  ? 'bg-[rgba(255,154,62,0.18)] text-[color:var(--foreground)]'
                  : 'text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <PreferenceControls />
          <ActionButton href="/play?autostart=1" label="Play Now" />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <PreferenceControls />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--foreground)]"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div id="mobile-menu" className="section-shell glass-panel mt-3 rounded-[2rem] p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {[{ label: 'Home', href: '#hero' }, ...navigationItems].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200',
                  activeHref === item.href
                    ? 'bg-[rgba(255,154,62,0.18)] text-[color:var(--foreground)]'
                    : 'text-[color:var(--foreground-muted)] hover:bg-white/50 hover:text-[color:var(--foreground)]',
                )}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <ActionButton className="mt-2 w-full" href="/play?autostart=1" label="Play Now" />
          </div>
        </div>
      ) : null}
    </header>
  );
}

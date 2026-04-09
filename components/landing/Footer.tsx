import { Globe, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  { href: '#hero', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#footer', label: 'Contact' },
];

const socialLinks = [
  { href: 'mailto:team@fruitninja.dev', icon: Mail, label: 'Email' },
  { href: '#leaderboard', icon: Globe, label: 'Community' },
  { href: '#gameplay', icon: MessageCircle, label: 'Trailer' },
];

export function Footer() {
  return (
    <footer id="footer" className="section-shell pb-10 pt-4">
      <div className="glass-panel rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-2xl tracking-[-0.04em] text-[color:var(--foreground)]">Fruit Ninja HTML5</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[color:var(--foreground-muted)]">
              A modern browser arcade experience with clean motion, strong hierarchy, and a landing page tuned for play conversion.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-wrap gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[color:var(--foreground-muted)] transition-colors hover:text-[color:var(--foreground)]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    aria-label={link.label}
                    className="subtle-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--foreground)] transition-transform duration-200 hover:-translate-y-0.5"
                    href={link.href}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[color:var(--border-strong)] pt-4 text-sm text-[color:var(--foreground-soft)]">
          © 2026 Fruit Ninja HTML5. Crafted for speed, clarity, and repeat play.
        </div>
      </div>
    </footer>
  );
}

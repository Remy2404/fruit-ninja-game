'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';

type ThemePreference = 'dark' | 'light';

interface PreferenceControlsProps {
  className?: string;
}

export function PreferenceControls({ className }: PreferenceControlsProps) {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const [theme, setTheme] = useState<ThemePreference>('light');

  useEffect(() => {
    const resolvedTheme = resolveThemePreference();

    if (resolvedTheme === theme) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setTheme(resolvedTheme);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    applyThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <PreferenceButton
        ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        dataTestId="theme-toggle"
        isPressed={theme === 'dark'}
        onClick={toggleTheme}
      >
        <motion.span
          key={theme}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          initial={{ opacity: 0, rotate: -16, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </PreferenceButton>

      <PreferenceButton
        ariaLabel={soundEnabled ? 'Mute game sound' : 'Enable game sound'}
        dataTestId="sound-toggle"
        isPressed={soundEnabled}
        onClick={toggleSound}
      >
        <motion.span
          key={soundEnabled ? 'on' : 'off'}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          initial={{ opacity: 0, rotate: 14, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </motion.span>
      </PreferenceButton>
    </div>
  );
}

interface PreferenceButtonProps {
  ariaLabel: string;
  children: React.ReactNode;
  dataTestId: string;
  isPressed: boolean;
  onClick: () => void;
}

function PreferenceButton({
  ariaLabel,
  children,
  dataTestId,
  isPressed,
  onClick,
}: PreferenceButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isPressed}
      data-testid={dataTestId}
      onClick={onClick}
      className="glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--foreground)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}

function resolveThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem('fruit-theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemePreference(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem('fruit-theme', theme);
}

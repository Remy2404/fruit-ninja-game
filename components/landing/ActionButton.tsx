'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { cn } from '@/lib/utils';

interface Ripple {
  diameter: number;
  id: number;
  x: number;
  y: number;
}

interface ActionButtonProps {
  className?: string;
  href: string;
  icon?: LucideIcon;
  label: string;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({
  className,
  href,
  icon: Icon,
  label,
  variant = 'primary',
}: ActionButtonProps) {
  const reduceMotion = useReducedMotionPreference();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const diameter = Math.max(bounds.width, bounds.height) * 1.35;
    const ripple: Ripple = {
      diameter,
      id: Date.now() + Math.random(),
      x: event.clientX - bounds.left - diameter / 2,
      y: event.clientY - bounds.top - diameter / 2,
    };

    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((entry) => entry.id !== ripple.id));
    }, 650);
  };

  return (
    <Link
      href={href}
      onPointerDown={handlePointerDown}
      className={cn(
        'group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-5 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-200 focus-visible:outline-none sm:px-6',
        variant === 'primary'
          ? 'bg-[linear-gradient(135deg,var(--accent-red),var(--accent-orange))] text-white shadow-[0_24px_48px_-26px_rgba(255,104,72,0.85)]'
          : 'border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)] shadow-[0_16px_28px_-20px_rgba(var(--shadow-rgb),0.55)]',
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-full',
          variant === 'primary'
            ? 'bg-white/0 group-hover:bg-white/10 group-active:bg-white/14'
            : 'bg-white/0 group-hover:bg-white/40 group-active:bg-white/50',
        )}
        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute rounded-full animate-[button-ripple_650ms_ease-out_forwards]',
            variant === 'primary' ? 'bg-white/30' : 'bg-[rgba(255,154,62,0.28)]',
          )}
          style={{
            height: ripple.diameter,
            left: ripple.x,
            top: ripple.y,
            width: ripple.diameter,
          }}
        />
      ))}

      <span className="relative z-10 inline-flex items-center gap-2">
        {label}
        {Icon ? <Icon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" /> : null}
      </span>
    </Link>
  );
}

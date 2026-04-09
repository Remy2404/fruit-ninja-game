'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

interface AnimatedCounterProps {
  formatOptions?: Intl.NumberFormatOptions;
  suffix?: string;
  value: number;
}

export function AnimatedCounter({ formatOptions, suffix, value }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { amount: 0.75, once: true });
  const reduceMotion = useReducedMotionPreference();
  const [displayValue, setDisplayValue] = useState(0);

  const formatter = useMemo(() => new Intl.NumberFormat('en-US', formatOptions), [formatOptions]);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (reduceMotion) {
      const animationFrame = window.requestAnimationFrame(() => {
        setDisplayValue(value);
      });

      return () => window.cancelAnimationFrame(animationFrame);
    }

    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, reduceMotion, value]);

  const effectiveValue = reduceMotion ? value : displayValue;

  const roundedValue =
    formatOptions?.maximumFractionDigits && formatOptions.maximumFractionDigits > 0
      ? Number(effectiveValue.toFixed(formatOptions.maximumFractionDigits))
      : Math.round(effectiveValue);

  return (
    <span ref={ref}>
      {formatter.format(roundedValue)}
      {suffix}
    </span>
  );
}

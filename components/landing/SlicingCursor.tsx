'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

interface CursorTrail {
  angle: number;
  length: number;
  x: number;
  y: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

export function SlicingCursor() {
  const reduceMotion = useReducedMotionPreference();
  const previousPositionRef = useRef<PointerPosition | null>(null);
  const [isEnabled, setIsEnabled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : false,
  );
  const [position, setPosition] = useState<PointerPosition | null>(null);
  const [trail, setTrail] = useState<CursorTrail | null>(null);

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: fine)');

    const syncPointerMode = (event: MediaQueryListEvent) => {
      setIsEnabled(event.matches);
      if (!event.matches) {
        setPosition(null);
        setTrail(null);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!mediaQuery.matches) {
        return;
      }

      const nextPosition = { x: event.clientX, y: event.clientY };
      const previousPosition = previousPositionRef.current;
      previousPositionRef.current = nextPosition;
      setPosition(nextPosition);

      if (!previousPosition) {
        return;
      }

      const dx = nextPosition.x - previousPosition.x;
      const dy = nextPosition.y - previousPosition.y;
      const length = Math.hypot(dx, dy);

      if (length < 6) {
        return;
      }

      setTrail({
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
        length,
        x: previousPosition.x,
        y: previousPosition.y,
      });
    };

    const clearCursor = () => {
      previousPositionRef.current = null;
      setPosition(null);
      setTrail(null);
    };

    mediaQuery.addEventListener('change', syncPointerMode);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', clearCursor);

    return () => {
      mediaQuery.removeEventListener('change', syncPointerMode);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', clearCursor);
    };
  }, [reduceMotion]);

  if (!isEnabled || !position) {
    return null;
  }

  return (
    <>
      {trail ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.98),rgba(255,176,84,1),rgba(255,255,255,0))] shadow-[0_0_22px_rgba(255,176,84,0.95)] mix-blend-screen"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          style={{
            left: trail.x,
            top: trail.y,
            transform: `rotate(${trail.angle}deg)`,
            transformOrigin: '0 50%',
            width: trail.length,
          }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        />
      ) : null}

      <motion.div
        aria-hidden="true"
        animate={{ opacity: 1, scale: 1 }}
        className="pointer-events-none fixed z-[71] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,176,84,0.98)_58%,rgba(255,176,84,0)_80%)] shadow-[0_0_24px_rgba(255,176,84,0.75)] mix-blend-screen"
        initial={{ opacity: 0, scale: 0.7 }}
        style={{ left: position.x, top: position.y }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />
    </>
  );
}

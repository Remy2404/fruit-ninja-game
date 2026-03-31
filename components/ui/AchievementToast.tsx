'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAchievementStore } from '../../store/useAchievementStore';
import { ACHIEVEMENT_META } from './achievementConfig';

const TOAST_DURATION_MS = 2800;

export function AchievementToast() {
  const { toastQueue, popToast } = useAchievementStore();
  const current = toastQueue[0];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      popToast();
    }, TOAST_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current?.id]);

  const meta = current ? ACHIEVEMENT_META[current.id] : null;
  const Icon = meta?.icon ?? null;

  return (
    <AnimatePresence mode="wait">
      {current && Icon && (
        <motion.div
          key={current.id}
          initial={{ y: 60, opacity: 0, scale: 0.88 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
          style={{ bottom: '22%' }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(18, 18, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${meta!.color}44`,
              boxShadow: `0 0 28px ${meta!.color}22, 0 8px 32px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Achievement icon */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
              style={{
                background: `${meta!.color}18`,
                border: `1px solid ${meta!.color}30`,
              }}
            >
              <Icon size={18} style={{ color: meta!.color }} strokeWidth={2} />
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className="text-white font-black text-sm leading-tight tracking-wide truncate"
                style={{ letterSpacing: '0.02em' }}
              >
                {current.title}
              </span>
              <span className="text-xs leading-tight mt-0.5 truncate" style={{ color: '#8a8a8a' }}>
                {current.description}
              </span>
            </div>

            {/* Unlocked badge */}
            <div
              className="ml-1 shrink-0 flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(74,222,128,0.25)' }}
            >
              <Check size={11} strokeWidth={3} style={{ color: '#4ade80' }} />
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: '#4ade80', letterSpacing: '0.06em' }}
              >
                New
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Heart, Volume2, VolumeX, Flame } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AchievementToast } from './AchievementToast';

export function HUD() {
  const {
    score,
    lives,
    mode,
    timeLeft,
    soundEnabled,
    toggleSound,
    setStatus,
    setTimeLeft,
    streakCount,
    streakMultiplier,
    lastSliceTime,
  } = useGameStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [streakVisible, setStreakVisible] = useState(false);

  useEffect(() => {
    if (mode === 'arcade' || mode === 'zen') {
      timerRef.current = setInterval(() => {
        const state = useGameStore.getState();
        if (state.status === 'playing' && state.timeLeft > 0) {
          state.setTimeLeft(state.timeLeft - 1);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  // Show streak badge for 3s after the last slice; hide immediately if streak drops below 2
  useEffect(() => {
    if (streakCount >= 2) {
      setStreakVisible(true);
      const timer = setTimeout(() => setStreakVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setStreakVisible(false);
    }
  }, [streakCount, lastSliceTime]);

  // Danger conditions:
  // Classic  → 1 life left
  // Arcade/Zen → 10 seconds or fewer remaining
  const isDanger =
    (mode === 'classic' && lives <= 1) ||
    ((mode === 'arcade' || mode === 'zen') && timeLeft > 0 && timeLeft <= 10);

  const multiplierLabel =
    streakMultiplier === 1.5 ? '×1.5' :
    streakMultiplier === 2   ? '×2'   :
    streakMultiplier === 3   ? '×3'   : '';

  return (
    <>
      {/* ── Danger Sense Vignette overlay ── */}
      <AnimatePresence>
        {isDanger && (
          <motion.div
            key="danger-vignette"
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.15, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 38%, rgba(220, 30, 30, 0.42) 100%)',
              boxShadow: 'inset 0 0 100px rgba(200, 0, 0, 0.45)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Achievement Toasts ── */}
      <AchievementToast />

      {/* ── Main HUD row ── */}
      <div className="flex flex-row justify-between w-full p-4 md:p-6 text-white pointer-events-none relative z-10">
        {/* Left: score + mode + timer */}
        <div className="flex flex-col items-start pointer-events-auto">
          <motion.div
            key={score}
            initial={{ scale: 1.4, color: '#ffcc00' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tighter"
            style={{ textShadow: '0 4px 8px rgba(0,0,0,0.7)' }}
          >
            {score}
          </motion.div>

          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mt-2 text-zinc-300 border border-white/10 uppercase tracking-widest">
            {mode} mode
          </div>

          {(mode === 'arcade' || mode === 'zen') && (
            <motion.div
              className={`mt-2 text-2xl font-black tabular-nums ${
                timeLeft <= 10 ? 'text-red-400' : 'text-orange-300'
              }`}
              animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}
            >
              {timeLeft}s
            </motion.div>
          )}
        </div>

        {/* Right: controls + lives + streak badge */}
        <div className="flex flex-col items-end pointer-events-auto gap-3">
          <button
            onClick={toggleSound}
            className="w-11 h-11 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 size={20} />
            ) : (
              <VolumeX size={20} className="text-red-400" />
            )}
          </button>

          <button
            onClick={() => setStatus('paused')}
            className="w-11 h-11 bg-black/50 hover:bg-black/70 rounded-full flex gap-1 items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
          >
            <div className="w-1.5 h-4 bg-white rounded-sm" />
            <div className="w-1.5 h-4 bg-white rounded-sm" />
          </button>

          {/* ── Streak Multiplier Badge ── */}
          <AnimatePresence>
            {streakVisible && (
              <motion.div
                key="streak-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <motion.div
                  animate={streakCount >= 5 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
                  style={{
                    background: 'rgba(170, 30, 30, 0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 100, 70, 0.3)',
                    boxShadow: '0 0 22px rgba(255, 60, 30, 0.28)',
                  }}
                >
                  <Flame size={17} strokeWidth={2} style={{ color: '#ff7c26' }} />
                  <span
                    className="text-base font-black tabular-nums"
                    style={{ color: '#ff9f4a' }}
                  >
                    {streakCount}
                  </span>
                  {streakMultiplier > 1 && (
                    <span
                      className="text-xs font-black"
                      style={{ color: '#ffd709' }}
                    >
                      {multiplierLabel}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Classic Lives ── */}
          {mode === 'classic' && (
            <div className="flex gap-1.5 mt-2">
              {Array.from({ length: Math.max(lives, 3) }, (_, i) => i + 1).map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, opacity: i > lives ? 0.15 : 1 }}
                  transition={{ delay: i * 0.05, type: 'spring' }}
                >
                  <Heart
                    size={28}
                    fill={i > lives ? 'transparent' : '#ff3366'}
                    className={
                      i > lives
                        ? 'text-zinc-600'
                        : 'text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]'
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

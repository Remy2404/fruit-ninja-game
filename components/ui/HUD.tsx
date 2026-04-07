'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Heart, Volume2, VolumeX } from 'lucide-react';
import { AchievementToast } from './AchievementToast';
import { getModeConfig } from '../../game/config/ModeConfig';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export function HUD() {
  const {
    score,
    lives,
    mode,
    timeLeft,
    soundEnabled,
    toggleSound,
    setStatus,
    streakCount,
    streakMultiplier,
    energy,
    isEnergyActive,
  } = useGameStore(
    useShallow((state) => ({
      score: state.score,
      lives: state.lives,
      mode: state.mode,
      timeLeft: state.timeLeft,
      soundEnabled: state.soundEnabled,
      toggleSound: state.toggleSound,
      setStatus: state.setStatus,
      streakCount: state.streakCount,
      streakMultiplier: state.streakMultiplier,
      energy: state.energy,
      isEnergyActive: state.isEnergyActive,
    })),
  );

  const modeConfig = getModeConfig(mode);
  const hasLives = modeConfig.startingLives > 0;
  const hasTimer = modeConfig.timerSeconds > 0;
  const visibleTimeLeft = Math.max(0, Math.ceil(timeLeft));
  const isDanger =
    (hasLives && lives <= 1) || (hasTimer && visibleTimeLeft > 0 && visibleTimeLeft <= 10);
  const streakVisible = streakCount >= 2;
  const multiplierLabel =
    streakMultiplier === 1.5 ? 'x1.5' : streakMultiplier === 2 ? 'x2' : streakMultiplier === 3 ? 'x3' : '';

  return (
    <>
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

      <AchievementToast />

      <div className="flex flex-row justify-between w-full p-4 md:p-6 text-white pointer-events-none relative z-10">
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
            {modeConfig.title} mode
          </div>

          {hasTimer && (
            <motion.div
              className={`mt-2 text-2xl font-black tabular-nums ${
                visibleTimeLeft <= 10 ? 'text-red-400' : 'text-orange-300'
              }`}
              animate={visibleTimeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}
            >
              {visibleTimeLeft}s
            </motion.div>
          )}

          {modeConfig.timeControl.enabled && (
            <div className="mt-4 w-32 md:w-48 h-3 bg-black/60 overflow-hidden rounded-full border border-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)] flex-shrink-0">
              <div
                className="h-full bg-sky-400 rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, energy))}%`,
                  transition: 'width 0.1s linear',
                  boxShadow: isEnergyActive ? '0 0 12px #38bdf8' : 'none',
                  filter: isEnergyActive ? 'brightness(1.5)' : 'brightness(1)',
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end pointer-events-auto gap-3">
          <button
            onClick={toggleSound}
            className="w-11 h-11 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-400" />}
          </button>

          <button
            onClick={() => setStatus('paused')}
            className="w-11 h-11 bg-black/50 hover:bg-black/70 rounded-full flex gap-1 items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
          >
            <div className="w-1.5 h-4 bg-white rounded-sm" />
            <div className="w-1.5 h-4 bg-white rounded-sm" />
          </button>

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
                  <span className="text-base font-black tabular-nums" style={{ color: '#ff9f4a' }}>
                    {streakCount}
                  </span>
                  {streakMultiplier > 1 && (
                    <span className="text-xs font-black" style={{ color: '#ffd709' }}>
                      {multiplierLabel}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {hasLives && (
            <div className="flex gap-1.5 mt-2">
              {Array.from({ length: Math.max(lives, modeConfig.startingLives) }, (_, index) => index + 1).map(
                (lifeIndex) => (
                  <motion.div
                    key={lifeIndex}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, opacity: lifeIndex > lives ? 0.15 : 1 }}
                    transition={{ delay: lifeIndex * 0.05, type: 'spring' }}
                  >
                    <Heart
                      size={28}
                      fill={lifeIndex > lives ? 'transparent' : '#ff3366'}
                      className={
                        lifeIndex > lives
                          ? 'text-zinc-600'
                          : 'text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]'
                      }
                    />
                  </motion.div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

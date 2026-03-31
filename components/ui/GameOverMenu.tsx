'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull,
  Swords,
  Bomb,
  Target,
  Leaf,
  Check,
  Star,
  Trophy,
  Timer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import { ACHIEVEMENT_META } from './achievementConfig';
import type { GameMode, GameEndReason } from '../../store/useGameStore';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, iconColor, label, value }: StatCardProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center rounded-2xl py-4 px-3 relative overflow-hidden"
      style={{
        background: 'rgba(22, 22, 22, 0.9)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: 'linear-gradient(to right, #ff9f4a, #ffd709)' }}
      />
      <Icon size={22} strokeWidth={1.8} style={{ color: iconColor, marginTop: '4px' }} />
      <span className="text-white font-black text-base mt-2 tabular-nums">{value}</span>
      <span
        className="text-xs uppercase tracking-widest mt-1 font-semibold"
        style={{ color: '#5a5a5a', letterSpacing: '0.08em' }}
      >
        {label}
      </span>
    </div>
  );
}

// Maps every possible (mode × endReason) combination to a distinct visual identity.
function resolveEndState(mode: GameMode, reason: GameEndReason) {
  // Timer ran out in Zen or Arcade → the player completed the round
  if (reason === 'timeout' && (mode === 'zen' || mode === 'arcade')) {
    return {
      icon: Trophy,
      iconBg: 'rgba(255,215,9,0.12)',
      iconBorder: 'rgba(255,215,9,0.30)',
      iconGlow: 'rgba(255,215,9,0.18)',
      iconColor: '#ffd709',
      heading: mode === 'zen' ? 'Zen Complete' : 'Time\'s Up!',
      headingGradient: 'linear-gradient(135deg, #ffd709, #ff9f4a)',
      topGlow: 'linear-gradient(to right, transparent, #ffd709, transparent)',
      isWin: true,
    };
  }

  // Bomb killed the player in Classic
  if (reason === 'bomb') {
    return {
      icon: Bomb,
      iconBg: 'rgba(255,50,50,0.12)',
      iconBorder: 'rgba(255,50,50,0.28)',
      iconGlow: 'rgba(255,50,50,0.18)',
      iconColor: '#ff7162',
      heading: 'KABOOM!',
      headingGradient: 'linear-gradient(135deg, #ff7162, #ff9f4a)',
      topGlow: 'linear-gradient(to right, transparent, #ff7162, transparent)',
      isWin: false,
    };
  }

  // Default: lives ran out
  return {
    icon: Skull,
    iconBg: 'rgba(255,60,60,0.12)',
    iconBorder: 'rgba(255,60,60,0.22)',
    iconGlow: 'rgba(255,60,60,0.15)',
    iconColor: '#ff7162',
    heading: 'Game Over',
    headingGradient: 'linear-gradient(135deg, #ff9f4a, #ffd709)',
    topGlow: 'linear-gradient(to right, transparent, #ff9f4a, transparent)',
    isWin: false,
  };
}

export function GameOverMenu() {
  const {
    score,
    mode,
    endReason,
    bestScoreClassic,
    bestScoreArcade,
    bestScoreZen,
    fruitsSliced,
    bombsDodged,
    sliceMisses,
    resetGame,
    setStatus,
  } = useGameStore();

  const { sessionUnlocks, clearSessionUnlocks, checkAndUnlock } = useAchievementStore();

  const bestScore =
    mode === 'classic' ? bestScoreClassic :
    mode === 'arcade'  ? bestScoreArcade  : bestScoreZen;

  const total = fruitsSliced + sliceMisses;
  const accuracy = total > 0 ? Math.round((fruitsSliced / total) * 100) : 100;
  const isNewBest = score >= bestScore && score > 0;

  const end = resolveEndState(mode, endReason);
  const EndIcon = end.icon;

  // End-game achievement check (precision, flawless, zen_master, etc.)
  useEffect(() => {
    const state = useGameStore.getState();
    checkAndUnlock({
      fruitsSliced: state.fruitsSliced,
      bombsDodged: state.bombsDodged,
      sliceMisses: state.sliceMisses,
      maxCombo: state.maxCombo,
      score: state.score,
      mode: state.mode,
      timeLeft: state.timeLeft,
      sessionStartTime: state.sessionStartTime,
    });

    return () => {
      clearSessionUnlocks();
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
          className="relative z-10 flex flex-col items-center w-full max-w-sm mx-4 rounded-3xl py-8 px-6"
          style={{
            background: 'rgba(12, 12, 12, 0.97)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: `0 0 60px ${end.iconGlow}, 0 24px 64px rgba(0,0,0,0.7)`,
          }}
        >
          {/* Top glow accent — color-matched per end state */}
          <div
            className="absolute top-0 left-1/4 right-1/4 h-px rounded-full"
            style={{ background: end.topGlow }}
          />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: end.iconBg,
                border: `1px solid ${end.iconBorder}`,
                boxShadow: `0 0 24px ${end.iconGlow}`,
              }}
            >
              <EndIcon size={28} strokeWidth={1.6} style={{ color: end.iconColor }} />
            </div>
            <h1
              className="text-3xl font-black uppercase tracking-widest"
              style={{
                background: end.headingGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {end.heading}
            </h1>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 280 }}
            className="mt-5 text-center"
          >
            <div
              className="text-7xl font-black tabular-nums"
              style={{ textShadow: '0 0 32px rgba(255,159,74,0.45)' }}
            >
              {score}
            </div>
            {isNewBest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mt-2 flex items-center justify-center gap-1.5"
              >
                <Star size={13} strokeWidth={2} style={{ color: '#ffd709' }} fill="#ffd709" />
                <span
                  className="text-sm font-black uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, #ffd709, #ff9f4a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  New Best Score
                </span>
                <Star size={13} strokeWidth={2} style={{ color: '#ffd709' }} fill="#ffd709" />
              </motion.div>
            )}
            {!isNewBest && bestScore > 0 && (
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a4a4a' }}>
                Best: {bestScore}
              </div>
            )}
          </motion.div>

          {/* ── Session Stats Row ── */}
          <motion.div
            className="flex gap-2.5 w-full mt-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <StatCard icon={Swords} iconColor="#ff9f4a" label="Sliced" value={String(fruitsSliced)} />
            {mode === 'zen' ? (
              <StatCard icon={Leaf} iconColor="#4ade80" label="No Bombs" value="Zen" />
            ) : mode === 'arcade' ? (
              <StatCard icon={Timer} iconColor="#38bdf8" label="Mode" value="Arcade" />
            ) : (
              <StatCard icon={Bomb} iconColor="#ff7162" label="Dodged" value={String(bombsDodged)} />
            )}
            <StatCard icon={Target} iconColor="#38bdf8" label="Accuracy" value={`${accuracy}%`} />
          </motion.div>

          {/* ── This-session Achievement Unlocks ── */}
          <AnimatePresence>
            {sessionUnlocks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="w-full mt-5"
              >
                <p
                  className="text-center text-xs uppercase tracking-widest font-black mb-2.5"
                  style={{ color: '#4a4a4a', letterSpacing: '0.1em' }}
                >
                  Achievements Unlocked
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {sessionUnlocks.map((a, i) => {
                    const meta = ACHIEVEMENT_META[a.id];
                    const AIcon = meta?.icon;
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ scale: 0, rotate: -6 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.6 + i * 0.09,
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: `${meta?.color ?? '#ff9f4a'}12`,
                          border: `1px solid ${meta?.color ?? '#ff9f4a'}30`,
                        }}
                      >
                        {AIcon && (
                          <AIcon size={13} strokeWidth={2} style={{ color: meta.color }} />
                        )}
                        <span className="text-white font-bold text-xs">{a.title}</span>
                        <Check size={11} strokeWidth={3} style={{ color: '#4ade80' }} />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action Buttons ── */}
          <motion.div
            className="flex flex-col gap-3 w-full mt-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <button
              id="game-over-try-again"
              onClick={resetGame}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest text-white transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ff9f4a 0%, #ff7c26 100%)',
                boxShadow: '0 0 24px rgba(255,159,74,0.38)',
                letterSpacing: '0.08em',
              }}
            >
              {end.isWin ? 'Play Again' : 'Try Again'}
            </button>

            <button
              id="game-over-main-menu"
              onClick={() => setStatus('menu')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#7a7a7a',
                letterSpacing: '0.08em',
              }}
            >
              Main Menu
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

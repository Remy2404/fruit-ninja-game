'use client';

import { motion } from 'framer-motion';
import { useGameStore, GameMode } from '../../store/useGameStore';

const MODES: {
  id: GameMode;
  title: string;
  desc: string;
  detail: string;
  gradient: string;
  glow: string;
  border: string;
  bestKey: 'bestScoreClassic' | 'bestScoreArcade' | 'bestScoreZen';
  badge: string;
}[] = [
  {
    id: 'classic',
    title: 'CLASSIC',
    desc: '3 Lives. Bomb = Game Over.',
    detail: 'The original experience.',
    gradient: 'from-red-600 to-orange-600',
    glow: 'rgba(255,60,0,0.4)',
    border: 'border-red-500/40 hover:border-red-400',
    bestKey: 'bestScoreClassic',
    badge: 'bg-red-500/15 text-red-400',
  },
  {
    id: 'arcade',
    title: 'ARCADE',
    desc: '60 sec. Bombs = -10 pts.',
    detail: 'Fast-paced scoring frenzy.',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(0,200,255,0.4)',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bestKey: 'bestScoreArcade',
    badge: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    id: 'zen',
    title: 'ZEN',
    desc: '90 sec. No bombs.',
    detail: 'Pure slicing relaxation.',
    gradient: 'from-green-500 to-emerald-600',
    glow: 'rgba(0,220,100,0.4)',
    border: 'border-green-500/40 hover:border-green-400',
    bestKey: 'bestScoreZen',
    badge: 'bg-green-500/15 text-green-400',
  },
];

export function MainMenu() {
  const store = useGameStore();
  const { resetGame, setMode } = store;

  const handleStart = (mode: GameMode) => {
    setMode(mode);
    resetGame();
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-black/70 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
        className="text-center mb-10 md:mb-14"
      >
        <h1
          className="text-6xl sm:text-7xl md:text-8xl font-black italic tracking-tighter bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 text-transparent bg-clip-text"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(255,100,0,0.5))',
          }}
        >
          FRUIT NINJA
        </h1>
        <p className="text-base md:text-lg mt-2 text-zinc-400 font-bold tracking-[0.3em] uppercase">
          Web Edition
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-5xl px-4 w-full"
      >
        {MODES.map((m, idx) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.08 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleStart(m.id)}
            className={`
              group relative flex-1 overflow-hidden rounded-2xl md:rounded-3xl
              bg-zinc-900/80 border-2 ${m.border}
              p-6 md:p-8 text-left transition-all
              hover:bg-zinc-800/90
            `}
            style={{
              boxShadow: `0 0 0px ${m.glow}`,
              transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${m.glow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0px ${m.glow}`;
            }}
          >
            <div
              className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${m.gradient} opacity-60`}
            />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              {m.title}
            </h2>
            <p className="text-sm text-zinc-400 font-medium">{m.desc}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{m.detail}</p>
            <div
              className={`mt-4 text-xs font-bold ${m.badge} inline-block px-3 py-1 rounded-full`}
            >
              BEST: {store[m.bestKey]}
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-xs text-zinc-500 tracking-wider"
      >
        Swipe to slice · Click and drag on desktop
      </motion.p>
    </motion.div>
  );
}

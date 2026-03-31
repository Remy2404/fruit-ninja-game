'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { RotateCcw, Home, Trophy } from 'lucide-react';

export function GameOverMenu() {
  const {
    score,
    maxCombo,
    mode,
    bestScoreClassic,
    bestScoreArcade,
    bestScoreZen,
    resetGame,
    setStatus,
  } = useGameStore();

  const bestScore =
    mode === 'classic'
      ? bestScoreClassic
      : mode === 'arcade'
        ? bestScoreArcade
        : bestScoreZen;

  const isNewBest = score >= bestScore && score > 0;

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-red-950/90 to-black/90 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: -50, scale: 0.7 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
        className="text-center"
      >
        <h1
          className="text-6xl md:text-8xl font-black italic tracking-tighter text-red-500"
          style={{ textShadow: '0 0 40px rgba(255,0,0,0.6)' }}
        >
          GAME OVER
        </h1>

        {isNewBest && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center justify-center gap-2 mt-3"
          >
            <Trophy size={24} className="text-yellow-400" />
            <span className="text-yellow-400 font-black text-lg tracking-wider uppercase">
              New Best Score!
            </span>
            <Trophy size={24} className="text-yellow-400" />
          </motion.div>
        )}

        <p className="text-xl mt-6 text-red-200/80 font-bold uppercase tracking-widest">
          Final Score
        </p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
          className="text-7xl md:text-[120px] font-black text-white mt-2"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          {score}
        </motion.div>

        {maxCombo > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base text-orange-300/80 font-bold mt-2"
          >
            Best Combo: {maxCombo}x
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 md:gap-6 mt-12 md:mt-16"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="flex items-center gap-3 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-lg md:text-xl transition-colors"
          style={{ boxShadow: '0 0 30px rgba(255,0,0,0.3)' }}
        >
          <RotateCcw size={24} />
          TRY AGAIN
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStatus('menu')}
          className="flex items-center gap-3 px-7 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-lg md:text-xl border border-white/10 transition-colors"
        >
          <Home size={24} />
          MENU
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

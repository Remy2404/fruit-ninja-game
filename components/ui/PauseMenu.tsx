'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Play, RotateCcw, Home } from 'lucide-react';

export function PauseMenu() {
  const { setStatus, resetGame } = useGameStore();

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-black/85 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: -40, scale: 0.85 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1
          className="text-6xl md:text-8xl font-black italic tracking-tighter text-white"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}
        >
          PAUSED
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-xs px-6"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setStatus('playing')}
          className="flex items-center justify-center gap-3 w-full py-4 bg-white hover:bg-zinc-100 text-black rounded-full font-black text-xl transition-colors"
        >
          <Play size={24} />
          RESUME
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={resetGame}
          className="flex items-center justify-center gap-3 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-lg border border-white/10 transition-colors"
        >
          <RotateCcw size={20} />
          RESTART
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setStatus('menu')}
          className="flex items-center justify-center gap-3 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-lg border border-white/10 transition-colors"
        >
          <Home size={20} />
          MAIN MENU
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

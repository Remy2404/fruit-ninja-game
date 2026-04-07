'use client';

import { motion } from 'framer-motion';
import { getModeConfigs } from '../../game/config/ModeConfig';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export function MainMenu() {
  const { resetGame, setMode, bestScores } = useGameStore(
    useShallow((state) => ({
      resetGame: state.resetGame,
      setMode: state.setMode,
      bestScores: state.bestScores,
    })),
  );

  const modes = getModeConfigs();

  return (
    <motion.div
      className="flex flex-col items-center justify-start overflow-y-auto h-full w-full bg-black/70 backdrop-blur-lg pt-12 pb-24"
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
          style={{ filter: 'drop-shadow(0 0 30px rgba(255,100,0,0.5))' }}
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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 max-w-7xl px-4 w-full"
      >
        {modes.map((modeConfig, index) => (
          <motion.button
            key={modeConfig.id}
            id={`menu-card-${modeConfig.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMode(modeConfig.id);
              resetGame();
            }}
            className={`
              group relative overflow-hidden rounded-2xl md:rounded-3xl
              bg-zinc-900/80 border-2 ${modeConfig.presentation.border}
              p-6 md:p-8 text-left transition-all
              hover:bg-zinc-800/90
            `}
            style={{
              boxShadow: `0 0 0px ${modeConfig.presentation.glow}`,
              transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.boxShadow = `0 0 40px ${modeConfig.presentation.glow}`;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = `0 0 0px ${modeConfig.presentation.glow}`;
            }}
          >
            <div
              className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${modeConfig.presentation.gradient} opacity-60`}
            />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              {modeConfig.presentation.menuTitle}
            </h2>
            <p className="text-sm text-zinc-400 font-medium">{modeConfig.presentation.description}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{modeConfig.presentation.detail}</p>
            <div
              className={`mt-4 text-xs font-bold ${modeConfig.presentation.badge} inline-block px-3 py-1 rounded-full`}
            >
              BEST: {bestScores[modeConfig.id]}
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

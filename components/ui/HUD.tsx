'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function HUD() {
  const { score, lives, mode, timeLeft, soundEnabled, toggleSound, setStatus, setTimeLeft } =
    useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <div className="flex flex-row justify-between w-full p-4 md:p-6 text-white pointer-events-none">
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

        {mode === 'classic' && (
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: Math.max(lives, 3) }, (_, i) => i + 1).map(
              (i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    opacity: i > lives ? 0.15 : 1,
                  }}
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
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

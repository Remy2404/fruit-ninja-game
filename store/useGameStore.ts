import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameMode = 'classic' | 'arcade' | 'zen';

export interface GameStore {
  status: GameState;
  mode: GameMode;
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;

  // Session stats (reset each game, not persisted)
  fruitsSliced: number;
  bombsDodged: number;
  sliceMisses: number;
  sessionStartTime: number;

  // Streak multiplier (reset each game, not persisted)
  streakCount: number;
  streakMultiplier: number;
  lastSliceTime: number;

  soundEnabled: boolean;
  musicEnabled: boolean;

  bestScoreClassic: number;
  bestScoreArcade: number;
  bestScoreZen: number;

  setStatus: (status: GameState) => void;
  setMode: (mode: GameMode) => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  setCombo: (count: number) => void;
  setTimeLeft: (time: number) => void;
  resetGame: () => void;

  recordSlice: () => number;
  recordMiss: () => void;
  recordBombDodged: () => void;
  resetStreak: () => void;

  toggleSound: () => void;
  toggleMusic: () => void;

  endGame: () => void;
}

const MODE_TIME_LIMITS: Record<GameMode, number> = {
  classic: 0,
  arcade: 60,
  zen: 90,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      status: 'menu',
      mode: 'classic',
      score: 0,
      lives: 3,
      combo: 0,
      maxCombo: 0,
      timeLeft: 0,

      fruitsSliced: 0,
      bombsDodged: 0,
      sliceMisses: 0,
      sessionStartTime: 0,

      streakCount: 0,
      streakMultiplier: 1,
      lastSliceTime: 0,

      soundEnabled: true,
      musicEnabled: true,

      bestScoreClassic: 0,
      bestScoreArcade: 0,
      bestScoreZen: 0,

      setStatus: (status) => set({ status }),
      setMode: (mode) => set({ mode }),

      addScore: (points) => {
        const state = get();
        const prevScore = state.score;
        const newScore = Math.max(0, prevScore + points);

        const updates: Partial<GameStore> = { score: newScore };

        if (state.mode === 'classic' && points > 0) {
          const prevMilestone = Math.floor(prevScore / 100);
          const newMilestone = Math.floor(newScore / 100);
          if (newMilestone > prevMilestone) {
            updates.lives = Math.min(state.lives + 1, 5);
          }
        }

        set(updates);
      },

      loseLife: () => {
        set((state) => {
          const newLives = state.lives - 1;
          if (newLives <= 0) {
            setTimeout(() => get().endGame(), 0);
            return { lives: 0 };
          }
          return { lives: newLives };
        });
      },

      setCombo: (count) => {
        set((state) => ({
          combo: count,
          maxCombo: Math.max(state.maxCombo, count),
        }));
      },

      setTimeLeft: (time) => {
        set({ timeLeft: time });
        if (time <= 0) {
          const state = get();
          if (
            state.status === 'playing' &&
            (state.mode === 'arcade' || state.mode === 'zen')
          ) {
            state.endGame();
          }
        }
      },

      recordSlice: () => {
        const now = Date.now();
        const state = get();
        const withinWindow = now - state.lastSliceTime < 3000;
        const newStreak = withinWindow ? state.streakCount + 1 : 1;
        const multiplier: number =
          newStreak >= 8 ? 3 :
          newStreak >= 5 ? 2 :
          newStreak >= 3 ? 1.5 : 1;

        set({
          fruitsSliced: state.fruitsSliced + 1,
          streakCount: newStreak,
          streakMultiplier: multiplier,
          lastSliceTime: now,
        });

        return multiplier;
      },

      recordMiss: () => set((state) => ({ sliceMisses: state.sliceMisses + 1 })),

      recordBombDodged: () => set((state) => ({ bombsDodged: state.bombsDodged + 1 })),

      resetStreak: () => set({ streakCount: 0, streakMultiplier: 1 }),

      resetGame: () => {
        const mode = get().mode;
        set({
          status: 'playing',
          score: 0,
          lives: mode === 'classic' ? 3 : 0,
          combo: 0,
          maxCombo: 0,
          timeLeft: MODE_TIME_LIMITS[mode],
          fruitsSliced: 0,
          bombsDodged: 0,
          sliceMisses: 0,
          sessionStartTime: Date.now(),
          streakCount: 0,
          streakMultiplier: 1,
          lastSliceTime: 0,
        });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),

      endGame: () => {
        const state = get();
        const updates: Partial<GameStore> = { status: 'gameover' };

        if (state.mode === 'classic' && state.score > state.bestScoreClassic) {
          updates.bestScoreClassic = state.score;
        } else if (state.mode === 'arcade' && state.score > state.bestScoreArcade) {
          updates.bestScoreArcade = state.score;
        } else if (state.mode === 'zen' && state.score > state.bestScoreZen) {
          updates.bestScoreZen = state.score;
        }

        set(updates);
      },
    }),
    {
      name: 'fruit-ninja-storage',
      partialize: (state) => ({
        bestScoreClassic: state.bestScoreClassic,
        bestScoreArcade: state.bestScoreArcade,
        bestScoreZen: state.bestScoreZen,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
      }),
    },
  ),
);

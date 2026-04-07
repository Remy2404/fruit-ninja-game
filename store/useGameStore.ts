import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getModeConfig } from '../game/config/ModeConfig';
import { getThemeModeMapping } from '../game/config/ThemeConfig';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameMode = 'classic' | 'arcade' | 'zen' | 'songkran';
export type GameEndReason = 'lives' | 'bomb' | 'timeout';

export interface GameStore {
  status: GameState;
  mode: GameMode;
  themeId: string;
  endReason: GameEndReason;
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;

  fruitsSliced: number;
  bombsDodged: number;
  sliceMisses: number;
  sessionStartTime: number;

  streakCount: number;
  streakMultiplier: number;
  lastSliceTime: number;

  soundEnabled: boolean;
  musicEnabled: boolean;

  bestScoreClassic: number;
  bestScoreArcade: number;
  bestScoreZen: number;
  bestScoreSongkran: number;

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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      status: 'menu',
      mode: 'classic',
      themeId: 'default',
      endReason: 'timeout' as GameEndReason,
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
      bestScoreSongkran: 0,

      setStatus: (status) => set({ status }),
      setMode: (mode) => set({ mode, themeId: getThemeModeMapping(mode) }),

      addScore: (points) => {
        const state = get();
        const prevScore = state.score;
        const newScore = Math.max(0, prevScore + points);

        const updates: Partial<GameStore> = { score: newScore };

        const modeConfig = getModeConfig(state.mode);
        if (modeConfig.missCostsLife && points > 0) {
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
            setTimeout(() => {
              set({ endReason: 'lives' });
              get().endGame();
            }, 0);
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
          const modeConfig = getModeConfig(state.mode);
          if (state.status === 'playing' && modeConfig.timerSeconds > 0) {
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
        const modeConfig = getModeConfig(mode);
        set({
          status: 'playing',
          score: 0,
          lives: modeConfig.lives,
          combo: 0,
          maxCombo: 0,
          timeLeft: modeConfig.timerSeconds,
          fruitsSliced: 0,
          bombsDodged: 0,
          sliceMisses: 0,
          sessionStartTime: Date.now(),
          streakCount: 0,
          streakMultiplier: 1,
          lastSliceTime: 0,
          endReason: 'timeout',
        });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),

      endGame: () => {
        const state = get();
        const updates: Partial<GameStore> = { status: 'gameover' };

        if (state.endReason !== 'lives' && state.endReason !== 'bomb') {
          const modeConfig = getModeConfig(state.mode);
          updates.endReason =
            modeConfig.lives > 0 ? 'lives' : 'timeout';
        }

        if (state.mode === 'classic' && state.score > state.bestScoreClassic) {
          updates.bestScoreClassic = state.score;
        } else if (state.mode === 'arcade' && state.score > state.bestScoreArcade) {
          updates.bestScoreArcade = state.score;
        } else if (state.mode === 'zen' && state.score > state.bestScoreZen) {
          updates.bestScoreZen = state.score;
        } else if (state.mode === 'songkran' && state.score > state.bestScoreSongkran) {
          updates.bestScoreSongkran = state.score;
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
        bestScoreSongkran: state.bestScoreSongkran,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
      }),
    },
  ),
);

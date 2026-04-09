import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { MODE_ORDER, getModeConfig } from '../game/config/ModeConfig';
import { getThemeModeMapping } from '../game/config/ThemeConfig';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameMode =
  | 'classic'
  | 'arcade'
  | 'zen'
  | 'songkran'
  | 'frenzy'
  | 'risk'
  | 'memory'
  | 'combo_master'
  | 'tsunami'
  | 'precision'
  | 'chaos'
  | 'time_freeze';
export type GameEndReason = 'lives' | 'bomb' | 'timeout';

const STREAK_WINDOW_MS = 3000;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const createBestScores = (): Record<GameMode, number> =>
  MODE_ORDER.reduce(
    (scores, mode) => {
      scores[mode] = 0;
      return scores;
    },
    {} as Record<GameMode, number>,
  );

export function isGameMode(value: string): value is GameMode {
  return MODE_ORDER.includes(value as GameMode);
}

export interface GameStore {
  status: GameState;
  mode: GameMode;
  themeId: string;
  endReason: GameEndReason;
  score: number;
  lives: number;
  maxCombo: number;
  timeLeft: number;

  energy: number;
  timeScale: number;
  isEnergyActive: boolean;

  fruitsSliced: number;
  bombsDodged: number;
  fruitsMissed: number;
  sessionStartTime: number;

  streakCount: number;
  streakMultiplier: number;
  lastSliceTime: number;

  soundEnabled: boolean;
  bestScores: Record<GameMode, number>;

  setStatus: (status: GameState) => void;
  setMode: (mode: GameMode) => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  registerCombo: (count: number) => void;
  advanceTimer: (deltaSeconds: number) => void;
  resetGame: () => void;

  decreaseEnergy: (amount: number) => void;
  increaseEnergy: (amount: number) => void;
  setTimeScale: (value: number) => void;
  setIsEnergyActive: (active: boolean) => void;

  recordSlice: () => number;
  recordFruitMissed: () => void;
  recordBombDodged: () => void;
  resetStreak: () => void;

  toggleSound: () => void;
  endGame: (reason?: GameEndReason) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      status: 'menu',
      mode: 'classic',
      themeId: 'default',
      endReason: 'timeout',
      score: 0,
      lives: 3,
      maxCombo: 0,
      timeLeft: 0,

      energy: 100,
      timeScale: 1,
      isEnergyActive: false,

      fruitsSliced: 0,
      bombsDodged: 0,
      fruitsMissed: 0,
      sessionStartTime: 0,

      streakCount: 0,
      streakMultiplier: 1,
      lastSliceTime: 0,

      soundEnabled: true,
      bestScores: createBestScores(),

      setStatus: (status) => set({ status }),
      setMode: (mode) => set({ mode, themeId: getThemeModeMapping(mode) }),

      addScore: (points) => {
        const state = get();
        const previousScore = state.score;
        const nextScore = Math.max(0, previousScore + points);
        const modeConfig = getModeConfig(state.mode);
        const updates: Partial<GameStore> = { score: nextScore };

        const extraLifeEvery = modeConfig.scoring.extraLifeEveryScore;
        if (extraLifeEvery && points > 0) {
          const previousMilestone = Math.floor(previousScore / extraLifeEvery);
          const nextMilestone = Math.floor(nextScore / extraLifeEvery);
          if (nextMilestone > previousMilestone) {
            updates.lives = Math.min(state.lives + 1, modeConfig.scoring.maxLives);
          }
        }

        set(updates);
      },

      loseLife: () => {
        const state = get();
        if (state.status !== 'playing' || state.lives <= 0) return;

        const nextLives = Math.max(0, state.lives - 1);
        set({ lives: nextLives });
        if (nextLives === 0) {
          get().endGame('lives');
        }
      },

      registerCombo: (count) =>
        set((state) => ({
          maxCombo: Math.max(state.maxCombo, count),
        })),

      advanceTimer: (deltaSeconds) => {
        const state = get();
        const modeConfig = getModeConfig(state.mode);
        if (
          state.status !== 'playing' ||
          modeConfig.timerSeconds <= 0 ||
          deltaSeconds <= 0
        ) {
          return;
        }

        const nextTimeLeft = Math.max(0, state.timeLeft - deltaSeconds);
        set({ timeLeft: nextTimeLeft });
        if (nextTimeLeft <= 0) {
          get().endGame('timeout');
        }
      },

      decreaseEnergy: (amount) =>
        set((state) => ({ energy: Math.max(0, state.energy - amount) })),

      increaseEnergy: (amount) => {
        const maxEnergy = getModeConfig(get().mode).timeControl.energyMax;
        set((state) => ({ energy: Math.min(maxEnergy, state.energy + amount) }));
      },

      setTimeScale: (value) => set({ timeScale: value }),
      setIsEnergyActive: (active) => set({ isEnergyActive: active }),

      recordSlice: () => {
        const now = Date.now();
        const state = get();
        const withinWindow = now - state.lastSliceTime < STREAK_WINDOW_MS;
        const nextStreak = withinWindow ? state.streakCount + 1 : 1;
        const streakMultiplier =
          nextStreak >= 8 ? 3 : nextStreak >= 5 ? 2 : nextStreak >= 3 ? 1.5 : 1;

        set({
          fruitsSliced: state.fruitsSliced + 1,
          streakCount: nextStreak,
          streakMultiplier,
          lastSliceTime: now,
        });

        return streakMultiplier;
      },

      recordFruitMissed: () =>
        set((state) => ({ fruitsMissed: state.fruitsMissed + 1 })),

      recordBombDodged: () =>
        set((state) => ({ bombsDodged: state.bombsDodged + 1 })),

      resetStreak: () => set({ streakCount: 0, streakMultiplier: 1 }),

      resetGame: () => {
        const mode = get().mode;
        const modeConfig = getModeConfig(mode);
        set({
          status: 'playing',
          score: 0,
          lives: modeConfig.startingLives,
          maxCombo: 0,
          timeLeft: modeConfig.timerSeconds,
          energy: modeConfig.timeControl.energyMax,
          timeScale: 1,
          isEnergyActive: false,
          fruitsSliced: 0,
          bombsDodged: 0,
          fruitsMissed: 0,
          sessionStartTime: Date.now(),
          streakCount: 0,
          streakMultiplier: 1,
          lastSliceTime: 0,
          endReason: modeConfig.timerSeconds > 0 ? 'timeout' : 'lives',
        });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      endGame: (reason) => {
        const state = get();
        if (state.status === 'gameover') return;

        const resolvedReason =
          reason ??
          (getModeConfig(state.mode).timerSeconds > 0 ? 'timeout' : 'lives');
        const previousBest = state.bestScores[state.mode];
        const bestScores =
          state.score > previousBest
            ? { ...state.bestScores, [state.mode]: state.score }
            : state.bestScores;

        set({
          status: 'gameover',
          endReason: resolvedReason,
          bestScores,
          isEnergyActive: false,
          timeScale: 1,
        });
      },
    }),
    {
      name: 'fruit-ninja-storage',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : window.localStorage,
      ),
      partialize: (state) => ({
        bestScores: state.bestScores,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);

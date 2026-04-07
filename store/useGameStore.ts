import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getModeConfig } from '../game/config/ModeConfig';
import { getThemeModeMapping } from '../game/config/ThemeConfig';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameMode = 'classic' | 'arcade' | 'zen' | 'songkran' | 'frenzy' | 'risk' | 'memory' | 'combo_master' | 'tsunami' | 'precision' | 'chaos' | 'time_freeze';
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

  energy: number;
  timeScale: number;
  isEnergyActive: boolean;

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
  bestScoreFrenzy: number;
  bestScoreRisk: number;
  bestScoreMemory: number;
  bestScoreComboMaster: number;
  bestScoreTsunami: number;
  bestScorePrecision: number;
  bestScoreChaos: number;
  bestScoreTimeFreeze: number;

  setStatus: (status: GameState) => void;
  setMode: (mode: GameMode) => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  setCombo: (count: number) => void;
  setTimeLeft: (time: number) => void;
  resetGame: () => void;

  decreaseEnergy: (amount: number) => void;
  increaseEnergy: (amount: number) => void;
  setTimeScale: (value: number) => void;
  setIsEnergyActive: (active: boolean) => void;

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

      energy: 100,
      timeScale: 1.0,
      isEnergyActive: false,

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
      bestScoreFrenzy: 0,
      bestScoreRisk: 0,
      bestScoreMemory: 0,
      bestScoreComboMaster: 0,
      bestScoreTsunami: 0,
      bestScorePrecision: 0,
      bestScoreChaos: 0,
      bestScoreTimeFreeze: 0,

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

      decreaseEnergy: (amount) => {
        set((state) => ({ energy: Math.max(0, state.energy - amount) }));
      },

      increaseEnergy: (amount) => {
        set((state) => ({ energy: Math.min(100, state.energy + amount) }));
      },

      setTimeScale: (value) => {
        set({ timeScale: value });
      },

      setIsEnergyActive: (active) => {
        set({ isEnergyActive: active });
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
          energy: 100,
          timeScale: 1.0,
          isEnergyActive: false,
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
        } else if (state.mode === 'frenzy' && state.score > state.bestScoreFrenzy) {
          updates.bestScoreFrenzy = state.score;
        } else if (state.mode === 'risk' && state.score > state.bestScoreRisk) {
          updates.bestScoreRisk = state.score;
        } else if (state.mode === 'memory' && state.score > state.bestScoreMemory) {
          updates.bestScoreMemory = state.score;
        } else if (state.mode === 'combo_master' && state.score > state.bestScoreComboMaster) {
          updates.bestScoreComboMaster = state.score;
        } else if (state.mode === 'tsunami' && state.score > state.bestScoreTsunami) {
          updates.bestScoreTsunami = state.score;
        } else if (state.mode === 'precision' && state.score > state.bestScorePrecision) {
          updates.bestScorePrecision = state.score;
        } else if (state.mode === 'chaos' && state.score > state.bestScoreChaos) {
          updates.bestScoreChaos = state.score;
        } else if (state.mode === 'time_freeze' && state.score > state.bestScoreTimeFreeze) {
          updates.bestScoreTimeFreeze = state.score;
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
        bestScoreFrenzy: state.bestScoreFrenzy,
        bestScoreRisk: state.bestScoreRisk,
        bestScoreMemory: state.bestScoreMemory,
        bestScoreComboMaster: state.bestScoreComboMaster,
        bestScoreTsunami: state.bestScoreTsunami,
        bestScorePrecision: state.bestScorePrecision,
        bestScoreChaos: state.bestScoreChaos,
        bestScoreTimeFreeze: state.bestScoreTimeFreeze,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
      }),
    },
  ),
);

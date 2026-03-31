import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface CheckStats {
  fruitsSliced: number;
  bombsDodged: number;
  sliceMisses: number;
  maxCombo: number;
  score: number;
  mode: string;
  timeLeft: number;
  sessionStartTime: number;
}

const DEFINITIONS: Achievement[] = [
  { id: 'first_slice',    title: 'First Cut',      description: 'Slice your first fruit'              },
  { id: 'combo_initiate', title: 'Combo Initiate', description: 'Achieve a 3x combo in one stroke'   },
  { id: 'combo_maniac',   title: 'Combo Maniac',   description: 'Achieve a 7x combo in one stroke'   },
  { id: 'fruit_veteran',  title: 'Fruit Veteran',  description: 'Slice 25 fruits in one game'         },
  { id: 'century',        title: 'Century',        description: 'Score 100 points in a single game'   },
  { id: 'bomb_dodger',    title: 'Bomb Dodger',    description: 'Let 5 bombs fall safely in one game' },
  { id: 'precision',      title: 'Precision',      description: 'Finish with 80%+ slicing accuracy'   },
  { id: 'flawless',       title: 'Flawless',       description: 'Classic: finish with zero misses'    },
  { id: 'speed_demon',    title: 'Speed Demon',    description: 'Score 50pts in Arcade within 30s'    },
  { id: 'zen_master',     title: 'Zen Master',     description: 'Score 100pts in Zen mode'            },
];

function evaluate(id: string, stats: CheckStats): boolean {
  const total = stats.fruitsSliced + stats.sliceMisses;
  const accuracy = total > 0 ? (stats.fruitsSliced / total) * 100 : 100;
  const elapsedSec = (Date.now() - stats.sessionStartTime) / 1000;

  switch (id) {
    case 'first_slice':    return stats.fruitsSliced >= 1;
    case 'combo_initiate': return stats.maxCombo >= 3;
    case 'combo_maniac':   return stats.maxCombo >= 7;
    case 'fruit_veteran':  return stats.fruitsSliced >= 25;
    case 'century':        return stats.score >= 100;
    case 'bomb_dodger':    return stats.bombsDodged >= 5;
    case 'precision':      return accuracy >= 80 && stats.fruitsSliced >= 10;
    case 'flawless':       return stats.mode === 'classic' && stats.sliceMisses === 0 && stats.fruitsSliced >= 5;
    case 'speed_demon':    return stats.mode === 'arcade' && stats.score >= 50 && elapsedSec <= 30;
    case 'zen_master':     return stats.mode === 'zen' && stats.score >= 100;
    default:               return false;
  }
}

export interface AchievementStore {
  unlockedIds: Record<string, boolean>;
  toastQueue: Achievement[];
  sessionUnlocks: Achievement[];

  checkAndUnlock: (stats: CheckStats) => void;
  popToast: () => void;
  clearSessionUnlocks: () => void;
  resetSession: () => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlockedIds: {},
      toastQueue: [],
      sessionUnlocks: [],

      checkAndUnlock: (stats) => {
        const { unlockedIds } = get();
        const newlyUnlocked: Achievement[] = [];

        for (const def of DEFINITIONS) {
          if (unlockedIds[def.id]) continue;
          if (evaluate(def.id, stats)) {
            newlyUnlocked.push(def);
          }
        }

        if (newlyUnlocked.length === 0) return;

        const updatedIds = { ...unlockedIds };
        newlyUnlocked.forEach((a) => { updatedIds[a.id] = true; });

        set((state) => ({
          unlockedIds: updatedIds,
          toastQueue: [...state.toastQueue, ...newlyUnlocked],
          sessionUnlocks: [...state.sessionUnlocks, ...newlyUnlocked],
        }));
      },

      popToast: () => set((state) => ({ toastQueue: state.toastQueue.slice(1) })),

      clearSessionUnlocks: () => set({ sessionUnlocks: [] }),

      resetSession: () => set({ toastQueue: [], sessionUnlocks: [] }),
    }),
    {
      name: 'fruit-ninja-achievements',
      partialize: (state) => ({ unlockedIds: state.unlockedIds }),
    },
  ),
);

import type { GameMode } from '../../store/useGameStore';

export interface ModeConfig {
  id: GameMode;
  title: string;
  lives: number;
  timerSeconds: number;
  bombEndsGame: boolean;
  missCostsLife: boolean;
  bombScorePenalty: number;
  spawnIntervalMs: number;
  allowBombs: boolean;
  scoreMultiplier: number;
}

const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  classic: {
    id: 'classic',
    title: 'CLASSIC',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1600,
    allowBombs: true,
    scoreMultiplier: 1,
  },
  arcade: {
    id: 'arcade',
    title: 'ARCADE',
    lives: 0,
    timerSeconds: 60,
    bombEndsGame: false,
    missCostsLife: false,
    bombScorePenalty: -10,
    spawnIntervalMs: 1600,
    allowBombs: true,
    scoreMultiplier: 1,
  },
  zen: {
    id: 'zen',
    title: 'ZEN',
    lives: 0,
    timerSeconds: 90,
    bombEndsGame: false,
    missCostsLife: false,
    bombScorePenalty: 0,
    spawnIntervalMs: 1600,
    allowBombs: false,
    scoreMultiplier: 1,
  },
  songkran: {
    id: 'songkran',
    title: 'SONGKRAN',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1400,
    allowBombs: true,
    scoreMultiplier: 1,
  },
};

export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

export { MODE_CONFIGS };

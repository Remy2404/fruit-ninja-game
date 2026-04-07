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
  enableWaveMotion?: boolean;
  enableComboOnly?: boolean;
  enablePrecisionScoring?: boolean;
  enableMemoryFade?: boolean;
  enableTimeControl?: boolean;
  enableRiskObjects?: boolean;
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
  frenzy: {
    id: 'frenzy',
    title: 'FRENZY',
    lives: 0,
    timerSeconds: 60,
    bombEndsGame: false,
    missCostsLife: false,
    bombScorePenalty: -10,
    spawnIntervalMs: 900,
    allowBombs: true,
    scoreMultiplier: 1.5,
  },
  risk: {
    id: 'risk',
    title: 'RISK',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1400,
    allowBombs: true,
    scoreMultiplier: 1,
    enableRiskObjects: true,
  },
  memory: {
    id: 'memory',
    title: 'MEMORY',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1600,
    allowBombs: true,
    scoreMultiplier: 1,
    enableMemoryFade: true,
  },
  combo_master: {
    id: 'combo_master',
    title: 'COMBO MASTER',
    lives: 0,
    timerSeconds: 60,
    bombEndsGame: false,
    missCostsLife: false,
    bombScorePenalty: -10,
    spawnIntervalMs: 1000,
    allowBombs: true,
    scoreMultiplier: 1,
    enableComboOnly: true,
  },
  tsunami: {
    id: 'tsunami',
    title: 'TSUNAMI',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1200,
    allowBombs: true,
    scoreMultiplier: 1,
    enableWaveMotion: true,
  },
  precision: {
    id: 'precision',
    title: 'PRECISION',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1600,
    allowBombs: true,
    scoreMultiplier: 1,
    enablePrecisionScoring: true,
  },
  chaos: {
    id: 'chaos',
    title: 'CHAOS',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 600,
    allowBombs: true,
    scoreMultiplier: 2,
  },
  time_freeze: {
    id: 'time_freeze',
    title: 'TIME FREEZE',
    lives: 3,
    timerSeconds: 0,
    bombEndsGame: true,
    missCostsLife: true,
    bombScorePenalty: 0,
    spawnIntervalMs: 1200,
    allowBombs: true,
    scoreMultiplier: 1,
    enableTimeControl: true,
  },
};

export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

export { MODE_CONFIGS };

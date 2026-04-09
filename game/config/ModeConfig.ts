import type { GameMode } from '../../store/useGameStore';
import type { ObjectSetId } from './ObjectConfig';

export interface ModePresentation {
  menuTitle: string;
  description: string;
  detail: string;
  gradient: string;
  glow: string;
  border: string;
  badge: string;
}

export interface SpawnRules {
  baseIntervalMs: number;
  minIntervalMs: number;
  scoreIntervalReduction: number;
  waveIntervalReduction: number;
  maxBombChance: number;
  baseBombChance: number;
  scoreBombChanceScale: number;
  waveBombChanceScale: number;
  maxGroupThresholds: Array<{ score: number; size: number }>;
  spreadWidthRatio: number;
  startXRatio: number;
  lateralVariance: number;
  targetHeightRange: [number, number];
  launchVelocityScaleRange: [number, number];
  objectSetId: ObjectSetId;
}

export interface BombRules {
  allow: boolean;
  endsGame: boolean;
  scorePenalty: number;
  radius: number;
}

export interface MissRules {
  costsLife: boolean;
}

export interface ScoringRules {
  modeMultiplier: number;
  criticalMultiplier: number;
  extraLifeEveryScore: number | null;
  maxLives: number;
}

export interface ComboRules {
  comboOnly: boolean;
  minSlices: number;
  resolveWindowMs: number;
  bonusPerFruit: number;
  comboOnlyBonusPerFruit: number;
}

export interface PrecisionRules {
  enabled: boolean;
  perfectDistancePx: number;
  centerRatio: number;
  edgeRatio: number;
  perfectMultiplier: number;
  centerMultiplier: number;
  edgeMultiplier: number;
}

export interface MemoryFadeRules {
  enabled: boolean;
  visibleMs: number;
  fadeDurationMs: number;
}

export interface WaveMotionRules {
  enabled: boolean;
  amplitude: number;
  frequency: number;
}

export interface TimeControlRules {
  enabled: boolean;
  energyMax: number;
  slowScale: number;
  drainPerSecond: number;
  rechargePerSecond: number;
}

export interface RiskRules {
  enabled: boolean;
  goldChance: number;
  cursedChance: number;
  goldBonus: number;
  cursedPenalty: number;
}

export interface ModeConfig {
  id: GameMode;
  title: string;
  presentation: ModePresentation;
  startingLives: number;
  timerSeconds: number;
  bombs: BombRules;
  misses: MissRules;
  scoring: ScoringRules;
  combo: ComboRules;
  precision: PrecisionRules;
  memoryFade: MemoryFadeRules;
  waveMotion: WaveMotionRules;
  timeControl: TimeControlRules;
  risk: RiskRules;
  spawn: SpawnRules;
}

interface ModeConfigOverrides {
  title: string;
  presentation: ModePresentation;
  startingLives: number;
  timerSeconds: number;
  bombs?: Partial<BombRules>;
  misses?: Partial<MissRules>;
  scoring?: Partial<ScoringRules>;
  combo?: Partial<ComboRules>;
  precision?: Partial<PrecisionRules>;
  memoryFade?: Partial<MemoryFadeRules>;
  waveMotion?: Partial<WaveMotionRules>;
  timeControl?: Partial<TimeControlRules>;
  risk?: Partial<RiskRules>;
  spawn?: Partial<SpawnRules>;
}

const DEFAULT_SPAWN_THRESHOLDS = [
  { score: 0, size: 2 },
  { score: 31, size: 3 },
  { score: 81, size: 4 },
  { score: 151, size: 5 },
  { score: 251, size: 6 },
];

function createModeConfig(
  id: GameMode,
  overrides: ModeConfigOverrides,
): ModeConfig {
  return {
    id,
    title: overrides.title,
    presentation: overrides.presentation,
    startingLives: overrides.startingLives,
    timerSeconds: overrides.timerSeconds,
    bombs: {
      allow: true,
      endsGame: true,
      scorePenalty: 0,
      radius: 38,
      ...overrides.bombs,
    },
    misses: {
      costsLife: true,
      ...overrides.misses,
    },
    scoring: {
      modeMultiplier: 1,
      criticalMultiplier: 5,
      extraLifeEveryScore: overrides.startingLives > 0 ? 100 : null,
      maxLives: 5,
      ...overrides.scoring,
    },
    combo: {
      comboOnly: false,
      minSlices: 3,
      resolveWindowMs: 250,
      bonusPerFruit: 2,
      comboOnlyBonusPerFruit: 5,
      ...overrides.combo,
    },
    precision: {
      enabled: false,
      perfectDistancePx: 15,
      centerRatio: 0.4,
      edgeRatio: 0.8,
      perfectMultiplier: 2.5,
      centerMultiplier: 1.5,
      edgeMultiplier: 0.5,
      ...overrides.precision,
    },
    memoryFade: {
      enabled: false,
      visibleMs: 500,
      fadeDurationMs: 300,
      ...overrides.memoryFade,
    },
    waveMotion: {
      enabled: false,
      amplitude: 3,
      frequency: 0.003,
      ...overrides.waveMotion,
    },
    timeControl: {
      enabled: false,
      energyMax: 100,
      slowScale: 0.3,
      drainPerSecond: 20,
      rechargePerSecond: 12,
      ...overrides.timeControl,
    },
    risk: {
      enabled: false,
      goldChance: 0.1,
      cursedChance: 0.15,
      goldBonus: 5,
      cursedPenalty: 10,
      ...overrides.risk,
    },
    spawn: {
      baseIntervalMs: 1600,
      minIntervalMs: 600,
      scoreIntervalReduction: 8,
      waveIntervalReduction: 3,
      maxBombChance: 0.25,
      baseBombChance: 0.15,
      scoreBombChanceScale: 0.001,
      // Slower ramp: hits maxBombChance at ~100 waves instead of ~50.
      waveBombChanceScale: 0.001,
      maxGroupThresholds: DEFAULT_SPAWN_THRESHOLDS,
      spreadWidthRatio: 0.6,
      startXRatio: 0.2,
      lateralVariance: 4,
      targetHeightRange: [0.6, 0.8],
      launchVelocityScaleRange: [0.75, 1],
      objectSetId: 'default',
      ...overrides.spawn,
    },
  };
}

const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  classic: createModeConfig('classic', {
    title: 'CLASSIC',
    presentation: {
      menuTitle: 'CLASSIC',
      description: '3 lives. Bomb = game over.',
      detail: 'The original experience.',
      gradient: 'from-red-600 to-orange-600',
      glow: 'rgba(255,60,0,0.4)',
      border: 'border-red-500/40 hover:border-red-400',
      badge: 'bg-red-500/15 text-red-400',
    },
    startingLives: 3,
    timerSeconds: 0,
  }),
  arcade: createModeConfig('arcade', {
    title: 'ARCADE',
    presentation: {
      menuTitle: 'ARCADE',
      description: '60 sec. Bombs = -10 pts.',
      detail: 'Fast-paced scoring frenzy.',
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'rgba(0,200,255,0.4)',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-400',
    },
    startingLives: 0,
    timerSeconds: 60,
    bombs: { endsGame: false, scorePenalty: -10 },
    misses: { costsLife: false },
    // Bombs don't end the game → they accumulate on screen. Cap lower so the
    // board doesn't become a minefield in a 60-second run.
    spawn: { baseBombChance: 0.10, maxBombChance: 0.15 },
  }),
  zen: createModeConfig('zen', {
    title: 'ZEN',
    presentation: {
      menuTitle: 'ZEN',
      description: '90 sec. No bombs.',
      detail: 'Pure slicing relaxation.',
      gradient: 'from-green-500 to-emerald-600',
      glow: 'rgba(0,220,100,0.4)',
      border: 'border-green-500/40 hover:border-green-400',
      badge: 'bg-green-500/15 text-green-400',
    },
    startingLives: 0,
    timerSeconds: 90,
    bombs: { allow: false, endsGame: false, scorePenalty: 0 },
    misses: { costsLife: false },
  }),
  songkran: createModeConfig('songkran', {
    title: 'SONGKRAN',
    presentation: {
      menuTitle: 'SONGKRAN',
      description: '3 lives. Pot bomb = game over.',
      detail: 'Khmer New Year festival.',
      gradient: 'from-amber-500 to-yellow-500',
      glow: 'rgba(212,160,23,0.45)',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/15 text-amber-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    bombs: { radius: 44 },
    spawn: { baseIntervalMs: 1400, objectSetId: 'khmerSongkran' },
  }),
  frenzy: createModeConfig('frenzy', {
    title: 'FRENZY',
    presentation: {
      menuTitle: 'FRENZY',
      description: '60 sec. Bombs = -10 pts.',
      detail: 'Khmer scoring frenzy. 1.5x score.',
      gradient: 'from-fuchsia-500 to-purple-600',
      glow: 'rgba(192,38,211,0.45)',
      border: 'border-fuchsia-500/40 hover:border-fuchsia-400',
      badge: 'bg-fuchsia-500/15 text-fuchsia-400',
    },
    startingLives: 0,
    timerSeconds: 60,
    bombs: { endsGame: false, scorePenalty: -10, radius: 44 },
    misses: { costsLife: false },
    scoring: { modeMultiplier: 1.5 },
    // Fast spawn (337ms min) + no game-over bombs → cap lower to prevent bomb floods.
    spawn: { baseIntervalMs: 900, minIntervalMs: 337.5, objectSetId: 'khmerSongkran', baseBombChance: 0.10, maxBombChance: 0.15 },
  }),
  risk: createModeConfig('risk', {
    title: 'RISK',
    presentation: {
      menuTitle: 'RISK',
      description: 'Golden +5. Cursed -10.',
      detail: 'High risk, high reward.',
      gradient: 'from-yellow-400 to-red-600',
      glow: 'rgba(255,180,0,0.4)',
      border: 'border-yellow-500/40 hover:border-yellow-400',
      badge: 'bg-yellow-500/15 text-yellow-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    spawn: { baseIntervalMs: 1400 },
    risk: { enabled: true },
  }),
  memory: createModeConfig('memory', {
    title: 'MEMORY',
    presentation: {
      menuTitle: 'MEMORY',
      description: 'Objects fade after 0.5s.',
      detail: 'Trust your instincts.',
      gradient: 'from-slate-400 to-indigo-600',
      glow: 'rgba(100,100,255,0.4)',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/15 text-indigo-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    memoryFade: { enabled: true },
  }),
  combo_master: createModeConfig('combo_master', {
    title: 'COMBO MASTER',
    presentation: {
      menuTitle: 'COMBO M.',
      description: 'Only combos score. 3+ slices per burst.',
      detail: 'Singles are worthless.',
      gradient: 'from-pink-500 to-rose-600',
      glow: 'rgba(255,100,150,0.4)',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/15 text-pink-400',
    },
    startingLives: 0,
    timerSeconds: 60,
    bombs: { endsGame: false, scorePenalty: -10 },
    misses: { costsLife: false },
    // Fast spawn (375ms min) + no game-over bombs → cap lower.
    spawn: { baseIntervalMs: 1000, minIntervalMs: 375, baseBombChance: 0.08, maxBombChance: 0.15 },
    combo: { comboOnly: true },
  }),
  tsunami: createModeConfig('tsunami', {
    title: 'TSUNAMI',
    presentation: {
      menuTitle: 'TSUNAMI',
      description: 'Bounded wave motion on all objects.',
      detail: 'Survive watery chaos.',
      gradient: 'from-blue-400 to-teal-600',
      glow: 'rgba(0,180,255,0.4)',
      border: 'border-blue-500/40 hover:border-blue-400',
      badge: 'bg-blue-500/15 text-blue-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    bombs: { radius: 44 },
    waveMotion: { enabled: true },
    spawn: { baseIntervalMs: 1200, objectSetId: 'khmerSongkran' },
  }),
  precision: createModeConfig('precision', {
    title: 'PRECISION',
    presentation: {
      menuTitle: 'PRECISION',
      description: 'Center cuts up to 2.5x. Edge cuts 0.5x.',
      detail: 'Accuracy decides the score.',
      gradient: 'from-emerald-400 to-lime-600',
      glow: 'rgba(100,255,100,0.4)',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    precision: { enabled: true },
  }),
  chaos: createModeConfig('chaos', {
    title: 'CHAOS',
    presentation: {
      menuTitle: 'CHAOS',
      description: 'Double points. Extreme spawn speed.',
      detail: 'Fast-paced madness.',
      gradient: 'from-rose-500 to-violet-600',
      glow: 'rgba(255,50,200,0.4)',
      border: 'border-rose-500/40 hover:border-rose-400',
      badge: 'bg-rose-500/15 text-rose-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    scoring: { modeMultiplier: 2 },
    // CRITICAL: 150ms min interval = 6.67 waves/sec. At default 15% bomb chance
    // that's a game-ending bomb every ~1 second. Chaos fun = speed, not bombs.
    spawn: { baseIntervalMs: 600, minIntervalMs: 150, baseBombChance: 0.06, maxBombChance: 0.12 },
  }),
  time_freeze: createModeConfig('time_freeze', {
    title: 'TIME FREEZE',
    presentation: {
      menuTitle: 'FREEZE',
      description: 'Hold to slow time while energy lasts.',
      detail: 'Control the flow.',
      gradient: 'from-sky-300 to-indigo-500',
      glow: 'rgba(100,200,255,0.4)',
      border: 'border-sky-500/40 hover:border-sky-400',
      badge: 'bg-sky-500/15 text-sky-400',
    },
    startingLives: 3,
    timerSeconds: 0,
    spawn: { baseIntervalMs: 1200 },
    timeControl: { enabled: true },
  }),
};

export const MODE_ORDER: GameMode[] = [
  'classic',
  'arcade',
  'zen',
  'songkran',
  'frenzy',
  'risk',
  'memory',
  'combo_master',
  'tsunami',
  'precision',
  'chaos',
  'time_freeze',
];

export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

export function getModeConfigs(): ModeConfig[] {
  return MODE_ORDER.map((mode) => MODE_CONFIGS[mode]);
}

export { MODE_CONFIGS };

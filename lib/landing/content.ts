import type { LucideIcon } from 'lucide-react';
import {
  Bomb,
  Brain,
  Clock3,
  Flame,
  Gauge,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { getModeConfigs } from '@/game/config/ModeConfig';
import type { GameMode } from '@/store/useGameStore';

export interface NavigationItem {
  label: string;
  href: `#${string}`;
}

export interface HeroStat {
  label: string;
  value: string;
  detail: string;
}

export interface PreviewCard {
  title: string;
  description: string;
  eyebrow: string;
  metric: string;
  fruitSrc: string;
  accentClass: string;
}

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  accentClass: string;
}

export interface ModeCard {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  previewLabel: string;
  metricLabel: string;
  assetSrc: string;
  gradientClass: string;
}

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  signature: string;
}

export interface StatHighlight {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  format?: Intl.NumberFormatOptions;
}

const modeMeta: Record<
  GameMode,
  {
    difficulty: ModeCard['difficulty'];
    previewLabel: string;
    metricLabel: string;
    assetSrc: string;
  }
> = {
  classic: {
    difficulty: 'Medium',
    previewLabel: 'Arcade essential',
    metricLabel: '3 lives, one mistake can end the run',
    assetSrc: '/assets/watermelon.svg',
  },
  arcade: {
    difficulty: 'Hard',
    previewLabel: 'Score sprint',
    metricLabel: '60-second rush with bomb penalties',
    assetSrc: '/assets/orange.svg',
  },
  zen: {
    difficulty: 'Easy',
    previewLabel: 'Calm flow',
    metricLabel: 'Bomb-free session built for clean rhythm',
    assetSrc: '/assets/kiwi.svg',
  },
  songkran: {
    difficulty: 'Medium',
    previewLabel: 'Festival remix',
    metricLabel: 'Khmer-themed objects with larger bomb pressure',
    assetSrc: '/assets/num-ansom.svg',
  },
  frenzy: {
    difficulty: 'Hard',
    previewLabel: 'Scoring overdrive',
    metricLabel: '1.5x scoring multiplier with high spawn density',
    assetSrc: '/assets/mango.svg',
  },
  risk: {
    difficulty: 'Hard',
    previewLabel: 'Decision pressure',
    metricLabel: 'Golden and cursed fruit force split-second calls',
    assetSrc: '/assets/pomegranate.svg',
  },
  memory: {
    difficulty: 'Hard',
    previewLabel: 'Visibility test',
    metricLabel: 'Objects fade after a half-second',
    assetSrc: '/assets/grape.svg',
  },
  combo_master: {
    difficulty: 'Expert',
    previewLabel: 'Pure combo play',
    metricLabel: 'Only multi-slice bursts earn points',
    assetSrc: '/assets/cherry.svg',
  },
  tsunami: {
    difficulty: 'Hard',
    previewLabel: 'Wave motion',
    metricLabel: 'Constant oscillation changes every trajectory',
    assetSrc: '/assets/coconut.svg',
  },
  precision: {
    difficulty: 'Hard',
    previewLabel: 'Accuracy focus',
    metricLabel: 'Center cuts can boost scoring up to 2.5x',
    assetSrc: '/assets/lime.svg',
  },
  chaos: {
    difficulty: 'Expert',
    previewLabel: 'Maximum speed',
    metricLabel: 'Double points at extreme spawn rates',
    assetSrc: '/assets/dragonfruit.svg',
  },
  time_freeze: {
    difficulty: 'Medium',
    previewLabel: 'Flow control',
    metricLabel: 'Spend energy to slow time at the right moment',
    assetSrc: '/assets/blueberry.svg',
  },
};

export const navigationItems: NavigationItem[] = [
  { label: 'Gameplay', href: '#gameplay' },
  { label: 'Features', href: '#features' },
  { label: 'Modes', href: '#modes' },
  { label: 'Leaderboard', href: '#leaderboard' },
  { label: 'Contact', href: '#footer' },
];

export const heroStats: HeroStat[] = [
  {
    label: 'Zero install',
    value: 'Instant play',
    detail: 'Launch in the browser and start slicing in seconds.',
  },
  {
    label: 'Modes',
    value: '12 game variants',
    detail: 'From Zen calm to Chaos speed, every run feels different.',
  },
  {
    label: 'Built for',
    value: 'Skill expression',
    detail: 'Precision, combos, and timing all matter in the score loop.',
  },
];

export const gameplayPreviewCards: PreviewCard[] = [
  {
    eyebrow: 'Slice feel',
    title: 'Smooth slicing effect',
    description: 'Blade trails and impact bursts sell every clean cut.',
    metric: 'Responsive swipe feedback',
    fruitSrc: '/assets/watermelon-half.svg',
    accentClass: 'from-[#ff7f5a] to-[#ffb347]',
  },
  {
    eyebrow: 'Combo chase',
    title: 'Combo multiplier system',
    description: 'Stack multi-fruit bursts to spike your score ceiling.',
    metric: 'Burst windows reward timing',
    fruitSrc: '/assets/cherry-half.svg',
    accentClass: 'from-[#ff6484] to-[#ff8359]',
  },
  {
    eyebrow: 'Score pop',
    title: 'Score explosion animation',
    description: 'Every perfect cut lands with numbers, sparks, and motion.',
    metric: 'Readable at full speed',
    fruitSrc: '/assets/pineapple-half.svg',
    accentClass: 'from-[#ffd65b] to-[#f59e0b]',
  },
];

export const featureItems: FeatureItem[] = [
  {
    icon: Zap,
    title: 'Fast-paced gameplay',
    description: 'Short decision windows keep the page aligned with arcade energy.',
    accentClass: 'from-[#ff8750] to-[#ffb347]',
  },
  {
    icon: Target,
    title: 'Precision slicing mechanics',
    description: 'Center hits matter, making swipe quality just as important as speed.',
    accentClass: 'from-[#65c466] to-[#b4e95a]',
  },
  {
    icon: Flame,
    title: 'Combo multiplier system',
    description: 'String together slices and the scoring model opens up quickly.',
    accentClass: 'from-[#ff6060] to-[#ff8e53]',
  },
  {
    icon: Clock3,
    title: 'Time attack mode',
    description: 'Timer-led runs shift focus from survival to output per second.',
    accentClass: 'from-[#5fb8ff] to-[#7d8cff]',
  },
  {
    icon: Bomb,
    title: 'Bomb avoidance challenge',
    description: 'Risk management stays readable even when the screen gets crowded.',
    accentClass: 'from-[#1f2937] to-[#4b5563]',
  },
  {
    icon: Brain,
    title: 'Skill-based scoring',
    description: 'The system rewards timing, accuracy, and route choice instead of luck.',
    accentClass: 'from-[#8b5cf6] to-[#ec4899]',
  },
];

export const modeCards: ModeCard[] = getModeConfigs().map((config) => {
  const meta = modeMeta[config.id];

  return {
    id: config.id,
    name: toTitleCase(config.title),
    tagline: config.presentation.description,
    description: config.presentation.detail,
    difficulty: meta.difficulty,
    previewLabel: meta.previewLabel,
    metricLabel: meta.metricLabel,
    assetSrc: meta.assetSrc,
    gradientClass: config.presentation.gradient,
  };
});

export const leaderboardEntries: LeaderboardEntry[] = [
  { rank: 1, player: 'BladeByte', score: 248430, signature: '26x combo streak' },
  { rank: 2, player: 'CitrusKai', score: 241905, signature: '97% slice accuracy' },
  { rank: 3, player: 'NovaPeel', score: 236180, signature: 'Bombless classic run' },
  { rank: 4, player: 'MangoTrace', score: 229760, signature: 'Chaos mode specialist' },
  { rank: 5, player: 'ZenArc', score: 221540, signature: 'Time Freeze tactician' },
];

export const statHighlights: StatHighlight[] = [
  {
    icon: Users,
    label: 'Total players',
    value: 128400,
    format: { notation: 'compact', maximumFractionDigits: 1 },
  },
  {
    icon: Trophy,
    label: 'Fruits sliced',
    value: 94600000,
    format: { notation: 'compact', maximumFractionDigits: 1 },
  },
  {
    icon: Sparkles,
    label: 'Best combo recorded',
    value: 42,
    suffix: 'x',
  },
  {
    icon: Gauge,
    label: 'Average session',
    value: 8.4,
    suffix: ' min',
    format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  },
];

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

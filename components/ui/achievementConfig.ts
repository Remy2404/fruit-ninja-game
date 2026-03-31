import type { LucideIcon } from 'lucide-react';
import {
  Slice,
  Zap,
  Flame,
  Trophy,
  Star,
  ShieldCheck,
  Target,
  Sparkles,
  Rocket,
  Leaf,
} from 'lucide-react';

export interface AchievementMeta {
  icon: LucideIcon;
  color: string;
}

// Icon + accent colour per achievement id — all presentation, zero data-layer coupling.
export const ACHIEVEMENT_META: Record<string, AchievementMeta> = {
  first_slice:    { icon: Slice,       color: '#ff9f4a' },
  combo_initiate: { icon: Zap,         color: '#fbbf24' },
  combo_maniac:   { icon: Flame,       color: '#ef4444' },
  fruit_veteran:  { icon: Trophy,      color: '#ffd709' },
  century:        { icon: Star,        color: '#ffd709' },
  bomb_dodger:    { icon: ShieldCheck, color: '#34d399' },
  precision:      { icon: Target,      color: '#38bdf8' },
  flawless:       { icon: Sparkles,    color: '#a78bfa' },
  speed_demon:    { icon: Rocket,      color: '#f472b6' },
  zen_master:     { icon: Leaf,        color: '#4ade80' },
};

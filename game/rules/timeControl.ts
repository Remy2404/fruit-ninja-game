import type { TimeControlRules } from '../config/ModeConfig';

export interface TimeControlState {
  energy: number;
  isEnergyActive: boolean;
  timeScale: number;
}

export function stepTimeControl(
  state: TimeControlState,
  dtMs: number,
  rules: TimeControlRules,
): TimeControlState {
  if (!rules.enabled) {
    return {
      energy: rules.energyMax,
      isEnergyActive: false,
      timeScale: 1,
    };
  }

  const deltaSeconds = dtMs / 1000;

  if (state.isEnergyActive && state.energy > 0) {
    const nextEnergy = Math.max(0, state.energy - rules.drainPerSecond * deltaSeconds);
    const stillActive = nextEnergy > 0;
    return {
      energy: nextEnergy,
      isEnergyActive: stillActive,
      timeScale: stillActive ? rules.slowScale : 1,
    };
  }

  return {
    energy: Math.min(rules.energyMax, state.energy + rules.rechargePerSecond * deltaSeconds),
    isEnergyActive: false,
    timeScale: 1,
  };
}

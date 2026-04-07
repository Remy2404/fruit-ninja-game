import { useGameStore } from '../../store/useGameStore';
import type { ModeConfig } from '../config/ModeConfig';
import { stepTimeControl } from '../rules/timeControl';

export class TimeControlSystem {
  private readonly modeConfig: ModeConfig;

  constructor(modeConfig: ModeConfig) {
    this.modeConfig = modeConfig;
  }

  public update(dtMs: number) {
    if (!this.modeConfig.timeControl.enabled) return;

    const state = useGameStore.getState();
    const nextState = stepTimeControl(
      {
        energy: state.energy,
        isEnergyActive: state.isEnergyActive,
        timeScale: state.timeScale,
      },
      dtMs,
      this.modeConfig.timeControl,
    );

    state.setTimeScale(nextState.timeScale);
    state.setIsEnergyActive(nextState.isEnergyActive);

    if (nextState.energy < state.energy) {
      state.decreaseEnergy(state.energy - nextState.energy);
    } else if (nextState.energy > state.energy) {
      state.increaseEnergy(nextState.energy - state.energy);
    }
  }
}

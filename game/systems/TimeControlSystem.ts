import { useGameStore } from '../../store/useGameStore';
import type { ModeConfig } from '../config/ModeConfig';

export class TimeControlSystem {
  private modeConfig: ModeConfig;
  private energyDrainRate = 0.05;
  private energyGainRate = 0.02;

  constructor(modeConfig: ModeConfig) {
    this.modeConfig = modeConfig;
  }

  public update(dt: number) {
    if (!this.modeConfig.enableTimeControl) return;

    // We get real dt unscaled ideally, but we'll accept dt as is since it doesn't affect time directly
    // Wait, if timeScale is 0.3, dt will be 0.3x. 
    // We should compensate or just adjust the rates. The dt passed here will be scaled.
    // If it's scaled, draining will be slower.
    const state = useGameStore.getState();
    const ms = dt * 16.66; // scaled ms

    if (state.isEnergyActive && state.energy > 0) {
      // Compensate for slow timeScale so draining doesn't slow down
      const unscaledMs = state.timeScale > 0 ? (ms / state.timeScale) : ms;
      state.decreaseEnergy(this.energyDrainRate * unscaledMs);
      state.setTimeScale(0.3);
      
      if (useGameStore.getState().energy <= 0) {
         state.setIsEnergyActive(false);
         state.setTimeScale(1.0);
      }
    } else {
      const unscaledMs = state.timeScale > 0 ? (ms / state.timeScale) : ms;
      state.increaseEnergy(this.energyGainRate * unscaledMs);
      state.setTimeScale(1.0);
    }
  }
}

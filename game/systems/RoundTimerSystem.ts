import { useGameStore } from '../../store/useGameStore';

export class RoundTimerSystem {
  private accumulatorMs = 0;

  public reset() {
    this.accumulatorMs = 0;
  }

  public update(dtMs: number) {
    const state = useGameStore.getState();
    if (state.status !== 'playing' || state.timeLeft <= 0) return;

    this.accumulatorMs += dtMs;
    if (this.accumulatorMs < 16) return;

    const elapsedSeconds = this.accumulatorMs / 1000;
    this.accumulatorMs = 0;
    state.advanceTimer(elapsedSeconds);
  }
}

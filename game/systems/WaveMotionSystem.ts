import type { ModeConfig } from '../config/ModeConfig';
import { Pool } from '../core/Pool';
import { Bomb } from '../entities/Bomb';
import { Fruit } from '../entities/Fruit';

export class WaveMotionSystem {
  private readonly fruitPool: Pool<Fruit>;
  private readonly bombPool: Pool<Bomb>;
  private readonly modeConfig: ModeConfig;
  private elapsedMs = 0;

  constructor(fruitPool: Pool<Fruit>, bombPool: Pool<Bomb>, modeConfig: ModeConfig) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.modeConfig = modeConfig;
  }

  public reset() {
    this.elapsedMs = 0;
  }

  public update(dt: number) {
    if (!this.modeConfig.waveMotion.enabled) return;

    this.elapsedMs += dt * 16.66;
    const { amplitude, frequency } = this.modeConfig.waveMotion;

    for (const fruit of this.fruitPool.active) {
      const offsetX = Math.sin(this.elapsedMs * frequency + fruit.waveSeed) * amplitude;
      fruit.applyWaveOffset(offsetX);
    }

    for (const bomb of this.bombPool.active) {
      const offsetX = Math.sin(this.elapsedMs * frequency + bomb.waveSeed) * amplitude;
      bomb.applyWaveOffset(offsetX);
    }
  }
}

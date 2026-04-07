import { Pool } from '../core/Pool';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import type { ModeConfig } from '../config/ModeConfig';

export class WaveMotionSystem {
  private fruitPool: Pool<Fruit>;
  private bombPool: Pool<Bomb>;
  private modeConfig: ModeConfig;
  private time = 0;

  constructor(fruitPool: Pool<Fruit>, bombPool: Pool<Bomb>, modeConfig: ModeConfig) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.modeConfig = modeConfig;
  }

  public update(dt: number) {
    if (!this.modeConfig.enableWaveMotion) return;

    this.time += dt * 16.66;

    const amplitude = 3;
    const frequency = 0.003;

    for (let i = 0; i < this.fruitPool.active.length; i++) {
      const fruit = this.fruitPool.active[i];
      const offset = fruit.id.charCodeAt(0) * 100;
      fruit.x += Math.sin((this.time + offset) * frequency) * amplitude * dt;
    }

    for (let i = 0; i < this.bombPool.active.length; i++) {
      const bomb = this.bombPool.active[i];
      const offset = bomb.id.charCodeAt(0) * 100;
      bomb.x += Math.sin((this.time + offset) * frequency) * amplitude * dt;
    }
  }
}

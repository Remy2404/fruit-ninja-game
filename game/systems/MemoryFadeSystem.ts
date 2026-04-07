import { Pool } from '../core/Pool';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import type { ModeConfig } from '../config/ModeConfig';

export class MemoryFadeSystem {
  private fruitPool: Pool<Fruit>;
  private bombPool: Pool<Bomb>;
  private modeConfig: ModeConfig;

  constructor(fruitPool: Pool<Fruit>, bombPool: Pool<Bomb>, modeConfig: ModeConfig) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.modeConfig = modeConfig;
  }

  public update(_dt: number) {
    if (!this.modeConfig.enableMemoryFade) return;

    for (let i = 0; i < this.fruitPool.active.length; i++) {
      const fruit = this.fruitPool.active[i];
      if (fruit.isSliced) continue;
      
      if (fruit.age > 500) {
        const fadeProgress = Math.min(1, Math.max(0, (fruit.age - 500) / 300));
        fruit.container.alpha = 1 - fadeProgress;
      } else {
        fruit.container.alpha = 1;
      }
    }

    for (let i = 0; i < this.bombPool.active.length; i++) {
      const bomb = this.bombPool.active[i];
      if (bomb.age > 500) {
        const fadeProgress = Math.min(1, Math.max(0, (bomb.age - 500) / 300));
        bomb.container.alpha = 1 - fadeProgress;
      } else {
        bomb.container.alpha = 1;
      }
    }
  }
}

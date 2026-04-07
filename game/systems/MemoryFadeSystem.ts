import type { ModeConfig } from '../config/ModeConfig';
import { Pool } from '../core/Pool';
import { Bomb } from '../entities/Bomb';
import { Fruit } from '../entities/Fruit';

export class MemoryFadeSystem {
  private readonly fruitPool: Pool<Fruit>;
  private readonly bombPool: Pool<Bomb>;
  private readonly modeConfig: ModeConfig;

  constructor(fruitPool: Pool<Fruit>, bombPool: Pool<Bomb>, modeConfig: ModeConfig) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.modeConfig = modeConfig;
  }

  public update() {
    if (!this.modeConfig.memoryFade.enabled) return;

    const { visibleMs, fadeDurationMs } = this.modeConfig.memoryFade;
    for (const fruit of this.fruitPool.active) {
      if (fruit.isSliced) continue;

      fruit.container.alpha =
        fruit.age <= visibleMs
          ? 1
          : 1 - Math.min(1, Math.max(0, (fruit.age - visibleMs) / fadeDurationMs));
    }

    for (const bomb of this.bombPool.active) {
      bomb.container.alpha =
        bomb.age <= visibleMs
          ? 1
          : 1 - Math.min(1, Math.max(0, (bomb.age - visibleMs) / fadeDurationMs));
    }
  }
}

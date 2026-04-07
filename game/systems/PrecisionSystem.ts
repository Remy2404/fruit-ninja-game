import { Fruit } from '../entities/Fruit';
import type { ModeConfig } from '../config/ModeConfig';
import { calculatePrecisionMultiplier } from '../rules/precision';

export class PrecisionSystem {
  public static calculatePrecisionMultiplier(
    fruit: Fruit,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    modeConfig: ModeConfig,
  ): number {
    return calculatePrecisionMultiplier(
      fruit.x,
      fruit.y,
      fruit.radius,
      p1,
      p2,
      modeConfig.precision,
    );
  }
}

import { Fruit } from '../entities/Fruit';

export class PrecisionSystem {
  public static calculatePrecisionMultiplier(
    fruit: Fruit,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ): number {
    const l1 = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    if (l1 === 0) return 1;

    let t = ((fruit.x - p1.x) * (p2.x - p1.x) + (fruit.y - p1.y) * (p2.y - p1.y)) / l1;
    t = Math.max(0, Math.min(1, t));

    const projX = p1.x + t * (p2.x - p1.x);
    const projY = p1.y + t * (p2.y - p1.y);

    const distSq = (fruit.x - projX) * (fruit.x - projX) + (fruit.y - projY) * (fruit.y - projY);
    const dist = Math.sqrt(distSq);

    if (dist < 15) return 2.5;
    if (dist < fruit.radius * 0.4) return 1.5;
    if (dist > fruit.radius * 0.8) return 0.5;
    return 1;
  }
}

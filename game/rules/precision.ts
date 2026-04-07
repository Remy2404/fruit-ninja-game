import type { PrecisionRules } from '../config/ModeConfig';

export function calculatePrecisionMultiplier(
  fruitX: number,
  fruitY: number,
  radius: number,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  rules: PrecisionRules,
): number {
  if (!rules.enabled) return 1;

  const lineLengthSquared = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
  if (lineLengthSquared === 0) return 1;

  let t =
    ((fruitX - p1.x) * (p2.x - p1.x) + (fruitY - p1.y) * (p2.y - p1.y)) /
    lineLengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projectionX = p1.x + t * (p2.x - p1.x);
  const projectionY = p1.y + t * (p2.y - p1.y);
  const distance = Math.hypot(fruitX - projectionX, fruitY - projectionY);

  if (distance <= rules.perfectDistancePx) return rules.perfectMultiplier;
  if (distance <= radius * rules.centerRatio) return rules.centerMultiplier;
  if (distance >= radius * rules.edgeRatio) return rules.edgeMultiplier;
  return 1;
}

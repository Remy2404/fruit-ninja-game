import { describe, expect, it } from 'vitest';
import { getModeConfig } from '../../game/config/ModeConfig';
import { calculateFruitSliceScore } from '../../game/rules/scoring';

describe('risk scoring', () => {
  it('applies the gold bonus exactly once', () => {
    const breakdown = calculateFruitSliceScore({
      baseScore: 2,
      isCritical: false,
      precisionMultiplier: 1,
      streakMultiplier: 1,
      modeConfig: getModeConfig('risk'),
      variant: 'gold',
    });

    expect(breakdown.variantModifier).toBe(5);
    expect(breakdown.finalPoints).toBe(7);
  });

  it('does not let critical slices double-apply variant modifiers', () => {
    const breakdown = calculateFruitSliceScore({
      baseScore: 2,
      isCritical: true,
      precisionMultiplier: 1,
      streakMultiplier: 1,
      modeConfig: getModeConfig('risk'),
      variant: 'gold',
    });

    expect(breakdown.criticalBasePoints).toBe(10);
    expect(breakdown.variantModifier).toBe(5);
    expect(breakdown.finalPoints).toBe(15);
  });
});

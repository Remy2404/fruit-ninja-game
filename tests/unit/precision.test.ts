import { describe, expect, it } from 'vitest';
import { getModeConfig } from '../../game/config/ModeConfig';
import { calculatePrecisionMultiplier } from '../../game/rules/precision';

describe('precision scoring', () => {
  const rules = getModeConfig('precision').precision;

  it('rewards center cuts with the configured perfect multiplier', () => {
    const multiplier = calculatePrecisionMultiplier(
      50,
      50,
      30,
      { x: 0, y: 50 },
      { x: 100, y: 50 },
      rules,
    );

    expect(multiplier).toBe(rules.perfectMultiplier);
  });

  it('penalizes edge cuts with the configured edge multiplier', () => {
    const multiplier = calculatePrecisionMultiplier(
      50,
      50,
      30,
      { x: 74, y: 20 },
      { x: 74, y: 80 },
      rules,
    );

    expect(multiplier).toBe(rules.edgeMultiplier);
  });
});

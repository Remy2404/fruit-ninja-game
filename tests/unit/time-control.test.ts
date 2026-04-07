import { describe, expect, it } from 'vitest';
import { getModeConfig } from '../../game/config/ModeConfig';
import { stepTimeControl } from '../../game/rules/timeControl';

describe('time control math', () => {
  const rules = getModeConfig('time_freeze').timeControl;

  it('drains energy at a stable real-time rate while active', () => {
    const next = stepTimeControl(
      { energy: 100, isEnergyActive: true, timeScale: 1 },
      1000,
      rules,
    );

    expect(next.energy).toBeCloseTo(80);
    expect(next.timeScale).toBe(rules.slowScale);
    expect(next.isEnergyActive).toBe(true);
  });

  it('recharges energy and restores normal time when inactive', () => {
    const next = stepTimeControl(
      { energy: 50, isEnergyActive: false, timeScale: rules.slowScale },
      2000,
      rules,
    );

    expect(next.energy).toBeCloseTo(74);
    expect(next.timeScale).toBe(1);
    expect(next.isEnergyActive).toBe(false);
  });
});

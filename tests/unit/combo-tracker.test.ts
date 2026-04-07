import { describe, expect, it } from 'vitest';
import { ComboTracker } from '../../game/systems/ComboTracker';
import { getModeConfig } from '../../game/config/ModeConfig';

describe('combo tracking', () => {
  it('resolves combos after the configured idle window', () => {
    const tracker = new ComboTracker(getModeConfig('combo_master').combo);

    tracker.registerSlice('a', 10, 10, 0);
    tracker.registerSlice('b', 20, 10, 100);
    tracker.registerSlice('c', 30, 10, 200);

    expect(tracker.update(true, 300)).toBeNull();
    expect(tracker.update(true, 500)).toEqual({ count: 3, x: 30, y: 10 });
  });

  it('prevents long-held pointer bursts from accumulating across windows', () => {
    const tracker = new ComboTracker(getModeConfig('combo_master').combo);

    tracker.registerSlice('a', 10, 10, 0);
    tracker.registerSlice('b', 20, 10, 100);
    expect(tracker.update(true, 500)).toBeNull();

    tracker.registerSlice('c', 30, 10, 600);
    tracker.registerSlice('d', 40, 10, 700);
    tracker.registerSlice('e', 50, 10, 800);

    expect(tracker.update(false, 810)).toEqual({ count: 3, x: 50, y: 10 });
  });
});

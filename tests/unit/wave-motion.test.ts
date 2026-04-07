import { describe, expect, it } from 'vitest';
import { getModeConfig } from '../../game/config/ModeConfig';
import { Pool } from '../../game/core/Pool';
import { WaveMotionSystem } from '../../game/systems/WaveMotionSystem';

function createWaveEntity(baseX: number) {
  return {
    x: baseX,
    waveSeed: 0,
    waveOffsetX: 0,
    applyWaveOffset(offsetX: number) {
      const delta = offsetX - this.waveOffsetX;
      this.waveOffsetX = offsetX;
      this.x += delta;
    },
  };
}

describe('wave motion', () => {
  it('keeps motion bounded around the base position', () => {
    const fruit = createWaveEntity(100);
    const system = new WaveMotionSystem(
      { active: [fruit] } as unknown as Pool<never>,
      { active: [] } as unknown as Pool<never>,
      getModeConfig('tsunami'),
    );

    let minX = fruit.x;
    let maxX = fruit.x;
    for (let frame = 0; frame < 240; frame++) {
      system.update(1);
      minX = Math.min(minX, fruit.x);
      maxX = Math.max(maxX, fruit.x);
    }

    expect(maxX - minX).toBeLessThanOrEqual(6.1);
    expect(Math.abs((maxX + minX) / 2 - 100)).toBeLessThan(0.5);
  });
});

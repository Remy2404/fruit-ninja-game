import { describe, expect, it } from 'vitest';
import { Pool } from '../../game/core/Pool';

describe('pool exhaustion safeguards', () => {
  it('tracks exhaustion and returns null from tryGet when a capped pool is empty', () => {
    const pool = new Pool(
      () => ({ active: true }),
      { initialSize: 1, maxSize: 1, name: 'test-pool' },
    );

    const first = pool.tryGet();
    const second = pool.tryGet();

    expect(first).not.toBeNull();
    expect(second).toBeNull();
    expect(pool.getStats().exhaustionCount).toBe(1);
  });
});

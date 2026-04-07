import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Pool } from '../../game/core/Pool';
import { Fruit } from '../../game/entities/Fruit';
import { CollisionSystem } from '../../game/systems/CollisionSystem';
import type { SwipeSegment } from '../../game/systems/InputSystem';
import { getModeConfig } from '../../game/config/ModeConfig';
import { resetStores, startMode } from '../helpers/resetStores';
import { useGameStore } from '../../store/useGameStore';

class StubSwipeSource {
  public isSwiping = false;
  constructor(private readonly segments: SwipeSegment[]) {}

  public consumePendingSegments(consumer: (segment: SwipeSegment) => void) {
    for (const segment of this.segments) {
      consumer(segment);
    }
    this.segments.length = 0;
  }
}

function createPoolStub<T>(items: T[]) {
  return {
    active: items,
    release(item: T) {
      const index = items.indexOf(item);
      if (index >= 0) items.splice(index, 1);
    },
  } as unknown as Pool<T>;
}

function createFruit(id: string, x: number): Fruit {
  return {
    id,
    x,
    y: 50,
    radius: 20,
    isSliced: false,
    vx: 0,
    vy: 0,
    halfAssetPath: '/half.png',
    assetPath: '/full.png',
    rotation: 0,
    juiceColor: 0xffffff,
    baseScore: 1,
    isCritical: false,
    variant: 'normal',
  } as Fruit;
}

describe('high-speed multi-object swipes', () => {
  beforeEach(() => {
    resetStores();
  });

  it('slices multiple fruits across a burst of recent segments', () => {
    startMode('classic');
    const fruits = [createFruit('a', 60), createFruit('b', 120), createFruit('c', 180)];
    const segments: SwipeSegment[] = [];

    for (let x = 0; x < 240; x += 20) {
      segments.push({
        p1: { x, y: 50, time: x },
        p2: { x: x + 20, y: 50, time: x + 1 },
      });
    }

    const system = new CollisionSystem(
      new StubSwipeSource(segments),
      createPoolStub(fruits),
      createPoolStub([]),
      {
        spawnFruitHalves: vi.fn(),
        spawnFruitJuice: vi.fn(),
        spawnExplosion: vi.fn(),
        spawnFloatingText: vi.fn(),
      } as never,
      { spawn: vi.fn() } as never,
      getModeConfig('classic'),
    );

    system.update();

    expect(fruits).toHaveLength(0);
    expect(useGameStore.getState().fruitsSliced).toBe(3);
    expect(useGameStore.getState().score).toBeGreaterThanOrEqual(3);
  });
});

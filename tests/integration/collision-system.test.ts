import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getModeConfig } from '../../game/config/ModeConfig';
import { Pool } from '../../game/core/Pool';
import { Bomb } from '../../game/entities/Bomb';
import { Fruit } from '../../game/entities/Fruit';
import { CollisionSystem } from '../../game/systems/CollisionSystem';
import type { SwipeSegment } from '../../game/systems/InputSystem';
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

function createFruit(overrides: Partial<Fruit> = {}) {
  return {
    id: 'fruit',
    x: 50,
    y: 50,
    radius: 24,
    isSliced: false,
    vx: 0,
    vy: 0,
    halfAssetPath: '/half.png',
    assetPath: '/full.png',
    rotation: 0,
    juiceColor: 0xffffff,
    baseScore: 2,
    isCritical: false,
    variant: 'normal',
    ...overrides,
  } as Fruit;
}

function createBomb(overrides: Partial<Bomb> = {}) {
  return {
    x: 50,
    y: 50,
    radius: 24,
    ...overrides,
  } as Bomb;
}

function createSegment(): SwipeSegment {
  return {
    p1: { x: 0, y: 50, time: 0 },
    p2: { x: 100, y: 50, time: 16 },
  };
}

function createCollisionSystem(mode = getModeConfig('classic'), fruits: Fruit[] = [], bombs: Bomb[] = []) {
  return new CollisionSystem(
    new StubSwipeSource([createSegment()]),
    createPoolStub(fruits),
    createPoolStub(bombs),
    {
      spawnFruitHalves: vi.fn(),
      spawnFruitJuice: vi.fn(),
      spawnExplosion: vi.fn(),
      spawnFloatingText: vi.fn(),
    } as never,
    { spawn: vi.fn() } as never,
    mode,
    { triggerBombFeedback: vi.fn() } as never,
  );
}

describe('collision integration', () => {
  beforeEach(() => {
    resetStores();
  });

  it('applies risk scoring once through the real collision path', () => {
    startMode('risk');
    const fruit = createFruit({ variant: 'gold' });
    const system = createCollisionSystem(getModeConfig('risk'), [fruit], []);

    system.update();

    expect(useGameStore.getState().score).toBe(7);
  });

  it('ends the game when a bomb is sliced in classic mode', () => {
    startMode('classic');
    const system = createCollisionSystem(getModeConfig('classic'), [], [createBomb()]);

    system.update();

    expect(useGameStore.getState().status).toBe('gameover');
    expect(useGameStore.getState().endReason).toBe('bomb');
  });

  it('applies bomb penalties without ending the game in arcade mode', () => {
    startMode('arcade');
    useGameStore.getState().addScore(20);
    const system = createCollisionSystem(getModeConfig('arcade'), [], [createBomb()]);

    system.update();

    expect(useGameStore.getState().status).toBe('playing');
    expect(useGameStore.getState().score).toBe(10);
  });
});

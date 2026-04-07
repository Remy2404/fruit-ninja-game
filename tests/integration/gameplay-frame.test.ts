import { beforeEach, describe, expect, it } from 'vitest';
import { runGameplayFramePhase } from '../../game/core/runGameplayFrame';
import { RoundTimerSystem } from '../../game/systems/RoundTimerSystem';
import { resetStores, startMode } from '../helpers/resetStores';
import { useGameStore } from '../../store/useGameStore';

describe('gameplay frame orchestration', () => {
  beforeEach(() => {
    resetStores();
  });

  it('aborts the remaining gameplay phase once collision ends the run', () => {
    startMode('classic');
    const calls: string[] = [];

    runGameplayFramePhase({
      getStatus: () => useGameStore.getState().status,
      runSpawner: () => {
        calls.push('spawner');
      },
      runCollision: () => {
        calls.push('collision');
        useGameStore.getState().endGame('bomb');
      },
      runMemoryFade: () => {
        calls.push('memory');
      },
      runWaveMotion: () => {
        calls.push('wave');
      },
      runEntityUpdates: () => {
        calls.push('entities');
      },
    });

    expect(calls).toEqual(['spawner', 'collision']);
  });

  it('advances timed rounds from the engine-side timer system', () => {
    startMode('arcade');
    const timer = new RoundTimerSystem();

    timer.update(1000);

    expect(useGameStore.getState().timeLeft).toBeCloseTo(59);
  });
});

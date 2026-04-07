// @vitest-environment jsdom

import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GameCanvas from '../../components/GameCanvas';
import { useGameStore } from '../../store/useGameStore';
import { resetStores } from '../helpers/resetStores';

const instances: Array<{ init: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }> = [];

vi.mock('../../game/core/Game', () => {
  return {
    FruitNinjaGame: class MockFruitNinjaGame {
      public init = vi.fn().mockResolvedValue(undefined);
      public destroy = vi.fn();

      constructor(...args: [HTMLElement]) {
        void args;
        instances.push({ init: this.init, destroy: this.destroy });
      }
    },
  };
});

describe('game canvas lifecycle', () => {
  beforeEach(() => {
    instances.length = 0;
    resetStores();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('destroys previous game instances across repeated mode-driven remounts', async () => {
    const view = render(<GameCanvas />);
    await waitFor(() => expect(instances).toHaveLength(1));
    expect(instances[0].init).toHaveBeenCalledTimes(1);

    act(() => {
      useGameStore.getState().setMode('songkran');
    });
    await waitFor(() => expect(instances).toHaveLength(2));
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);

    act(() => {
      useGameStore.getState().setMode('classic');
    });
    await waitFor(() => expect(instances).toHaveLength(3));
    expect(instances[1].destroy).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(instances[2].destroy).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameRouteBootstrap } from '../../components/game/GameRouteBootstrap';
import { getModeConfig } from '../../game/config/ModeConfig';
import { useGameStore } from '../../store/useGameStore';
import { resetStores } from '../helpers/resetStores';

describe('game route bootstrap', () => {
  beforeEach(() => {
    resetStores();
    document.body.innerHTML = '';
  });

  it('preselects a valid mode and autostarts the game', async () => {
    render(<GameRouteBootstrap autostart mode="precision" />);

    await waitFor(() => expect(useGameStore.getState().status).toBe('playing'));
    expect(useGameStore.getState().mode).toBe('precision');
    expect(useGameStore.getState().lives).toBe(getModeConfig('precision').startingLives);
  });

  it('ignores invalid modes without corrupting the current selection', async () => {
    useGameStore.getState().setMode('zen');

    render(<GameRouteBootstrap autostart mode="invalid_mode" />);

    await waitFor(() => expect(useGameStore.getState().status).toBe('playing'));
    expect(useGameStore.getState().mode).toBe('zen');
  });

  it('can update the selected mode without forcing the game to start', async () => {
    render(<GameRouteBootstrap autostart={false} mode="arcade" />);

    await waitFor(() => expect(useGameStore.getState().mode).toBe('arcade'));
    expect(useGameStore.getState().status).toBe('menu');
  });
});

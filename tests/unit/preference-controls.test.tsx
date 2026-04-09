// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferenceControls } from '../../components/landing/PreferenceControls';
import { useGameStore } from '../../store/useGameStore';
import { resetStores } from '../helpers/resetStores';

describe('preference controls', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetStores();
    window.localStorage.clear();
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });
  });

  it('updates the document theme and persists the preference', async () => {
    render(<PreferenceControls />);
    const themeToggle = screen.getByTestId('theme-toggle');

    await waitFor(() => expect(themeToggle.getAttribute('aria-pressed')).toBe('false'));
    fireEvent.click(themeToggle);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('fruit-theme')).toBe('dark');
    expect(themeToggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles the shared sound state without requiring the game route', () => {
    render(<PreferenceControls />);
    const soundToggle = screen.getByTestId('sound-toggle');

    expect(useGameStore.getState().soundEnabled).toBe(true);
    fireEvent.click(soundToggle);
    expect(useGameStore.getState().soundEnabled).toBe(false);
    expect(soundToggle.getAttribute('aria-pressed')).toBe('false');
  });
});

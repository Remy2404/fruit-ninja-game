'use client';

import { useEffect } from 'react';
import { isGameMode, useGameStore } from '@/store/useGameStore';

interface GameRouteBootstrapProps {
  autostart: boolean;
  mode: string | null;
}

export function GameRouteBootstrap({ autostart, mode }: GameRouteBootstrapProps) {
  const resetGame = useGameStore((state) => state.resetGame);
  const setMode = useGameStore((state) => state.setMode);

  useEffect(() => {
    const resolvedMode = mode && isGameMode(mode) ? mode : null;

    if (resolvedMode) {
      setMode(resolvedMode);
    }

    if (autostart) {
      resetGame();
    }
  }, [autostart, mode, resetGame, setMode]);

  return null;
}

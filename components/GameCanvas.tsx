'use client';

import { useEffect, useRef } from 'react';
import { FruitNinjaGame } from '../game/core/Game';
import { useGameStore } from '../store/useGameStore';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<FruitNinjaGame | null>(null);

  const mode = useGameStore((s) => s.mode);
  const themeId = useGameStore((s) => s.themeId);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const preventContext = (e: Event) => e.preventDefault();
    container.addEventListener('contextmenu', preventContext);
    container.addEventListener('touchmove', preventContext, { passive: false });

    // Destroy previous game instance if switching modes/themes
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }

    const game = new FruitNinjaGame(container);
    gameRef.current = game;

    game.init().catch(console.error);

    return () => {
      container.removeEventListener('contextmenu', preventContext);
      container.removeEventListener('touchmove', preventContext);

      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [mode, themeId]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none bg-[#1a0e06]" 
      style={{ WebkitTapHighlightColor: 'transparent' }}
    />
  );
}

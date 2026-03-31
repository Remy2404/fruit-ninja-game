'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { FruitNinjaGame } from '../game/core/Game';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<FruitNinjaGame | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const container = containerRef.current;

    const preventContext = (e: Event) => e.preventDefault();
    container.addEventListener('contextmenu', preventContext);
    container.addEventListener('touchmove', preventContext, { passive: false });

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
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none bg-[#1a0e06]" 
      style={{ WebkitTapHighlightColor: 'transparent' }}
    />
  );
}

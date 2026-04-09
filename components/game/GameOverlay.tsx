'use client';

import dynamic from 'next/dynamic';
import { GameOverMenu } from '@/components/ui/GameOverMenu';
import { HUD } from '@/components/ui/HUD';
import { MainMenu } from '@/components/ui/MainMenu';
import { PauseMenu } from '@/components/ui/PauseMenu';
import { useGameStore } from '@/store/useGameStore';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#111116]">
      <div className="animate-pulse font-mono text-xl text-white">Loading Engine...</div>
    </div>
  ),
});

export function GameOverlay() {
  const status = useGameStore((state) => state.status);

  return (
    <main className="relative h-dvh w-screen overflow-hidden overscroll-none bg-black text-white selection:bg-transparent touch-none">
      <GameCanvas />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        {status === 'playing' && <HUD />}

        {status === 'menu' && (
          <div className="pointer-events-auto absolute inset-0">
            <MainMenu />
          </div>
        )}

        {status === 'paused' && (
          <div className="pointer-events-auto absolute inset-0">
            <PauseMenu />
          </div>
        )}

        {status === 'gameover' && (
          <div className="pointer-events-auto absolute inset-0">
            <GameOverMenu />
          </div>
        )}
      </div>
    </main>
  );
}

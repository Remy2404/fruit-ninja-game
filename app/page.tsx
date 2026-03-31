'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/useGameStore';
import { HUD } from '@/components/ui/HUD';
import { MainMenu } from '@/components/ui/MainMenu';
import { GameOverMenu } from '@/components/ui/GameOverMenu';
import { PauseMenu } from '@/components/ui/PauseMenu';

// Dynamically import the GameCanvas with no SSR since it requires standard DOM canvas
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#111116] flex items-center justify-center">
      <div className="text-white text-xl animate-pulse font-mono">Loading Engine...</div>
    </div>
  )
});

export default function GameOverlay() {
  const status = useGameStore(state => state.status);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white selection:bg-transparent">
      
      {/* 
        WebGL Engine Layer 
        Z-Index 0. Pointer events are captured here for the sword trail.
      */}
      <GameCanvas />

      {/* 
        React HUD Layer 
        Pointer events none so slashes bleed through to the canvas beneath,
        except on specific interactive buttons.
      */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
          { status === 'playing' && <HUD /> }
          
          { status === 'menu' && (
             <div className="pointer-events-auto absolute inset-0">
               <MainMenu />
             </div>
          )}

          { status === 'paused' && (
             <div className="pointer-events-auto absolute inset-0">
               <PauseMenu />
             </div>
          )}

          { status === 'gameover' && (
             <div className="pointer-events-auto absolute inset-0">
               <GameOverMenu />
             </div>
          )}
      </div>
      
    </main>
  );
}

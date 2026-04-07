import type { GameState } from '../../store/useGameStore';

export interface GameplayFramePhase {
  getStatus: () => GameState;
  runSpawner: () => void;
  runCollision: () => void;
  runMemoryFade: () => void;
  runWaveMotion: () => void;
  runEntityUpdates: () => void;
}

export function runGameplayFramePhase(phase: GameplayFramePhase) {
  if (phase.getStatus() !== 'playing') return;

  phase.runSpawner();
  phase.runCollision();
  if (phase.getStatus() !== 'playing') return;

  phase.runMemoryFade();
  phase.runWaveMotion();
  if (phase.getStatus() !== 'playing') return;

  phase.runEntityUpdates();
}

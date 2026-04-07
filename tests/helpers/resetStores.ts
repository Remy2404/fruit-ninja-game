import { useAchievementStore } from '../../store/useAchievementStore';
import { type GameMode, useGameStore } from '../../store/useGameStore';

export function resetStores() {
  useGameStore.setState(useGameStore.getInitialState(), true);
  useAchievementStore.setState(useAchievementStore.getInitialState(), true);
}

export function startMode(mode: GameMode) {
  const state = useGameStore.getState();
  state.setMode(mode);
  state.resetGame();
}

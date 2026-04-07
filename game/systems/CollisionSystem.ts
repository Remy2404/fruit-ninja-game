import { InputSystem } from './InputSystem';
import { Pool } from '../core/Pool';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { lineToCircleIntersection } from '../utils/PhysicsMath';
import { ParticleSystem } from './ParticleSystem';
import { JuiceSplashSystem } from './JuiceSplashSystem';
import { ScreenFeedbackSystem } from './ScreenFeedbackSystem';
import { audioManager } from './AudioManager';
import { useGameStore } from '../../store/useGameStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import type { ModeConfig } from '../config/ModeConfig';

export class CollisionSystem {
  private inputSystem: InputSystem;
  private fruitPool: Pool<Fruit>;
  private bombPool: Pool<Bomb>;
  private particleSystem: ParticleSystem;
  private juiceSplashSystem: JuiceSplashSystem;
  private screenFeedback: ScreenFeedbackSystem | null;
  private modeConfig: ModeConfig;

  private slicedThisStroke: string[] = [];
  private lastSlicePoint = { x: 0, y: 0 };

  constructor(
    inputSystem: InputSystem,
    fruitPool: Pool<Fruit>,
    bombPool: Pool<Bomb>,
    particleSystem: ParticleSystem,
    juiceSplashSystem: JuiceSplashSystem,
    modeConfig: ModeConfig,
    screenFeedback: ScreenFeedbackSystem | null = null,
  ) {
    this.inputSystem = inputSystem;
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.particleSystem = particleSystem;
    this.juiceSplashSystem = juiceSplashSystem;
    this.modeConfig = modeConfig;
    this.screenFeedback = screenFeedback;
  }

  public update(_dt: number) {
    if (!this.inputSystem.isSwiping) {
      if (this.slicedThisStroke.length >= 3) {
        const count = this.slicedThisStroke.length;
        const state = useGameStore.getState();

        this.particleSystem.spawnFloatingText(
          this.lastSlicePoint.x,
          this.lastSlicePoint.y - 40,
          `${count}x COMBO!`,
          38,
          0xffcc00,
        );

        state.addScore(count * 2);
        state.setCombo(count);
        audioManager.play('combo');

        const afterComboState = useGameStore.getState();
        useAchievementStore.getState().checkAndUnlock({
          fruitsSliced: afterComboState.fruitsSliced,
          bombsDodged: afterComboState.bombsDodged,
          sliceMisses: afterComboState.sliceMisses,
          maxCombo: afterComboState.maxCombo,
          score: afterComboState.score,
          mode: afterComboState.mode,
          timeLeft: afterComboState.timeLeft,
          sessionStartTime: afterComboState.sessionStartTime,
        });
      }
      this.slicedThisStroke = [];
      return;
    }

    const points = this.inputSystem.points;
    if (points.length < 2) return;

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    for (let i = this.fruitPool.active.length - 1; i >= 0; i--) {
      const fruit = this.fruitPool.active[i];
      if (fruit.isSliced) continue;

      const isHit = lineToCircleIntersection(
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y },
        { x: fruit.x, y: fruit.y },
        fruit.radius + 12,
      );

      if (isHit) {
        fruit.isSliced = true;
        this.handleFruitSlice(fruit, p1, p2);
        this.fruitPool.release(fruit);
      }
    }

    for (let i = this.bombPool.active.length - 1; i >= 0; i--) {
      const bomb = this.bombPool.active[i];

      const isHit = lineToCircleIntersection(
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y },
        { x: bomb.x, y: bomb.y },
        bomb.radius + 10,
      );

      if (isHit) {
        this.handleBombSlice(bomb);
        this.bombPool.release(bomb);
      }
    }
  }

  private handleFruitSlice(
    fruit: Fruit,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) {
    if (!this.slicedThisStroke.includes(fruit.id)) {
      this.slicedThisStroke.push(fruit.id);
    }

    this.lastSlicePoint = { x: fruit.x, y: fruit.y };

    const sliceDx = p2.x - p1.x;
    const sliceDy = p2.y - p1.y;

    this.particleSystem.spawnFruitHalves(
      fruit.x,
      fruit.y,
      fruit.vx,
      fruit.vy,
      fruit.halfAssetPath,
      fruit.assetPath,
      fruit.radius,
      fruit.rotation,
      sliceDx,
      sliceDy,
    );

    this.particleSystem.spawnFruitJuice(fruit.x, fruit.y, fruit.juiceColor);
    this.juiceSplashSystem.spawn(fruit.x, fruit.y, fruit.juiceColor);

    audioManager.playPitchShifted('slice', 0.85, 1.15);
    audioManager.playPitchShifted('splat', 0.9, 1.1);

    const multiplier = useGameStore.getState().recordSlice();

    const tierScore = fruit.baseScore;
    const basePoints = fruit.isCritical ? tierScore * 5 : tierScore;
    const finalPoints = Math.round(basePoints * multiplier);

    let textContent: string;
    let textColor: number;

    if (fruit.isCritical) {
      textContent = multiplier > 1 ? `CRITICAL! +${finalPoints}` : `CRITICAL +${basePoints}`;
      textColor = 0xff4444;
    } else if (multiplier > 1) {
      textContent = `+${finalPoints}`;
      textColor = 0xff9f4a;
    } else {
      textContent = `+${tierScore}`;
      textColor = tierScore === 1 ? 0xffffff : tierScore === 2 ? 0xffd709 : 0xff9f4a;
    }

    this.particleSystem.spawnFloatingText(
      fruit.x,
      fruit.y - 10,
      textContent,
      fruit.isCritical ? 32 : 24,
      textColor,
    );

    useGameStore.getState().addScore(finalPoints);

    const postSliceState = useGameStore.getState();
    useAchievementStore.getState().checkAndUnlock({
      fruitsSliced: postSliceState.fruitsSliced,
      bombsDodged: postSliceState.bombsDodged,
      sliceMisses: postSliceState.sliceMisses,
      maxCombo: postSliceState.maxCombo,
      score: postSliceState.score,
      mode: postSliceState.mode,
      timeLeft: postSliceState.timeLeft,
      sessionStartTime: postSliceState.sessionStartTime,
    });
  }

  private handleBombSlice(bomb: Bomb) {
    this.particleSystem.spawnExplosion(bomb.x, bomb.y);
    audioManager.play('bomb');

    if (this.screenFeedback) {
      this.screenFeedback.triggerBombFeedback();
    }

    useGameStore.getState().resetStreak();

    const store = useGameStore.getState();

    if (this.modeConfig.bombEndsGame) {
      useGameStore.setState({ endReason: 'bomb' });
      store.endGame();
    } else if (this.modeConfig.bombScorePenalty !== 0) {
      store.addScore(this.modeConfig.bombScorePenalty);
      this.particleSystem.spawnFloatingText(
        bomb.x,
        bomb.y - 20,
        `${this.modeConfig.bombScorePenalty}`,
        30,
        0xff3333,
      );
    }
  }
}

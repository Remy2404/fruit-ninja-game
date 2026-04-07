import { useAchievementStore } from '../../store/useAchievementStore';
import { useGameStore } from '../../store/useGameStore';
import type { ModeConfig } from '../config/ModeConfig';
import { Pool } from '../core/Pool';
import { Bomb } from '../entities/Bomb';
import { Fruit } from '../entities/Fruit';
import { lineToCircleIntersection } from '../utils/PhysicsMath';
import { audioManager } from './AudioManager';
import { ComboTracker, type ComboResolution } from './ComboTracker';
import type { SwipeSegment } from './InputSystem';
import { ParticleSystem } from './ParticleSystem';
import { PrecisionSystem } from './PrecisionSystem';
import { ScreenFeedbackSystem } from './ScreenFeedbackSystem';
import { JuiceSplashSystem } from './JuiceSplashSystem';
import { calculateComboBonus, calculateFruitSliceScore } from '../rules/scoring';

export interface SwipeSource {
  isSwiping: boolean;
  consumePendingSegments: (consumer: (segment: SwipeSegment) => void) => void;
}

export class CollisionSystem {
  private readonly inputSystem: SwipeSource;
  private readonly fruitPool: Pool<Fruit>;
  private readonly bombPool: Pool<Bomb>;
  private readonly particleSystem: ParticleSystem;
  private readonly juiceSplashSystem: JuiceSplashSystem;
  private readonly screenFeedback: ScreenFeedbackSystem | null;
  private readonly modeConfig: ModeConfig;
  private readonly comboTracker: ComboTracker;

  constructor(
    inputSystem: SwipeSource,
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
    this.comboTracker = new ComboTracker(modeConfig.combo);
  }

  public reset() {
    this.comboTracker.reset();
  }

  public update() {
    let shouldAbort = false;

    this.inputSystem.consumePendingSegments((segment) => {
      if (shouldAbort) return;

      shouldAbort = this.processSegment(segment) || shouldAbort;
    });

    if (shouldAbort) return;

    const comboResolution = this.comboTracker.update(
      this.inputSystem.isSwiping,
      performance.now(),
    );
    if (comboResolution) {
      this.applyComboResolution(comboResolution);
    }
  }

  private processSegment(segment: SwipeSegment): boolean {
    const { p1, p2 } = segment;

    for (let index = this.fruitPool.active.length - 1; index >= 0; index--) {
      const fruit = this.fruitPool.active[index];
      if (fruit.isSliced) continue;

      const isHit = lineToCircleIntersection(
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y },
        { x: fruit.x, y: fruit.y },
        fruit.radius + 12,
      );

      if (!isHit) continue;

      fruit.isSliced = true;
      this.handleFruitSlice(fruit, p1, p2);
      this.fruitPool.release(fruit);
    }

    for (let index = this.bombPool.active.length - 1; index >= 0; index--) {
      const bomb = this.bombPool.active[index];
      const isHit = lineToCircleIntersection(
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y },
        { x: bomb.x, y: bomb.y },
        bomb.radius + 10,
      );

      if (!isHit) continue;

      this.handleBombSlice(bomb);
      this.bombPool.release(bomb);

      if (useGameStore.getState().status !== 'playing') {
        return true;
      }
    }

    return false;
  }

  private handleFruitSlice(
    fruit: Fruit,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) {
    const comboResolution = this.comboTracker.registerSlice(
      fruit.id,
      fruit.x,
      fruit.y,
      performance.now(),
    );
    if (comboResolution) {
      this.applyComboResolution(comboResolution);
    }

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

    const streakMultiplier = useGameStore.getState().recordSlice();
    const precisionMultiplier = this.modeConfig.precision.enabled
      ? PrecisionSystem.calculatePrecisionMultiplier(fruit, p1, p2, this.modeConfig)
      : 1;
    const scoreBreakdown = calculateFruitSliceScore({
      baseScore: fruit.baseScore,
      isCritical: fruit.isCritical,
      precisionMultiplier,
      streakMultiplier,
      modeConfig: this.modeConfig,
      variant: fruit.variant,
    });
    const finalPoints = this.modeConfig.combo.comboOnly ? 0 : scoreBreakdown.finalPoints;

    this.particleSystem.spawnFloatingText(
      fruit.x,
      fruit.y - 10,
      this.buildSliceText(fruit, finalPoints, precisionMultiplier),
      fruit.isCritical ? 32 : 24,
      this.buildSliceTextColor(fruit, precisionMultiplier, finalPoints),
    );

    useGameStore.getState().addScore(finalPoints);
    this.unlockAchievementsFromState();
  }

  private buildSliceText(
    fruit: Fruit,
    finalPoints: number,
    precisionMultiplier: number,
  ): string {
    if (this.modeConfig.combo.comboOnly) {
      return 'SLICE!';
    }

    if (fruit.variant === 'cursed') {
      return `CURSED ${this.formatPoints(finalPoints)}`;
    }

    if (fruit.variant === 'gold') {
      return `GOLD ${this.formatPoints(finalPoints)}`;
    }

    if (precisionMultiplier >= this.modeConfig.precision.perfectMultiplier) {
      return `PERFECT ${this.formatPoints(finalPoints)}`;
    }

    if (
      this.modeConfig.precision.enabled &&
      precisionMultiplier <= this.modeConfig.precision.edgeMultiplier
    ) {
      return `SLOPPY ${this.formatPoints(finalPoints)}`;
    }

    if (fruit.isCritical) {
      return `CRITICAL ${this.formatPoints(finalPoints)}`;
    }

    return this.formatPoints(finalPoints);
  }

  private buildSliceTextColor(
    fruit: Fruit,
    precisionMultiplier: number,
    finalPoints: number,
  ): number {
    if (this.modeConfig.combo.comboOnly) return 0xcccccc;
    if (fruit.variant === 'cursed') return 0x8800ff;
    if (fruit.variant === 'gold') return 0xffd700;
    if (precisionMultiplier >= this.modeConfig.precision.perfectMultiplier) return 0x00ffff;
    if (
      this.modeConfig.precision.enabled &&
      precisionMultiplier <= this.modeConfig.precision.edgeMultiplier
    ) {
      return 0xaaaaaa;
    }
    if (fruit.isCritical) return 0xff4444;
    return finalPoints === 1 ? 0xffffff : finalPoints === 2 ? 0xffd709 : 0xff9f4a;
  }

  private formatPoints(points: number): string {
    return points >= 0 ? `+${points}` : `${points}`;
  }

  private applyComboResolution(resolution: ComboResolution) {
    const comboScore = calculateComboBonus(resolution.count, this.modeConfig.combo);
    if (comboScore <= 0) return;

    const state = useGameStore.getState();
    state.addScore(comboScore);
    state.registerCombo(resolution.count);

    this.particleSystem.spawnFloatingText(
      resolution.x,
      resolution.y - 40,
      `${resolution.count}x COMBO! +${comboScore}`,
      38,
      0xffcc00,
    );
    audioManager.play('combo');
    this.unlockAchievementsFromState();
  }

  private handleBombSlice(bomb: Bomb) {
    this.particleSystem.spawnExplosion(bomb.x, bomb.y);
    audioManager.play('bomb');
    this.screenFeedback?.triggerBombFeedback();

    this.comboTracker.reset();
    useGameStore.getState().resetStreak();

    const state = useGameStore.getState();
    if (this.modeConfig.bombs.endsGame) {
      state.endGame('bomb');
      return;
    }

    if (this.modeConfig.bombs.scorePenalty !== 0) {
      state.addScore(this.modeConfig.bombs.scorePenalty);
      this.particleSystem.spawnFloatingText(
        bomb.x,
        bomb.y - 20,
        `${this.modeConfig.bombs.scorePenalty}`,
        30,
        0xff3333,
      );
    }
  }

  private unlockAchievementsFromState() {
    const state = useGameStore.getState();
    useAchievementStore.getState().checkAndUnlock({
      fruitsSliced: state.fruitsSliced,
      bombsDodged: state.bombsDodged,
      fruitsMissed: state.fruitsMissed,
      maxCombo: state.maxCombo,
      score: state.score,
      mode: state.mode,
      timeLeft: state.timeLeft,
      sessionStartTime: state.sessionStartTime,
    });
  }
}

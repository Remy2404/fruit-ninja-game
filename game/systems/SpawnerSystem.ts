import { Container } from 'pixi.js';
import { useGameStore } from '../../store/useGameStore';
import type { GameplayObjectDef } from '../config/ObjectConfig';
import { getObjectSet } from '../config/ObjectConfig';
import { getObjectVisual, type ThemeConfig } from '../config/ThemeConfig';
import { Pool } from '../core/Pool';
import { Bomb } from '../entities/Bomb';
import { Fruit, type FruitSpawnDefinition } from '../entities/Fruit';
import type { ModeConfig } from '../config/ModeConfig';
import { RiskObjectSpawner } from './RiskObjectSpawner';

export class SpawnerSystem {
  private readonly fruitPool: Pool<Fruit>;
  private readonly bombPool: Pool<Bomb>;
  private readonly fruitLayer: Container;
  private readonly gravity: number;
  private readonly theme: ThemeConfig;
  private readonly modeConfig: ModeConfig;
  private readonly riskSpawner: RiskObjectSpawner | null;

  private screenWidth: number;
  private screenHeight: number;
  private spawnTimer = 0;
  private spawnInterval: number;
  private waveCount = 0;
  private weightedObjects: GameplayObjectDef[] = [];
  private totalWeight = 0;

  constructor(
    fruitPool: Pool<Fruit>,
    bombPool: Pool<Bomb>,
    fruitLayer: Container,
    width: number,
    height: number,
    gravity: number,
    theme: ThemeConfig,
    modeConfig: ModeConfig,
  ) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.fruitLayer = fruitLayer;
    this.screenWidth = width;
    this.screenHeight = height;
    this.gravity = gravity;
    this.theme = theme;
    this.modeConfig = modeConfig;
    this.spawnInterval = modeConfig.spawn.baseIntervalMs;
    this.riskSpawner = modeConfig.risk.enabled
      ? new RiskObjectSpawner(modeConfig.risk)
      : null;

    this.buildWeightedPool();
  }

  private buildWeightedPool() {
    this.weightedObjects = getObjectSet(this.modeConfig.spawn.objectSetId);
    this.totalWeight = this.weightedObjects.reduce(
      (total, objectDef) => total + objectDef.weight,
      0,
    );
  }

  private pickRandomObject(): GameplayObjectDef {
    let roll = Math.random() * this.totalWeight;
    for (const objectDef of this.weightedObjects) {
      roll -= objectDef.weight;
      if (roll <= 0) return objectDef;
    }
    return this.weightedObjects[this.weightedObjects.length - 1];
  }

  private buildFruitDefinition(objectDef: GameplayObjectDef): FruitSpawnDefinition {
    const visual = getObjectVisual(this.theme, objectDef.id);
    const textureScale = this.modeConfig.spawn.objectSetId === 'khmerSongkran' ? 2 : 1.30;
    return {
      id: objectDef.id,
      assetPath: visual.asset,
      halfAssetPath: visual.halfAsset,
      radius: objectDef.radius,
      baseScore: objectDef.baseScore,
      juiceColor: visual.juiceColor,
      textureScale,
    };
  }

  private getMaxGroupSize(score: number): number {
    let maxGroupSize = this.modeConfig.spawn.maxGroupThresholds[0]?.size ?? 1;
    for (const threshold of this.modeConfig.spawn.maxGroupThresholds) {
      if (score >= threshold.score) {
        maxGroupSize = threshold.size;
      }
    }
    return maxGroupSize;
  }

  public resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  public resetTimers() {
    this.spawnTimer = 0;
    this.spawnInterval = this.modeConfig.spawn.baseIntervalMs;
    this.waveCount = 0;
  }

  public update(dt: number) {
    this.spawnTimer += dt * 16.66;

    if (this.spawnTimer < this.spawnInterval) return;

    this.spawnWave();
    this.spawnTimer = 0;
    this.waveCount++;

    const score = useGameStore.getState().score;
    this.spawnInterval = Math.max(
      this.modeConfig.spawn.minIntervalMs,
      this.modeConfig.spawn.baseIntervalMs -
        score * this.modeConfig.spawn.scoreIntervalReduction -
        this.waveCount * this.modeConfig.spawn.waveIntervalReduction,
    );
  }

  private spawnWave() {
    const score = useGameStore.getState().score;
    const maxGroupSize = this.getMaxGroupSize(score);
    // Right-skewed: multiplying two randoms biases towards smaller groups.
    // P(size=1) is highest; large groups are rare and feel special — exactly
    // like original Fruit Ninja where multi-fruit waves are the exception.
    const count = Math.max(1, Math.ceil(Math.random() * Math.random() * maxGroupSize));
    const spreadWidth = this.screenWidth * this.modeConfig.spawn.spreadWidthRatio;
    const startX = this.screenWidth * this.modeConfig.spawn.startXRatio;

    const bombChance = !this.modeConfig.bombs.allow
      ? 0
      : Math.min(
          this.modeConfig.spawn.maxBombChance,
          this.modeConfig.spawn.baseBombChance +
            score * this.modeConfig.spawn.scoreBombChanceScale +
            this.waveCount * this.modeConfig.spawn.waveBombChanceScale,
        );
    // If this wave has a bomb, pick exactly one random slot for it.
    const bombSlot = Math.random() < bombChance ? Math.floor(Math.random() * count) : -1;

    for (let i = 0; i < count; i++) {
      const isBomb = i === bombSlot;
      const spawnX = startX + Math.random() * spreadWidth;
      const spawnY = this.screenHeight + 60;
      const centerOffsetX = (this.screenWidth / 2 - spawnX) * 0.012;
      const vx =
        centerOffsetX +
        (Math.random() - 0.5) * this.modeConfig.spawn.lateralVariance;
      const [minHeightRatio, maxHeightRatio] = this.modeConfig.spawn.targetHeightRange;
      const [minVelocityScale, maxVelocityScale] =
        this.modeConfig.spawn.launchVelocityScaleRange;
      const targetHeight =
        this.screenHeight * (minHeightRatio + Math.random() * (maxHeightRatio - minHeightRatio));
      const vy =
        -Math.sqrt(2 * this.gravity * targetHeight) *
        (minVelocityScale + Math.random() * (maxVelocityScale - minVelocityScale));

      if (isBomb) {
        const bomb = this.bombPool.get();
        if (!bomb.container.parent) {
          this.fruitLayer.addChild(bomb.container);
        }
        bomb.spawn(
          spawnX,
          spawnY,
          vx,
          vy,
          this.theme.bombAsset,
          this.modeConfig.bombs.radius,
        );
        continue;
      }

      const fruit = this.fruitPool.get();
      if (!fruit.container.parent) {
        this.fruitLayer.addChild(fruit.container);
      }

      const objectDef = this.pickRandomObject();
      fruit.spawn(spawnX, spawnY, vx, vy, this.buildFruitDefinition(objectDef));
      this.riskSpawner?.assignVariant(fruit);
    }
  }
}

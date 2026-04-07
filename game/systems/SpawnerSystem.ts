import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { Pool } from '../core/Pool';
import { useGameStore } from '../../store/useGameStore';
import { Container } from 'pixi.js';
import type { ThemeConfig, SliceableObjectDef } from '../config/ThemeConfig';
import type { ModeConfig } from '../config/ModeConfig';

export class SpawnerSystem {
  private fruitPool: Pool<Fruit>;
  private bombPool: Pool<Bomb>;
  private fruitLayer: Container;

  private screenWidth: number;
  private screenHeight: number;

  private spawnTimer = 0;
  private spawnInterval: number;
  private waveCount = 0;

  private gravity: number;
  private theme: ThemeConfig;
  private modeConfig: ModeConfig;

  private weightedObjects: SliceableObjectDef[] = [];
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
    this.spawnInterval = modeConfig.spawnIntervalMs;

    this.buildWeightedPool();
  }

  private buildWeightedPool() {
    this.weightedObjects = [];
    this.totalWeight = 0;
    for (let i = 0; i < this.theme.objects.length; i++) {
      const obj = this.theme.objects[i];
      this.totalWeight += obj.weight;
      this.weightedObjects.push(obj);
    }
  }

  private pickRandomObject(): SliceableObjectDef {
    let roll = Math.random() * this.totalWeight;
    for (let i = 0; i < this.weightedObjects.length; i++) {
      roll -= this.weightedObjects[i].weight;
      if (roll <= 0) return this.weightedObjects[i];
    }
    return this.weightedObjects[this.weightedObjects.length - 1];
  }

  public resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  public resetTimers() {
    this.spawnTimer = 0;
    this.spawnInterval = this.modeConfig.spawnIntervalMs;
    this.waveCount = 0;
  }

  public update(dt: number) {
    this.spawnTimer += dt * 16.66;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnWave();
      this.spawnTimer = 0;
      this.waveCount++;

      const score = useGameStore.getState().score;
      const minInterval = Math.max(this.modeConfig.spawnIntervalMs * 0.375, 500);
      this.spawnInterval = Math.max(
        minInterval,
        this.modeConfig.spawnIntervalMs - score * 8 - this.waveCount * 3,
      );
    }
  }

  private spawnWave() {
    const state = useGameStore.getState();
    const score = state.score;

    let maxGroupSize = 2;
    if (score > 30) maxGroupSize = 3;
    if (score > 80) maxGroupSize = 4;
    if (score > 150) maxGroupSize = 5;
    if (score > 250) maxGroupSize = 6;

    const count = Math.floor(Math.random() * maxGroupSize) + 1;
    const spreadWidth = this.screenWidth * 0.6;
    const startX = this.screenWidth * 0.2;

    for (let i = 0; i < count; i++) {
      const bombChance =
        !this.modeConfig.allowBombs
          ? 0
          : Math.min(0.25, 0.06 + score * 0.001 + this.waveCount * 0.002);
      const isBomb = Math.random() < bombChance;

      const spawnX = startX + Math.random() * spreadWidth;
      const spawnY = this.screenHeight + 60;

      const centerOffsetX = (this.screenWidth / 2 - spawnX) * 0.012;
      const vx = centerOffsetX + (Math.random() - 0.5) * 4;

      const targetHeight = this.screenHeight * (0.6 + Math.random() * 0.2);
      const vy =
        -Math.sqrt(2 * this.gravity * targetHeight) *
        (0.75 + Math.random() * 0.25);

      if (isBomb) {
        const b = this.bombPool.get();
        if (!b.container.parent) {
          this.fruitLayer.addChild(b.container);
        }
        b.spawn(spawnX, spawnY, vx, vy, this.theme.bombAsset, this.theme.bombRadius);
      } else {
        const objectDef = this.pickRandomObject();
        const f = this.fruitPool.get();
        if (!f.container.parent) {
          this.fruitLayer.addChild(f.container);
        }
        f.spawn(spawnX, spawnY, vx, vy, objectDef);
      }
    }
  }
}

import { Fruit, FruitType } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { Pool } from '../core/Pool';
import { useGameStore } from '../../store/useGameStore';
import { Container } from 'pixi.js';

// Weighted spawn pool — Tier 1 (common) appears 3×, Tier 2 twice, Tier 3 (exotic/large) once.
const ALL_FRUIT_TYPES: FruitType[] = [
  // Tier 1 — 1 pt each (appears 3× for higher frequency)
  'strawberry', 'strawberry', 'strawberry',
  'cherry',     'cherry',     'cherry',
  'grape',      'grape',      'grape',
  'blueberry',  'blueberry',  'blueberry',
  'raspberry',  'raspberry',  'raspberry',
  'apple',      'apple',      'apple',
  // Tier 2 — 2 pts each (appears 2×)
  'orange',  'orange',
  'peach',   'peach',
  'plum',    'plum',
  'kiwi',    'kiwi',
  'lemon',   'lemon',
  'lime',    'lime',
  'mango',   'mango',
  // Tier 3 — 3 pts each (appears once — rarer)
  'watermelon',
  'pineapple',
  'coconut',
  'banana',
  'dragonfruit',
  'starfruit',
  'pomegranate',
];

export class SpawnerSystem {
  private fruitPool: Pool<Fruit>;
  private bombPool: Pool<Bomb>;
  private fruitLayer: Container;

  private screenWidth: number;
  private screenHeight: number;

  private spawnTimer = 0;
  private spawnInterval = 1600;
  private waveCount = 0;

  private gravity: number;

  constructor(
    fruitPool: Pool<Fruit>,
    bombPool: Pool<Bomb>,
    fruitLayer: Container,
    width: number,
    height: number,
    gravity: number,
  ) {
    this.fruitPool = fruitPool;
    this.bombPool = bombPool;
    this.fruitLayer = fruitLayer;
    this.screenWidth = width;
    this.screenHeight = height;
    this.gravity = gravity;
  }

  public resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  public resetTimers() {
    this.spawnTimer = 0;
    this.spawnInterval = 1600;
    this.waveCount = 0;
  }

  public update(dt: number) {
    this.spawnTimer += dt * 16.66;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnWave();
      this.spawnTimer = 0;
      this.waveCount++;

      const state = useGameStore.getState();
      const score = state.score;
      this.spawnInterval = Math.max(600, 1600 - score * 8 - this.waveCount * 3);
    }
  }

  private spawnWave() {
    const state = useGameStore.getState();
    const mode = state.mode;
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
        mode === 'zen'
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
        b.spawn(spawnX, spawnY, vx, vy);
      } else {
        const type =
          ALL_FRUIT_TYPES[Math.floor(Math.random() * ALL_FRUIT_TYPES.length)];
        const f = this.fruitPool.get();
        if (!f.container.parent) {
          this.fruitLayer.addChild(f.container);
        }
        f.spawn(spawnX, spawnY, vx, vy, type);
      }
    }
  }
}

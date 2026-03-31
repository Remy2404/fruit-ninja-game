import { Application, Container, Graphics, Sprite, Texture, Assets } from 'pixi.js';
import { useGameStore } from '../../store/useGameStore';
import { InputSystem } from '../systems/InputSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SpawnerSystem } from '../systems/SpawnerSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { JuiceSplashSystem } from '../systems/JuiceSplashSystem';
import { audioManager } from '../systems/AudioManager';
import { Pool } from './Pool';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';

const ASSET_PATHS = [
  '/assets/bg.png',
  '/assets/watermelon.svg',
  '/assets/apple.svg',
  '/assets/orange.svg',
  '/assets/coconut.svg',
  '/assets/banana.svg',
  '/assets/pineapple.svg',
  '/assets/bomb.svg',
  '/assets/watermelon-half.svg',
  '/assets/apple-half.svg',
  '/assets/orange-half.svg',
  '/assets/coconut-half.svg',
  '/assets/banana-half.svg',
  '/assets/pineapple-half.svg',
];

export class FruitNinjaGame {
  private app: Application;
  private isDestroyed = false;
  private isInitialized = false;

  private backgroundLayer: Container;
  private splashLayer: Container;
  private fruitLayer: Container;
  private vfxLayer: Container;
  private trailLayer: Container;

  private canvasWrapper: HTMLElement;

  private inputSystem: InputSystem | null = null;
  private particleSystem: ParticleSystem | null = null;
  private spawnerSystem: SpawnerSystem | null = null;
  private collisionSystem: CollisionSystem | null = null;
  private juiceSplashSystem: JuiceSplashSystem | null = null;

  private fruitPool: Pool<Fruit> | null = null;
  private bombPool: Pool<Bomb> | null = null;

  private gravity = 0.25;
  private prevStatus = '';

  constructor(canvasWrapper: HTMLElement) {
    this.canvasWrapper = canvasWrapper;
    this.app = new Application();
    this.backgroundLayer = new Container();
    this.splashLayer = new Container();
    this.fruitLayer = new Container();
    this.vfxLayer = new Container();
    this.trailLayer = new Container();
  }

  public async init() {
    if (this.isDestroyed) return;

    const { width, height } = this.canvasWrapper.getBoundingClientRect();

    await this.app.init({
      width,
      height,
      backgroundColor: 0x1a0e06,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });

    if (this.isDestroyed) {
      try { this.app.destroy(true); } catch { /* race */ }
      return;
    }

    await Assets.load(ASSET_PATHS);

    if (this.isDestroyed) {
      try { this.app.destroy(true); } catch { /* race */ }
      return;
    }

    this.canvasWrapper.appendChild(this.app.canvas);

    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.splashLayer);
    this.app.stage.addChild(this.fruitLayer);
    this.app.stage.addChild(this.vfxLayer);
    this.app.stage.addChild(this.trailLayer);

    this.drawBackground();

    window.addEventListener('resize', this.onResize);

    this.inputSystem = new InputSystem(this.app, this.trailLayer);
    this.particleSystem = new ParticleSystem(this.vfxLayer);
    this.juiceSplashSystem = new JuiceSplashSystem(this.splashLayer);

    this.fruitPool = new Pool<Fruit>(
      () => new Fruit(),
      40,
      undefined,
      (obj) => obj.reset(),
    );

    this.bombPool = new Pool<Bomb>(
      () => new Bomb(),
      10,
      undefined,
      (obj) => obj.reset(),
    );

    this.spawnerSystem = new SpawnerSystem(
      this.fruitPool,
      this.bombPool,
      this.fruitLayer,
      width,
      height,
      this.gravity,
    );

    this.collisionSystem = new CollisionSystem(
      this.inputSystem,
      this.fruitPool,
      this.bombPool,
      this.particleSystem,
      this.juiceSplashSystem,
    );

    this.app.ticker.add(this.update);
    this.isInitialized = true;
  }

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);

    if (this.app.ticker) {
      this.app.ticker.remove(this.update);
    }

    this.inputSystem?.destroy();
    this.particleSystem?.destroy();
    this.juiceSplashSystem?.destroy();
    this.fruitPool?.reset();
    this.bombPool?.reset();

    if (this.isInitialized && this.app.renderer) {
      try {
        this.app.destroy({ removeView: true });
      } catch {
        /* Pixi v8 destroy race (e.g. _cancelResize) is non-critical */
      }
    }
  }

  private onResize = () => {
    if (this.isDestroyed || !this.canvasWrapper || !this.app.renderer) return;
    const { width, height } = this.canvasWrapper.getBoundingClientRect();
    this.app.renderer.resize(width, height);
    this.drawBackground();
    this.spawnerSystem?.resize(width, height);
  };

  private drawBackground() {
    this.backgroundLayer.removeChildren();
    const { width, height } = this.app.renderer;

    const texture = Assets.get<Texture>('/assets/bg.png');
    if (!texture) return;

    const sprite = new Sprite(texture);

    const scaleX = width / texture.width;
    const scaleY = height / texture.height;
    const coverScale = Math.max(scaleX, scaleY);

    sprite.width = texture.width * coverScale;
    sprite.height = texture.height * coverScale;
    sprite.x = (width - sprite.width) / 2;
    sprite.y = (height - sprite.height) / 2;

    this.backgroundLayer.addChild(sprite);
  }

  private update = () => {
    if (this.isDestroyed || !this.isInitialized) return;

    const dt = this.app.ticker.deltaTime;
    const state = useGameStore.getState();
    const status = state.status;

    this.inputSystem!.update(dt);
    this.particleSystem!.update(dt, this.gravity);
    this.juiceSplashSystem!.update(dt);

    if (status === 'playing' && this.prevStatus !== 'playing') {
      this.onGameStart();
    }

    if (status === 'gameover' && this.prevStatus === 'playing') {
      audioManager.play('gameover');
    }

    this.prevStatus = status;

    if (status !== 'playing') return;

    this.spawnerSystem!.update(dt);
    this.collisionSystem!.update(dt);

    const { height } = this.app.renderer;

    for (let i = this.fruitPool!.active.length - 1; i >= 0; i--) {
      const fruit = this.fruitPool!.active[i];
      fruit.update(dt, this.gravity);

      if (fruit.y > height + 150) {
        if (!fruit.isSliced) {
          const currentState = useGameStore.getState();
          if (currentState.mode === 'classic') {
            currentState.loseLife();
            audioManager.play('miss');
          }
        }
        this.fruitPool!.release(fruit);
      }
    }

    for (let i = this.bombPool!.active.length - 1; i >= 0; i--) {
      const bomb = this.bombPool!.active[i];
      bomb.update(dt, this.gravity);

      if (bomb.y > height + 150) {
        this.bombPool!.release(bomb);
      }
    }
  };

  private onGameStart() {
    this.fruitPool?.reset();
    this.bombPool?.reset();
    this.spawnerSystem?.resetTimers();
    this.juiceSplashSystem?.clear();
    audioManager.play('start');
  }
}

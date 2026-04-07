import { Application, Container, Assets } from 'pixi.js';
import { useGameStore } from '../../store/useGameStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import { InputSystem } from '../systems/InputSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SpawnerSystem } from '../systems/SpawnerSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { JuiceSplashSystem } from '../systems/JuiceSplashSystem';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { ScreenFeedbackSystem } from '../systems/ScreenFeedbackSystem';
import { audioManager } from '../systems/AudioManager';
import { Pool } from './Pool';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { getModeConfig } from '../config/ModeConfig';
import { getThemeConfig, buildAssetManifest } from '../config/ThemeConfig';
import type { ModeConfig } from '../config/ModeConfig';
import type { ThemeConfig } from '../config/ThemeConfig';
import { MemoryFadeSystem } from '../systems/MemoryFadeSystem';
import { WaveMotionSystem } from '../systems/WaveMotionSystem';
import { TimeControlSystem } from '../systems/TimeControlSystem';

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
  private backgroundSystem: BackgroundSystem | null = null;
  private screenFeedback: ScreenFeedbackSystem | null = null;

  private fruitPool: Pool<Fruit> | null = null;
  private bombPool: Pool<Bomb> | null = null;

  private memoryFadeSystem: MemoryFadeSystem | null = null;
  private waveMotionSystem: WaveMotionSystem | null = null;
  private timeControlSystem: TimeControlSystem | null = null;

  private gravity = 0.25;
  private prevStatus = '';

  private modeConfig: ModeConfig;
  private themeConfig: ThemeConfig;

  constructor(canvasWrapper: HTMLElement) {
    this.canvasWrapper = canvasWrapper;
    this.app = new Application();
    this.backgroundLayer = new Container();
    this.splashLayer = new Container();
    this.fruitLayer = new Container();
    this.vfxLayer = new Container();
    this.trailLayer = new Container();

    const state = useGameStore.getState();
    this.modeConfig = getModeConfig(state.mode);
    this.themeConfig = getThemeConfig(state.themeId);
  }

  public async init() {
    if (this.isDestroyed) return;

    const { width, height } = this.canvasWrapper.getBoundingClientRect();

    await this.app.init({
      width,
      height,
      backgroundColor: this.themeConfig.backgroundColor,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });

    if (this.isDestroyed) {
      try { this.app.destroy(true); } catch { /* race */ }
      return;
    }

    // Store app reference for BackgroundSystem water texture generation
    (globalThis as Record<string, unknown>).__pixiApp = this.app;

    const assetManifest = buildAssetManifest(this.themeConfig);
    await Assets.load(assetManifest);

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

    this.backgroundSystem = new BackgroundSystem(this.backgroundLayer, this.themeConfig);
    this.backgroundSystem.init(width, height);

    this.screenFeedback = new ScreenFeedbackSystem(this.app);

    window.addEventListener('resize', this.onResize);

    this.inputSystem = new InputSystem(this.app, this.trailLayer);
    this.particleSystem = new ParticleSystem(
      this.vfxLayer,
      this.themeConfig.particleStyle.colors,
      this.themeConfig.particleStyle.scale,
    );
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
      this.themeConfig,
      this.modeConfig,
    );

    this.collisionSystem = new CollisionSystem(
      this.inputSystem,
      this.fruitPool,
      this.bombPool,
      this.particleSystem,
      this.juiceSplashSystem,
      this.modeConfig,
      this.screenFeedback,
    );

    this.memoryFadeSystem = new MemoryFadeSystem(this.fruitPool, this.bombPool, this.modeConfig);
    this.waveMotionSystem = new WaveMotionSystem(this.fruitPool, this.bombPool, this.modeConfig);
    this.timeControlSystem = new TimeControlSystem(this.modeConfig);

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
    this.backgroundSystem?.destroy();
    this.screenFeedback?.destroy();
    this.fruitPool?.reset();
    this.bombPool?.reset();

    delete (globalThis as Record<string, unknown>).__pixiApp;

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
    this.backgroundSystem?.resize(width, height);
    this.spawnerSystem?.resize(width, height);
    this.screenFeedback?.resize();
  };

  private update = () => {
    if (this.isDestroyed || !this.isInitialized) return;

    const dt = this.app.ticker.deltaTime;
    const state = useGameStore.getState();
    const timeScale = state.timeScale || 1.0;
    const scaledDt = dt * timeScale;
    const status = state.status;

    this.timeControlSystem?.update(dt);

    this.inputSystem!.update(dt);
    this.particleSystem!.update(scaledDt, this.gravity);
    this.juiceSplashSystem!.update(scaledDt);
    this.backgroundSystem?.update(scaledDt);
    this.screenFeedback?.update(scaledDt);

    if (status === 'playing' && this.prevStatus !== 'playing') {
      this.onGameStart();
    }

    if (status === 'gameover' && this.prevStatus === 'playing') {
      audioManager.play('gameover');
    }

    this.prevStatus = status;

    if (status !== 'playing') return;

    this.spawnerSystem!.update(scaledDt);
    this.collisionSystem!.update(scaledDt);
    
    this.memoryFadeSystem?.update(scaledDt);
    this.waveMotionSystem?.update(scaledDt);

    const { height } = this.app.renderer;

    for (let i = this.fruitPool!.active.length - 1; i >= 0; i--) {
      const fruit = this.fruitPool!.active[i];
      fruit.update(scaledDt, this.gravity);

      if (fruit.y > height + 150) {
        if (!fruit.isSliced) {
          const currentState = useGameStore.getState();
          currentState.recordMiss();

          if (this.modeConfig.missCostsLife) {
            currentState.loseLife();
            audioManager.play('miss');
          }

          const postMissState = useGameStore.getState();
          useAchievementStore.getState().checkAndUnlock({
            fruitsSliced: postMissState.fruitsSliced,
            bombsDodged: postMissState.bombsDodged,
            sliceMisses: postMissState.sliceMisses,
            maxCombo: postMissState.maxCombo,
            score: postMissState.score,
            mode: postMissState.mode,
            timeLeft: postMissState.timeLeft,
            sessionStartTime: postMissState.sessionStartTime,
          });
        }
        this.fruitPool!.release(fruit);
      }
    }

    for (let i = this.bombPool!.active.length - 1; i >= 0; i--) {
      const bomb = this.bombPool!.active[i];
      bomb.update(scaledDt, this.gravity);

      if (bomb.y > height + 150) {
        const dodgeState = useGameStore.getState();
        dodgeState.recordBombDodged();
        const postDodgeState = useGameStore.getState();
        useAchievementStore.getState().checkAndUnlock({
          fruitsSliced: postDodgeState.fruitsSliced,
          bombsDodged: postDodgeState.bombsDodged,
          sliceMisses: postDodgeState.sliceMisses,
          maxCombo: postDodgeState.maxCombo,
          score: postDodgeState.score,
          mode: postDodgeState.mode,
          timeLeft: postDodgeState.timeLeft,
          sessionStartTime: postDodgeState.sessionStartTime,
        });
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
    useAchievementStore.getState().resetSession();
  }
}

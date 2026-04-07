import { Application, Assets, Container } from 'pixi.js';
import { useAchievementStore } from '../../store/useAchievementStore';
import { useGameStore } from '../../store/useGameStore';
import { getModeConfig, type ModeConfig } from '../config/ModeConfig';
import {
  buildAssetManifest,
  getThemeConfig,
  type ThemeConfig,
} from '../config/ThemeConfig';
import { Bomb } from '../entities/Bomb';
import { Fruit } from '../entities/Fruit';
import { Pool } from './Pool';
import { runGameplayFramePhase } from './runGameplayFrame';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { InputSystem } from '../systems/InputSystem';
import { JuiceSplashSystem } from '../systems/JuiceSplashSystem';
import { MemoryFadeSystem } from '../systems/MemoryFadeSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { RoundTimerSystem } from '../systems/RoundTimerSystem';
import { ScreenFeedbackSystem } from '../systems/ScreenFeedbackSystem';
import { SpawnerSystem } from '../systems/SpawnerSystem';
import { TimeControlSystem } from '../systems/TimeControlSystem';
import { WaveMotionSystem } from '../systems/WaveMotionSystem';
import { audioManager } from '../systems/AudioManager';

export class FruitNinjaGame {
  private readonly app: Application;
  private readonly backgroundLayer: Container;
  private readonly splashLayer: Container;
  private readonly fruitLayer: Container;
  private readonly vfxLayer: Container;
  private readonly trailLayer: Container;
  private readonly canvasWrapper: HTMLElement;

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
  private roundTimerSystem: RoundTimerSystem | null = null;

  private readonly gravity = 0.25;
  private prevStatus = '';
  private isDestroyed = false;
  private isInitialized = false;
  private readonly modeConfig: ModeConfig;
  private readonly themeConfig: ThemeConfig;

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
      try {
        this.app.destroy(true);
      } catch {
        // Ignore Pixi destroy races during teardown.
      }
      return;
    }

    await Assets.load(buildAssetManifest(this.themeConfig, this.modeConfig.spawn.objectSetId));
    if (this.isDestroyed) {
      try {
        this.app.destroy(true);
      } catch {
        // Ignore Pixi destroy races during teardown.
      }
      return;
    }

    this.canvasWrapper.appendChild(this.app.canvas);
    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.splashLayer);
    this.app.stage.addChild(this.fruitLayer);
    this.app.stage.addChild(this.vfxLayer);
    this.app.stage.addChild(this.trailLayer);

    this.backgroundSystem = new BackgroundSystem(
      this.backgroundLayer,
      this.themeConfig,
      (graphics) => this.app.renderer.generateTexture(graphics),
    );
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
      { initialSize: 40, name: 'fruit-pool' },
      undefined,
      (fruit) => fruit.reset(),
    );
    this.bombPool = new Pool<Bomb>(
      () => new Bomb(),
      { initialSize: 10, name: 'bomb-pool' },
      undefined,
      (bomb) => bomb.reset(),
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
    this.memoryFadeSystem = new MemoryFadeSystem(
      this.fruitPool,
      this.bombPool,
      this.modeConfig,
    );
    this.waveMotionSystem = new WaveMotionSystem(
      this.fruitPool,
      this.bombPool,
      this.modeConfig,
    );
    this.timeControlSystem = new TimeControlSystem(this.modeConfig);
    this.roundTimerSystem = new RoundTimerSystem();

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

    if (this.isInitialized && this.app.renderer) {
      try {
        this.app.destroy({ removeView: true });
      } catch {
        // Ignore Pixi v8 destroy races during teardown.
      }
    }
  }

  private onResize = () => {
    if (this.isDestroyed || !this.app.renderer) return;

    const { width, height } = this.canvasWrapper.getBoundingClientRect();
    this.app.renderer.resize(width, height);
    this.backgroundSystem?.resize(width, height);
    this.spawnerSystem?.resize(width, height);
    this.screenFeedback?.resize();
  };

  private update = () => {
    if (this.isDestroyed || !this.isInitialized) return;

    const frameDt = this.app.ticker.deltaTime;
    const frameMs = frameDt * 16.66;
    const stateBeforeSystems = useGameStore.getState();
    const status = stateBeforeSystems.status;

    this.roundTimerSystem?.update(frameMs);
    this.timeControlSystem?.update(frameMs);

    const timeScale = useGameStore.getState().timeScale || 1;
    const scaledDt = frameDt * timeScale;

    this.inputSystem?.update();
    this.particleSystem?.update(scaledDt, this.gravity);
    this.juiceSplashSystem?.update(scaledDt);
    this.backgroundSystem?.update(scaledDt);
    this.screenFeedback?.update(scaledDt);

    if (status === 'playing' && this.prevStatus !== 'playing') {
      this.onGameStart();
    }

    if (status === 'gameover' && this.prevStatus === 'playing') {
      audioManager.play('gameover');
    }

    this.prevStatus = status;
    if (useGameStore.getState().status !== 'playing') return;

    runGameplayFramePhase({
      getStatus: () => useGameStore.getState().status,
      runSpawner: () => this.spawnerSystem?.update(scaledDt),
      runCollision: () => this.collisionSystem?.update(),
      runMemoryFade: () => this.memoryFadeSystem?.update(),
      runWaveMotion: () => this.waveMotionSystem?.update(scaledDt),
      runEntityUpdates: () => this.updateActiveEntities(scaledDt),
    });
  };

  private updateActiveEntities(scaledDt: number) {
    if (!this.fruitPool || !this.bombPool) return;

    const rendererHeight = this.app.renderer.height;

    for (let index = this.fruitPool.active.length - 1; index >= 0; index--) {
      const fruit = this.fruitPool.active[index];
      fruit.update(scaledDt, this.gravity);

      if (fruit.y <= rendererHeight + 150) continue;

      if (!fruit.isSliced) {
        const state = useGameStore.getState();
        state.recordFruitMissed();
        if (this.modeConfig.misses.costsLife) {
          state.loseLife();
          audioManager.play('miss');
        }
        this.unlockAchievementsFromState();

        if (useGameStore.getState().status !== 'playing') {
          this.fruitPool.release(fruit);
          return;
        }
      }

      this.fruitPool.release(fruit);
    }

    for (let index = this.bombPool.active.length - 1; index >= 0; index--) {
      const bomb = this.bombPool.active[index];
      bomb.update(scaledDt, this.gravity);

      if (bomb.y <= rendererHeight + 150) continue;

      useGameStore.getState().recordBombDodged();
      this.unlockAchievementsFromState();
      this.bombPool.release(bomb);

      if (useGameStore.getState().status !== 'playing') {
        return;
      }
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

  private onGameStart() {
    this.fruitPool?.reset();
    this.bombPool?.reset();
    this.spawnerSystem?.resetTimers();
    this.waveMotionSystem?.reset();
    this.roundTimerSystem?.reset();
    this.collisionSystem?.reset();
    this.inputSystem?.reset();
    this.juiceSplashSystem?.clear();
    audioManager.play('start');
    useAchievementStore.getState().resetSession();
  }
}

import { Application, Graphics } from 'pixi.js';

const SHAKE_DURATION = 400;
const SHAKE_INTENSITY = 8;
const FLASH_DURATION = 300;
const FLASH_MAX_ALPHA = 0.55;

export class ScreenFeedbackSystem {
  private app: Application;
  private flashOverlay: Graphics;

  private shakeTimer = 0;
  private shakeIntensity = 0;
  private originalStageX = 0;
  private originalStageY = 0;

  private flashTimer = 0;
  private isFlashing = false;

  constructor(app: Application) {
    this.app = app;

    this.flashOverlay = new Graphics();
    this.flashOverlay.visible = false;
    this.app.stage.addChild(this.flashOverlay);
  }

  public triggerBombFeedback() {
    this.triggerShake(SHAKE_INTENSITY, SHAKE_DURATION);
    this.triggerFlash(FLASH_DURATION);
  }

  private triggerShake(intensity: number, durationMs: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = durationMs;
    this.originalStageX = 0;
    this.originalStageY = 0;
  }

  private triggerFlash(durationMs: number) {
    this.flashTimer = durationMs;
    this.isFlashing = true;

    const { width, height } = this.app.renderer;
    this.flashOverlay.clear();
    this.flashOverlay.rect(0, 0, width + 40, height + 40);
    this.flashOverlay.fill({ color: 0xffffff, alpha: 1 });
    this.flashOverlay.position.set(-20, -20);
    this.flashOverlay.alpha = FLASH_MAX_ALPHA;
    this.flashOverlay.visible = true;
  }

  public update(dt: number) {
    const frameDelta = dt * 16.66;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= frameDelta;
      const decay = Math.max(0, this.shakeTimer / SHAKE_DURATION);
      const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay;
      const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay;
      this.app.stage.x = this.originalStageX + offsetX;
      this.app.stage.y = this.originalStageY + offsetY;

      if (this.shakeTimer <= 0) {
        this.app.stage.x = this.originalStageX;
        this.app.stage.y = this.originalStageY;
      }
    }

    if (this.isFlashing) {
      this.flashTimer -= frameDelta;
      const flashProgress = Math.max(0, this.flashTimer / FLASH_DURATION);
      this.flashOverlay.alpha = FLASH_MAX_ALPHA * flashProgress;

      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        this.flashOverlay.visible = false;
        this.flashOverlay.alpha = 0;
      }
    }
  }

  public resize() {
    if (this.isFlashing) {
      const { width, height } = this.app.renderer;
      this.flashOverlay.clear();
      this.flashOverlay.rect(0, 0, width + 40, height + 40);
      this.flashOverlay.fill({ color: 0xffffff, alpha: 1 });
      this.flashOverlay.position.set(-20, -20);
    }
  }

  public destroy() {
    this.app.stage.x = this.originalStageX;
    this.app.stage.y = this.originalStageY;

    if (this.flashOverlay && !this.flashOverlay.destroyed) {
      this.flashOverlay.destroy();
    }
  }
}

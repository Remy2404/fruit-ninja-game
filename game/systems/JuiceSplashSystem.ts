import { Container, Graphics } from 'pixi.js';

interface JuiceSplash {
  graphics: Graphics;
  active: boolean;
  life: number;
  decay: number;
}

const MAX_SPLASHES = 60;

export class JuiceSplashSystem {
  private readonly container: Container;
  private readonly splashes: JuiceSplash[] = [];
  private nextSplashIndex = 0;

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);

    for (let index = 0; index < MAX_SPLASHES; index++) {
      const graphics = new Graphics();
      graphics.visible = false;
      this.container.addChild(graphics);
      this.splashes.push({
        graphics,
        active: false,
        life: 0,
        decay: 0,
      });
    }
  }

  public spawn(x: number, y: number, color: number) {
    const count = Math.floor(Math.random() * 3) + 2;

    for (let index = 0; index < count; index++) {
      const splash = this.splashes[this.nextSplashIndex];
      this.nextSplashIndex = (this.nextSplashIndex + 1) % this.splashes.length;

      const dropX = x + (Math.random() - 0.5) * 60;
      const dropY = y + (Math.random() - 0.5) * 40;
      const radius = Math.random() * 12 + 6;
      const streakAngle = Math.random() * Math.PI * 2;
      const streakLength = Math.random() * 20 + 10;

      splash.active = true;
      splash.life = 1;
      splash.decay = 0.003 + Math.random() * 0.002;

      splash.graphics.clear();
      splash.graphics.circle(dropX, dropY, radius);
      splash.graphics.fill({ color, alpha: 0.35 });
      splash.graphics.circle(
        dropX + Math.cos(streakAngle) * streakLength,
        dropY + Math.sin(streakAngle) * streakLength,
        radius * 0.5,
      );
      splash.graphics.fill({ color, alpha: 0.2 });
      splash.graphics.alpha = 0.5;
      splash.graphics.visible = true;
    }
  }

  public update(dt: number) {
    for (const splash of this.splashes) {
      if (!splash.active) continue;

      splash.life -= splash.decay * dt;
      if (splash.life <= 0) {
        splash.active = false;
        splash.graphics.visible = false;
        splash.graphics.clear();
        continue;
      }

      splash.graphics.alpha = splash.life * 0.5;
    }
  }

  public clear() {
    for (const splash of this.splashes) {
      splash.active = false;
      splash.life = 0;
      splash.graphics.visible = false;
      splash.graphics.clear();
    }
  }

  public destroy() {
    for (const splash of this.splashes) {
      splash.graphics.destroy();
    }
    this.splashes.length = 0;
    this.container.destroy();
  }
}

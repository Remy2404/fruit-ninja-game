import { Container, Graphics } from 'pixi.js';

interface JuiceSplash {
  graphics: Graphics;
  life: number;
  decay: number;
}

const MAX_SPLASHES = 60;

export class JuiceSplashSystem {
  private container: Container;
  private splashes: JuiceSplash[] = [];

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);
  }

  public spawn(x: number, y: number, color: number) {
    const count = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < count; i++) {
      const g = new Graphics();

      const dropX = x + (Math.random() - 0.5) * 60;
      const dropY = y + (Math.random() - 0.5) * 40;
      const radius = Math.random() * 12 + 6;

      g.circle(dropX, dropY, radius);
      g.fill({ color, alpha: 0.35 });

      const streakAngle = Math.random() * Math.PI * 2;
      const streakLen = Math.random() * 20 + 10;
      g.circle(
        dropX + Math.cos(streakAngle) * streakLen,
        dropY + Math.sin(streakAngle) * streakLen,
        radius * 0.5,
      );
      g.fill({ color, alpha: 0.2 });

      this.container.addChild(g);

      const splash: JuiceSplash = {
        graphics: g,
        life: 1.0,
        decay: 0.003 + Math.random() * 0.002,
      };

      this.splashes.push(splash);
    }

    while (this.splashes.length > MAX_SPLASHES) {
      const oldest = this.splashes.shift();
      if (oldest) {
        oldest.graphics.destroy();
      }
    }
  }

  public update(dt: number) {
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const splash = this.splashes[i];
      splash.life -= splash.decay * dt;

      if (splash.life <= 0) {
        splash.graphics.destroy();
        this.splashes.splice(i, 1);
      } else {
        splash.graphics.alpha = splash.life * 0.5;
      }
    }
  }

  public clear() {
    for (const splash of this.splashes) {
      splash.graphics.destroy();
    }
    this.splashes = [];
  }

  public destroy() {
    this.clear();
    this.container.destroy();
  }
}

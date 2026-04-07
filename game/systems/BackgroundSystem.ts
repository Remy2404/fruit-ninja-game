import { Container, Sprite, Assets, Graphics, Texture, TilingSprite, BlurFilter } from 'pixi.js';
import type { ThemeConfig } from '../config/ThemeConfig';

interface FloatingParticle {
  graphics: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

const MAX_FLOATING_PARTICLES = 40;
const WATER_ALPHA = 0.12;
const PARALLAX_STRENGTH = 0.0003;

export class BackgroundSystem {
  private container: Container;
  private bgSprite: Sprite | null = null;
  private waterTile: TilingSprite | null = null;
  private particleLayer: Container;
  private particles: FloatingParticle[] = [];
  private theme: ThemeConfig;

  private screenWidth = 0;
  private screenHeight = 0;
  private elapsed = 0;

  constructor(parent: Container, theme: ThemeConfig) {
    this.theme = theme;
    this.container = new Container();
    this.particleLayer = new Container();

    parent.addChild(this.container);
  }

  public init(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;

    this.drawStaticBackground();

    if (this.theme.hasWaterOverlay) {
      this.createWaterLayer();
    }

    if (this.theme.hasFloatingParticles) {
      this.container.addChild(this.particleLayer);
      this.seedParticles();
    }
  }

  private drawStaticBackground() {
    if (this.bgSprite) {
      this.container.removeChild(this.bgSprite);
      this.bgSprite.destroy();
      this.bgSprite = null;
    }

    const texture = Assets.get<Texture>(this.theme.backgroundAsset);
    if (!texture) return;

    this.bgSprite = new Sprite(texture);
    this.fitCover(this.bgSprite, texture);

    if (this.theme.blurStrength && this.theme.blurStrength > 0) {
      const blurFilter = new BlurFilter({
        strength: this.theme.blurStrength,
        quality: 4,
      });
      this.bgSprite.filters = [blurFilter];
    }

    this.container.addChildAt(this.bgSprite, 0);
  }

  private fitCover(sprite: Sprite, texture: Texture) {
    const scaleX = this.screenWidth / texture.width;
    const scaleY = this.screenHeight / texture.height;
    const coverScale = Math.max(scaleX, scaleY);

    sprite.width = texture.width * coverScale;
    sprite.height = texture.height * coverScale;
    sprite.x = (this.screenWidth - sprite.width) / 2;
    sprite.y = (this.screenHeight - sprite.height) / 2;
  }

  private createWaterLayer() {
    if (this.waterTile) {
      this.container.removeChild(this.waterTile);
      this.waterTile.destroy();
      this.waterTile = null;
    }

    const g = new Graphics();
    const tileW = 256;
    const tileH = 64;

    for (let x = 0; x < tileW; x++) {
      const waveY = Math.sin((x / tileW) * Math.PI * 4) * 8 + tileH * 0.5;
      const alpha = 0.3 + Math.sin((x / tileW) * Math.PI * 2) * 0.15;
      g.circle(x, waveY, 2 + Math.random() * 3);
      g.fill({ color: 0x42a5f5, alpha });
    }

    const renderer = (globalThis as Record<string, unknown>).__pixiApp as { renderer?: { generateTexture: (g: Graphics) => Texture } } | undefined;

    let waterTexture: Texture | null = null;
    if (renderer?.renderer) {
      waterTexture = renderer.renderer.generateTexture(g);
    }
    g.destroy();

    if (!waterTexture) {
      const fallbackG = new Graphics();
      fallbackG.rect(0, 0, this.screenWidth, 80);
      fallbackG.fill({ color: 0x42a5f5, alpha: WATER_ALPHA });
      this.container.addChild(fallbackG);
      return;
    }

    this.waterTile = new TilingSprite({
      texture: waterTexture,
      width: this.screenWidth,
      height: 80,
    });
    this.waterTile.alpha = WATER_ALPHA;
    this.waterTile.y = this.screenHeight - 120;
    this.container.addChild(this.waterTile);
  }

  private seedParticles() {
    for (let i = 0; i < MAX_FLOATING_PARTICLES; i++) {
      this.spawnParticle(true);
    }
  }

  private spawnParticle(randomizeLife: boolean) {
    const colors = [0x42a5f5, 0x81d4fa, 0xfff59d, 0xc8e6c9, 0xffcc80];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 1.5 + Math.random() * 3;
    const maxLife = 200 + Math.random() * 400;

    const g = new Graphics();
    g.circle(0, 0, size);
    g.fill({ color, alpha: 0.6 });

    const particle: FloatingParticle = {
      graphics: g,
      x: Math.random() * this.screenWidth,
      y: Math.random() * this.screenHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.4),
      life: randomizeLife ? Math.random() * maxLife : maxLife,
      maxLife,
      size,
      color,
    };

    g.position.set(particle.x, particle.y);
    this.particleLayer.addChild(g);
    this.particles.push(particle);
  }

  public update(dt: number) {
    this.elapsed += dt;

    if (this.bgSprite && this.theme.hasWaterOverlay) {
      const driftX = Math.sin(this.elapsed * PARALLAX_STRENGTH) * 4;
      const driftY = Math.cos(this.elapsed * PARALLAX_STRENGTH * 0.7) * 2;
      this.bgSprite.x = (this.screenWidth - this.bgSprite.width) / 2 + driftX;
      this.bgSprite.y = (this.screenHeight - this.bgSprite.height) / 2 + driftY;
    }

    if (this.waterTile) {
      this.waterTile.tilePosition.x += 0.5 * dt;
      this.waterTile.tilePosition.y = Math.sin(this.elapsed * 0.02) * 3;
    }

    if (this.theme.hasFloatingParticles) {
      this.updateParticles(dt);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.graphics.position.set(p.x, p.y);
      const lifeRatio = Math.max(0, p.life / p.maxLife);
      p.graphics.alpha = lifeRatio * 0.6;

      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > this.screenWidth + 20) {
        p.graphics.destroy();
        this.particles.splice(i, 1);
        this.spawnParticle(false);
      }
    }
  }

  public resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;

    if (this.bgSprite) {
      const texture = Assets.get<Texture>(this.theme.backgroundAsset);
      if (texture) {
        this.fitCover(this.bgSprite, texture);
      }
    }

    if (this.waterTile) {
      this.waterTile.width = width;
      this.waterTile.y = height - 120;
    }
  }

  public destroy() {
    for (const p of this.particles) {
      p.graphics.destroy();
    }
    this.particles.length = 0;

    if (this.waterTile) {
      this.waterTile.destroy();
      this.waterTile = null;
    }

    if (this.bgSprite) {
      this.bgSprite.destroy();
      this.bgSprite = null;
    }

    this.particleLayer.destroy();
    this.container.destroy();
  }
}

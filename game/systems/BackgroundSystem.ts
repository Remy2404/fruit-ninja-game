import {
  Assets,
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
import type { ThemeConfig } from '../config/ThemeConfig';

interface FloatingParticle {
  graphics: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const MAX_FLOATING_PARTICLES = 40;
const WATER_ALPHA = 0.12;
const PARALLAX_STRENGTH = 0.0003;
const FLOATING_PARTICLE_COLORS = [0x42a5f5, 0x81d4fa, 0xfff59d, 0xc8e6c9, 0xffcc80];

export class BackgroundSystem {
  private readonly container: Container;
  private readonly particleLayer: Container;
  private readonly theme: ThemeConfig;
  private readonly generateTexture: (graphics: Graphics) => Texture;

  private bgSprite: Sprite | null = null;
  private waterTile: TilingSprite | null = null;
  private waterFallback: Graphics | null = null;
  private particles: FloatingParticle[] = [];
  private screenWidth = 0;
  private screenHeight = 0;
  private elapsed = 0;

  constructor(
    parent: Container,
    theme: ThemeConfig,
    generateTexture: (graphics: Graphics) => Texture,
  ) {
    this.theme = theme;
    this.generateTexture = generateTexture;
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
      this.bgSprite.filters = [
        new BlurFilter({
          strength: this.theme.blurStrength,
          quality: 4,
        }),
      ];
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

    if (this.waterFallback) {
      this.waterFallback.destroy();
      this.waterFallback = null;
    }

    const graphics = new Graphics();
    const tileWidth = 256;
    const tileHeight = 64;

    for (let x = 0; x < tileWidth; x++) {
      const waveY = Math.sin((x / tileWidth) * Math.PI * 4) * 8 + tileHeight * 0.5;
      const alpha = 0.3 + Math.sin((x / tileWidth) * Math.PI * 2) * 0.15;
      graphics.circle(x, waveY, 2 + Math.random() * 3);
      graphics.fill({ color: 0x42a5f5, alpha });
    }

    let waterTexture: Texture | null = null;
    try {
      waterTexture = this.generateTexture(graphics);
    } catch {
      waterTexture = null;
    }
    graphics.destroy();

    if (!waterTexture) {
      this.waterFallback = new Graphics();
      this.waterFallback.rect(0, 0, this.screenWidth, 80);
      this.waterFallback.fill({ color: 0x42a5f5, alpha: WATER_ALPHA });
      this.container.addChild(this.waterFallback);
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
    if (this.particles.length > 0) return;

    for (let index = 0; index < MAX_FLOATING_PARTICLES; index++) {
      const graphics = new Graphics();
      graphics.visible = true;
      this.particleLayer.addChild(graphics);

      const particle: FloatingParticle = {
        graphics,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
      };

      this.resetParticle(particle, true);
      this.particles.push(particle);
    }
  }

  private resetParticle(particle: FloatingParticle, randomizeLife: boolean) {
    const color =
      FLOATING_PARTICLE_COLORS[
        Math.floor(Math.random() * FLOATING_PARTICLE_COLORS.length)
      ];
    const size = 1.5 + Math.random() * 3;
    const maxLife = 200 + Math.random() * 400;

    particle.x = Math.random() * this.screenWidth;
    particle.y = Math.random() * this.screenHeight;
    particle.vx = (Math.random() - 0.5) * 0.3;
    particle.vy = -(0.1 + Math.random() * 0.4);
    particle.maxLife = maxLife;
    particle.life = randomizeLife ? Math.random() * maxLife : maxLife;

    particle.graphics.clear();
    particle.graphics.circle(0, 0, size);
    particle.graphics.fill({ color, alpha: 0.6 });
    particle.graphics.position.set(particle.x, particle.y);
    particle.graphics.alpha = 0.6;
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
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.graphics.position.set(particle.x, particle.y);
      particle.graphics.alpha = Math.max(0, particle.life / particle.maxLife) * 0.6;

      if (
        particle.life <= 0 ||
        particle.y < -20 ||
        particle.x < -20 ||
        particle.x > this.screenWidth + 20
      ) {
        this.resetParticle(particle, false);
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

    if (this.waterFallback) {
      this.waterFallback.clear();
      this.waterFallback.rect(0, 0, width, 80);
      this.waterFallback.fill({ color: 0x42a5f5, alpha: WATER_ALPHA });
    }
  }

  public destroy() {
    for (const particle of this.particles) {
      particle.graphics.destroy();
    }
    this.particles.length = 0;

    this.waterTile?.destroy();
    this.waterTile = null;
    this.waterFallback?.destroy();
    this.waterFallback = null;

    this.bgSprite?.destroy();
    this.bgSprite = null;

    this.particleLayer.destroy();
    this.container.destroy();
  }
}

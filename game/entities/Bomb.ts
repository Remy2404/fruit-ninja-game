import { Container, Sprite, Assets, Graphics } from 'pixi.js';

export class Bomb {
  public id = '';
  public active = false;
  public age = 0;

  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public radius = 38;

  public rotation = 0;
  public angularVelocity = 0;

  public assetPath = '/assets/bomb.svg';

  public container: Container;
  public sprite: Sprite;
  private glowGraphics: Graphics;
  private glowPhase = 0;

  constructor() {
    this.id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
    this.container = new Container();

    this.glowGraphics = new Graphics();
    this.container.addChild(this.glowGraphics);

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.55);
    this.container.addChild(this.sprite);

    this.container.visible = false;
  }

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    bombAssetPath: string,
    bombRadius: number,
  ) {
    this.active = true;
    this.age = 0;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.assetPath = bombAssetPath;
    this.radius = bombRadius;

    this.rotation = Math.random() * Math.PI * 2;
    this.angularVelocity = (Math.random() - 0.5) * 0.1;
    this.glowPhase = Math.random() * Math.PI * 2;

    this.container.visible = true;
    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;

    this.applyTexture();
    this.drawGlow();
  }

  private applyTexture() {
    const texture = Assets.get(this.assetPath);
    if (texture) {
      this.sprite.texture = texture;
      const texSize = Math.max(texture.width, texture.height) || 100;
      const scale = ((this.radius * 2) / texSize) * 1.25;
      this.sprite.scale.set(scale);
    }
  }

  private drawGlow() {
    this.glowGraphics.clear();
    this.glowGraphics.circle(0, 0, this.radius * 1.5);
    this.glowGraphics.fill({ color: 0xff3300, alpha: 0.15 });
    this.glowGraphics.circle(0, 0, this.radius * 1.1);
    this.glowGraphics.fill({ color: 0xff5500, alpha: 0.1 });
  }

  public update(dt: number, gravity: number) {
    if (!this.active) return;

    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVelocity * dt;
    this.age += dt * 16.66;

    this.glowPhase += 0.06 * dt;
    const glowAlpha = 0.12 + Math.sin(this.glowPhase) * 0.08;
    this.glowGraphics.alpha = glowAlpha;

    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
  }

  public reset() {
    this.active = false;
    this.container.visible = false;
    this.container.alpha = 1;
    this.glowGraphics.clear();
  }
}

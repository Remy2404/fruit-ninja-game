import { Container, Sprite, Assets } from 'pixi.js';

export class Bomb {
  public id = '';
  public active = false;

  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public radius = 38;

  public rotation = 0;
  public angularVelocity = 0;

  public container: Container;
  public sprite: Sprite;

  constructor() {
    this.id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
    this.container = new Container();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.55);
    this.container.addChild(this.sprite);
    this.container.visible = false;
  }

  public spawn(x: number, y: number, vx: number, vy: number) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.rotation = Math.random() * Math.PI * 2;
    this.angularVelocity = (Math.random() - 0.5) * 0.1;

    this.container.visible = true;
    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;

    this.applyTexture();
  }

  private applyTexture() {
    const texture = Assets.get('/assets/bomb.svg');
    if (texture) {
      this.sprite.texture = texture;
    }
    const scale = (this.radius * 2) / 100;
    this.sprite.scale.set(scale);
  }

  public update(dt: number, gravity: number) {
    if (!this.active) return;

    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVelocity * dt;

    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
  }

  public reset() {
    this.active = false;
    this.container.visible = false;
    this.container.alpha = 1;
  }
}

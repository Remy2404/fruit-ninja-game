import { Container, Sprite, Assets } from 'pixi.js';

export type FruitType =
  | 'watermelon'
  | 'apple'
  | 'orange'
  | 'coconut'
  | 'banana'
  | 'pineapple';

const FRUIT_RADII: Record<FruitType, number> = {
  watermelon: 48,
  pineapple: 44,
  coconut: 40,
  apple: 36,
  orange: 36,
  banana: 34,
};

const JUICE_COLORS: Record<FruitType, number> = {
  watermelon: 0xff3355,
  apple: 0xff4444,
  orange: 0xff9933,
  coconut: 0xf0ead6,
  banana: 0xffe44d,
  pineapple: 0xffd700,
};

export function getJuiceColor(type: FruitType): number {
  return JUICE_COLORS[type];
}

export class Fruit {
  public id = '';
  public active = false;

  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public radius = 40;

  public rotation = 0;
  public angularVelocity = 0;

  public type: FruitType = 'watermelon';
  public isSliced = false;
  public isCritical = false;

  public container: Container;
  public sprite: Sprite;

  constructor() {
    this.id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
    this.container = new Container();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);
    this.container.visible = false;
  }

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: FruitType,
  ) {
    this.active = true;
    this.isSliced = false;
    this.isCritical = Math.random() < 0.1;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;

    this.rotation = Math.random() * Math.PI * 2;
    this.angularVelocity = (Math.random() - 0.5) * 0.15;
    this.radius = FRUIT_RADII[type];

    this.container.visible = true;
    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;

    this.applyTexture();
  }

  private applyTexture() {
    const texture = Assets.get(`/assets/${this.type}.svg`);
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
    this.isSliced = false;
    this.container.visible = false;
    this.container.alpha = 1;
  }
}

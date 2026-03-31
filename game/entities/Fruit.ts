import { Container, Sprite, Assets } from 'pixi.js';

export type FruitType =
  | 'watermelon'
  | 'apple'
  | 'orange'
  | 'coconut'
  | 'banana'
  | 'pineapple'
  | 'strawberry'
  | 'cherry'
  | 'grape'
  | 'blueberry'
  | 'raspberry'
  | 'peach'
  | 'plum'
  | 'kiwi'
  | 'lemon'
  | 'lime'
  | 'mango'
  | 'dragonfruit'
  | 'starfruit'
  | 'pomegranate';

// Visual radius used for rendering and collision detection.
export const FRUIT_RADII: Record<FruitType, number> = {
  // Tier 1 — small
  strawberry:  30,
  cherry:      28,
  grape:       28,
  blueberry:   26,
  raspberry:   26,
  // Tier 2 — medium
  apple:       36,
  orange:      36,
  peach:       36,
  plum:        34,
  kiwi:        32,
  lemon:       30,
  lime:        28,
  mango:       40,
  // Tier 3 — large / exotic
  watermelon:  48,
  pineapple:   44,
  coconut:     40,
  banana:      34,
  dragonfruit: 40,
  starfruit:   42,
  pomegranate: 42,
};

// Points awarded per slice (before multiplier / critical).
export const FRUIT_BASE_SCORES: Record<FruitType, number> = {
  // Tier 1 — easy (1 pt)
  strawberry:  1,
  cherry:      1,
  grape:       1,
  blueberry:   1,
  raspberry:   1,
  apple:       1,
  // Tier 2 — medium (2 pts)
  orange:      2,
  peach:       2,
  plum:        2,
  kiwi:        2,
  lemon:       2,
  lime:        2,
  mango:       2,
  // Tier 3 — exotic (3 pts)
  watermelon:  3,
  pineapple:   3,
  coconut:     3,
  banana:      3,
  dragonfruit: 3,
  starfruit:   3,
  pomegranate: 3,
};

const JUICE_COLORS: Record<FruitType, number> = {
  watermelon:  0xff3355,
  apple:       0xff4444,
  orange:      0xff9933,
  coconut:     0xf0ead6,
  banana:      0xffe44d,
  pineapple:   0xffd700,
  strawberry:  0xff2255,
  cherry:      0xcc0033,
  grape:       0x8b2fc9,
  blueberry:   0x4433cc,
  raspberry:   0xe00055,
  peach:       0xffaa55,
  plum:        0x8800aa,
  kiwi:        0x77cc22,
  lemon:       0xffe000,
  lime:        0x88ee00,
  mango:       0xffaa00,
  dragonfruit: 0xff44aa,
  starfruit:   0xffcc00,
  pomegranate: 0xdd0022,
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

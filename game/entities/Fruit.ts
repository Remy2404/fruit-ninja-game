import { Assets, Container, Sprite } from 'pixi.js';

export interface FruitSpawnDefinition {
  id: string;
  assetPath: string;
  halfAssetPath: string;
  radius: number;
  baseScore: number;
  juiceColor: number;
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

  public objectId = '';
  public assetPath = '';
  public halfAssetPath = '';
  public baseScore = 1;
  public juiceColor = 0xffffff;
  public isSliced = false;
  public isCritical = false;
  public age = 0;
  public variant: 'normal' | 'gold' | 'cursed' = 'normal';
  public waveOffsetX = 0;
  public waveSeed = 0;

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
    definition: FruitSpawnDefinition,
  ) {
    this.active = true;
    this.isSliced = false;
    this.isCritical = Math.random() < 0.1;
    this.age = 0;
    this.variant = 'normal';
    this.waveOffsetX = 0;
    this.waveSeed = Math.random() * Math.PI * 2;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.objectId = definition.id;
    this.assetPath = definition.assetPath;
    this.halfAssetPath = definition.halfAssetPath;
    this.radius = definition.radius;
    this.baseScore = definition.baseScore;
    this.juiceColor = definition.juiceColor;

    this.rotation = Math.random() * Math.PI * 2;
    this.angularVelocity = (Math.random() - 0.5) * 0.15;

    this.container.visible = true;
    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;

    this.applyTexture();
    this.setVariant('normal');
  }

  private applyTexture() {
    const texture = Assets.get(this.assetPath);
    if (!texture) return;

    this.sprite.texture = texture;
    const textureSize = Math.max(texture.width, texture.height) || 100;
    const scale = ((this.radius * 2) / textureSize) * 1.25;
    this.sprite.scale.set(scale);
    this.sprite.tint = 0xffffff;
  }

  public setVariant(variant: 'normal' | 'gold' | 'cursed') {
    this.variant = variant;
    if (variant === 'gold') {
      this.sprite.tint = 0xffd700;
    } else if (variant === 'cursed') {
      this.sprite.tint = 0x8800ff;
    } else {
      this.sprite.tint = 0xffffff;
    }
  }

  public applyWaveOffset(offsetX: number) {
    const delta = offsetX - this.waveOffsetX;
    this.waveOffsetX = offsetX;
    this.x += delta;
    this.container.x = this.x;
  }

  public update(dt: number, gravity: number) {
    if (!this.active) return;

    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVelocity * dt;
    this.age += dt * 16.66;

    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
  }

  public reset() {
    this.active = false;
    this.isSliced = false;
    this.waveOffsetX = 0;
    this.container.visible = false;
    this.container.alpha = 1;
    this.sprite.tint = 0xffffff;
  }
}

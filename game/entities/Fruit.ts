import { Container, Sprite, Assets } from 'pixi.js';
import type { SliceableObjectDef } from '../config/ThemeConfig';

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
    objectDef: SliceableObjectDef,
  ) {
    this.active = true;
    this.isSliced = false;
    this.isCritical = Math.random() < 0.1;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.objectId = objectDef.id;
    this.assetPath = objectDef.asset;
    this.halfAssetPath = objectDef.halfAsset;
    this.radius = objectDef.radius;
    this.baseScore = objectDef.baseScore;
    this.juiceColor = objectDef.juiceColor;

    this.rotation = Math.random() * Math.PI * 2;
    this.angularVelocity = (Math.random() - 0.5) * 0.15;

    this.container.visible = true;
    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;

    this.applyTexture();
  }

  private applyTexture() {
    const texture = Assets.get(this.assetPath);
    if (texture) {
      this.sprite.texture = texture;
      const texSize = Math.max(texture.width, texture.height) || 100;
      const scale = ((this.radius * 2) / texSize) * 2;
      this.sprite.scale.set(scale);
    }
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

import { Container, Graphics, Sprite, Assets, Text } from 'pixi.js';
import { Pool } from '../core/Pool';
import { FruitType, getJuiceColor } from '../entities/Fruit';

export class Particle {
  public id: string;
  public active = false;
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public life = 1.0;
  public decay = 0.03;
  public baseScale = 1.0;
  public color = 0xffffff;
  public graphics: Graphics;

  constructor(container: Container) {
    this.id = Math.random().toString(36).slice(2, 11);
    this.graphics = new Graphics();
    container.addChild(this.graphics);
    this.graphics.visible = false;
  }

  public spawn(x: number, y: number, color: number, scale = 1.0) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.color = color;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = 1.0;
    this.decay = Math.random() * 0.025 + 0.012;
    this.baseScale = (Math.random() * 0.5 + 0.5) * scale;

    this.graphics.clear();
    this.graphics.circle(0, 0, 6);
    this.graphics.fill({ color: this.color });
    this.graphics.position.set(this.x, this.y);
    this.graphics.scale.set(this.baseScale);
    this.graphics.alpha = 1.0;
    this.graphics.visible = true;
  }

  public update(dt: number, gravity: number) {
    if (!this.active) return;
    this.life -= this.decay * dt;
    if (this.life <= 0) {
      this.active = false;
      this.graphics.visible = false;
      return;
    }
    this.vy += gravity * 0.5 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.graphics.position.set(this.x, this.y);
    this.graphics.alpha = Math.max(0, this.life);
    this.graphics.scale.set(this.baseScale * this.life);
  }

  public reset() {
    this.active = false;
    this.graphics.visible = false;
  }
}

export class FruitHalf {
  public id: string;
  public active = false;
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public rotation = 0;
  public angularVelocity = 0;
  public life = 1.0;

  public container: Container;
  public sprite: Sprite;
  public maskGraphics: Graphics;

  constructor(parent: Container) {
    this.id = Math.random().toString(36).slice(2, 11);
    this.container = new Container();
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.maskGraphics = new Graphics();
    this.container.addChild(this.sprite);
    this.container.addChild(this.maskGraphics);
    this.sprite.mask = this.maskGraphics;
    parent.addChild(this.container);
    this.container.visible = false;
  }

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: FruitType,
    originalRotation: number,
    sliceAngle: number,
    isLeftHalf: boolean,
  ) {
    this.active = true;
    this.life = 1.0;
    this.x = x;
    this.y = y;

    const pushSpeed = 5;
    const normalAngle =
      sliceAngle + (isLeftHalf ? -Math.PI / 2 : Math.PI / 2);
    this.vx = vx * 0.5 + Math.cos(normalAngle) * pushSpeed;
    this.vy = vy * 0.5 + Math.sin(normalAngle) * pushSpeed;

    this.rotation = originalRotation;
    this.angularVelocity = isLeftHalf ? -0.12 : 0.12;

    const halfTexture = Assets.get(`/assets/${type}-half.svg`);
    const outerTexture = Assets.get(`/assets/${type}.svg`);
    this.sprite.texture = halfTexture ?? outerTexture;
    const radius = type === 'watermelon' ? 48 : type === 'pineapple' ? 44 : 36;
    const scale = (radius * 2) / 100;
    this.sprite.scale.set(scale);

    this.maskGraphics.clear();
    this.maskGraphics.rotation = sliceAngle - originalRotation;
    const sz = 200;
    if (isLeftHalf) {
      this.maskGraphics.rect(-sz, -sz, sz, sz * 2);
    } else {
      this.maskGraphics.rect(0, -sz, sz, sz * 2);
    }
    this.maskGraphics.fill({ color: 0xffffff });

    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = 1;
    this.container.visible = true;
  }

  public update(dt: number, gravity: number) {
    if (!this.active) return;
    this.life -= 0.008 * dt;
    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVelocity * dt;

    this.container.position.set(this.x, this.y);
    this.container.rotation = this.rotation;
    this.container.alpha = Math.max(0, this.life);
  }

  public reset() {
    this.active = false;
    this.container.visible = false;
    this.container.alpha = 1;
  }
}

export class FloatingText {
  public active = false;
  public x = 0;
  public y = 0;
  public life = 1.0;
  public text: Text;

  constructor(parent: Container) {
    this.text = new Text({
      text: '',
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffcc00,
        stroke: { color: 0x000000, width: 5 },
      },
    });
    this.text.anchor.set(0.5);
    parent.addChild(this.text);
    this.text.visible = false;
  }

  public spawn(
    x: number,
    y: number,
    content: string,
    size: number,
    color: number,
  ) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.life = 1.0;
    this.text.text = content;
    this.text.style.fontSize = size;
    this.text.style.fill = color;
    this.text.visible = true;
    this.text.position.set(this.x, this.y);
    this.text.alpha = 1.0;
    this.text.scale.set(1);
  }

  public update(dt: number) {
    if (!this.active) return;
    this.life -= 0.018 * dt;
    this.y -= 2.5 * dt;
    this.text.y = this.y;
    this.text.alpha = this.life;
    this.text.scale.set(0.8 + this.life * 0.4);
    if (this.life <= 0) this.reset();
  }

  public reset() {
    this.active = false;
    this.text.visible = false;
  }
}

export class ParticleSystem {
  public pool: Pool<Particle>;
  public halfPool: Pool<FruitHalf>;
  public textPool: Pool<FloatingText>;
  private vfxLayer: Container;

  constructor(vfxLayer: Container) {
    this.vfxLayer = vfxLayer;

    this.pool = new Pool<Particle>(
      () => new Particle(this.vfxLayer),
      200,
      undefined,
      (p) => p.reset(),
    );

    this.halfPool = new Pool<FruitHalf>(
      () => new FruitHalf(this.vfxLayer),
      30,
      undefined,
      (h) => h.reset(),
    );

    this.textPool = new Pool<FloatingText>(
      () => new FloatingText(this.vfxLayer),
      15,
      undefined,
      (t) => t.reset(),
    );
  }

  public spawnFruitJuice(x: number, y: number, type: FruitType) {
    const color = getJuiceColor(type);
    const count = Math.floor(Math.random() * 8) + 12;
    for (let i = 0; i < count; i++) {
      const p = this.pool.get();
      p.spawn(x, y, color);
    }
  }

  public spawnExplosion(x: number, y: number) {
    const count = 40;
    for (let i = 0; i < count; i++) {
      const p = this.pool.get();
      const color = Math.random() > 0.5 ? 0xff5500 : 0xaa0000;
      p.spawn(x, y, color, 2.0);
    }
  }

  public spawnFruitHalves(
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: FruitType,
    rotation: number,
    sliceDx: number,
    sliceDy: number,
  ) {
    const sliceAngle = Math.atan2(sliceDy, sliceDx);

    const leftHalf = this.halfPool.get();
    leftHalf.spawn(x, y, vx, vy, type, rotation, sliceAngle, true);

    const rightHalf = this.halfPool.get();
    rightHalf.spawn(x, y, vx, vy, type, rotation, sliceAngle, false);
  }

  public spawnFloatingText(
    x: number,
    y: number,
    content: string,
    size = 28,
    color = 0xffffff,
  ) {
    const txt = this.textPool.get();
    txt.spawn(x, y, content, size, color);
  }

  public update(dt: number, gravity: number) {
    for (let i = this.pool.active.length - 1; i >= 0; i--) {
      const p = this.pool.active[i];
      p.update(dt, gravity);
      if (!p.active) {
        this.pool.release(p);
      }
    }

    for (let i = this.halfPool.active.length - 1; i >= 0; i--) {
      const h = this.halfPool.active[i];
      h.update(dt, gravity);
      if (h.life <= 0 || h.y > 2000) {
        this.halfPool.release(h);
      }
    }

    for (let i = this.textPool.active.length - 1; i >= 0; i--) {
      const t = this.textPool.active[i];
      t.update(dt);
      if (!t.active) {
        this.textPool.release(t);
      }
    }
  }

  public destroy() {
    this.pool.reset();
    this.halfPool.reset();
    this.textPool.reset();
  }
}

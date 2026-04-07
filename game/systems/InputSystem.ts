import { Application, Container, Graphics, Rectangle } from 'pixi.js';
import { audioManager } from './AudioManager';

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export class InputSystem {
  private app: Application;
  private trailLayer: Container;
  
  // Is the player holding down / swiping?
  public isSwiping = false;
  
  // History of recently touched points
  public points: TrailPoint[] = [];

  // Graphics object where we draw the blade trail
  private trailGraphics: Graphics;

  // Constants for tuning the feel
  private TRAIL_LIFETIME = 150; // ms before a point disappears
  private TRAIL_THICKNESS = 18;

  constructor(app: Application, trailLayer: Container) {
    this.app = app;
    this.trailLayer = trailLayer;
    
    this.trailGraphics = new Graphics();
    this.trailLayer.addChild(this.trailGraphics);

    this.bindEvents();
  }

  private bindEvents() {
    this.app.stage.eventMode = 'dynamic';
    this.app.stage.hitArea = new Rectangle(0, 0, 10000, 10000); 
    
    const canvas = this.app.canvas as HTMLCanvasElement;
    
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  public destroy() {
    const canvas = this.app.canvas;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    
    if (this.trailGraphics && !this.trailGraphics.destroyed) {
        this.trailGraphics.destroy();
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    this.isSwiping = true;
    this.points = [];
    this.addPoint(e.clientX, e.clientY);
    audioManager.playPitchShifted('whoosh', 0.8, 1.2);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isSwiping) return;
    this.addPoint(e.clientX, e.clientY);
  };

  private onPointerUp = () => {
    this.isSwiping = false;

  };

  private addPoint(x: number, y: number) {
   
    const rect = this.app.canvas.getBoundingClientRect();
    const scaleX = this.app.screen.width / rect.width;
    const scaleY = this.app.screen.height / rect.height;

    this.points.push({
      x: (x - rect.left) * scaleX,
      y: (y - rect.top) * scaleY,
      time: performance.now()
    });
  }

  public update(dt: number) {
    const now = performance.now();

    this.points = this.points.filter(p => now - p.time < this.TRAIL_LIFETIME);

    // 2. Short-circuit if no valid trail
    if (this.points.length < 2) {
      if (!this.isSwiping) {
        this.trailGraphics.clear();
      }
      return;
    }

    // 3. Render the dynamic trail mesh
    this.renderTrail();
  }

  private renderTrail() {
    this.trailGraphics.clear();
    
    const count = this.points.length;
    
    for (let i = 0; i < count - 1; i++) {
        const p1 = this.points[i];
        const p2 = this.points[i + 1];

        // Thickness tapers off towards the start of the array (older points)
        const progress = i / count;
        const thickness = this.TRAIL_THICKNESS * Math.max(0.1, progress);

        // Core white slice
        this.trailGraphics.moveTo(p1.x, p1.y);
        this.trailGraphics.lineTo(p2.x, p2.y);
        this.trailGraphics.stroke({ width: thickness, color: 0xffffff, alpha: progress });
        
        // Outer glow
        this.trailGraphics.moveTo(p1.x, p1.y);
        this.trailGraphics.lineTo(p2.x, p2.y);
        this.trailGraphics.stroke({ width: thickness * 2, color: 0x88ccff, alpha: progress * 0.5 });
    }
    
  }
}

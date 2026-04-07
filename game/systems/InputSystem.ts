import { Application, Container, Graphics, Rectangle } from 'pixi.js';
import { audioManager } from './AudioManager';
import { useGameStore } from '../../store/useGameStore';

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export interface SwipeSegment {
  p1: TrailPoint;
  p2: TrailPoint;
}

export class InputSystem {
  private readonly app: Application;
  private readonly trailLayer: Container;
  private readonly trailGraphics: Graphics;
  private readonly trailLifetimeMs = 150;
  private readonly trailThickness = 18;
  private readonly maxTrailPoints = 48;
  private readonly interpolationStepPx = 18;

  private activePointerId: number | null = null;
  private pendingSegments: SwipeSegment[] = [];

  public isSwiping = false;
  public points: TrailPoint[] = [];

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

  public reset() {
    this.activePointerId = null;
    this.isSwiping = false;
    this.points.length = 0;
    this.pendingSegments.length = 0;
    this.trailGraphics.clear();
    useGameStore.getState().setIsEnergyActive(false);
  }

  public destroy() {
    const canvas = this.app.canvas;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    this.reset();
    if (!this.trailGraphics.destroyed) {
      this.trailGraphics.destroy();
    }
  }

  public consumePendingSegments(consumer: (segment: SwipeSegment) => void) {
    for (const segment of this.pendingSegments) {
      consumer(segment);
    }
    this.pendingSegments.length = 0;
  }

  private onPointerDown = (event: PointerEvent) => {
    if (this.activePointerId !== null && this.activePointerId !== event.pointerId) {
      return;
    }

    this.activePointerId = event.pointerId;
    this.isSwiping = true;
    this.points.length = 0;
    this.pendingSegments.length = 0;
    useGameStore.getState().setIsEnergyActive(true);

    const canvas = this.app.canvas as HTMLCanvasElement;
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }

    this.recordPointerEvent(event);
    audioManager.playPitchShifted('whoosh', 0.8, 1.2);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isSwiping || event.pointerId !== this.activePointerId) return;
    this.recordPointerEvent(event);
  };

  private onPointerUp = (event: PointerEvent) => {
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) {
      return;
    }

    const canvas = this.app.canvas as HTMLCanvasElement;
    if (this.activePointerId !== null && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(this.activePointerId);
      } catch {
        // Pointer may already be released outside the canvas bounds.
      }
    }

    this.activePointerId = null;
    this.isSwiping = false;
    useGameStore.getState().setIsEnergyActive(false);
  };

  private recordPointerEvent(event: PointerEvent) {
    const sourceEvents =
      typeof event.getCoalescedEvents === 'function'
        ? event.getCoalescedEvents()
        : [event];

    for (const sourceEvent of sourceEvents) {
      const point = this.toCanvasPoint(
        sourceEvent.clientX,
        sourceEvent.clientY,
        sourceEvent.timeStamp || performance.now(),
      );
      this.appendInterpolatedPoints(point);
    }
  }

  private toCanvasPoint(clientX: number, clientY: number, time: number): TrailPoint {
    const rect = this.app.canvas.getBoundingClientRect();
    const scaleX = this.app.screen.width / rect.width;
    const scaleY = this.app.screen.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      time,
    };
  }

  private appendInterpolatedPoints(targetPoint: TrailPoint) {
    const previousPoint = this.points[this.points.length - 1];
    if (!previousPoint) {
      this.pushPoint(targetPoint);
      return;
    }

    const dx = targetPoint.x - previousPoint.x;
    const dy = targetPoint.y - previousPoint.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(distance / this.interpolationStepPx));
    let segmentStart = previousPoint;

    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const nextPoint: TrailPoint = {
        x: previousPoint.x + dx * t,
        y: previousPoint.y + dy * t,
        time: previousPoint.time + (targetPoint.time - previousPoint.time) * t,
      };

      this.pushPoint(nextPoint);
      this.pendingSegments.push({ p1: segmentStart, p2: nextPoint });
      segmentStart = nextPoint;
    }
  }

  private pushPoint(point: TrailPoint) {
    if (this.points.length >= this.maxTrailPoints) {
      for (let index = 1; index < this.points.length; index++) {
        this.points[index - 1] = this.points[index];
      }
      this.points.length -= 1;
    }

    this.points.push(point);
  }

  public update() {
    const now = performance.now();
    let writeIndex = 0;

    for (let readIndex = 0; readIndex < this.points.length; readIndex++) {
      const point = this.points[readIndex];
      if (now - point.time < this.trailLifetimeMs) {
        this.points[writeIndex] = point;
        writeIndex++;
      }
    }

    this.points.length = writeIndex;

    if (this.points.length < 2) {
      if (!this.isSwiping) {
        this.trailGraphics.clear();
      }
      return;
    }

    this.renderTrail();
  }

  private renderTrail() {
    this.trailGraphics.clear();

    const count = this.points.length;
    for (let index = 0; index < count - 1; index++) {
      const p1 = this.points[index];
      const p2 = this.points[index + 1];
      const progress = index / count;
      const thickness = this.trailThickness * Math.max(0.1, progress);

      this.trailGraphics.moveTo(p1.x, p1.y);
      this.trailGraphics.lineTo(p2.x, p2.y);
      this.trailGraphics.stroke({
        width: thickness,
        color: 0xffffff,
        alpha: progress,
      });

      this.trailGraphics.moveTo(p1.x, p1.y);
      this.trailGraphics.lineTo(p2.x, p2.y);
      this.trailGraphics.stroke({
        width: thickness * 2,
        color: 0x88ccff,
        alpha: progress * 0.5,
      });
    }
  }
}

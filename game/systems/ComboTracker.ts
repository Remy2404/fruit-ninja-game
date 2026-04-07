import type { ComboRules } from '../config/ModeConfig';

export interface ComboResolution {
  count: number;
  x: number;
  y: number;
}

export class ComboTracker {
  private readonly rules: ComboRules;
  private slicedIds = new Set<string>();
  private lastSliceAt = 0;
  private lastSlicePoint = { x: 0, y: 0 };

  constructor(rules: ComboRules) {
    this.rules = rules;
  }

  public reset() {
    this.slicedIds.clear();
    this.lastSliceAt = 0;
    this.lastSlicePoint = { x: 0, y: 0 };
  }

  public registerSlice(id: string, x: number, y: number, timeMs: number): ComboResolution | null {
    let resolved: ComboResolution | null = null;
    if (this.shouldResolve(timeMs)) {
      resolved = this.resolveCurrent();
    }

    this.slicedIds.add(id);
    this.lastSliceAt = timeMs;
    this.lastSlicePoint = { x, y };
    return resolved;
  }

  public update(isSwiping: boolean, timeMs: number): ComboResolution | null {
    if (this.slicedIds.size === 0) return null;
    if (!isSwiping || this.shouldResolve(timeMs)) {
      return this.resolveCurrent();
    }
    return null;
  }

  private shouldResolve(timeMs: number): boolean {
    return this.slicedIds.size > 0 && timeMs - this.lastSliceAt >= this.rules.resolveWindowMs;
  }

  private resolveCurrent(): ComboResolution | null {
    const count = this.slicedIds.size;
    const resolution =
      count >= this.rules.minSlices
        ? {
            count,
            x: this.lastSlicePoint.x,
            y: this.lastSlicePoint.y,
          }
        : null;

    this.slicedIds.clear();
    this.lastSliceAt = 0;
    return resolution;
  }
}

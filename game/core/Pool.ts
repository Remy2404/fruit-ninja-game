export interface PoolOptions {
  initialSize?: number;
  maxSize?: number;
  name?: string;
}

export interface PoolStats {
  name: string;
  totalAllocated: number;
  peakActive: number;
  exhaustionCount: number;
}

export class Pool<T> {
  private readonly inactive: T[] = [];
  public readonly active: T[] = [];

  private readonly factory: () => T;
  private readonly onAlloc?: (obj: T) => void;
  private readonly onRelease?: (obj: T) => void;
  private readonly maxSize?: number;
  private readonly name: string;
  private totalAllocated = 0;
  private peakActive = 0;
  private exhaustionCount = 0;

  constructor(
    factory: () => T,
    optionsOrInitialSize: PoolOptions | number = 0,
    onAlloc?: (obj: T) => void,
    onRelease?: (obj: T) => void,
  ) {
    const options =
      typeof optionsOrInitialSize === 'number'
        ? { initialSize: optionsOrInitialSize }
        : optionsOrInitialSize;

    this.factory = factory;
    this.onAlloc = onAlloc;
    this.onRelease = onRelease;
    this.maxSize = options.maxSize;
    this.name = options.name ?? 'unnamed-pool';

    const initialSize = options.initialSize ?? 0;
    for (let index = 0; index < initialSize; index++) {
      this.inactive.push(this.allocate());
    }
  }

  public tryGet(): T | null {
    const pooled = this.inactive.pop();
    if (pooled) {
      return this.activate(pooled);
    }

    if (this.maxSize !== undefined && this.totalAllocated >= this.maxSize) {
      this.exhaustionCount++;
      return null;
    }

    this.exhaustionCount++;
    return this.activate(this.allocate());
  }

  public get(): T {
    const pooled = this.tryGet();
    if (!pooled) {
      throw new Error(`Pool "${this.name}" exhausted at max size ${this.maxSize ?? 0}`);
    }
    return pooled;
  }

  public release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index === -1) return;

    const lastIndex = this.active.length - 1;
    this.active[index] = this.active[lastIndex];
    this.active.pop();
    this.inactive.push(obj);
    this.onRelease?.(obj);
  }

  public reset(): void {
    for (const obj of this.active) {
      this.onRelease?.(obj);
      this.inactive.push(obj);
    }
    this.active.length = 0;
  }

  public getStats(): PoolStats {
    return {
      name: this.name,
      totalAllocated: this.totalAllocated,
      peakActive: this.peakActive,
      exhaustionCount: this.exhaustionCount,
    };
  }

  private allocate(): T {
    this.totalAllocated++;
    return this.factory();
  }

  private activate(obj: T): T {
    this.active.push(obj);
    this.peakActive = Math.max(this.peakActive, this.active.length);
    this.onAlloc?.(obj);
    return obj;
  }
}

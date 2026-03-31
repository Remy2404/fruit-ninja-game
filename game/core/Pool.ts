/**
 * Generic Object Pool for high-performance memory management.
 * Avoids garbage collection stutters by recycling objects instead of 
 * constantly calling `new` and letting objects fall out of scope.
 */
export class Pool<T> {
  private inactive: T[] = [];
  public active: T[] = [];
  
  private factory: () => T;
  private onAlloc?: (obj: T) => void;
  private onRelease?: (obj: T) => void;

  /**
   * @param factory Function that instantiates a new object when the pool is empty
   * @param initialSize How many objects to pre-allocate
   * @param onAlloc Lifecycle hook called right before returning the object
   * @param onRelease Lifecycle hook called when object is returned to pool
   */
  constructor(
    factory: () => T,
    initialSize: number = 0,
    onAlloc?: (obj: T) => void,
    onRelease?: (obj: T) => void
  ) {
    this.factory = factory;
    this.onAlloc = onAlloc;
    this.onRelease = onRelease;
    
    // Pre-allocate to prevent runtime allocation hitches
    for (let i = 0; i < initialSize; i++) {
      this.inactive.push(this.factory());
    }
  }

  /**
   * Retrieves an object from the pool, or creates one if depleted.
   */
  get(): T {
    const obj = this.inactive.pop() || this.factory();
    this.active.push(obj);
    
    if (this.onAlloc) {
      this.onAlloc(obj);
    }
    
    return obj;
  }

  /**
   * Returns an object to the pool.
   */
  release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      // Fast removal by swapping with last element
      const last = this.active[this.active.length - 1];
      this.active[index] = last;
      this.active.pop();
      
      this.inactive.push(obj);
      
      if (this.onRelease) {
        this.onRelease(obj);
      }
    }
  }

  /**
   * Releases all active objects back into the pool.
   */
  reset(): void {
    for (let i = 0; i < this.active.length; i++) {
      const obj = this.active[i];
      if (this.onRelease) {
        this.onRelease(obj);
      }
      this.inactive.push(obj);
    }
    this.active.length = 0;
  }
}

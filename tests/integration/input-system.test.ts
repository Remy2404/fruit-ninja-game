// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Application, Container } from 'pixi.js';
import { InputSystem } from '../../game/systems/InputSystem';
import { resetStores } from '../helpers/resetStores';

function dispatchPointer(
  target: EventTarget,
  type: string,
  init: { clientX: number; clientY: number; pointerId?: number; timeStamp?: number },
) {
  const event = new Event(type, { bubbles: true }) as PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: init.clientX },
    clientY: { value: init.clientY },
    pointerId: { value: init.pointerId ?? 1 },
    timeStamp: { value: init.timeStamp ?? 0 },
  });
  Object.assign(event, {
    getCoalescedEvents: () => [event],
  });
  target.dispatchEvent(event);
}

function createAppStub(canvas: HTMLCanvasElement) {
  return {
    canvas,
    stage: {
      eventMode: 'none',
      hitArea: null,
    },
    screen: {
      width: 300,
      height: 300,
    },
  } as unknown as Application;
}

describe('input system', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('interpolates fast swipes into multiple collision segments', () => {
    const canvas = document.createElement('canvas');
    canvas.setPointerCapture = vi.fn();
    canvas.releasePointerCapture = vi.fn();
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 300, height: 300 }),
    });
    document.body.appendChild(canvas);

    const system = new InputSystem(createAppStub(canvas), new Container());
    dispatchPointer(canvas, 'pointerdown', { clientX: 0, clientY: 50, timeStamp: 0 });
    dispatchPointer(canvas, 'pointermove', { clientX: 240, clientY: 50, timeStamp: 16 });

    const segments = [] as ReturnType<InputSystem['consumePendingSegments']>[];
    let segmentCount = 0;
    system.consumePendingSegments(() => {
      segmentCount++;
    });

    expect(segmentCount).toBeGreaterThan(10);
    system.destroy();
    expect(segments).toEqual([]);
  });
});

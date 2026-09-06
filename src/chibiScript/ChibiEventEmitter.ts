export type ChibiEvents = 'overview.uiSelector' | 'sync.uiSelector';

export class ChibiEventEmitter {
  private target: EventTarget = new EventTarget();

  public on(eventName: ChibiEvents, listener: EventListener) {
    return this.target.addEventListener(eventName, listener);
  }

  public once(eventName: ChibiEvents, listener: EventListener) {
    return this.target.addEventListener(eventName, listener, { once: true });
  }

  public off(eventName: ChibiEvents, listener: EventListener) {
    return this.target.removeEventListener(eventName, listener);
  }

  public emit(eventName: ChibiEvents, detail: any = null) {
    return this.target.dispatchEvent(new CustomEvent(eventName, { detail, cancelable: true }));
  }
}

export const chibiEventEmitterSingleton = new ChibiEventEmitter();

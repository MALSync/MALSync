import type { ChibiConsumer } from './ChibiConsumer';
import type { ChibiJson } from './ChibiGenerator';
import { ChibiReturn } from './ChibiReturn';
import { ChibiRegistry, chibiRegistrySingleton } from './ChibiRegistry';

export class ChibiCtx {
  private registry: ChibiRegistry;

  private globalRegistry = chibiRegistrySingleton;

  private intervalRegistry: { [key: string]: NodeJS.Timer } = {};

  private consumer: ChibiConsumer;

  constructor(consumer: ChibiConsumer) {
    this.consumer = consumer;
    this.registry = new ChibiRegistry();
  }

  run(script: ChibiJson<any>, startState: any = null) {
    return this.getConsumer()._subroutine(script, startState);
  }

  set(name: string, value: any) {
    this.registry.set(name, value);
  }

  get(name: string) {
    return this.registry.get(name);
  }

  globalSet(name: string, value: any) {
    this.globalRegistry.set(name, value);
  }

  globalGet(name: string) {
    return this.globalRegistry.get(name);
  }

  getConsumer() {
    return this.consumer;
  }

  return(value: any) {
    return new ChibiReturn(value);
  }

  setInterval(key: string, interval: NodeJS.Timer) {
    this.intervalRegistry[key] = interval;
  }

  getInterval(key: string) {
    return this.intervalRegistry[key];
  }

  clearIntervals() {
    Object.values(this.intervalRegistry).forEach(interval => {
      clearInterval(interval);
    });
    this.intervalRegistry = {};
  }
}

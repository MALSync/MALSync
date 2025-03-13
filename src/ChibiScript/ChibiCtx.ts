import type { ChibiConsumer } from './ChibiConsumer';

export class ChibiCtx {
  private variables: Record<string, any>;

  private consumer: ChibiConsumer;

  constructor(consumer: ChibiConsumer) {
    this.consumer = consumer;
    this.variables = {};
  }

  set(name: string, value: any) {
    this.variables[name] = value;
  }

  get(name: string) {
    return this.variables[name];
  }

  getConsumer() {
    return this.consumer;
  }
}

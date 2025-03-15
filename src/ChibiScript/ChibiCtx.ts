import type { ChibiConsumer } from './ChibiConsumer';
import type { ChibiJson } from './ChibiGenerator';
import { ChibiReturn } from './ChibiReturn';

export class ChibiCtx {
  private variables: Record<string, any>;

  private consumer: ChibiConsumer;

  constructor(consumer: ChibiConsumer) {
    this.consumer = consumer;
    this.variables = {};
  }

  run(script: ChibiJson<any>) {
    return this.getConsumer()._subroutine(script);
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

  return(value: any) {
    return new ChibiReturn(value);
  }
}

import { ChibiCtx } from './ChibiCtx';
import { UnknownChibiFunctionError } from './ChibiErrors';
import type { ChibiJson } from './ChibiGenerator';
import functionsRegistry from './functions';

export class ChibiConsumer {
  private ctx: ChibiCtx;

  constructor() {
    this.ctx = new ChibiCtx(this);
  }

  run(script: ChibiJson<any>) {
    let state = null;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      state = func(this.ctx, state, ...args);
    }
    return state;
  }

  addVariable(name: string, value: any) {
    this.ctx.set(name, value);
  }
}

import { UnknownChibiFunctionError } from './ChibiErrors';
import type { ChibiJson } from './ChibiGenerator';
import { functionsRegistry } from './functions';

export class ChibiConsumer {
  private script: ChibiJson<any>;

  constructor(script) {
    this.script = script;
  }

  run() {
    let state = null;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of this.script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      state = func(null, state, ...args);
    }
    return state;
  }
}

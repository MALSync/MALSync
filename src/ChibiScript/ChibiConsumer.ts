import { ChibiCtx } from './ChibiCtx';
import { ChibiError, UnknownChibiFunctionError } from './ChibiErrors';
import type { ChibiJson } from './ChibiGenerator';
import { ChibiReturn } from './ChibiReturn';
import functionsRegistry from './functions';

export class ChibiConsumer {
  private script: ChibiJson<any>;

  private ctx: ChibiCtx;

  private hasRun: boolean = false;

  constructor(script: ChibiJson<any>) {
    this.script = script;
    this.ctx = new ChibiCtx(this);
  }

  run(startState: any = null) {
    if (this.hasRun) {
      throw new ChibiError('Run method can only be executed once');
    }
    this.hasRun = true;
    const state = this._subroutine(this.script, startState);

    if (state && state instanceof ChibiReturn) {
      return state.getValue();
    }

    return state;
  }

  _subroutine(script: ChibiJson<any>, startState: any = null) {
    let state: any = startState;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      try {
        state = func(this.ctx, state, ...args);
      } catch (error) {
        if (error instanceof ChibiError) {
          throw error;
        }
        con.m('chibi').error(error);
        state = null;
      }

      if (state && state instanceof Promise) {
        throw new ChibiError('Async functions are not supported in this context');
      }

      if (state && state instanceof ChibiReturn) {
        return state;
      }
    }

    return state;
  }

  async runAsync() {
    if (this.hasRun) {
      throw new ChibiError('Run method can only be executed once');
    }
    this.hasRun = true;
    const state = await this._subroutineAsync(this.script);

    if (state && state instanceof ChibiReturn) {
      return state.getValue();
    }

    return state;
  }

  async _subroutineAsync(script: ChibiJson<any>, startState: any = null) {
    let state: any = startState;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      try {
        state = func(this.ctx, state, ...args);

        if (state && state instanceof Promise) {
          state = await state;
        }
      } catch (error) {
        if (error instanceof ChibiError) {
          throw error;
        }
        con.m('chibi').error(error);
        state = null;
      }

      if (state && state instanceof ChibiReturn) {
        return state;
      }
    }

    return state;
  }

  addVariable(name: string, value: any) {
    this.ctx.set(name, value);
  }

  clearIntervals() {
    return this.ctx.clearIntervals();
  }
}

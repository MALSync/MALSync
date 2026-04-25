import { ChibiCtx } from './ChibiCtx';
import { ChibiError, UnknownChibiFunctionError } from './ChibiErrors';
import type { ChibiJson } from './ChibiGenerator';
import { ChibiReturn } from './ChibiReturn';
import functionsRegistry from './functions';
import { chibiParamIndices } from './ChibiGeneratorTypes';
import type { ChibiEvents } from './ChibiEventEmitter';

export class ChibiConsumer {
  private script: ChibiJson<any>;

  private name: string;

  private ctx: ChibiCtx;

  private hasRun: boolean = false;

  constructor(script: ChibiJson<any>, name = 'Unknown') {
    this.script = script;
    this.name = name;
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
    this.ctx.setAsyncContext(false);
    let state: any = startState;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      try {
        // Resolve chibiJson arguments if necessary
        for (let i = 0; i < args.length; i += 1) {
          if (this.isChibiJson(i, functionName, args[i])) {
            args[i] = this._subroutine(args[i] as unknown as ChibiJson<any>);
          }
        }

        state = func(this.ctx, state, ...args);
      } catch (error) {
        if (error instanceof ChibiError) {
          throw error;
        }
        this.logError(error, functionName, state, args);
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
    this.ctx.setAsyncContext(true);
    let state: any = startState;
    // eslint-disable-next-line no-restricted-syntax
    for (const [functionName, ...args] of script) {
      if (!functionsRegistry[functionName]) {
        throw new UnknownChibiFunctionError(functionName);
      }
      const func = functionsRegistry[functionName];
      try {
        // Resolve chibiJson arguments if necessary
        for (let i = 0; i < args.length; i += 1) {
          if (this.isChibiJson(i, functionName, args[i])) {
            args[i] = await this._subroutineAsync(args[i] as unknown as ChibiJson<any>);
          }
        }

        state = func(this.ctx, state, ...args);

        if (state && state instanceof Promise) {
          state = await state;
        }
      } catch (error) {
        if (error instanceof ChibiError) {
          throw error;
        }
        this.logError(error, functionName, state, args);
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

  emitEvent(eventName: ChibiEvents, data?: any) {
    this.ctx.event.emit(eventName, data);
  }

  protected isChibiJson(index: number, functionName: string, argument: any) {
    return (
      Array.isArray(argument) &&
      argument.length > 0 &&
      Array.isArray(argument[0]) &&
      argument[0].length > 0 &&
      chibiParamIndices[functionName] &&
      chibiParamIndices[functionName].includes(index + 2) // +2 to account for ctx and input arguments
    );
  }

  logError(error, functionName, input, args) {
    console.log(
      '%cMAL-Sync',
      'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
      error.message,
      {
        name: this.name,
        functionName,
        input,
        args,
      },
    );
  }
}

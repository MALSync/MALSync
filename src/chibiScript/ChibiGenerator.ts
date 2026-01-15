import functionsRegistry from './functions';
import utilitiesRegistry from './utilities';
import { ChibiGeneratorFunctions, ChibiGeneratorUtilities } from './ChibiGeneratorTypes';

const randomKeys = {
  waitUntilTrue: 1,
  detectChanges: 2,
  detectURLChanges: 2,
  debounce: 1,
};

export type ChibiJson<T = void> = string[][] & { __type?: T };
export type ChibiParam<T> = T;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class ChibiGenerator<Input> {
  private value: Input;

  constructor(value: Input = undefined as unknown as Input) {
    this.value = value;

    Object.values(functionsRegistry).forEach(func => {
      this[func.name] = (...args) => {
        if (!value) {
          value = [] as unknown as Input;
        }

        for (let i = 0; i < args.length; i++) {
          if (typeof args[i] === 'function') {
            args[i] = args[i]($c);
          }
        }

        if (typeof randomKeys[func.name] !== 'undefined') {
          const randomKey = Math.random().toString(36).slice(2);
          args[randomKeys[func.name]] = func.name + randomKey;
        }

        const config = [...(value as unknown as []), [func.name, ...args]];
        return new ChibiGenerator(config);
      };
    });

    Object.values(utilitiesRegistry).forEach((util: any) => {
      this[util.name] = (...args) => util(this as any, ...args);
    });
  }

  /**
   * Finalizes and returns the built ChibiScript.
   *
   * @returns A ChibiJson representation of the built script
   */
  run() {
    return this.value as unknown as ChibiJson<Input>;
  }
}

// eslint-disable-next-line no-redeclare
interface ChibiGenerator<Input> extends ChibiGeneratorFunctions<Input> {}
// eslint-disable-next-line no-redeclare
interface ChibiGenerator<Input> extends ChibiGeneratorUtilities<Input> {}

export type { ChibiGenerator };

/**
 * Global entry point for creating ChibiScript programs.
 * Use this to start building a new ChibiScript.
 *
 * @example
 * // Create a script that returns a string
 * const script = $c.stringFunction("Hello, world!").run();
 */
export const $c = new ChibiGenerator();

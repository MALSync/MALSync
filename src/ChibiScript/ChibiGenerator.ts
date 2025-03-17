import functionsRegistry from './functions';

export type ChibiJson<T = void> = string[][] & { __type?: T };

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class ChibiGenerator<T> {
  private value: T;

  constructor(value: T = undefined as unknown as T) {
    this.value = value;

    Object.values(functionsRegistry).forEach(func => {
      this[func.name] = (...args) => {
        if (!value) {
          value = [] as unknown as T;
        }
        const config = [...(value as unknown as []), [func.name, ...args]];
        return new ChibiGenerator(config);
      };
    });
  }

  /**
   * Finalizes and returns the built ChibiScript.
   *
   * @returns A ChibiJson representation of the built script
   */
  run() {
    return this.value as unknown as ChibiJson<T>;
  }
}

type RemoveFirstTwo<T extends any[]> = T extends [any, any, ...infer Rest] ? Rest : never;
type InputType<T extends (...args: any) => any> = Parameters<T>[1];
type AllowedTypes = string | number | bigint | boolean | null | undefined;
type TypeMismatchError<
  FunctionName extends string,
  ActualType,
  ExpectedType,
> = `${FunctionName} requires input of type ${ExpectedType extends AllowedTypes ? ExpectedType : 'unknown'}, but received ${ActualType extends AllowedTypes ? ActualType : 'unknown'}`;

type MatchesType<InputT, TargetT> = TargetT extends void
  ? true
  : NonNullable<InputT> extends TargetT
    ? true
    : TargetT extends boolean
      ? InputT extends boolean
        ? true
        : false
      : false;

// List of function names that accept boolean rest parameters
type BooleanRestParamFunctions = 'and' | 'or';

type ArrayToEntryFunctions = 'first' | 'last' | 'at';

type passthroughFunctions = 'slice' | 'reverse' | 'log';

type ChainableMethods<T, R extends Record<string, (...args: any[]) => any>> = {
  [K in keyof R]: MatchesType<T, InputType<R[K]>> extends true
    ? K extends BooleanRestParamFunctions
      ? (...args: ChibiJson<boolean>[]) => ChibiGenerator<ReturnType<R[K]>>
      : RemoveFirstTwo<Parameters<R[K]>> extends never
        ? () => ChibiGenerator<ReturnType<R[K]>>
        : <Args extends RemoveFirstTwo<Parameters<R[K]>>>(
            ...args: Args
          ) => R[K] extends typeof functionsRegistry.if
            ? ChibiGenerator<ReturnType<typeof functionsRegistry.if<Args>>>
            : K extends ArrayToEntryFunctions
              ? ChibiGenerator<ReturnType<typeof functionsRegistry.at<T extends any[] ? T : never>>>
              : K extends passthroughFunctions
                ? ChibiGenerator<T>
                : ChibiGenerator<ReturnType<R[K]>>
    : TypeMismatchError<string & K, T, InputType<R[K]>>;
};

// eslint-disable-next-line no-redeclare
interface ChibiGenerator<T> extends ChainableMethods<T, typeof functionsRegistry> {}

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

// ## MatchesType Tests ##
// Expect true
type MatchesTypeTrue1 = MatchesType<string, string>;
type MatchesTypeTrue2 = MatchesType<number, number>;
type MatchesTypeTrue3 = MatchesType<bigint, bigint>;
type MatchesTypeTrue4 = MatchesType<boolean, boolean>;
type MatchesTypeTrue5 = MatchesType<null, null>;
type MatchesTypeTrue6 = MatchesType<undefined, undefined>;
type MatchesTypeTrue7 = MatchesType<boolean, void>;
type MatchesTypeTrue8 = MatchesType<true, false>;
type MatchesTypeTrue9 = MatchesType<string[], any[]>;
type MatchesTypeTrue10 = MatchesType<Element | null, Element>;

// Expect false
type MatchesTypeFalse1 = MatchesType<string, number>;
type MatchesTypeFalse2 = MatchesType<number, string>;
type MatchesTypeFalse3 = MatchesType<bigint, number>;
type MatchesTypeFalse4 = MatchesType<boolean, number>;
type MatchesTypeFalse5 = MatchesType<null, number>;
type MatchesTypeFalse6 = MatchesType<undefined, number>;

import booleanFunction from './functions/booleanFunction';
import ifFunction from './functions/ifFunction';
import regexFunction from './functions/regexFunction';
import stringFunction from './functions/stringFunction';

const functionsRegistry = { regexFunction, stringFunction, ifFunction, booleanFunction };

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
> = `${FunctionName} requires input of type ${ExpectedType extends AllowedTypes ? ExpectedType : never}, but received ${ActualType extends AllowedTypes ? ActualType : never}`;

type MatchesType<InputT, TargetT> = TargetT extends void
  ? true
  : InputT extends TargetT
    ? true
    : false;

type ChainableMethods<T, R extends Record<string, (...args: any[]) => any>> = {
  [K in keyof R]: MatchesType<T, InputType<R[K]>> extends true
    ? <Args extends RemoveFirstTwo<Parameters<R[K]>>>(
        ...args: Args
      ) => R[K] extends typeof ifFunction
        ? ChibiGenerator<ReturnType<typeof ifFunction<Args>>>
        : ChibiGenerator<ReturnType<R[K]>>
    : TypeMismatchError<string & K, T, InputType<R[K]>>;
};

// eslint-disable-next-line no-redeclare
interface ChibiGenerator<T> extends ChainableMethods<T, typeof functionsRegistry> {}

export type { ChibiGenerator };

export const chibi = () => new ChibiGenerator();

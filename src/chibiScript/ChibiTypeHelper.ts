import type { ChibiJson, ChibiGenerator } from './ChibiGenerator';

export type GetArrayType<T extends any[]> = T extends (infer U)[] ? U : never;

export type InputType<T extends (...args: any) => any> = Parameters<T>[1];

export type InputTypeUtility<T extends (...args: any) => any> = UnwrapGenerator<Parameters<T>[0]>;

export type UnwrapGenerator<T> = T extends ChibiGenerator<infer U> ? U : never;

export type UnwrapJson<T> = T extends ChibiJson<infer U> ? U : never;

export type MatchesType<InputT, TargetT> = TargetT extends void
  ? true
  : NonNullable<InputT> extends TargetT
    ? true
    : TargetT extends boolean
      ? InputT extends boolean
        ? true
        : false
      : false;

type AllowedTypes = string | number | bigint | boolean | null | undefined;
export type TypeMismatchError<
  FunctionName extends string,
  ActualType,
  ExpectedType,
> = `${FunctionName} requires input of type ${ExpectedType extends AllowedTypes ? ExpectedType : 'unknown'}, but received ${ActualType extends AllowedTypes ? ActualType : 'unknown'}`;

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

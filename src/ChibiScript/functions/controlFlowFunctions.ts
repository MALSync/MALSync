import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiGenerator, ChibiJson } from '../ChibiGenerator';

type UnwrapJson<T> = T extends ChibiJson<infer U> ? U : never;

export default {
  /**
   * Conditional execution based on a condition
   * @input any
   * @param condition - Boolean condition to evaluate
   * @param thenAction - Action to execute if condition is true
   * @param elseAction - Action to execute if condition is false
   * @returns Result of either thenAction or elseAction based on condition
   */
  if<Args extends any[]>(
    ctx: ChibiCtx,
    input: void,
    condition: ChibiJson<boolean>,
    thenAction: Args[1],
    elseAction: Args[2],
  ): UnwrapJson<Args[1]> | UnwrapJson<Args[2]> {
    const conditionState = ctx.run(condition);
    if (conditionState) {
      return ctx.run(thenAction) as UnwrapJson<Args[1]>;
    }
    return ctx.run(elseAction) as UnwrapJson<Args[2]>;
  },

  /**
   * Conditional execution based on a condition
   * @input condition - Boolean condition to evaluate
   * @param thenAction - Action to execute if condition is true
   * @returns Result of thenAction if condition is true, otherwise input
   */
  then<Input, Then extends ChibiJson<any>>(
    ctx: ChibiCtx,
    input: Input,
    thenAction: ($c: ChibiGenerator<Input>) => Then,
  ): UnwrapJson<Then> | Input {
    if (input) {
      return ctx.run(thenAction as unknown as Then, input) as UnwrapJson<Then>;
    }
    return input;
  },
};

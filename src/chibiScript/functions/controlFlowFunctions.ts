import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiGenerator, ChibiJson } from '../ChibiGenerator';
import type * as CT from '../ChibiTypeHelper';

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
  ): CT.UnwrapJson<Args[1]> | CT.UnwrapJson<Args[2]> {
    const conditionState = ctx.run(condition);
    if (conditionState) {
      return ctx.run(thenAction) as CT.UnwrapJson<Args[1]>;
    }
    return ctx.run(elseAction) as CT.UnwrapJson<Args[2]>;
  },

  /**
   * Conditional execution based on a condition
   * @input condition - Boolean condition to evaluate
   * @param thenAction - Action to execute if condition is true
   * @returns Result of thenAction if condition is true, otherwise input
   */
  ifThen<Input, Then extends ($c: ChibiGenerator<Input>) => ChibiJson<any>>(
    ctx: ChibiCtx,
    input: Input,
    thenAction: Then,
  ): CT.UnwrapJson<ReturnType<Then>> | Input {
    if (input) {
      return ctx.run(thenAction as any, input);
    }
    return input;
  },
};

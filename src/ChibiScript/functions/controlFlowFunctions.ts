import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

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
    const conditionState = ctx.getConsumer().run(condition);
    if (conditionState) {
      return ctx.getConsumer().run(thenAction) as UnwrapJson<Args[1]>;
    }
    return ctx.getConsumer().run(elseAction) as UnwrapJson<Args[2]>;
  },
};

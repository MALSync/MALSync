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
   * @example
   * $c.if(
   *  $c.boolean(true).run(),
   *  $c.string('hello').run(),
   *  $c.string('world').run()
   * ).concat('world').run(); // returns 'helloworld'
   */
  if<Input, Then extends ChibiJson<any>, Else extends ChibiJson<any>>(
    ctx: ChibiCtx,
    input: void,
    condition: ChibiJson<boolean>,
    thenAction: Then,
    elseAction: Else,
  ): CT.UnwrapJson<Then> | CT.UnwrapJson<Else> {
    if (ctx.isAsync()) {
      return (async () => {
        const conditionState = await ctx.runAsync(condition);
        if (conditionState) {
          return ctx.runAsync(thenAction);
        }
        return ctx.runAsync(elseAction);
      })() as any;
    }

    const conditionState = ctx.run(condition);
    if (conditionState) {
      return ctx.run(thenAction);
    }
    return ctx.run(elseAction);
  },

  /**
   * Conditional execution based on a condition
   * @input condition - Boolean condition to evaluate
   * @param thenAction - Action to execute if condition is true
   * @returns Result of thenAction if condition is true, otherwise input
   * @example
   * $c.string('/anime/123').ifThen($c => $c.urlAbsolute().return().run()).boolean(false)
   */
  ifThen<Input, Then extends ($c: ChibiGenerator<Input>) => ChibiJson<any>>(
    ctx: ChibiCtx,
    input: Input,
    thenAction: Then,
  ): CT.UnwrapJson<ReturnType<Then>> | Input {
    if (input) {
      return ctx.isAsync()
        ? (ctx.runAsync(thenAction as any, input) as any)
        : ctx.run(thenAction as any, input);
    }
    return input;
  },

  /**
   * If the input is falsy stop further execution and return the result of returnAction
   * @input condition - Boolean condition to evaluate
   * @param returnAction - Action to execute if input is falsy
   * @example
   * $c.querySelector('a').ifNotReturn($c.number(0).run()).text().trim().run();
   * $c.querySelector('a').ifNotReturn().text().trim().run();
   */
  ifNotReturn<Input>(
    ctx: ChibiCtx,
    input: Input,
    returnAction?: ChibiJson<any>,
  ): Exclude<Input, false | 0 | '' | null | undefined> {
    if (input) {
      return input as any;
    }
    if (ctx.isAsync()) {
      return ctx.return(returnAction ? ctx.runAsync(returnAction) : null) as any;
    }
    return ctx.return(returnAction ? ctx.run(returnAction) : null) as any;
  },
};

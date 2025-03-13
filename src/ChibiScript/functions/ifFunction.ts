import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

type Unwrap<T> = T extends ChibiJson<infer U> ? U : never;

export default function ifFunction<Args extends any[]>(
  ctx: ChibiCtx,
  input: void,
  condition: ChibiJson<boolean>,
  thenAction: Args[1],
  elseAction: Args[2],
): Unwrap<Args[1]> | Unwrap<Args[2]> {
  const conditionState = ctx.getConsumer().run(condition);
  if (conditionState) {
    return ctx.getConsumer().run(thenAction) as Unwrap<Args[1]>;
  }
  return ctx.getConsumer().run(elseAction) as Unwrap<Args[2]>;
}

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
  if (condition) {
    return thenAction;
  }
  return elseAction;
}

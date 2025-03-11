import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

export default function ifFunction(
  ctx: ChibiCtx,
  input: void,
  condition: ChibiJson<boolean>,
  thenAction: ChibiJson<any>,
  elseAction?: ChibiJson<any>,
) {}

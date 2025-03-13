import type { ChibiCtx } from '../ChibiCtx';

export default {
  string: (ctx: ChibiCtx, input: any, value?: string) => {
    if (value !== undefined) return value;
    return String(input);
  },

  boolean: (ctx: ChibiCtx, input: any, value?: boolean) => {
    if (value !== undefined) return value;
    return Boolean(input);
  },

  number: (ctx: ChibiCtx, input: any, value?: number) => {
    if (value !== undefined) return value;
    return Number(input);
  },
};

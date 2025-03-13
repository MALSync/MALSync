import type { ChibiCtx } from '../ChibiCtx';

export default {
  /**
   * Converts input to string or returns the provided static value
   * @param value - Optional static string value to return instead of converting input
   * @returns A string representation of the input or the static value
   */
  string: (ctx: ChibiCtx, input: any, value?: string) => {
    if (value !== undefined) return value;
    return String(input);
  },

  /**
   * Converts input to boolean or returns the provided static value
   * @param value - Optional static boolean value to return instead of converting input
   * @returns A boolean representation of the input or the static value
   */
  boolean: (ctx: ChibiCtx, input: any, value?: boolean) => {
    if (value !== undefined) return value;
    return Boolean(input);
  },

  /**
   * Converts input to number or returns the provided static value
   * @param value - Optional static number value to return instead of converting input
   * @returns A number representation of the input or the static value
   */
  number: (ctx: ChibiCtx, input: any, value?: number) => {
    if (value !== undefined) return value;
    return Number(input);
  },
};

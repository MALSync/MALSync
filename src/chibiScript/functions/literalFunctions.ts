import type { ChibiCtx } from '../ChibiCtx';

export default {
  /**
   * Converts input to string or returns the provided static value
   * @input any
   * @param value - Optional static string value to return instead of converting input
   * @returns A string representation of the input or the static value
   */
  string: (ctx: ChibiCtx, input: any, value?: string) => {
    if (value !== undefined) return value;
    return String(input);
  },

  /**
   * Converts input to boolean or returns the provided static value
   * @input any
   * @param value - Optional static boolean value to return instead of converting input
   * @returns A boolean representation of the input or the static value
   */
  boolean: (ctx: ChibiCtx, input: any, value?: boolean) => {
    if (value !== undefined) return value;
    return Boolean(input);
  },

  /**
   * Converts input to number or returns the provided static value
   * @input any
   * @param value - Optional static number value to return instead of converting input
   * @returns A number representation of the input or the static value
   */
  number: (ctx: ChibiCtx, input: any, value?: number) => {
    if (value !== undefined) return value;
    return Number(input);
  },

  /**
   * Returns the provided array
   * @input void
   * @param value - array value to return
   * @returns returns the array
   */
  array: (ctx: ChibiCtx, input: void, value: string[]) => {
    return value;
  },

  /**
   * Returns the provided object
   * @input void
   * @param value - object value to return
   * @returns returns the object
   */
  object: (ctx: ChibiCtx, input: void, value: object) => {
    return value;
  },

  /**
   * Converts input to half-width character
   * @input any
   * @param value - Optional static string value to return instead of converting input
   * @returns A string representation of the input or the static value
   * @example
   * $c.string('Ｈｅｌｌｏ Ｗｏｒｌｄ ３').convertCh().run(); // returns Hello World 3
   */
  convertCh: (ctx: ChibiCtx, input: any, value: string) => {
    if (value !== undefined) return value;
    return String(input)
      .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/\u3000/g, ' '); // This is for full width space. Writing it in example gave eslint warning
  },
};

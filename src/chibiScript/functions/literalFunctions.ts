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
   * Type assertion function to cast input to a specified type
   * @input any
   * @returns The input value cast to the specified type
   * @example
   * $c.getVariable('list').type<HTMLElement>().run();
   */
  type: <Input, Output>(ctx: ChibiCtx, input: Input): Output => {
    return input as unknown as Output;
  },
};

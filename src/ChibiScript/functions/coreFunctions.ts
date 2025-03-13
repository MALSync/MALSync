import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

export default {
  /**
   * Gets the current URL or URL from context
   * @input void - No input required
   * @returns Current URL as string
   */
  url: (ctx: ChibiCtx, input: void): string => {
    const url = ctx.get('url');

    if (url && typeof url === 'string') {
      return url;
    }

    return typeof window !== 'undefined' ? window.location.href : '';
  },

  /**
   * Returns the input value immediately, stopping execution
   * @input any - Value to return
   * @returns The input value unchanged
   */
  return: (ctx: ChibiCtx, input: any): any => {
    return ctx.return(input);
  },

  /**
   * Gets a value from the variables in context
   * @input void - No input required
   * @param key - Variable name to retrieve
   * @param defaultValue - Default value if variable is not found
   * @returns Variable value or default value
   */
  getVariable: (ctx: ChibiCtx, input: void, key: string, defaultValue?: any): any => {
    const value = ctx.get(key);
    return value !== undefined ? value : defaultValue;
  },

  /**
   * Sets a variable in the context
   * @input any - Value to set if no value parameter is provided
   * @param key - Variable name to store the value under
   * @param value - Optional value to set instead of the input
   * @returns The input value (for chaining)
   */
  setVariable: (ctx: ChibiCtx, input: any, key: string, value?: ChibiJson<any>): any => {
    if (value !== undefined) {
      const resolvedValue = ctx.run(value);
      ctx.set(key, resolvedValue);
    } else {
      ctx.set(key, input);
    }
    return input;
  },

  /**
   * Logs a value to the console
   * @input any - Value to log
   * @param prefix - Optional prefix for the log
   * @returns The input value (for chaining)
   */
  log: (ctx: ChibiCtx, input: any, prefix: string = 'ChibiScript'): any => {
    con.m(prefix).log(input);
    return input;
  },

  /**
   * Throws an error with custom message
   * @input any - Optional context for the error
   * @param message - Error message to throw
   * @returns Never returns, always throws
   */
  error: (ctx: ChibiCtx, input: any, message: string): never => {
    throw new Error(message);
  },
};

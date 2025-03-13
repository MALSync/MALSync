import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

export default {
  /**
   * Checks if two values are equal (using strict equality ===)
   * @input any - First value to compare
   * @param value - Second value to compare
   * @returns Boolean indicating if values are equal
   * @example
   * equals("abc", "abc") // returns true
   * equals(5, "5") // returns false
   */
  equals: (ctx: ChibiCtx, input: any, value: any) => {
    return input === value;
  },

  /**
   * Checks if input is greater than the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is greater than value
   * @example
   * greaterThan(10, 5) // returns true
   */
  greaterThan: (ctx: ChibiCtx, input: any, value: any) => {
    return input > value;
  },

  /**
   * Checks if input is greater than or equal to the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is greater than or equal to value
   * @example
   * greaterThanOrEqual(10, 10) // returns true
   */
  greaterThanOrEqual: (ctx: ChibiCtx, input: any, value: any) => {
    return input >= value;
  },

  /**
   * Checks if input is less than the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is less than value
   * @example
   * lessThan(5, 10) // returns true
   */
  lessThan: (ctx: ChibiCtx, input: any, value: any) => {
    return input < value;
  },

  /**
   * Checks if input is less than or equal to the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is less than or equal to value
   * @example
   * lessThanOrEqual(10, 10) // returns true
   */
  lessThanOrEqual: (ctx: ChibiCtx, input: any, value: any) => {
    return input <= value;
  },

  /**
   * Checks if string contains a substring
   * @input string - String to search within
   * @param substring - Substring to search for
   * @returns Boolean indicating if input contains the substring
   * @example
   * contains("Hello world", "world") // returns true
   */
  contains: (ctx: ChibiCtx, input: string, substring: string) => {
    return input.includes(substring);
  },

  /**
   * Checks if string matches a regular expression
   * @input string - String to test
   * @param pattern - Regular expression pattern
   * @returns Boolean indicating if the string matches the pattern
   * @example
   * matches("abc123", "^[a-z]+\\d+$") // returns true
   */
  matches: (ctx: ChibiCtx, input: string, pattern: string) => {
    const regex = new RegExp(pattern);
    return regex.test(input);
  },

  /**
   * Performs logical AND operation on all provided boolean values
   * @input void - No input used
   * @param values - One or more boolean values to AND together
   * @returns Result of AND operation on all values
   * @example
   * and(true, false, true) // returns false
   * and(true, true, true) // returns true
   */
  and: (ctx: ChibiCtx, input: void, ...values: ChibiJson<boolean>[]) => {
    return values.reduce((result, val) => result && ctx.run(val), true);
  },

  /**
   * Performs logical OR operation on all provided boolean values
   * @input void - No input used
   * @param values - One or more boolean values to OR together
   * @returns Result of OR operation on all values
   * @example
   * or(false, false, true) // returns true
   * or(false, false, false) // returns false
   */
  or: (ctx: ChibiCtx, input: void, ...values: ChibiJson<boolean>[]) => {
    return values.reduce((result, val) => result || ctx.run(val), false);
  },

  /**
   * Performs logical NOT operation on input
   * @input boolean - Boolean value to negate
   * @returns Negated boolean value
   * @example
   * not(true) // returns false
   */
  not: (ctx: ChibiCtx, input: boolean) => {
    return !input;
  },

  /**
   * Checks if value is null or undefined
   * @input any - Value to check
   * @returns Boolean indicating if value is null or undefined
   * @example
   * isNil(null) // returns true
   * isNil(undefined) // returns true
   * isNil("") // returns false
   */
  isNil: (ctx: ChibiCtx, input: any) => {
    return input === null || input === undefined;
  },

  /**
   * Checks if value is empty (empty string, array, object or null/undefined)
   * @input any - Value to check
   * @returns Boolean indicating if value is empty
   * @example
   * isEmpty("") // returns true
   * isEmpty([]) // returns true
   * isEmpty({}) // returns true
   */
  isEmpty: (ctx: ChibiCtx, input: any) => {
    if (input === null || input === undefined) return true;
    if (typeof input === 'string') return input === '';
    if (Array.isArray(input)) return input.length === 0;
    if (typeof input === 'object') return Object.keys(input).length === 0;
    return false;
  },
};

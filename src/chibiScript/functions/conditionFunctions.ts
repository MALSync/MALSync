import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson, ChibiParam } from '../ChibiGenerator';
import type * as CT from '../ChibiTypeHelper';

export default {
  /**
   * Checks if two values are equal (using strict equality ===)
   * @input any - First value to compare
   * @param value - Second value to compare
   * @returns Boolean indicating if values are equal
   * @example
   * $c.string("abc").equals("abc") // returns true
   */
  equals: (ctx: ChibiCtx, input: any, value: ChibiParam<any>) => {
    return input === value;
  },

  /**
   * Checks if input is greater than the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is greater than value
   * @example
   * $c.number(10).greaterThan(5) // returns true
   */
  greaterThan: (ctx: ChibiCtx, input: any, value: ChibiParam<any>) => {
    return input > value;
  },

  /**
   * Checks if input is greater than or equal to the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is greater than or equal to value
   * @example
   * $c.number(10).greaterThanOrEqual(10) // returns true
   */
  greaterThanOrEqual: (ctx: ChibiCtx, input: any, value: ChibiParam<any>) => {
    return input >= value;
  },

  /**
   * Checks if input is less than the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is less than value
   * @example
   * $c.number(5).lessThan(10) // returns true
   */
  lessThan: (ctx: ChibiCtx, input: any, value: ChibiParam<any>) => {
    return input < value;
  },

  /**
   * Checks if input is less than or equal to the given value
   * @input any - First value to compare
   * @param value - Value to compare against
   * @returns Boolean indicating if input is less than or equal to value
   * @example
   * $c.number(10).lessThanOrEqual(10) // returns true
   */
  lessThanOrEqual: (ctx: ChibiCtx, input: any, value: ChibiParam<any>) => {
    return input <= value;
  },

  /**
   * Checks if string contains a substring
   * @input string - String to search within
   * @param substring - Substring to search for
   * @returns Boolean indicating if input contains the substring
   * @example
   * $c.string("Hello world").contains("world") // returns true
   */
  contains: (ctx: ChibiCtx, input: string, substring: ChibiParam<string>) => {
    return input.includes(substring);
  },

  /**
   * Checks if string matches a regular expression
   * @input string - String to test
   * @param pattern - Regular expression pattern
   * @param flags - Regex flags (default: 'i' for case-insensitive)
   * @returns Boolean indicating if the string matches the pattern
   * @example
   * $c.string("abc123").matches("^[a-z]+\\d+$") // returns true
   */
  matches: (
    ctx: ChibiCtx,
    input: string,
    pattern: ChibiParam<string>,
    flags: ChibiParam<string> = 'i',
  ) => {
    const regex = new RegExp(pattern, flags);
    return regex.test(input);
  },

  /**
   * Performs logical AND operation on all provided boolean values
   * @input void - No input used
   * @param values - One or more boolean values to AND together
   * @returns Result of AND operation on all values
   * @example
   * $c.and($c.boolean(true).run(), $c.boolean(false).run(), $c.boolean(true).run()) // returns false
   * $c.and($c.boolean(true).run(), $c.boolean(true).run()) // returns true
   */
  and: (ctx: ChibiCtx, input: void, ...values: ChibiJson<boolean>[]) => {
    if (ctx.isAsync()) {
      return (async () => {
        for (let i = 0; i < values.length; i++) {
          const val = await ctx.runAsync(values[i]);
          if (!val) {
            return false;
          }
        }
        return true;
      })() as unknown as boolean;
    }
    return values.reduce((result, val) => result && ctx.run(val), true);
  },

  /**
   * Performs logical OR operation on all provided boolean values
   * @input void - No input used
   * @param values - One or more boolean values to OR together
   * @returns Result of OR operation on all values
   * @example
   * $c.or($c.boolean(false).run(), $c.boolean(true).run()) // returns true
   * $c.or($c.boolean(false).run(), $c.boolean(false).run()) // returns false
   */
  or: (ctx: ChibiCtx, input: void, ...values: ChibiJson<boolean>[]) => {
    if (ctx.isAsync()) {
      return (async () => {
        for (let i = 0; i < values.length; i++) {
          const val = await ctx.runAsync(values[i]);
          if (val) {
            return true;
          }
        }
        return false;
      })() as unknown as boolean;
    }

    return values.reduce((result, val) => result || ctx.run(val), false);
  },

  /**
   * Performs logical NOT operation on input
   * @input boolean - Boolean value to negate
   * @returns Negated boolean value
   * @example
   * $c.boolean(true).not() // returns false
   */
  not: (ctx: ChibiCtx, input: boolean) => {
    return !input;
  },

  /**
   * Checks if value is null or undefined
   * @input any - Value to check
   * @returns Boolean indicating if value is null or undefined
   * @example
   * $c.value(null).isNil() // returns true
   * $c.value(undefined).isNil() // returns true
   * $c.value("").isNil() // returns false
   */
  isNil: (ctx: ChibiCtx, input: any) => {
    return input === null || input === undefined;
  },

  /**
   * Checks if value is empty (empty string, array, object or null/undefined)
   * @input any - Value to check
   * @returns Boolean indicating if value is empty
   * @example
   * $c.string("").isEmpty() // returns true
   * $c.array([]).isEmpty() // returns true
   * $c.object({}).isEmpty() // returns true
   */
  isEmpty: (ctx: ChibiCtx, input: any) => {
    if (input === null || input === undefined) return true;
    if (typeof input === 'string') return input === '';
    if (Array.isArray(input)) return input.length === 0;
    if (typeof input === 'object') return Object.keys(input).length === 0;
    return false;
  },

  /**
   * Returns the first non-nil value from a list of values
   * @input void - No input used
   * @param values - List of values to check
   * @returns First non-nil value, or undefined if all values are nil
   * @example
   * $c.coalesce($c.boolean(false).run(), $c.string("Hello").run()) // returns "Hello"
   */
  coalesce: <Input, Values extends ChibiJson<any>[]>(
    ctx: ChibiCtx,
    input: void,
    ...values: Values
  ): CT.UnwrapJson<Values[number]> | undefined => {
    if (ctx.isAsync()) {
      return (async () => {
        // eslint-disable-next-line no-restricted-syntax
        for (const val of values) {
          const result = await ctx.runAsync(val);
          if (result !== null && result !== undefined) {
            return result;
          }
        }
        return undefined;
      })() as any;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const val of values) {
      const result = ctx.run(val);
      if (result !== null && result !== undefined) {
        return result;
      }
    }
    return undefined;
  },
};

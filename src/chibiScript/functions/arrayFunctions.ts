import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiGenerator, ChibiJson, ChibiParam } from '../ChibiGenerator';
import type * as CT from '../ChibiTypeHelper';

export default {
  /**
   * Gets the first element from an array
   * @input any[] - Array to get element from
   * @returns First element of the array or undefined if empty
   * @example
   * $c.array(["1", "2", "3"]).first() // returns "1"
   */
  first: <Input>(
    ctx: ChibiCtx,
    input: Input,
  ): CT.GetArrayType<Input extends any[] ? Input : never> => {
    return input[0];
  },

  /**
   * Gets the last element from an array
   * @input any[] - Array to get element from
   * @returns Last element of the array or undefined if empty
   * @example
   * $c.array(["1", "2", "3"]).last() // returns "3"
   */
  last: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
  ): CT.GetArrayType<Input extends any[] ? Input : never> => {
    return input[input.length - 1];
  },

  /**
   * Gets element at a specific index from an array
   * @input any[] - Array to get element from
   * @param index - Index of element to get
   * @returns Element at the specified index or undefined if index is out of bounds
   * @example
   * $c.array(["1", "2", "3"]).at(1) // returns "2"
   */
  at: <Input>(
    ctx: ChibiCtx,
    input: Input,
    index: ChibiParam<number>,
  ): CT.GetArrayType<Input extends any[] ? Input : never> => {
    return input[index];
  },

  /**
   * Gets the length of an array
   * @input any[] - Array to get length of
   * @returns Number of elements in the array
   * @example
   * $c.array(["1", "2", "3"]).length() // returns 3
   */
  length: (ctx: ChibiCtx, input: any[]) => {
    return input.length;
  },

  /**
   * Slices an array to extract a section
   * @input any[] - Array to slice
   * @param start - Start index
   * @param end - Optional end index (exclusive)
   * @returns New array with extracted section
   * @example
   * $c.array(["1", "2", "3", "4", "5"]).slice(1, 3) // returns ["2", "3"]
   */
  slice: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
    start: ChibiParam<number>,
    end?: ChibiParam<number>,
  ): Input => {
    return input.slice(start, end) as Input;
  },

  /**
   * Reverses an array in place
   * @input any[] - Array to reverse
   * @returns Reversed array (same reference as input)
   * @example
   * $c.array(["1", "2", "3"]).reverse() // returns ["3", "2", "1"]
   */
  reverse: <Input>(ctx: ChibiCtx, input: Input extends any[] ? Input : never) => {
    return input.reverse() as Input;
  },

  /**
   * Checks if an array includes a certain element
   * @input any[] - Array to search
   * @param searchElement - Element to search for
   * @returns Boolean indicating if the element is found
   * @example
   * $c.array(["1", "2", "3"]).arrayIncludes("2") // returns true
   */
  arrayIncludes: (ctx: ChibiCtx, input: any[], searchElement: ChibiParam<any>) => {
    return input.includes(searchElement);
  },

  /**
   * Maps each element in an array to a new value using a callback function
   * @input any[] - Array to map over
   * @param callback - Function that transforms each element
   * @returns New array with transformed elements
   * @example
   * $c.array(['1', '2', '3']).map($item => $item.concat('2').run()) // returns ["12", "22", "32"]
   */
  map: <Input>(
    ctx: ChibiCtx,
    input: any[],
    callback: (
      $c: ChibiGenerator<CT.GetArrayType<Input extends any[] ? Input : never>>,
    ) => ChibiJson<any>,
  ) => {
    if (ctx.isAsync()) {
      return (async () => {
        for (let i = 0; i < input.length; i++) {
          input[i] = await ctx.runAsync(callback as unknown as ChibiJson<any>, input[i]);
        }
        return input;
      })() as any;
    }

    return input.map(item => {
      return ctx.run(callback as unknown as ChibiJson<any>, item);
    });
  },

  /**
   * Finds the first element in an array that satisfies the condition
   * @input any[] - Array to search in
   * @param callback - Function that returns true for the desired element
   * @returns First element that satisfies condition or undefined if not found
   * @example
   * $c.array(['1', '2', '3', '4']).arrayFind($item => $item.number().greaterThan(2).run()) // returns "3"
   */
  arrayFind: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
    condition: (
      $c: ChibiGenerator<CT.GetArrayType<Input extends any[] ? Input : never>>,
    ) => ChibiJson<boolean>,
  ): CT.GetArrayType<Input extends any[] ? Input : never> | undefined => {
    if (ctx.isAsync()) {
      return (async () => {
        for (let i = 0; i < input.length; i++) {
          if (await ctx.runAsync(condition as unknown as ChibiJson<any>, input[i])) {
            return input[i];
          }
        }
        return undefined;
      })() as any;
    }

    for (let i = 0; i < input.length; i++) {
      if (ctx.run(condition as unknown as ChibiJson<any>, input[i])) {
        return input[i];
      }
    }
    return undefined;
  },

  /**
   * Filters an array to include only elements that satisfy the condition
   * @input any[] - Array to filter
   * @param callback - Function that returns true for elements to keep
   * @returns New array with elements that satisfy the condition
   * @example
   * $c.array(['1', '2', '3', '4']).filter($item => $item.number().greaterThan(2).run()) // returns ["3", "4"]
   */
  filter: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
    condition: (
      $c: ChibiGenerator<CT.GetArrayType<Input extends any[] ? Input : never>>,
    ) => ChibiJson<boolean>,
  ): Input => {
    if (ctx.isAsync()) {
      return (async () => {
        const results: Input[] = [];
        for (let i = 0; i < input.length; i++) {
          if (await ctx.runAsync(condition as unknown as ChibiJson<any>, input[i])) {
            results.push(input[i]);
          }
        }
        return results;
      })() as unknown as Input;
    }

    return input.filter(item => ctx.run(condition as unknown as ChibiJson<any>, item)) as Input;
  },
};

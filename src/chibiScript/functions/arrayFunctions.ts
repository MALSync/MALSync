import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiGenerator, ChibiJson } from '../ChibiGenerator';
import type * as CT from '../ChibiTypeHelper';

export default {
  /**
   * Gets the first element from an array
   * @input any[] - Array to get element from
   * @returns First element of the array or undefined if empty
   * @example
   * first([1, 2, 3]) // returns 1
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
   * last([1, 2, 3]) // returns 3
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
   * at([1, 2, 3], 1) // returns 2
   */
  at: <Input>(
    ctx: ChibiCtx,
    input: Input,
    index: number,
  ): CT.GetArrayType<Input extends any[] ? Input : never> => {
    return input[index];
  },

  /**
   * Gets the length of an array
   * @input any[] - Array to get length of
   * @returns Number of elements in the array
   * @example
   * length([1, 2, 3]) // returns 3
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
   * slice([1, 2, 3, 4, 5], 1, 3) // returns [2, 3]
   */
  slice: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
    start: number,
    end?: number,
  ): Input => {
    return input.slice(start, end) as Input;
  },

  /**
   * Reverses an array in place
   * @input any[] - Array to reverse
   * @returns Reversed array (same reference as input)
   * @example
   * reverse([1, 2, 3]) // returns [3, 2, 1]
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
   * includes([1, 2, 3], 2) // returns true
   */
  arrayIncludes: (ctx: ChibiCtx, input: any[], searchElement: any) => {
    return input.includes(searchElement);
  },

  /**
   * Maps each element in an array to a new value using a callback function
   * @input any[] - Array to map over
   * @param callback - Function that transforms each element
   * @returns New array with transformed elements
   * @example
   * map([1, 2, 3], ($item) => $item.multiply(2)) // returns [2, 4, 6]
   */
  map: <Call extends ($c: ChibiGenerator<CT.GetArrayType<any>>) => ChibiJson<any>>(
    ctx: ChibiCtx,
    input: any[],
    callback: Call,
  ) => {
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
   * arrayFind([1, 2, 3, 4], ($item) => $item.greaterThan(2)) // returns 3
   */
  arrayFind: <Input>(
    ctx: ChibiCtx,
    input: Input extends any[] ? Input : never,
    condition: (
      $c: ChibiGenerator<CT.GetArrayType<Input extends any[] ? Input : never>>,
    ) => ChibiJson<boolean>,
  ): CT.GetArrayType<Input extends any[] ? Input : never> | undefined => {
    for (let i = 0; i < input.length; i++) {
      if (ctx.run(condition as unknown as ChibiJson<any>, input[i])) {
        return input[i];
      }
    }
    return undefined;
  },
};

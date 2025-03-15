import type { ChibiCtx } from '../ChibiCtx';

type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never;

export default {
  /**
   * Gets the first element from an array
   * @input any[] - Array to get element from
   * @returns First element of the array or undefined if empty
   * @example
   * first([1, 2, 3]) // returns 1
   */
  first: <T extends any[]>(ctx: ChibiCtx, input: T): GetElementType<T> => {
    return input[0];
  },

  /**
   * Gets the last element from an array
   * @input any[] - Array to get element from
   * @returns Last element of the array or undefined if empty
   * @example
   * last([1, 2, 3]) // returns 3
   */
  last: <T extends any[]>(ctx: ChibiCtx, input: T): GetElementType<T> => {
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
  at: <T extends any[]>(ctx: ChibiCtx, input: T, index: number): GetElementType<T> => {
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
  slice: <T extends any[]>(ctx: ChibiCtx, input: T, start: number, end?: number) => {
    return input.slice(start, end) as T;
  },

  /**
   * Reverses an array in place
   * @input any[] - Array to reverse
   * @returns Reversed array (same reference as input)
   * @example
   * reverse([1, 2, 3]) // returns [3, 2, 1]
   */
  reverse: <T extends any[]>(ctx: ChibiCtx, input: T) => {
    return input.reverse() as T;
  },

  /**
   * Checks if an array includes a certain element
   * @input any[] - Array to search
   * @param searchElement - Element to search for
   * @returns Boolean indicating if the element is found
   * @example
   * includes([1, 2, 3], 2) // returns true
   */
  includes: (ctx: ChibiCtx, input: any[], searchElement: any) => {
    return input.includes(searchElement);
  },
};

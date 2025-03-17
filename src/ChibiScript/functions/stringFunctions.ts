import type { ChibiCtx } from '../ChibiCtx';

export default {
  /**
   * Splits a string into an array using a delimiter
   * @input string - The input string to split
   * @param delimiter - The delimiter to split by
   * @returns Array of substrings
   */
  split: (ctx: ChibiCtx, input: string, delimiter: string) => {
    return input.split(delimiter);
  },

  /**
   * Joins an array of strings into a single string
   * @input string[] - Array of strings to join
   * @param separator - The separator to join with
   * @returns Joined string
   */
  join: (ctx: ChibiCtx, input: string[], separator: string) => {
    return input.join(separator);
  },

  /**
   * Replaces occurrences of a pattern in a string
   * @input string - The input string
   * @param pattern - String or RegExp to replace
   * @param replacement - Replacement string or function
   * @returns String with replacements
   */
  replace: (ctx: ChibiCtx, input: string, pattern: string, replacement: string) => {
    return input.replace(pattern, replacement);
  },

  /**
   * Replaces all occurrences of a pattern in a string
   * @input string - The input string
   * @param pattern - String or RegExp to replace
   * @param replacement - Replacement string or function
   * @returns String with all replacements
   */
  replaceAll: (ctx: ChibiCtx, input: string, pattern: string, replacement: string) => {
    return input.replaceAll(pattern, replacement);
  },

  /**
   * Extracts a substring from a string
   * @input string - The input string
   * @param start - Start index
   * @param end - Optional end index
   * @returns Extracted substring
   */
  substring: (ctx: ChibiCtx, input: string, start: number, end?: number) => {
    return input.substring(start, end);
  },

  /**
   * Extracts specific characters from a string
   * @input string - The input string
   * @param pattern - Regular expression pattern
   * @param group - Capture group to extract (default: 0 - full match)
   * @param flags - Regex flags (default: 'i' for case-insensitive)
   * @returns Extracted string from the specified group
   */
  regex: (
    ctx: ChibiCtx,
    input: string,
    pattern: string,
    group: number = 0,
    flags: string = 'i',
  ) => {
    const regex = new RegExp(pattern, flags);
    const match = input.match(regex);

    if (!match) {
      throw new Error(`No match found for regex '${pattern}' in input '${input}'`);
    }

    return match[group];
  },

  /**
   * Converts a string to lowercase
   * @input string - The input string
   * @returns Lowercase string
   */
  toLowerCase: (ctx: ChibiCtx, input: string) => {
    return input.toLowerCase();
  },

  /**
   * Converts a string to uppercase
   * @input string - The input string
   * @returns Uppercase string
   */
  toUpperCase: (ctx: ChibiCtx, input: string) => {
    return input.toUpperCase();
  },

  /**
   * Trims whitespace from both ends of a string
   * @input string - The input string
   * @returns Trimmed string
   */
  trim: (ctx: ChibiCtx, input: string) => {
    return input.trim();
  },

  /**
   * Checks if a string includes a substring
   * @input string - The input string
   * @param searchString - String to search for
   * @param position - Optional position to start search
   * @returns Boolean indicating if string includes the substring
   */
  includes: (ctx: ChibiCtx, input: string, searchString: string, position?: number) => {
    return input.includes(searchString, position);
  },
};

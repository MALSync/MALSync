import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiJson } from '../ChibiGenerator';

export default {
  /**
   * Splits a string into an array using a delimiter
   * @input string - The input string to split
   * @param delimiter - The delimiter to split by
   * @returns Array of substrings
   * @example
   * $c.string("a,b,c").split(",") // returns ["a", "b", "c"]
   */
  split: (ctx: ChibiCtx, input: string, delimiter: string) => {
    return input.split(delimiter);
  },

  /**
   * Joins an array of strings into a single string
   * @input string[] - Array of strings to join
   * @param separator - The separator to join with
   * @returns Joined string
   * @example
   * $c.array(["a", "b", "c"]).join(",") // returns "a,b,c"
   */
  join: (ctx: ChibiCtx, input: string[], separator: string) => {
    return input.join(separator);
  },

  /**
   * Replaces occurrences of a pattern in a string
   * @input string - The input string
   * @param pattern - String to replace
   * @param replacement - Replacement string or return string of function
   * @returns String with replacements
   * @example
   * $c.string("Hello World").replace("World", "Chibi") // returns "Hello Chibi"
   * $c.string("Hello World").replace("World", $c.string('Chibi').run()) // returns "Hella Chibi"
   */
  replace: (
    ctx: ChibiCtx,
    input: string,
    pattern: string,
    replacement: string | ChibiJson<string>,
  ) => {
    const replacementValue = typeof replacement === 'string' ? replacement : ctx.run(replacement);
    return input.replace(pattern, replacementValue);
  },

  /**
   * Replaces all occurrences of a pattern in a string
   * @input string - The input string
   * @param pattern - String to replace
   * @param replacement - Replacement string or function
   * @returns String with all replacements
   * @example
   * $c.string("Hello World").replaceAll("o", "e") // returns "Hella Werld"
   * $c.string("Hello World").replaceAll("o", $c.string('e').run()) // returns "Hella Werld"
   */
  replaceAll: (
    ctx: ChibiCtx,
    input: string,
    pattern: string,
    replacement: string | ChibiJson<string>,
  ) => {
    const replacementValue = typeof replacement === 'string' ? replacement : ctx.run(replacement);
    // eslint-disable-next-line es-x/no-string-prototype-replaceall
    return input.replaceAll(pattern, replacementValue);
  },

  /**
   * Replaces text using a regular expression pattern
   * @input string - The input string
   * @param pattern - Regular expression pattern
   * @param replacement - Replacement string or function
   * @param flags - Regex flags (default: 'i' for case-insensitive)
   * @returns String with regex replacements
   * @example
   * $c.string("Hello123").replaceRegex("\\d+", "!") // returns "Hello!"
   * $c.string("Hello123").replaceRegex("\\d+", $c.string('!').run()) // returns "Hello!"
   */
  replaceRegex: (
    ctx: ChibiCtx,
    input: string,
    pattern: string,
    replacement: string | ChibiJson<string>,
    flags: string = 'gi',
  ) => {
    const replacementValue = typeof replacement === 'string' ? replacement : ctx.run(replacement);
    const regex = new RegExp(pattern, flags);
    return input.replace(regex, replacementValue);
  },

  /**
   * Extracts a substring from a string
   * @input string - The input string
   * @param start - Start index
   * @param end - Optional end index
   * @returns Extracted substring
   * @example
   * $c.string("Hello World").substring(0, 5) // returns "Hello"
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
   * @example
   * $c.string("Hello123").regex("o(\\d+)", 0) // returns "o123"
   * $c.string("Hello123").regex("o(\\d+)", 1) // returns "123"
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
   * @example
   * $c.string("Hello World").toLowerCase() // returns "hello world"
   */
  toLowerCase: (ctx: ChibiCtx, input: string) => {
    return input.toLowerCase();
  },

  /**
   * Converts a string to uppercase
   * @input string - The input string
   * @returns Uppercase string
   * @example
   * $c.string("Hello World").toUpperCase() // returns "HELLO WORLD"
   */
  toUpperCase: (ctx: ChibiCtx, input: string) => {
    return input.toUpperCase();
  },

  /**
   * Trims whitespace from both ends of a string
   * @input string - The input string
   * @returns Trimmed string
   * @example
   * $c.string("   Hello World   ").trim() // returns "Hello World"
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
   * @example
   * $c.string("Hello World").includes("World") // returns true
   */
  includes: (ctx: ChibiCtx, input: string, searchString: string, position?: number) => {
    return input.includes(searchString, position);
  },

  /**
   * Concatenates two strings
   * @input string - The first string
   * @param value - The second string to concatenate or function
   * @returns Concatenated string
   * @example
   * $c.string("Hello").concat(" World") // returns "Hello World"
   * $c.string("Hello").concat($c.string(" World").run()) // returns "Hello World"
   */
  concat: (ctx: ChibiCtx, input: string, value: string | ChibiJson<string>) => {
    const concatValue = typeof value === 'string' ? value : ctx.run(value);
    return input.concat(concatValue);
  },

  /**
   * Parses a string as JSON
   * @input string - The JSON string to parse
   * @returns Parsed JavaScript object
   * @example
   * $c.string('{"key":"value"}').jsonParse() // returns { key: 'value' }
   */
  jsonParse: (ctx: ChibiCtx, input: string) => {
    return JSON.parse(input);
  },
};

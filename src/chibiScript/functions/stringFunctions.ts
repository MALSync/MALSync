import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Splits a string into an array using a delimiter
   * @input string - The input string to split
   * @param delimiter - The delimiter to split by
   * @returns Array of substrings
   * @example
   * $c.string("a,b,c").split(",") // returns ["a", "b", "c"]
   */
  split: (ctx: ChibiCtx, input: string, delimiter: ChibiParam<string>) => {
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
  join: (ctx: ChibiCtx, input: string[], separator: ChibiParam<string>) => {
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
    pattern: ChibiParam<string>,
    replacement: ChibiParam<string>,
  ) => {
    return input.replace(pattern, replacement);
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
    pattern: ChibiParam<string>,
    replacement: ChibiParam<string>,
  ) => {
    // eslint-disable-next-line es-x/no-string-prototype-replaceall
    return input.replaceAll(pattern, replacement);
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
    pattern: ChibiParam<string>,
    replacement: ChibiParam<string>,
    flags: ChibiParam<string> = 'gi',
  ) => {
    const regex = new RegExp(pattern, flags);
    return input.replace(regex, replacement);
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
  substring: (
    ctx: ChibiCtx,
    input: string,
    start: ChibiParam<number>,
    end?: ChibiParam<number>,
  ) => {
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
    input: ChibiParam<string>,
    pattern: ChibiParam<string>,
    group: ChibiParam<number> = 0,
    flags: ChibiParam<string> = 'i',
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
  includes: (
    ctx: ChibiCtx,
    input: string,
    searchString: ChibiParam<string>,
    position?: ChibiParam<number>,
  ) => {
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
  concat: (ctx: ChibiCtx, input: string, value: ChibiParam<string>) => {
    return input.concat(value);
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

  /**
   * Converts full-width ASCII characters or number to its half-width character
   * @input string
   * @returns Its half-width characters or number
   * @example
   * $c.string('Ｈelｌｏ Ｗoｒlｄ ３').toHalfWidth().run(); // returns Hello World 3
   */
  toHalfWidth: (ctx: ChibiCtx, input: string) => {
    return input
      .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      .replace(/\u3000/g, ' ');
  },

  /**
   * Converts Japanese numerals to Arabic numerals
   * @input string
   * @returns Its standard numerals
   * @example
   * $c.string('九十八').JPtoNumeral().run(); // returns 98
   */
  JPtoNumeral: (ctx: ChibiCtx, input: string) => {
    if (!/^[零〇一二三四五六七八九十百千万億兆]+$/.test(input)) {
      throw new Error(`No valid Japanese numeral equal in input '${input}'`);
    }
    const map = { 零: 0, 〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
    const units = { 十: 10, 百: 100, 千: 1000, 万: 10000 };
    let section = 0;
    let num = 0;
    input.split('').forEach(ch => {
      if (map[ch] !== undefined) {
        num = map[ch];
      } else if (units[ch] !== undefined) {
        section += (num || 1) * units[ch];
        num = 0;
      }
    });
    return section + num;
  },
};

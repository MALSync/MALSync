import type { ChibiCtx } from '../../ChibiCtx';
import type { ChibiParam } from '../../ChibiGenerator';

export default {
  /**
   * Extracts a specific segment from a URL path by splitting the URL on '/' characters
   * @input string - URL or path to split
   * @param part - Index of the segment to return (0-based)
   * @returns The URL segment at the specified index after splitting by '/', or undefined if index is out of bounds
   * @example
   * $c.string("https://example.com/anime/123").urlpart(4) // returns "123"
   * $c.string("/manga/456/chapter/7").urlpart(2) // returns "456"
   */
  urlPart: (ctx: ChibiCtx, input: string, part: ChibiParam<number>) => {
    return utils.urlPart(input, part);
  },

  /**
   * Removes URL hash and query parameters
   * @input string - URL to strip
   * @returns URL with hash and query parameters removed
   * @example
   * $c.string("https://example.com/page?param=1#section").urlStrip() // returns "https://example.com/page"
   */
  urlStrip: (ctx: ChibiCtx, input: string) => {
    return utils.urlStrip(input);
  },

  /**
   * Gets the value of a query parameter from a URL
   * @input string - URL to extract parameter from
   * @param name - Name of the parameter to extract
   * @returns Value of the parameter or null if not found
   * @example
   * $c.string("https://example.com/page?id=123&view=list").urlParam("id") // returns "123"
   */
  urlParam: (ctx: ChibiCtx, input: string, name: ChibiParam<string>) => {
    return utils.urlParam(input, name);
  },

  /**
   * Converts a relative URL to an absolute URL
   * @input string - URL to convert (can be relative)
   * @param domain - Domain to use for converting relative URLs
   * @returns Absolute URL
   * @example
   * $c.string("/path/to/page").urlAbsolute() // returns "https://example.com/path/to/page"
   */
  urlAbsolute: (ctx: ChibiCtx, input: string, domain?: ChibiParam<string>): string => {
    if (!domain) {
      domain = `${window.location.protocol}//${window.location.host}`;
    }
    return utils.absoluteLink(input, domain);
  },

  /**
   * Gets the text content of an element excluding the text of its children
   * @input Element - DOM element
   * @returns Text content of the element excluding child elements' text
   * @example
   * $c.html("<div>Parent <span>Child</span></div>").getBaseText() // returns "Parent "
   */
  getBaseText: (ctx: ChibiCtx, input: Element): string => {
    return utils.getBaseText(j.$(input));
  },
};

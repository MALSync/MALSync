import type { ChibiCtx } from '../ChibiCtx';

export default {
  /**
   * Selects an element from the DOM using a CSS selector
   * @input void - No input required
   * @param selector - CSS selector string
   * @returns The first matching Element or null if not found
   */
  querySelector: (ctx: ChibiCtx, input: void, selector: string) => {
    return document.querySelector(selector);
  },

  /**
   * Selects multiple elements from the DOM using a CSS selector
   * @input void - No input required
   * @param selector - CSS selector string
   * @returns Array of all matching elements
   */
  querySelectorAll: (ctx: ChibiCtx, input: void, selector: string) => {
    return Array.from(document.querySelectorAll(selector));
  },

  /**
   * Finds elements within the input element using a CSS selector
   * @input Element - DOM element to search within
   * @param selector - CSS selector string
   * @returns The first matching Element or null if not found
   */
  find: (ctx: ChibiCtx, input: Element, selector: string) => {
    return input.querySelector(selector);
  },

  /**
   * Finds all elements within the input element using a CSS selector
   * @input Element - DOM element to search within
   * @param selector - CSS selector string
   * @returns Array of all matching elements
   */
  findAll: (ctx: ChibiCtx, input: Element, selector: string) => {
    return Array.from(input.querySelectorAll(selector));
  },

  /**
   * Gets the text content of an element
   * @input Element - DOM element
   * @returns Text content of the element
   */
  text: (ctx: ChibiCtx, input: Element) => {
    return input.textContent;
  },

  /**
   * Gets the HTML content of an element
   * @input Element - DOM element
   * @returns HTML content of the element
   */
  html: (ctx: ChibiCtx, input: Element) => {
    return input.innerHTML;
  },

  /**
   * Gets the value of an attribute on an element
   * @input Element - DOM element
   * @param name - Name of the attribute
   * @returns Value of the attribute or null if not present
   */
  getAttribute: (ctx: ChibiCtx, input: Element, name: string) => {
    return input.getAttribute(name);
  },

  /**
   * Gets computed style of an element
   * @input Element - DOM element
   * @param property - CSS property name
   * @returns Value of the computed style property
   */
  getComputedStyle: (ctx: ChibiCtx, input: Element, property: string) => {
    return window.getComputedStyle(input).getPropertyValue(property);
  },

  /**
   * Finds the closest ancestor of an element matching a selector
   * @input Element - DOM element to start from
   * @param selector - CSS selector to match ancestors against
   * @returns The matching ancestor element or null if none found
   */
  closest: (ctx: ChibiCtx, input: Element, selector: string) => {
    return input.closest(selector);
  },

  /**
   * Gets the parent element of a DOM node
   * @input Element - DOM element
   * @returns The parent Element or null if no parent exists
   */
  parent: (ctx: ChibiCtx, input: Element) => {
    return input.parentElement;
  },

  /**
   * Gets the current document title
   * @returns The current document title
   */
  title: (ctx: ChibiCtx, input: void) => {
    return document.title;
  },
};

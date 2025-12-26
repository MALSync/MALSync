import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Selects an element from the DOM using a CSS selector
   * @input void - No input required
   * @param selector - CSS selector string or ChibiJson that resolves to a string
   * @returns The first matching Element or null if not found
   * @example
   * $c.querySelector('h1')
   */
  querySelector: (ctx: ChibiCtx, input: void, selector: ChibiParam<string>) => {
    return document.querySelector(selector);
  },

  /**
   * Selects multiple elements from the DOM using a CSS selector
   * @input void - No input required
   * @param selector - CSS selector string or ChibiJson that resolves to a string
   * @returns Array of all matching elements
   * @example
   * $c.querySelectorAll('h1')
   */
  querySelectorAll: (ctx: ChibiCtx, input: void, selector: ChibiParam<string>) => {
    return Array.from(document.querySelectorAll(selector));
  },

  /**
   * Finds elements within the input element using a CSS selector
   * @input Element - DOM element to search within
   * @param selector - CSS selector string or ChibiJson that resolves to a string
   * @returns The first matching Element or null if not found
   * @example
   * $c.querySelector('div').find('h1')
   */
  find: (ctx: ChibiCtx, input: Element, selector: ChibiParam<string>) => {
    return input.querySelector(selector);
  },

  /**
   * Finds all elements within the input element using a CSS selector
   * @input Element - DOM element to search within
   * @param selector - CSS selector string or ChibiJson that resolves to a string
   * @returns Array of all matching elements
   * @example
   * $c.querySelector('div').findAll('h1')
   */
  findAll: (ctx: ChibiCtx, input: Element, selector: ChibiParam<string>) => {
    return Array.from(input.querySelectorAll(selector));
  },

  /**
   * Gets the text content of an element
   * @input Element - DOM element
   * @returns Text content of the element
   * @example
   * $c.querySelector('h1').text()
   */
  text: (ctx: ChibiCtx, input: Element) => {
    return input.textContent;
  },

  /**
   * Gets the HTML content of an element
   * @input Element - DOM element
   * @returns HTML content of the element
   * @example
   * $c.querySelector('h1').html()
   */
  html: (ctx: ChibiCtx, input: Element) => {
    return input.innerHTML;
  },

  /**
   * Gets the value of an input, textarea or select element. Equals to .value in JS
   * @input Element - DOM element
   * @returns Value of the input or textarea, or null if not applicable
   * @example
   * $c.querySelector('select').elementValue().run()
   */
  elementValue: (ctx: ChibiCtx, input: Element) => {
    return (input as HTMLInputElement).value;
  },

  /**
   * Gets the text of the selected dropdown element
   * @input Element - DOM element
   * @returns text of the option, or null if not applicable
   * @example
   * $c.querySelector('select').selectedText().run()
   */
  selectedText: (ctx: ChibiCtx, input: Element) => {
    return (input as HTMLSelectElement).selectedOptions[0]?.text || null;
  },

  /**
   * Gets the value of an attribute on an element
   * @input Element - DOM element
   * @param name - Name of the attribute
   * @returns Value of the attribute or null if not present
   * @example
   * $c.querySelector('input').getAttribute('value')
   */
  getAttribute: (ctx: ChibiCtx, input: Element, name: ChibiParam<string>) => {
    return input.getAttribute(name);
  },

  /**
   * Gets computed style of an element
   * @input Element - DOM element
   * @param property - CSS property name
   * @returns Value of the computed style property
   * @example
   * $c.querySelector('h1').getComputedStyle('color')
   */
  getComputedStyle: (ctx: ChibiCtx, input: Element, property: ChibiParam<string>) => {
    return window.getComputedStyle(input).getPropertyValue(property);
  },

  /**
   * Sets a CSS style property on an element
   * @input Element - DOM element
   * @param property - CSS property name
   * @param value - Value to set for the property
   * @param important - Whether to set the property as !important (default: false)
   * @returns The modified Element
   * @example
   * $c.querySelector('h1').setStyle('color', 'red', true)
   */
  setStyle: (
    ctx: ChibiCtx,
    input: Element,
    property: ChibiParam<string>,
    value: ChibiParam<string>,
    important: ChibiParam<boolean> = false,
  ) => {
    (input as HTMLElement).style.setProperty(property, value, important ? 'important' : '');
    return input;
  },

  /**
   * Finds the closest ancestor of an element matching a selector
   * @input Element - DOM element to start from
   * @param selector - CSS selector to match ancestors against or ChibiJson that resolves to a string
   * @returns The matching ancestor element or null if none found
   * @example
   * $c.querySelector('h1').closest('.container')
   */
  closest: (ctx: ChibiCtx, input: Element, selector: ChibiParam<string>) => {
    return input.closest(selector);
  },

  /**
   * Gets the parent element of a DOM node
   * @input Element - DOM element
   * @returns The parent Element or null if no parent exists
   * @example
   * $c.querySelector('h1').parent()
   */
  parent: (ctx: ChibiCtx, input: Element) => {
    return input.parentElement;
  },

  /**
   * Gets the next sibling element of a DOM node
   * @input Element - DOM element
   * @returns The next sibling Element or null if no sibling exists
   * @example
   * $c.querySelector('h1').next()
   */
  next: (ctx: ChibiCtx, input: Element) => {
    return input.nextElementSibling;
  },

  /**
   * Gets the previous sibling element of a DOM node
   * @input Element - DOM element
   * @returns The previous sibling Element or null if no sibling exists
   * @example
   * $c.querySelector('h1').prev()
   */
  prev: (ctx: ChibiCtx, input: Element) => {
    return input.previousElementSibling;
  },

  /**
   * Checks if an element matches a CSS selector
   * @input Element - DOM element
   * @param selector - CSS selector string
   * @returns Boolean indicating if the element matches the selector
   * @example
   * $c.querySelector('h1').elementMatches('.highlight')
   */
  elementMatches: (ctx: ChibiCtx, input: Element, selector: ChibiParam<string>) => {
    return input.matches(selector);
  },

  /**
   * Gets the current document title
   * @returns The current document title
   * @example
   * $c.document().title() // returns "My Page Title"
   */
  title: (ctx: ChibiCtx, input: void) => {
    return document.title;
  },
};

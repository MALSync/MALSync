import type { ChibiGenerator, ChibiJson } from '../ChibiGenerator';

export default {
  /**
   * Returns the first non-nil value from a list of values wrapped into a function
   * @param values - List of values to check
   * @returns First non-nil value, or undefined if all values are nil
   * @example
   * $c.coalesceFn($c.boolean(false).run(), $c.string("Hello").run()) // returns "Hello"
   */
  coalesceFn: ($c: ChibiGenerator<void>, ...values: ChibiJson<any>[]) => {
    const args = values.map(val => $c.fn(val).run());
    return $c.coalesce(...args);
  },
};

import type { ChibiCtx } from '../ChibiCtx';
import type { ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Calculates a number
   * @input number
   * @param operator - Operator to use ('+', '-', '*', '/')
   * @param value - Number to calculate with
   * @returns Calculated number
   * @example
   * $c.number(1).calculate('-', 4) // returns -3
   * $c.number(3).calculate('*', $c.string('4').number().run()) // returns 12
   */
  calculate: (
    ctx: ChibiCtx,
    input: number,
    operator: '+' | '-' | '*' | '/',
    value: ChibiParam<number>,
  ) => {
    type Operation = (a: number, b: number) => number;
    const operations: Record<string, Operation> = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => {
        if (b === 0) throw new Error('Unresolvable operation');
        return a / b;
      },
    };
    const operation = operations[operator];
    return operation(input, value);
  },
};

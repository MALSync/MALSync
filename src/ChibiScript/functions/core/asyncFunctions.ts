import type { ChibiJson } from 'src/chibiScript/ChibiGenerator';
import type { ChibiCtx } from '../../ChibiCtx';

export default {
  /**
   * Wait for the DOM to be ready
   * @input void - No input required
   */
  domReady: (ctx: ChibiCtx, input: void): Promise<void> => {
    return new Promise(resolve => {
      $(() => {
        resolve();
      });
    });
  },

  /**
   * Wait for a specific condition to be true
   * @param condition - Condition to evaluate
   * @returns Promise that resolves when the condition is true
   */
  waitUntilTrue: (ctx: ChibiCtx, input: void, condition: ChibiJson<boolean>): Promise<void> => {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const conditionState = ctx.run(condition);
        if (conditionState) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  },
};

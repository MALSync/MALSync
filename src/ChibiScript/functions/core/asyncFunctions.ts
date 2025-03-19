import type { ChibiJson } from 'src/chibiScript/ChibiGenerator';
import type { ChibiCtx } from '../../ChibiCtx';
import { changeDetect } from 'src/utils/general';

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
   * @param _intervalKey - Internal never provide this
   * @returns Promise that resolves when the condition is true
   */
  waitUntilTrue: (
    ctx: ChibiCtx,
    input: void,
    condition: ChibiJson<boolean>,
    _intervalKey?,
  ): Promise<void> => {
    return new Promise(resolve => {
      clearInterval(ctx.getInterval(_intervalKey));
      ctx.setInterval(
        _intervalKey,
        setInterval(() => {
          const conditionState = ctx.run(condition);
          if (conditionState) {
            clearInterval(ctx.getInterval(_intervalKey));
            resolve();
          }
        }, 100),
      );
    });
  },

  /**
   * Detect changes in a specific target and run a callback every time a change is detected
   * @param target - Target to monitor for changes
   * @param callback - Callback to execute when changes are detected
   * @param _intervalKey - Internal never provide this
   */
  detectChanges: (
    ctx: ChibiCtx,
    input: void,
    target: ChibiJson<any>,
    callback: ChibiJson<any>,
    _intervalKey?,
  ): void => {
    clearInterval(ctx.getInterval(_intervalKey));
    let currentState = ctx.run(target);
    ctx.setInterval(
      _intervalKey,
      setInterval(() => {
        const temp = ctx.run(target);
        if (typeof temp !== 'undefined' && currentState !== temp) {
          currentState = temp;
          ctx.run(callback);
        }
      }, 500),
    );
  },
};

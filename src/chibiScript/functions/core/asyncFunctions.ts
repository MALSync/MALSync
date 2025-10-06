import type { ChibiJson, ChibiParam } from 'src/chibiScript/ChibiGenerator';
import type { ChibiCtx } from '../../ChibiCtx';

export default {
  /**
   * Wait for the DOM to be ready
   * @input void - No input required
   * @example
   * $c.domReady().trigger()
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
   * @example
   * $c.waitUntilTrue($c.boolean(true).run()).trigger().run()
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
        utils.waitUntilTrue(
          () => ctx.runAsync(condition),
          () => resolve(),
        ),
      );
    });
  },

  /**
   * Function to wait for a specific amount of time
   * @param ms - Time in milliseconds to wait
   * @returns Passes through the input
   * @example
   * $c.wait(1000).trigger().run() // Waits for 1 second
   */
  wait: <Input>(ctx: ChibiCtx, input: Input, ms: ChibiParam<number>): Input => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(input);
      }, ms);
    }) as unknown as Input;
  },

  /**
   * Detect changes in a specific target and run a callback every time a change is detected
   * @param target - Target to monitor for changes
   * @param callback - Callback to execute when changes are detected
   * @param _intervalKey - Internal never provide this
   * @example
   * $c.detectChanges($c.querySelector('h1').text().run(), $c.trigger().run())
   */
  detectChanges: async (
    ctx: ChibiCtx,
    input: void,
    target: ChibiJson<any>,
    callback: ChibiJson<any>,
    _intervalKey?,
  ): Promise<void> => {
    clearInterval(ctx.getInterval(_intervalKey));
    let currentState = JSON.stringify(await ctx.runAsync(target));
    ctx.setInterval(
      _intervalKey,
      setInterval(async () => {
        const temp = JSON.stringify(await ctx.runAsync(target));
        if (typeof temp !== 'undefined' && currentState !== temp) {
          currentState = temp;
          ctx.runAsync(callback);
        }
      }, 500),
    );
  },

  /**
   * Detect changes in the URL and run a callback every time a change is detected
   * @param callback - Callback to execute when URL changes are detected
   * @param options - Options to configure the detection
   * @param _intervalKey - Internal never provide this
   * @example
   * $c.detectURLChanges($c.trigger().run())
   */
  detectURLChanges: (
    ctx: ChibiCtx,
    input: void,
    callback: ChibiJson<any>,
    options: {
      ignoreQuery: boolean;
      ignoreAnchor: boolean;
    } | null = null,
    _intervalKey?,
  ): void => {
    const ignoreQuery = options?.ignoreQuery ?? false;
    const ignoreAnchor = options?.ignoreAnchor ?? true;

    const normalizeUrl = (url: string) => {
      let normalized = url;
      if (ignoreQuery) {
        normalized = normalized.split('?')[0];
      }
      if (ignoreAnchor) {
        normalized = normalized.split('#')[0];
      }
      return normalized;
    };

    clearInterval(ctx.getInterval(_intervalKey));
    let currentUrl = normalizeUrl(window.location.href);
    ctx.setInterval(
      _intervalKey,
      setInterval(() => {
        const newUrl = normalizeUrl(window.location.href);
        if (currentUrl !== newUrl) {
          currentUrl = newUrl;
          ctx.runAsync(callback);
        }
      }, 500),
    );
  },

  /**
   * Function to debounce rapid calls to a function
   * @param func - Function to debounce
   * @param ms - Time in milliseconds to wait
   * @returns A debounced version of the input function
   * @example
   * $c.detectURLChanges($c.debounce(1000).trigger().run())
   */
  debounce: <Input>(ctx: ChibiCtx, input: Input, ms: ChibiParam<number>, _intervalKey?): Input => {
    return new Promise(resolve => {
      clearInterval(ctx.getInterval(_intervalKey));
      ctx.setInterval(
        _intervalKey,
        setInterval(() => {
          clearInterval(ctx.getInterval(_intervalKey));
          resolve(input);
        }, ms),
      );
    }) as unknown as Input;
  },
};

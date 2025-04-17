import type { ChibiJson } from 'src/chibiScript/ChibiGenerator';
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
          () => ctx.run(condition),
          () => resolve(),
        ),
      );
    });
  },

  /**
   * Detect changes in a specific target and run a callback every time a change is detected
   * @param target - Target to monitor for changes
   * @param callback - Callback to execute when changes are detected
   * @param _intervalKey - Internal never provide this
   * @example
   * $c.detectChanges($c.querySelector('h1').text().run(), $c.trigger().run())
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
          ctx.run(callback);
        }
      }, 500),
    );
  },
};

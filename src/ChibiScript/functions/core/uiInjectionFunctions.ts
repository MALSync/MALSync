import type { ChibiCtx } from '../../ChibiCtx';

export default {
  /**
   * Prepends HTML content inside a target element (as the first child)
   * @input Element - Target DOM element to inject into
   */
  uiPrepend: (ctx: ChibiCtx, input: Element): void => {
    const ui = ctx.get('ui');
    if (typeof ui !== 'string') throw new Error('UI html not found');

    j.$(input).prepend(j.html(ui));
  },

  /**
   * Appends HTML content inside a target element (as the last child)
   * @input Element - Target DOM element to inject into
   */
  uiAppend: (ctx: ChibiCtx, input: Element): void => {
    const ui = ctx.get('ui');
    if (typeof ui !== 'string') throw new Error('UI html not found');

    j.$(input).append(j.html(ui));
  },

  /**
   * Inserts HTML content after a target element (as a sibling)
   * @input Element - Target DOM element to inject after
   */
  uiAfter: (ctx: ChibiCtx, input: Element): void => {
    const ui = ctx.get('ui');
    if (typeof ui !== 'string') throw new Error('UI html not found');

    j.$(input).after(j.html(ui));
  },

  /**
   * Inserts HTML content before a target element (as a sibling)
   * @input Element - Target DOM element to inject before
   */
  uiBefore: (ctx: ChibiCtx, input: Element): void => {
    const ui = ctx.get('ui');
    if (typeof ui !== 'string') throw new Error('UI html not found');

    j.$(input).before(j.html(ui));
  },
};

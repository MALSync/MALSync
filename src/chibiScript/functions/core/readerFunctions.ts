import type { ChibiCtx } from '../../ChibiCtx';

export default {
  /**
   * Counts how many elements are above the viewport
   * @input Element[] - Array of DOM elements to evaluate
   * @returns Number of elements above the viewport
   * @example
   * $c.querySelectorAll('img').countAbove()
   */
  countAbove: (ctx: ChibiCtx, input: Element[]): number => {
    if (input.length === 0) {
      throw new Error('Input array is empty');
    }

    const activeElement = getElementInViewport(input as HTMLElement[]);
    if (!activeElement) return 0;

    const count = countElementsAbove(input as HTMLElement[], activeElement);

    return count;

    function getElementInViewport(elements: HTMLElement[]) {
      const inPort: HTMLElement[] = [];
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();
        if (rect.bottom <= windowHeight && rect.left <= windowWidth && rect.width && rect.height) {
          inPort.push(element);
        }
      }

      if (inPort.length) return inPort[inPort.length - 1];

      return null;
    }

    function countElementsAbove(elements: HTMLElement[], element: HTMLElement) {
      let count = 0;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        count++;
        if (el === element) break;
      }
      return count;
    }
  },
};

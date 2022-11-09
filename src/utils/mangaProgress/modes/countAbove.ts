import { ModeAbstract } from '../ModeAbstract';

type arguements = {
  selector: string;
};

export class countAbove extends ModeAbstract<arguements> {
  protected execute(args: arguements) {
    const elements = j.$(args.selector);
    if (elements.length === 0) throw new Error(`No element found for '${args.selector}'`);

    const activeElement = this.getElementInViewport(elements);
    if (!activeElement) return 0;

    const count = this.countElementsAbove(elements, activeElement);

    return count;
  }

  protected getElementInViewport(elements: JQuery<HTMLElement>) {
    const inPort: HTMLElement[] = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const rect = element.getBoundingClientRect();
      if (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      ) {
        inPort.push(element);
      }
    }

    if (inPort.length) return inPort[inPort.length - 1];

    return null;
  }

  protected countElementsAbove(elements: JQuery<HTMLElement>, element: HTMLElement) {
    let count = 1; // start at 1 because the element itself is counted
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      // eslint-disable-next-line no-bitwise
      if (element.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) {
        count++;
      }
    }
    return count;
  }
}

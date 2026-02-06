/* eslint-disable no-redeclare */
import * as _utils from './src/utils/general';
import * as webextension from './src/api/webextension';
import * as _console from './src/utils/console';

type ConsoleType = typeof _console;
type UtilsType = typeof _utils;
type WebExtensionType = typeof webextension;

declare global {
  const chrome: any;
  const $: any;
  const require: any;

  interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    [index: number]: TElement;
    length: number;
    find(selector: string): JQuery;
    attr(name: string): string | undefined;
    text(): string;
    text(text: string): this;
    html(html: string): this;
    append(...content: any[]): this;
    prepend(...content: any[]): this;
    after(...content: any[]): this;
    data(key: string): any;
    children(selector?: string): JQuery;
    first(): JQuery;
    last(): JQuery;
    [Symbol.iterator](): Iterator<TElement>;
  }

  interface JQueryStatic {
    (selector: string | Element | JQuery): JQuery;
    (callback: () => void): JQuery;
  }

  let con: ConsoleType;
  let utils: UtilsType;
  let j: {
    $: JQueryStatic;
    html: (content: string) => string;
  };
  let api: WebExtensionType;
  let __MAL_SYNC_KEYS__: {
    simkl: {
      id: string;
      secret: string;
    };
  };

  interface Window {
    /**
     * @deprecated
     * @see @link https://developer.mozilla.org/en-US/docs/Web/API/Window/fullScreen
     */
    fullScreen: boolean;
  }

  interface Document {
    webkitIsFullScreen: boolean;
    mozFullScreen: boolean;
    msFullscreenElement: Element;
  }

  type ObjectAnyType = {
    [x in string | number]: any;
  };
}

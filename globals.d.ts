/* eslint-disable no-redeclare */
import * as _utils from './src/utils/general';
import * as webextension from './src/api/webextension';
import * as _console from './src/utils/console';

type ConsoleType = typeof _console;
type UtilsType = typeof _utils;
type WebExtensionType = typeof webextension;

declare global {
  let con: ConsoleType;
  let utils: UtilsType;
  let j: {
    $: JQueryStatic;
    html: (content: string) => string;
  };
  let api: WebExtensionType;

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

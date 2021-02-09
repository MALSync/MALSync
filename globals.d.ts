import * as _utils from './src/utils/general';
import * as webextension from './src/api/webextension';
import * as _console from './src/utils/console';

declare global {
  let con: typeof _console;
  let utils: typeof _utils;
  let j: {
    $: JQueryStatic;
    html: (content: string) => string;
  };
  let api: typeof webextension;

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

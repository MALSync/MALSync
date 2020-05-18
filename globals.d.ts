import * as _utils from "./src/utils/general";
import * as webextension from "./src/api/webextension";
import * as _console from "./src/utils/console";

declare global {
  let con: typeof _console;
  let utils: typeof _utils;
  let j: { $: JQueryStatic };
  let api: typeof webextension;
}

import { StorageInterface } from './storageInterface';

declare let GM_setValue: Function;
declare let GM_getValue: Function;
declare let GM_deleteValue: Function;
declare let GM_addStyle: Function;
declare let GM_getResourceText: Function;
declare let GM_info: any;
declare let GM_listValues: Function;
declare let i18n: Record<string, string>;

export const userscriptLegacy: StorageInterface = {
  set(key: string, value: string): Promise<void> {
    GM_setValue(key, value);
    return Promise.resolve();
  },

  get(key: string): Promise<string | undefined> {
    const value = GM_getValue(key);
    return Promise.resolve(value);
  },

  remove(key: string): Promise<void> {
    GM_deleteValue(key);
    return Promise.resolve();
  },

  list(): Promise<any[]> {
    const reverseArray: any = {};
    j.$.each(GM_listValues(), function eachListValues(index, cache) {
      reverseArray[cache] = index;
    });
    return Promise.resolve(reverseArray);
  },

  addStyle(css: string): Promise<void> {
    GM_addStyle(css);
    return Promise.resolve();
  },

  version() {
    return GM_info.script.version;
  },

  lang(selector: string, args: string[] = []): string {
    let message = i18n[selector];
    if (typeof args !== 'undefined') {
      for (let argIndex = 0; argIndex < args.length; argIndex++) {
        message = message.replace(`$${argIndex + 1}`, args[argIndex]);
      }
    }
    return message;
  },

  langDirection() {
    return 'ltr';
  },

  assetUrl(filename) {
    return `https://raw.githubusercontent.com/MALSync/MALSync/master/assets/assets/${filename}`;
  },

  injectCssResource(res, head, code = null) {
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    head.append(
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      j
        .$('<style>')
        .attr('rel', 'stylesheet')
        .attr('type', 'text/css')
        .html(code || GM_getResourceText(res)),
    );
  },

  injectJsResource(res, head) {
    const s = document.createElement('script');
    s.text = GM_getResourceText(res);
    s.onload = function onLoad() {
      // @ts-ignore
      this.remove();
    };
    head.get(0).appendChild(s);
  },

  addProxyScriptToTag(tag, name) {
    // @ts-expect-error value is assigned by webpack
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ps: { [key: string]: string } = proxyScripts;
    if (!ps[name]) throw new Error(`Proxy script ${name} not found`);
    tag.textContent = ps[name];
    return tag;
  },

  updateDom(head) {
    const s = document.createElement('script');
    s.text = `
        document.getElementsByTagName('head')[0].onclick = function(e){
          try{
            componentHandler.upgradeDom();
          }catch(e){
            console.log(e);
            setTimeout(function(){
              componentHandler.upgradeDom();
            },500);
          }
        }`;
    s.onload = function () {
      // @ts-ignore
      this.remove();
    };
    head.get(0).appendChild(s);
  },

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  storageOnChanged(cb) {
    // not supported
  },
};

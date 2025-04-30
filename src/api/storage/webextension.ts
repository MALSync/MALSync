import { StorageInterface } from './storageInterface';

declare let i18n: string[];

export const webextension: StorageInterface = {
  async set(key: string, value: string): Promise<void> {
    const obj = {} as any;
    obj[key] = value;
    return new Promise((resolve, reject) => {
      getStorage(key).set(obj, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  },

  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      getStorage(key).get(key, function (results) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(results[key]);
      });
    });
  },

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getStorage(key).remove(key, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  },

  async list(type = 'local'): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      if (type === 'local') {
        chrome.storage.local.get(null, function (results) {
          resolve(results);
        });
      } else {
        chrome.storage.sync.get(null, function (results) {
          resolve(results);
        });
      }
    });
  },

  async addStyle(css) {
    try {
      const style = document.createElement('style');
      style.textContent = css;
      (document.head || document.body || document.documentElement || document).appendChild(style);
    } catch (e) {
      console.log(`Could not add css:${e}`);
    }
  },

  version() {
    return chrome.runtime.getManifest().version;
  },

  lang(selector, args) {
    if (api.settings.get('forceEn') && typeof i18n !== 'undefined') {
      let message = i18n[selector];
      if (typeof args !== 'undefined') {
        for (let argIndex = 0; argIndex < args.length; argIndex++) {
          message = message.replace(`$${argIndex + 1}`, args[argIndex]);
        }
      }
      return message;
    }
    // @ts-ignore
    return chrome.i18n.getMessage(selector, args);
  },

  langDirection() {
    try {
      const lang = chrome.i18n.getUILanguage();
      if (/^(ar)(-|$)/i.test(lang) && !api.settings.get('forceEn')) {
        return 'rtl';
      }
    } catch (error) {
      con.error(error);
    }
    return 'ltr';
  },

  assetUrl(filename) {
    return chrome.runtime.getURL(`assets/${filename}`);
  },

  injectCssResource(res, head) {
    alert('injectCssResource not supported in webextension');
  },

  injectJsResource(res, head) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(`vendor/${res}`);
    s.onload = function () {
      // @ts-ignore
      this.remove();
    };
    head.get(0).appendChild(s);
  },

  addProxyScriptToTag(tag, name) {
    tag.src = chrome.runtime.getURL(`/content/proxy/proxy_${name}.js`);
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

  storageOnChanged(cb) {
    chrome.storage.onChanged.addListener(cb);
  },
};

function getStorage(key: string) {
  if (utils.syncRegex.test(key)) {
    return chrome.storage.sync;
  }
  return chrome.storage.local;
}

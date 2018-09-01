import {storageInterface} from "./storageInterface";

export const webextension: storageInterface = {
    async set(key: string, value: string): Promise<any> {
      const obj = {} as any;
      obj[key] = value;
      return new Promise((resolve, reject) => {
          chrome.storage.local.set(obj, function(){
              resolve();
          });
      });
    },

    async get(key: string): Promise<any> {
      return new Promise((resolve, reject) => {
          chrome.storage.local.get(key, function(results){
              resolve(results[key]);
          });
      });
    },

    async remove(key: string): Promise<any> {
      return new Promise((resolve, reject) => {
          chrome.storage.local.remove(key, function(){
              resolve();
          });
      });
    },

    async addStyle(css){
      try {
          var style = document.createElement('style');
          style.textContent = css;
          (document.head || document.body || document.documentElement || document).appendChild(style);
      } catch (e) {
          console.log("Could not add css:" + e);
      }
    },

    injectCssResource(res, head){
      var path = chrome.extension.getURL('vendor/'+res);
      head.append($('<link>')
          .attr("rel","stylesheet")
          .attr("type","text/css")
          .attr("href", path));
    }
};

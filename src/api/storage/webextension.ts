import {storageInterface} from "./storageInterface";

export const webextension: storageInterface = {
    async set(key: string, value: string): Promise<any> {
      const obj = {} as any;
      obj[key] = value;
      return new Promise((resolve, reject) => {
          getStorage(key).set(obj, function(){
              resolve();
          });
      });
    },

    async get(key: string): Promise<any> {
      return new Promise((resolve, reject) => {
          getStorage(key).get(key, function(results){
              resolve(results[key]);
          });
      });
    },

    async remove(key: string): Promise<any> {
      return new Promise((resolve, reject) => {
          getStorage(key).remove(key, function(){
              resolve();
          });
      });
    },

    async list(): Promise<any> {
      return new Promise((resolve, reject) => {
          chrome.storage.local.get(null, function(results){
              resolve(results);
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

    version(){
      return chrome.runtime.getManifest().version;
    },

    assetUrl(filename){
      return chrome.extension.getURL('assets/'+filename);
    },

    injectCssResource(res, head){
      var path = chrome.extension.getURL('vendor/'+res);
      head.append($('<link>')
          .attr("rel","stylesheet")
          .attr("type","text/css")
          .attr("href", path));
    },

    injectjsResource(res, head){
      var s = document.createElement('script');
      s.src = chrome.extension.getURL('vendor/'+res);
      s.onload = function() {
        // @ts-ignore
        this.remove();
      };
      head.get(0).appendChild(s);
    },

    updateDom(head){
      var s = document.createElement('script');
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
      s.onload = function() {
        // @ts-ignore
        this.remove();
      };
      head.get(0).appendChild(s);
    }
};

function getStorage(key:string){
  if(utils.syncRegex.test(key)){
    return chrome.storage.sync;
  }
  return chrome.storage.local;
}

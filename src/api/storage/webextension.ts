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
    }
};

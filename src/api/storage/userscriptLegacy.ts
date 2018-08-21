import {storageInterface} from "./storageInterface";

declare var GM_setValue: any;
declare var GM_getValue: any;
declare var GM_deleteValue: any;
declare var GM_addStyle: any;

export const userscriptLegacy: storageInterface = {
    async set(key: string, value: string): Promise<void> {
      GM_setValue(key, value);
    },

    async get(key: string): Promise<string | undefined> {
      const value = GM_getValue(key);
      return value;
    },

    async remove(key: string): Promise<void> {
      GM_deleteValue(key);
    },

    async addStyle(css){
      GM_addStyle(css);
    }
};

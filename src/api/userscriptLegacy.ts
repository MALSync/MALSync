import {apiInterface} from "./apiInterface";

declare var GM_setValue: any;
declare var GM_getValue: any;
declare var GM_deleteValue: any;

export const userscriptLegacy: apiInterface = {
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
};

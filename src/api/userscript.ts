import { userscriptLegacy } from './storage/userscriptLegacy';
import { requestUserscriptLegacy } from './request/requestUserscriptLegacy';
import { settingsObj } from './settings';

export const storage = userscriptLegacy;

export const request = requestUserscriptLegacy;

export const settings = settingsObj;

export const type = 'userscript';

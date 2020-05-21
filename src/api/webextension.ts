import { webextension } from './storage/webextension';
import { requestApi } from './request/requestWebextension';
import { settingsObj } from './settings';

export const storage = webextension;

export const request = requestApi;

export const settings = settingsObj;

export const type = 'webextension';

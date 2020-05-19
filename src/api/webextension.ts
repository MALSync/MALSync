import { webextension } from './storage/webextension';
import { requestApi } from './request/requestWebextension';
import { settingsObj } from './settings';

export var storage = webextension;

export var request = requestApi;

export var settings = settingsObj;

export var type = 'webextension';

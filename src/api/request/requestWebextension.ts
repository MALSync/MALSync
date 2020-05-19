import {
  xhrI,
  xhrResponseI,
  sendMessageI,
  responseMessageI,
} from './../messageInterface';
import { requestInterface } from './requestInterface';

export const requestApi: requestInterface = {
  async xhr(method, url) {
    if (typeof requestApi.sendMessage !== 'undefined') {
      return requestApi.sendMessage({ name: 'xhr', method: method, url: url });
    }
  },

  async sendMessage(message: sendMessageI): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, function(response: responseMessageI) {
        resolve(response);
      });
    });
  },
};

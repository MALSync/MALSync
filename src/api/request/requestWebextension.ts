import { sendMessageI, responseMessageI } from '../messageInterface';
import { requestInterface } from './requestInterface';

export const requestApi: requestInterface = {
  async xhr(method, url) {
    if (typeof requestApi.sendMessage !== 'undefined') {
      return requestApi.sendMessage({ name: 'xhr', method, url });
    }
    throw 'Could not send xhr';
  },

  async sendMessage(message: sendMessageI): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, function(response: responseMessageI) {
        resolve(response);
      });
    });
  },

  notification(options) {
    this.sendMessage({
      name: 'notification',
      options,
    });
  },
};

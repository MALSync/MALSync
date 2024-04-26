import { sendMessageI, responseMessageI } from '../messageInterface';
import { requestInterface } from './requestInterface';

export const requestApi: requestInterface = {
  async xhr(method, url) {
    if (typeof requestApi.sendMessage !== 'undefined') {
      return requestApi.sendMessage({ name: 'xhr', method, url }).then(xhr => {
        if (xhr.status === 429) throw 'Rate limit Timeout';
        if (xhr.status === 0) throw xhr.responseText;
        return xhr;
      });
    }
    throw 'Could not send xhr';
  },

  async sendMessage(message: sendMessageI): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, function (response: responseMessageI) {
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
  database(call, param) {
    return this.sendMessage({
      name: 'database',
      options: {
        call,
        param,
      },
    });
  },
};

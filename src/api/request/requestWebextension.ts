import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./../messageInterface";

export const requestApi = {
  async xhr(method, url): Promise<xhrResponseI>{
    return requestApi.sendMessage({name: "xhr", method: method, url: url})
  },

  async sendMessage(message: sendMessageI): Promise<any>{
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, function(response: responseMessageI) {
        resolve(response);
      });
    });
  }
}

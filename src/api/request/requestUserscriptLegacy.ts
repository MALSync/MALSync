import {requestInterface} from "./requestInterface";
import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./../messageInterface";

declare var GM_xmlhttpRequest: any;

export const requestUserscriptLegacy: requestInterface = {
    async xhr(method, url):  Promise<any>{
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: method,
            url: url,
            synchronous: false,
            onload: function(response) {
                console.log(response);
                var responseObj: xhrResponseI = {
                  finalUrl: response.finalUrl,
                  responseText: response.responseText,
                  status: response.status
                }
                resolve(responseObj);
            }
        });
      });
    },
};

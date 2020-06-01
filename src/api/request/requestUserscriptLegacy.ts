import { requestInterface } from './requestInterface';
import { xhrResponseI } from '../messageInterface';

declare let GM_xmlhttpRequest: any;

export const requestUserscriptLegacy: requestInterface = {
  async xhr(method, url): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        method,
        url,
        synchronous: false,
        headers: [],
        data: null,
        onload(response) {
          console.log(response);
          const responseObj: xhrResponseI = {
            finalUrl: response.finalUrl,
            responseText: response.responseText,
            status: response.status,
          };
          resolve(responseObj);
        },
      };
      if (typeof url === 'object') {
        request.url = url.url;
        request.headers = url.headers;
        request.data = url.data;
      }
      GM_xmlhttpRequest(request);
    });
  },
};

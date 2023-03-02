import { requestInterface } from './requestInterface';
import { xhrResponseI } from '../messageInterface';
import { defaultImg } from '../../background/notifications';

declare let GM_xmlhttpRequest: any;
declare let GM_notification: (details: {
  title: string;
  text: string;
  image: string;
  timeout: number;
  onclick: () => void;
}) => void;

export const requestUserscriptLegacy: requestInterface = {
  async xhr(method, url, retry = 0): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        method,
        url,
        synchronous: false,
        headers: {},
        data: null,
        onload(response) {
          console.log(response);
          if (response.status === 429) {
            if (retry > 3 || utils.rateLimitExclude.test(response.finalUrl))
              throw 'Rate limit Timeout';
            con.error('RATE LIMIT');
            api.storage.set('rateLimit', true);
            setTimeout(() => {
              api.storage.set('rateLimit', false);
              resolve(requestUserscriptLegacy.xhr(method, url, retry + 1));
            }, 30000);
            return;
          }
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

      request.url = encodeURI(request.url as string);

      // @ts-ignore
      if (request.url.includes('malsync.moe')) {
        // @ts-ignore
        request.headers.version = api.storage.version();
        // @ts-ignore
        request.headers.type = 'userscript';
      }
      GM_xmlhttpRequest(request);
    });
  },
  notification(options) {
    GM_notification({
      title: options.title,
      text: options.text,
      image: options.image ?? defaultImg,
      timeout: options.sticky ? 0 : 10,
      onclick: () => {
        window.open(options.url, '_blank');
      },
    });
  },
  database(call, param) {
    return Promise.resolve(undefined);
  },
};

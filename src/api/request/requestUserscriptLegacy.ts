import { RequestInterface } from './requestInterface';
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

export const requestUserscriptLegacy: RequestInterface = {
  async xhr(method, url, retry = 0): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers: Record<string, string> = {};
      let requestUrl: string;
      let data: string | undefined;

      if (typeof url === 'object') {
        const { url: u, headers: h = {}, data: d } = url;
        requestUrl = u ?? '';
        headers = h as Record<string, string>;
        data = d;
      } else {
        requestUrl = url;
      }

      const request = {
        method,
        url: encodeURI(requestUrl),
        synchronous: false,
        headers,
        data,
        onload(response: { status: number; finalUrl: string; responseText: any }) {
          console.log(response);
          if (response.status === 429) {
            if (retry > 3 || utils.rateLimitExclude.test(response.finalUrl))
              throw new Error('Rate limit Timeout');
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

      if (
        utils.isDomainMatching(request.url, 'malsync.moe') ||
        utils.isDomainMatching(request.url, 'simkl.com')
      ) {
        request.headers.version = api.storage.version();
        request.headers.type = 'userscript';
      }
      GM_xmlhttpRequest(request);
    });
  },
  notification(options) {
    GM_notification({
      title: options.title,
      text: options.text,
      image: options.image || defaultImg,
      timeout: options.sticky ? 0 : 10,
      onclick: () => {
        window.open(options.url, '_blank');
      },
    });
  },
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  database(call, param) {
    return Promise.resolve(undefined);
  },
};

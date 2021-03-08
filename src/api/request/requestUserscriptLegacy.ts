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
};

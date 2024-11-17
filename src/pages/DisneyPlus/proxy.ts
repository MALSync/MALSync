import { DisneyPlusProxyData } from './types';

// Inspired by HiDive proxy
export function script() {
  const logger = con.m('D+ Proxy');
  const auth = '';
  if (!(window as any).fetchOverride) {
    (window as any).malsyncData = {};
    // eslint-disable-next-line no-var
    var originalFetch = fetch;
    // @ts-ignore
    // eslint-disable-next-line no-global-assign
    fetch = (input, init) =>
      originalFetch(input, init).then(response => {
        try {
          const url = input.url || input;

          if (url.includes('disney.api')) {
            const res = response.clone();
            res.json().then(data => {
              logger.log('Fetch request', this._url, data);
            });
          }
        } catch (e) {
          logger.error('MALSYNC', e);
        }

        return response;
      });

    class CustomXMLHttpRequest extends XMLHttpRequest {
      _url: string | undefined;

      constructor() {
        super();
      }

      open(
        method: string,
        url: string,
        async: boolean = true,
        user?: string | undefined,
        password?: string | undefined,
      ) {
        this._url = url;
        super.open.apply(this, [method, url, async, user, password]);
      }

      send(body?: any) {
        const originalOnReadyStateChange = this.onreadystatechange;

        this.onreadystatechange = ev => {
          if (this.readyState === XMLHttpRequest.DONE) {
            // logger.log('XMLHttpRequest', this._url, this.responseText);
            if (this._url?.includes('/deeplink')) {
              try {
                let json = JSON.parse(this.responseText);
                let temp = json['data']['deeplink']['actions'][0];
                let data: DisneyPlusProxyData = {
                  seriesId: temp['partnerFeed']['evaSeriesEntityId'],
                  nextEpisodeId: temp['upNextId'],
                  title: temp['internalTitle'],
                };
                (window as any).malsyncData = data;
              } catch (e) {
                logger.error(e);
              }
            }
          }

          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(this, [ev]);
          }
        };

        super.send.apply(this, [body]);
      }
    }

    window.XMLHttpRequest = CustomXMLHttpRequest as any;
    (window as any).fetchOverride = true;
  }

  if (Object.prototype.hasOwnProperty.call(window as any, 'malsyncData')) {
    return (window as any).malsyncData;
  }
  return undefined;
}

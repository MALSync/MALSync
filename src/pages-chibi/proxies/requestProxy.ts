export type ForwardedRequest = {
  source: 'fetch' | 'xhr';
  url: string;
  data: unknown;
};

const logger = con.m('Request');

function resolveFetchUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if ('url' in input) return input.url;
  return String(input);
}

function allowedContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return lower.includes('application/json') || lower.includes('+json');
}

let remoteActive = false;
let requestQueue: ForwardedRequest[] = [];

function forwardRequest(request: ForwardedRequest): void {
  window.dispatchEvent(
    new CustomEvent('malsync-xhr', {
      detail: request,
    }),
  );
  if (!remoteActive) {
    requestQueue.push(request);
  }
}

function listenForRemote() {
  window.addEventListener(
    'malsync-xhr-start',
    () => {
      logger.log('Remote connected');
      remoteActive = true;
      requestQueue.forEach(req => forwardRequest(req));
      requestQueue = [];
    },
    false,
  );
}

function proxyFetch() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (...args) => {
    const url = resolveFetchUrl(args[0]);
    return originalFetch(...args).then(response => {
      const contentType = response.headers?.get('content-type');
      if (allowedContentType(contentType)) {
        const clone = response.clone();
        clone
          .json()
          .then(data => forwardRequest({ source: 'fetch', url, data }))
          .catch(() => undefined);
      }

      return response;
    });
  };
}

function proxyXHR() {
  const originalXHR = window.XMLHttpRequest;

  window.XMLHttpRequest = class extends originalXHR {
    private _malsyncUrl = '';

    open(method: string, url: string | URL): void;
    // eslint-disable-next-line no-dupe-class-members
    open(
      method: string,
      url: string | URL,
      async: boolean,
      username?: string | null,
      password?: string | null,
    ): void;
    // eslint-disable-next-line no-dupe-class-members
    open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ): void {
      this._malsyncUrl = url.toString();
      return super.open(method, url, async as boolean, username, password);
    }

    send(body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this;
      const originalOnReadyStateChange = this.onreadystatechange;

      this.onreadystatechange = function (this: XMLHttpRequest, event: Event) {
        if (this.readyState === 4) {
          try {
            const contentType = xhr.getResponseHeader('content-type');
            if (xhr.responseType === 'json' && xhr.response) {
              forwardRequest({
                source: 'xhr',
                url: xhr._malsyncUrl,
                data: xhr.response,
              });
            } else if (allowedContentType(contentType)) {
              if (typeof xhr.response === 'string') {
                if (xhr.response) {
                  let data;
                  try {
                    data = JSON.parse(xhr.response);
                  } catch (e) {
                    data = xhr.responseText || null;
                  }
                  forwardRequest({
                    source: 'xhr',
                    url: xhr._malsyncUrl,
                    data,
                  });
                }
              }
            }
          } catch (e) {
            // Ignore parsing errors or other issues
          }
        }

        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.apply(this, [event] as any);
        }

        return undefined;
      };

      return super.send(body);
    }
  };
}

export function init(): void {
  logger.log('Initializing');
  proxyFetch();
  proxyXHR();
  listenForRemote();
}

init();

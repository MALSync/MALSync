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

const xhrListeners = new WeakMap<XMLHttpRequest, EventListener>();

// Old implementation did block the Crunchyroll video player from loading.
function proxyXHR() {
  const proto = window.XMLHttpRequest.prototype;
  const originalOpen = proto.open;

  proto.open = function open(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: [boolean?, (string | null)?, (string | null)?]
  ) {
    const requestUrl = url.toString();

    const previous = xhrListeners.get(this);
    if (previous) this.removeEventListener('load', previous);

    const onLoad = () => {
      const { responseType } = this;
      if (responseType !== '' && responseType !== 'text' && responseType !== 'json') {
        return;
      }

      if (responseType === 'json' && this.response) {
        forwardRequest({ source: 'xhr', url: requestUrl, data: this.response });
      } else if (allowedContentType(this.getResponseHeader('content-type')) && this.responseText) {
        let data: unknown;
        try {
          data = JSON.parse(this.responseText);
        } catch (e) {
          data = this.responseText;
        }
        forwardRequest({ source: 'xhr', url: requestUrl, data });
      }
    };

    xhrListeners.set(this, onLoad);
    this.addEventListener('load', onLoad);

    return originalOpen.call(this, method, url, ...(rest as [boolean]));
  };
}

export function init(): void {
  logger.log('Initializing');
  proxyFetch();
  proxyXHR();
  listenForRemote();
}

init();

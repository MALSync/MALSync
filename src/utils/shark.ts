import * as Sentry from '@sentry/browser';

declare type FetchImpl = typeof fetch;

export class FakeFetchTransport extends Sentry.Transports.FetchTransport {
  constructor(options, fetchImpl?: FetchImpl) {
    const fakeFetch = function(url, opt) {
      return api.request.xhr(opt.method ?? 'GET', {
        url,
        data: opt.body,
      });
    };
    // @ts-ignore
    super(options, fakeFetch);
    return this;
  }
}

export function initShark() {
  Sentry.init({
    dsn: '',
    transport: FakeFetchTransport,
    release: `malsync.${api.type}@${api.storage.version()}`,
  });
}

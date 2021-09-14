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

export async function initShark() {
  if (!(await api.settings.getAsync('crashReport'))) {
    con.info('Crash reports disabled');
    return;
  }

  Sentry.init({
    dsn: 'https://blood@shark.malsync.moe/1337',
    tunnel: 'https://api.malsync.moe/shark',
    transport: FakeFetchTransport,
    release: `malsync.${api.type}@${api.storage.version()}`,
    integrations: [new Sentry.Integrations.Breadcrumbs({ console: false, dom: false })],
    environment: env.CONTEXT,
  });
}

export const Shark = Sentry;

export function bloodTrail(options: Sentry.Breadcrumb) {
  try {
    Shark.addBreadcrumb(options);
  } catch (e) {
    console.error(e);
  }
}

import * as Sentry from '@sentry/browser';

const normalizeUrl = url => {
  return url.replace(/(webpack_require__@)?(moz|chrome)-extension:\/\/[^/]+\//, '~/');
};

declare type FetchImpl = typeof fetch;

class FakeFetchTransport extends Sentry.Transports.FetchTransport {
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
    release: `malsync@${api.storage.version()}`,
    integrations: [new Sentry.Integrations.Breadcrumbs({ console: false, dom: false })],
    // eslint-disable-next-line no-undef
    environment: env.CONTEXT,
    autoSessionTracking: false,
    beforeSend(event) {
      if (
        event.exception &&
        event.exception.values &&
        event.exception.values[0] &&
        event.exception.values[0].stacktrace &&
        event.exception.values[0].stacktrace.frames &&
        event.exception.values[0].stacktrace.frames[0] &&
        event.exception.values[0].stacktrace.frames[0].filename === '~/vendor/material.js'
      ) {
        return null;
      }

      return event;
    },
  });

  Sentry.configureScope(scope => {
    scope.addEventProcessor(async (event: any) => {
      if (event.culprit) {
        event.culprit = normalizeUrl(event.culprit);
      }

      if (
        event.exception &&
        event.exception.values &&
        event.exception.values[0] &&
        event.exception.values[0].stacktrace &&
        event.exception.values[0].stacktrace.frames
      ) {
        event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames.map(frame => {
          frame.filename = normalizeUrl(frame.filename);
          return frame;
        });
      }

      return event;
    });
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

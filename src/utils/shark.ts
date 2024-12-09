import * as Sentry from '@sentry/browser';

const normalizeUrl = (url: string) => {
  return url.replace(/(webpack_require__@)?(moz|chrome)-extension:\/\/[^/]+\//, '~/');
};

function makeFakeFetchTransport(options, _fetchImpl): any {
  return Sentry.makeFetchTransport(options, (url: any, opt: any) => {
    const retObj = {
      status: 200,
      headers: {
        get: type => '',
      },
    };

    return api.request
      .xhr(opt.method ?? 'GET', {
        url,
        data: opt.body,
      })
      .catch(e => {
        retObj.status = 429;
        return retObj;
      })
      .then(res => retObj) as any;
  });
}

export async function initShark() {
  if (!(await api.settings.getAsync('crashReport'))) {
    con.info('Crash reports disabled');
    return;
  }

  if (utils.isDomainMatching(window.location.href, 'wakanim.tv') && utils.isFirefox()) {
    con.info('Crash reports disabled for wakanim.tv');
    return;
  }

  if (utils.isDomainMatching(window.location.href, 'simkl.com') && utils.isFirefox()) {
    con.info('Crash reports disabled for simkl.com');
    return;
  }

  Sentry.init({
    dsn: 'https://blood@shark.malsync.moe/1337',
    tunnel: 'https://api.malsync.moe/shark',
    transport: makeFakeFetchTransport as any,
    release: `malsync@${api.storage.version()}`,
    integrations: [
      new Sentry.Integrations.Breadcrumbs({ console: false, dom: false }),
      new Sentry.Integrations.GlobalHandlers({ onerror: false, onunhandledrejection: false }),
    ],
    // eslint-disable-next-line no-undef
    environment: env.CONTEXT,
    autoSessionTracking: false,
    ignoreErrors: ['SafeError'],
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
        event.exception.values[0].stacktrace.frames =
          event.exception.values[0].stacktrace.frames.map(frame => {
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

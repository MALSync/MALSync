
export function setConAndUtils() {
  (globalThis as any).con = require('../../../src/utils/console');
  (globalThis as any).con.log = function() {};
  (globalThis as any).con.error = function() {};
  (globalThis as any).con.info = function() {};
  (globalThis as any).utils = require('../../../src/utils/general');
}

export function createStorageStub() {
  const store: { [key: string]: any } = {};
  return {
    lang(key: string) {
      return key;
    },
    get(key: string) {
      return Promise.resolve(store[key]);
    },
    set(key: string, value: any) {
      store[key] = value;
      return Promise.resolve();
    },
    remove(key: string) {
      delete store[key];
      return Promise.resolve();
    },
  };
}

export type Fixture = {
  /** Defaults to GET - every remaining (non-sync) test only ever reads. */
  method?: string;
  /** Matched against the request URL (exact string or regex - use a regex to ignore query strings/ids you don't care about). */
  url: string | RegExp;
  /** Optional: matched against the raw request body (POST APIs like AniList's GraphQL endpoint all hit one URL, disambiguated by body content). */
  body?: string | RegExp;
  /** HTTP status to respond with. Defaults to 200. */
  status?: number;
  /** Response body - JSON.stringify'd automatically. */
  response: any;
};

export function createFixtureXhr(fixtures: Fixture[]) {
  return async function xhr(method: string, conf: any) {
    const fixture = fixtures.find(f => {
      if ((f.method ?? 'GET') !== method) return false;
      if (!matches(f.url, conf.url)) return false;
      if (f.body && !matches(f.body, conf.data ?? '')) return false;
      return true;
    });
    if (!fixture) {
      throw new Error(`No fixture for ${method} ${conf.url}${conf.data ? ` ${conf.data}` : ''}`);
    }
    return { status: fixture.status ?? 200, responseText: JSON.stringify(fixture.response) };
  };
}

function matches(matcher: string | RegExp, value: string) {
  return typeof matcher === 'string' ? matcher === value : matcher.test(value);
}

export function createProviderApi(opts: {
  tokenKey: string;
  xhr: (method: string, conf: any) => Promise<{ status: number; responseText: string }>;
  unauthorizedResponse?: { status: number; response: any };
}) {
  const settingsStore: { [key: string]: any } = {};

  const api: any = {
    token: 'valid-token',
    status: 0,
    settings: {
      get(key: string) {
        if (key === opts.tokenKey) return api.token;
        return key in settingsStore ? settingsStore[key] : '';
      },
      set(key: string, value: any) {
        settingsStore[key] = value;
      },
    },
    storage: createStorageStub(),
    request: {
      async xhr(method: string, conf: any) {
        if (api.status) {
          return { status: api.status, responseText: '' };
        }
        if (!api.token && conf.headers?.Authorization !== undefined && opts.unauthorizedResponse) {
          return {
            status: opts.unauthorizedResponse.status,
            responseText: JSON.stringify(opts.unauthorizedResponse.response),
          };
        }
        return opts.xhr(method, conf);
      },
    },
  };

  return api;
}

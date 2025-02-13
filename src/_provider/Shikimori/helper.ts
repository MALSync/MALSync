/* eslint-disable import/no-cycle */
import {
  NotAuthenticatedError,
  NotFoundError,
  ServerOfflineError,
  MissingParameterError,
  InvalidParameterError,
} from '../Errors';
import { Cache } from '../../utils/Cache';
import { Queries } from './queries';

const clientId = 'z3NJ84kK9iy5NU6SnhdCDB38rr4-jFIJ67bMIUDzdoo';

export const authUrl = `https://shikimori.one/oauth/authorize?client_id=${clientId}&redirect_uri=https%3A%2F%2Fmalsync.moe%2Fshikimori%2Foauth&response_type=code&scope=user_rates`;

const apiDomain = 'https://shikimori.one/api/';

export const domain = 'https://shikimori.one';

export async function apiCall(options: {
  type: 'GET' | 'PUT' | 'DELETE' | 'POST';
  path: string;
  parameter?: { [key: string]: string | number };
  dataObj?: { [key: string]: unknown };
  auth?: boolean;
}) {
  const { type } = options;
  const token = api.settings.get('shikiToken');

  if (!token && !token.access_token && !options.auth) {
    throw new NotAuthenticatedError('No token set');
  }

  let url = '';
  if (options.auth) {
    url = 'https://shikimori.one/oauth/token';
  } else {
    url = `${apiDomain}${options.path}`;

    if (options.parameter && Object.keys(options.parameter).length) {
      url += url.includes('?') ? '&' : '?';
      const params = [] as string[];
      for (const key in options.parameter) {
        params.push(`${key}=${options.parameter[key]}`);
      }
      url += params.join('&');
    }
  }
  const headers = {
    'User-Agent': 'MAL-Sync',
    'Content-Type': 'application/json',
    ...(!options.auth ? { Authorization: `Bearer ${token.access_token}` } : {}),
  };

  return api.request
    .xhr(type, {
      url,
      headers,
      data: options.dataObj ? JSON.stringify(options.dataObj) : undefined,
    })
    .then(async response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let res: any = null;
      if (response.responseText) {
        res = JSON.parse(response.responseText);
      }

      if (response.status === 401) {
        if (options.auth) throw new NotAuthenticatedError(res.message || res.error);
        await refreshToken(token.refresh_token);
        return apiCall(options);
      }

      if (res && res.error) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (options.auth) throw new NotAuthenticatedError(res.message || res.error);
            await refreshToken(token.refresh_token);
            return apiCall(options);
          case 'not_found':
            throw new NotFoundError(res.message || res.error);
          default:
            throw new Error(res.message || res.error);
        }
      }

      if (res && res.errors && res.errors.length) {
        let error = '';
        if (res.errors[0].message) {
          for (let i = 0; i < res.errors.length; i++) {
            error += `${res.errors[i].message}${res.errors[i].path ? ` - Path: (${res.errors[i].path})` : ''}\n`;
          }
        } else {
          error = res.errors.join('\n');
          if (error.includes('Missing parameter')) {
            throw new MissingParameterError(error);
          } else if (error.includes('Invalid parameter')) {
            throw new InvalidParameterError(error);
          }
        }
        throw new Error(error);
      }

      switch (response.status) {
        case 400:
          throw new Error('Invalid Parameters');
        case 403:
        default:
      }

      return res;
    });
}

export function authRequest(data: { code: string } | { refresh_token: string }) {
  const dataObj = {
    client_id: clientId,
    client_secret: '6vkFaJN_wxQHmBoq23ac1z6tZKiAD7xqsXGudkkOqTg',
    redirect_uri: 'https://malsync.moe/shikimori/oauth',
    ...('code' in data
      ? {
          code: data.code,
          grant_type: 'authorization_code',
        }
      : {
          refresh_token: data.refresh_token,
          grant_type: 'refresh_token',
        }),
  };

  return apiCall({
    type: 'POST',
    path: 'oauth/token',
    auth: true,
    dataObj,
  });
}

async function refreshToken(refresh_token: string) {
  const res = await authRequest({ refresh_token }).catch(async err => {
    if (err.message === 'invalid_request') {
      await api.settings.set('shikiToken', '');
    }
    throw err;
  });
  await api.settings.set('shikiToken', {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
  });
}

export async function userRequest() {
  return Queries.CurrentUser();
}

export async function userId(): Promise<string> {
  const cacheObj = new Cache('shiki/userId', 4 * 60 * 60 * 1000);

  if (await cacheObj.hasValue()) {
    return cacheObj.getValue();
  }

  const res = await userRequest();
  if (res.data.currentUser.id) {
    await cacheObj.setValue(res.data.currentUser.id);
  }
  return res.data.currentUser.id;
}

export function title(rus: string, eng: string, headline = false) {
  const options = api.settings.get('shikiOptions');
  const locale = options && options.locale ? options.locale : 'ru';
  if (locale === 'ru') return rus || eng;
  if (headline && eng && rus) return `${eng} / ${rus}`;
  return eng || rus;
}

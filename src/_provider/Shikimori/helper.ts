import { NotAutenticatedError, NotFoundError, ServerOfflineError } from '../Errors';
import { status } from '../definitions';
import { Cache } from '../../utils/Cache';

const clientId = 'z3NJ84kK9iy5NU6SnhdCDB38rr4-jFIJ67bMIUDzdoo';

export const authUrl = `https://shikimori.one/oauth/authorize?client_id=${clientId}&redirect_uri=https%3A%2F%2Fmalsync.moe%2Fshikimori%2Foauth&response_type=code&scope=user_rates`;

const apiDomain = 'https://shikimori.one/api/';

export const domain = 'https://shikimori.one';

export async function apiCall(options: {
  type: 'GET' | 'PUT' | 'DELETE' | 'POST';
  path: string;
  parameter?: { [key: string]: string | number };
  dataObj?: { [key: string]: any };
  auth?: boolean;
}) {
  const type = options.type || 'GET';
  const token = api.settings.get('shikiToken');

  if (!token && !token.access_token && !options.auth) {
    throw new NotAutenticatedError('No token set');
  }

  let url = apiDomain + options.path;
  if (options.parameter && Object.keys(options.parameter).length) {
    url += url.includes('?') ? '&' : '?';
    const params = [] as string[];
    for (const key in options.parameter) {
      params.push(`${key}=${options.parameter[key]}`);
    }
    url += params.join('&');
  }

  const headers: any = {
    Authorization: `Bearer ${token.access_token}`,
    'User-Agent': 'MAL-Sync',
    'Content-Type': 'application/json',
  };

  let data = '';
  if (options.dataObj) {
    data = JSON.stringify(options.dataObj);
  }

  if (options.auth) {
    delete headers.Authorization;
    url = 'https://shikimori.one/oauth/token';
  }

  return api.request
    .xhr(type, {
      url,
      headers,
      data,
    })
    .then(async response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }

      let res: any = null;
      if (response.responseText) {
        res = JSON.parse(response.responseText);
      }

      if (response.status === 401) {
        if (options.auth) throw new NotAutenticatedError(res.message ?? res.error);
        await refreshToken(token.refresh_token);
        return apiCall(options);
      }

      if (res && res.error) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (options.auth) throw new NotAutenticatedError(res.message ?? res.error);
            await refreshToken(token.refresh_token);
            return apiCall(options);
          case 'not_found':
            throw new NotFoundError(res.message ?? res.error);
          default:
            throw new Error(res.message ?? res.error);
        }
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
  const dataObj: any = {
    client_id: clientId,
    client_secret: '6vkFaJN_wxQHmBoq23ac1z6tZKiAD7xqsXGudkkOqTg',
    redirect_uri: 'https://malsync.moe/shikimori/oauth',
  };

  if ('code' in data) {
    dataObj.code = data.code;
    dataObj.grant_type = 'authorization_code';
  }

  if ('refresh_token' in data) {
    dataObj.refresh_token = data.refresh_token;
    dataObj.grant_type = 'refresh_token';
  }

  return apiCall({
    type: 'POST',
    path: 'oauth/token',
    auth: true,
    dataObj,
  });
}

async function refreshToken(refresh_token: string) {
  const res = await authRequest({ refresh_token }).catch(err => {
    if (err.message === 'invalid_request') {
      api.settings.set('shikiToken', '');
    }
    throw err;
  });
  await api.settings.set('shikiToken', {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
  });
}

export function userRequest(): Promise<userRequestInterface> {
  return apiCall({
    type: 'GET',
    path: 'users/whoami',
  }).then(res => {
    if (res.locale) {
      api.settings.set('shikiOptions', {
        locale: res.locale,
      });
    }
    return res;
  });
}

export async function userId() {
  const cacheObj = new Cache('shiki/userId', 4 * 60 * 60 * 1000);

  if (await cacheObj.hasValue()) {
    return cacheObj.getValue();
  }

  const res = await userRequest();
  if (res.id) {
    cacheObj.setValue(res.id);
  }
  return res.id;
}

export function title(rus: string, eng: string, headline = false) {
  const options = api.settings.get('shikiOptions');
  const locale = options && options.locale ? options.locale : 'ru';
  if (locale === 'ru') return rus || eng;
  if (headline && eng && rus) return `${eng} / ${rus}`;
  return eng || rus;
}

export type StatusType =
  | 'planned'
  | 'watching'
  | 'rewatching'
  | 'completed'
  | 'on_hold'
  | 'dropped';

// eslint-disable-next-line no-shadow
export enum statusTranslate {
  watching = status.Watching,
  planned = status.PlanToWatch,
  completed = status.Completed,
  dropped = status.Dropped,
  on_hold = status.Onhold,
  rewatching = status.Rewatching,
}

export interface StatusRequest {
  id?: number;
  user_id: number;
  target_id: number;
  target_type: 'Anime' | 'Manga';
  score: number;
  status: StatusType;
  rewatches: number;
  episodes: number;
  volumes: number;
  chapters: number;
  text: string;
  text_html?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Image {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}

export interface MetaRequest {
  id: number;
  name: string;
  russian: string;
  image: Image;
  url: string;
  kind: string;
  score: string;
  status: string;
  volumes: number;
  chapters: number;
  episodes: number;
  aired_on: string;
  released_on: string;
}

export interface userRequestInterface {
  id: number;
  nickname: string;
  avatar: string;
  image: {
    x80: string;
  };
  url: string;
  locale: string;
}

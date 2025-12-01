import { NotAutenticatedError, parseJson, ServerOfflineError } from '../Errors';
import type { BakaSeries, BakaSorting, BakaState } from './types';
import { status } from '../definitions';

export const apiDomain = 'https://api.mangabaka.dev';

export const authenticationUrl = 'https://malsync.moe/mangabaka/oauth';

export const logger = con.m('MangaBaka', '#ff66aa');

export const urls = {
  userInfo() {
    return 'https://mangabaka.dev/auth/oauth2/userinfo';
  },
  series(id: number | string) {
    return `${apiDomain}/v1/series/${id}`;
  },
  seriesByAniId(id: number | string) {
    return `${apiDomain}/v1/source/anilist/${id}`;
  },
  seriesByMalId(id: number | string) {
    return `${apiDomain}/v1/source/my-anime-list/${id}`;
  },
  seriesRelated(id: number | string) {
    return `${apiDomain}/v1/series/${id}/related`;
  },
  library(state: BakaState | null = null, sortBy: BakaSorting = 'default', page = 1, limit = 100) {
    const data: any = { sort_by: sortBy, page, limit };
    if (state) {
      data.state = state;
    }
    return `${apiDomain}/v1/my/library?${new URLSearchParams(Object.entries(data))}`;
  },
  libraryEntry(id: number | string) {
    return `${apiDomain}/v1/my/library/${id}`;
  },
};

export async function call(
  url,
  sData: any = {},
  asParameter = false,
  method: 'GET' | 'POST' = 'GET',
  login = true,
) {
  if (asParameter) {
    url += `?${new URLSearchParams(Object.entries(sData))}`;
    sData = undefined;
  }
  logger.m('api').log(method, url, sData);

  const headers: any = {
    client_id: __MAL_SYNC_KEYS__.mangabaka.id,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  if (login) {
    headers.Authorization = `Bearer ${api.settings.get('mangabakaToken')}`;
  } else logger.m('api').log('No login');

  if (method === 'GET') {
    sData = undefined;
  }

  return api.request
    .xhr(method, {
      url,
      headers,
      data: sData,
    })
    .then(async response => {
      const res = parseJson(response.responseText);
      errorHandling(res, response.status);
      return res;
    });
}

export function errorHandling(res, code) {
  if ((code > 499 && code < 600) || code === 0) {
    throw new ServerOfflineError(`Server Offline status: ${code}`);
  }

  if (res && (res.status < 200 || res.status >= 300)) {
    switch (res.status) {
      case 401:
        throw new NotAutenticatedError('user_token_failed');
      default:
        throw new Error(res.message ? res.message : `Unknown Error, status code: ${res.status}`);
    }
  }

  // Userinfo call
  if (res && typeof res.error !== 'undefined') {
    switch (res.error) {
      case 'invalid_token':
        throw new NotAutenticatedError('user_token_failed');
      default:
        throw new Error(
          res.error_description ? `${res.error_description} (${res.error})` : res.error,
        );
    }
  }
}

export function bakaStateToState(input: BakaState): status {
  switch (input) {
    case 'reading':
      return status.Watching;
    case 'completed':
      return status.Completed;
    case 'paused':
      return status.Onhold;
    case 'dropped':
      return status.Dropped;
    case 'plan_to_read':
      return status.PlanToWatch;
    case 'rereading':
      return status.Rewatching;
    default:
      throw new Error(`Unhandled Baka State: ${input}`);
  }
}

export function stateToBakaState(input: status): BakaState | null {
  switch (input) {
    case status.Watching:
      return 'reading';
    case status.Completed:
      return 'completed';
    case status.Onhold:
      return 'paused';
    case status.Dropped:
      return 'dropped';
    case status.PlanToWatch:
      return 'plan_to_read';
    case status.Rewatching:
      return 'rereading';
    case status.All:
      return null;
    default:
      throw new Error(`Unhandled Status: ${input}`);
  }
}

export function getAlternativeTitles(series: BakaSeries): string[] {
  const titles: string[] = [];
  if (series.title) {
    titles.push(series.title);
  }
  if (series.romanized_title) {
    titles.push(series.romanized_title);
  }
  if (series.native_title) {
    titles.push(series.native_title);
  }
  return titles;
}

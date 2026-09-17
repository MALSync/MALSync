import {
  NotAutenticatedError,
  NotFoundError,
  parseJson,
  ServerOfflineError,
  TokenExpiredError,
  UnexpectedResponseError,
} from '../Errors';
import { status } from '../definitions';

export const apiDomain = 'https://www.animeoshi.com/api/anime/v1';

export const authenticationUrl = 'https://malsync.moe/animeoshi/oauth';

let loggerInstance;

export function logger() {
  if (!loggerInstance) loggerInstance = con.m('AnimeOshi', '#ff4f6e');
  return loggerInstance;
}

export type OshiAnime = {
  id: number;
  slug: string;
  episode_id: number | null;
  url: string;
  image: string;
  mal_id: number | null;
  anilist_id: number | null;
  episode_count: number;
  season: string | null;
  release_date: string | null;
  status: string;
  oshimeter: { score: number | null; rater_count: number | null } | null;
};

export type OshiSearchItem = OshiAnime & {
  title: string;
  type: string | null;
  episodes: number | null;
  release_year: number | null;
  one_liner: string | null;
  cursor: string;
};

export type OshiStatus =
  'Currently Watching' | 'Completed' | 'On Hold' | 'Dropped' | 'Want to Watch';

export function oshiStatusToState(input: OshiStatus): status {
  switch (input) {
    case 'Currently Watching':
      return status.Watching;
    case 'Completed':
      return status.Completed;
    case 'On Hold':
      return status.Onhold;
    case 'Dropped':
      return status.Dropped;
    case 'Want to Watch':
      return status.PlanToWatch;
    default:
      throw new Error(`Unhandled AnimeOshi status: ${input}`);
  }
}

export function stateToOshiStatus(input: status): OshiStatus {
  switch (input) {
    case status.Watching:
    case status.Rewatching:
      return 'Currently Watching';
    case status.Completed:
      return 'Completed';
    case status.Onhold:
      return 'On Hold';
    case status.Dropped:
      return 'Dropped';
    case status.PlanToWatch:
    case status.Considering:
      return 'Want to Watch';
    case status.All:
      return null as unknown as OshiStatus;
    default:
      throw new Error(`Unhandled AnimeOshi status: ${input}`);
  }
}

export type OshiWatchlistEntry = {
  anime_id: number;
  title: string;
  slug: string;
  image: string;
  url: string;
  mal_id: number | null;
  anilist_id: number | null;
  status: OshiStatus;
  episode_count: number;
  total_episodes: number;
  user_rating: OshiRating | null;
  updated_at: string | null;
  cursor: string;
};

export type OshiRating = {
  /** 0-100 in multiples of 10, null when the anime is not currently rateable */
  score: number | null;
  verified: boolean;
  rate_date: string | null;
};

export const urls = {
  token() {
    return `${apiDomain}/oauth/token`;
  },
  profile() {
    return `${apiDomain}/external/profile`;
  },
  animeByExternalId(ids: { mal?: number; anilist?: number }) {
    const data = ids.mal ? { mal_id: ids.mal } : { anilist_id: ids.anilist };
    return `${apiDomain}/anime/external?${new URLSearchParams(Object.entries(data) as any)}`;
  },
  animeByIdentifier(identifier: number | string) {
    return `${apiDomain}/anime/external/${identifier}`;
  },
  search(keyword: string, limit = 20) {
    const data = { q: keyword, limit, include_adult: true };
    return `${apiDomain}/external/search/anime?${new URLSearchParams(Object.entries(data) as any)}`;
  },
  watchlist(params: { anime_id?: number; status?: string; cursor?: string; limit?: number } = {}) {
    const data = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
    data.push(['include_adult', 'true']);
    return `${apiDomain}/external/watchlist?${new URLSearchParams(data as any)}`;
  },
  watchlistUpsert() {
    return `${apiDomain}/external/watchlist`;
  },
  rating() {
    return `${apiDomain}/external/rating`;
  },
  watchlistEntry(animeId: number) {
    return `${apiDomain}/external/watchlist/${animeId}`;
  },
};

/**
 * OAuth endpoints
 */
export async function call(
  url: string,
  sData: any = undefined,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
) {
  logger().m('api').log(method, url, sData);

  return api.request
    .xhr(method, {
      url,
      headers: {
        Authorization: `Bearer ${api.settings.get('animeoshiToken')}`,
        'Content-Type': 'application/json',
      },
      data: sData ? JSON.stringify(sData) : undefined,
    })
    .then(response => handleResponse(response))
    .catch(async err => {
      if (err instanceof TokenExpiredError) {
        if (await refreshToken()) {
          return call(url, sData, method);
        }
        throw new NotAutenticatedError('user_token_failed');
      }
      throw err;
    });
}

/**
 * Public endpoints
 */
export async function publicCall(url: string) {
  logger().m('api').log('GET', url);

  return api.request
    .xhr('GET', {
      url,
      headers: {
        'x-api-key': __MAL_SYNC_KEYS__.animeoshi.apiKey,
      },
    })
    .then(response => handleResponse(response, false));
}

function handleResponse(response, authenticated = true) {
  if ((response.status > 499 && response.status < 600) || response.status === 0) {
    throw new ServerOfflineError(`Server Offline status: ${response.status}`);
  }

  if (response.status === 204 || !response.responseText) return null;

  const res = parseJson(response.responseText);
  const message = res?.message || res?.error_description || res?.error;

  switch (response.status) {
    case 401:
    case 403:
      if (!authenticated) throw new UnexpectedResponseError(message || 'Api key rejected');
      throw new TokenExpiredError(message || 'Unauthorized');
    case 404:
      throw new NotFoundError(message || 'Not Found');
    default:
      if (response.status < 200 || response.status >= 300) {
        throw new Error(message ? `${message} (${response.status})` : `Status ${response.status}`);
      }
  }

  return res;
}

async function refreshToken() {
  const l = logger().m('Refresh');
  const rToken = api.settings.get('animeoshiRefresh');
  if (!rToken) return false;
  l.log('Refresh Access Token');

  return api.request
    .xhr('POST', {
      url: urls.token(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: __MAL_SYNC_KEYS__.animeoshi.id,
        refresh_token: rToken,
      }).toString(),
    })
    .then(res => {
      if ((res.status > 499 && res.status < 600) || res.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${res.status}`);
      }
      return parseJson(res.responseText);
    })
    .then(json => {
      if (json && json.access_token && json.refresh_token) {
        api.settings.set('animeoshiToken', json.access_token);
        api.settings.set('animeoshiRefresh', json.refresh_token);
        return true;
      }
      l.error(json?.error, '|', json?.error_description);
      api.settings.set('animeoshiRefresh', '');
      return false;
    });
}

export function oshimeterScore(anime: { oshimeter?: { score: number | null } | null }): string {
  const score = anime.oshimeter?.score;
  if (!score) return '';
  return (score > 10 ? score / 10 : score).toFixed(1);
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function finishedAiring(airingStatus: string) {
  return ['Completed', 'Cancelled'].includes(airingStatus);
}

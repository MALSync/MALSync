import { startFinishDate, status } from '../definitions';
import { NotAuthenticatedError, NotFoundError, parseJson, ServerOfflineError } from '../Errors';

const logger = con.m('kitsu', '#d65e43');

export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    current: status.Watching,
    planned: status.PlanToWatch,
    completed: status.Completed,
    dropped: status.Dropped,
    on_hold: status.Onhold,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export function timestampToDate(timestamp: string | null): startFinishDate {
  if (typeof timestamp !== 'string') {
    return null;
  }

  return timestamp.substring(0, 10);
}

export function dateToTimestamp(date: startFinishDate): string | null {
  if (typeof date !== 'string') {
    return null;
  }

  return `${date}T00:00:00.000Z`;
}

export function getTitle(titles, canonicalTitle) {
  let title: string;
  switch (api.settings.get('kitsuOptions').titleLanguagePreference) {
    case 'english':
      title = titles.en;
      break;
    case 'romanized':
      title = titles.en_jp;
      break;
    case 'canonical':
    default:
      title = canonicalTitle;
  }

  if (typeof title === 'undefined' || !title) title = titles.en;
  if (typeof title === 'undefined' || !title) title = titles.en_jp;
  if (typeof title === 'undefined' || !title) title = titles.ja_jp;
  if (typeof title === 'undefined' || !title) {
    const keys = Object.keys(titles);
    if (!keys.length) {
      return 'No Title';
    }
    title = titles[keys[0]];
  }

  return title;
}

export function getCacheKey(id, kitsuId) {
  if (Number.isNaN(id) || !id) {
    return `kitsu:${kitsuId}`;
  }
  return id;
}

export function malToKitsu(malid: number, type: 'anime' | 'manga') {
  return apiCall(
    'GET',
    `https://kitsu.app/api/edge/mappings?filter[externalSite]=myanimelist/${type}&filter[externalId]=${malid}&include=item&fields[item]=id`,
    {},
    false,
  );
}

export function kitsuToMal(kitsuId: number, type: 'anime' | 'manga') {
  return api.request
    .xhr('GET', {
      url: `https://kitsu.app/api/edge/${type}/${kitsuId}/mappings?filter[externalSite]=myanimelist/${type}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
    })
    .then(response => {
      const res = JSON.parse(response.responseText);
      con.log('[KtoM]', res);
      if (typeof res.data === 'undefined' || !res.data.length) return null;
      return Number(res.data[0].attributes.externalId);
    });
}

export function apiCall(
  mode: 'GET' | 'POST' | 'DELETE' | 'PUT',
  url,
  variables = {},
  authentication = true,
) {
  const headers: any = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  };
  if (authentication) headers.Authorization = `Bearer ${api.settings.get('kitsuToken')}`;
  return api.request
    .xhr(mode, {
      url,
      headers,
      data: mode !== 'GET' ? JSON.stringify(variables) : undefined,
    })
    .then(response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }

      if (response.status === 204) {
        return {};
      }

      const res = parseJson(response.responseText);

      if (typeof res.errors !== 'undefined' && res.errors.length) {
        logger.error('[SINGLE]', 'Error', res.errors);
        const error = res.errors[0];
        switch (parseInt(error.status)) {
          case 401:
          case 403:
            throw new NotAuthenticatedError(error.detail);
          case 404:
            throw new NotFoundError(error.detail);
          default:
            throw new Error(error.detail);
        }
      }

      return res;
    });
}

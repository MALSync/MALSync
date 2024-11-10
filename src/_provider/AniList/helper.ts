/* eslint-disable no-shadow */
import { status, fuzzyDate, startFinishDate } from '../definitions';
import {
  NotAutenticatedError,
  NotFoundError,
  parseJson,
  ServerOfflineError,
  UnexpectedResponseError,
} from '../Errors';

const logger = con.m('anilist', '#3db4f2');

export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    CURRENT: status.Watching,
    PLANNING: status.PlanToWatch,
    COMPLETED: status.Completed,
    DROPPED: status.Dropped,
    PAUSED: status.Onhold,
    REPEATING: status.Watching,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export enum statusTranslate {
  CURRENT = status.Watching,
  PLANNING = status.PlanToWatch,
  COMPLETED = status.Completed,
  DROPPED = status.Dropped,
  PAUSED = status.Onhold,
  REPEATING = status.Rewatching,
}

export function parseFuzzyDate(date?: fuzzyDate): startFinishDate {
  if (!date?.year || !date?.month || !date?.day) {
    return null;
  }

  const year = String(date.year).padStart(4, '0');
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getFuzzyDate(date?: startFinishDate): fuzzyDate {
  const fuzzyDate: fuzzyDate = {
    year: null,
    month: null,
    day: null,
  };
  // ES6 doesn't support named capture groups
  const regexMatch = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (regexMatch?.[1] && regexMatch?.[2] && regexMatch?.[3]) {
    fuzzyDate.year = parseInt(regexMatch[1]);
    fuzzyDate.month = parseInt(regexMatch[2]);
    fuzzyDate.day = parseInt(regexMatch[3]);
  }

  return fuzzyDate;
}

export function aniListToMal(anilistId: number, type: 'anime' | 'manga') {
  const query = `
  query ($id: Int, $type: MediaType) {
    Media (id: $id, type: $type) {
      id
      idMal
    }
  }
  `;

  const variables = {
    id: anilistId,
    type: type.toUpperCase(),
  };

  return api.request
    .xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: JSON.stringify({
        query,
        variables,
      }),
    })
    .then(response => {
      const res = parseJson(response.responseText);
      con.log(res);
      return res.data.Media.idMal;
    });
}

export function malToAnilist(malId: number, type: 'anime' | 'manga') {
  const query = `
  query ($id: Int, $type: MediaType) {
    Media (idMal: $id, type: $type) {
      id
      idMal
    }
  }
  `;

  const variables = {
    id: malId,
    type: type.toUpperCase(),
  };

  return api.request
    .xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: JSON.stringify({
        query,
        variables,
      }),
    })
    .then(response => {
      if (response.status === 404) return NaN;
      const res = parseJson(response.responseText);
      con.log(res);
      return res.data.Media.id;
    });
}

export function getCacheKey(id, kitsuId) {
  if (Number.isNaN(id) || !id) {
    return `anilist:${kitsuId}`;
  }
  return id;
}

export async function apiCall(query, variables, requiresAuthentication = true) {
  if (requiresAuthentication && !api.settings.get('anilistToken')) {
    throw new NotAutenticatedError('No token found');
  }

  const headers: any = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (api.settings.get('anilistToken'))
    headers.Authorization = `Bearer ${api.settings.get('anilistToken')}`;

  return api.request
    .xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers,
      data: JSON.stringify({
        query,
        variables,
      }),
    })
    .then(response => {
      try {
        const res = parseJson(response.responseText);

        if (typeof res.errors !== 'undefined' && res.errors.length) {
          logger.error('[SINGLE]', 'Error', res.errors);
          const error = res.errors[0];
          switch (error.status) {
            case 400:
              if (error.message === 'Invalid token' && !requiresAuthentication) {
                api.settings.set('anilistToken', null);
                return apiCall(query, variables, requiresAuthentication);
              }
              if (error.message === 'validation') throw new Error('Wrong request format');
              if (error.message.includes('invalid')) throw new Error('Wrong request format');
              throw new NotAutenticatedError(error.message);
            case 404:
              throw new NotFoundError(error.message);
            default:
              throw new Error(error.message);
          }
        }

        return res;
      } catch (err) {
        if (err instanceof UnexpectedResponseError) {
          if ((response.status > 499 && response.status < 600) || response.status === 0) {
            throw new ServerOfflineError(`Server Offline status: ${response.status}`);
          }
          if (response.status === 403) {
            throw new Error(api.storage.lang('Error_Blocked', ['AniList']));
          }
        }
        throw err;
      }
    });
}

export function imgCheck(url: string) {
  if (!url || url.endsWith('/default.jpg')) return '';
  return url;
}

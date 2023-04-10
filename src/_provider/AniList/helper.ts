/* eslint-disable no-shadow */
import { status } from '../definitions';
import { NotAutenticatedError, NotFoundError, parseJson, ServerOfflineError } from '../Errors';

const logger = con.m('anilist', '#3db4f2');

export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    CURRENT: 1,
    PLANNING: 6,
    COMPLETED: 2,
    DROPPED: 4,
    PAUSED: 3,
    REPEATING: 1,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export enum statusTranslate {
  'CURRENT' = status.Watching,
  'PLANNING' = status.PlanToWatch,
  'COMPLETED' = status.Completed,
  'DROPPED' = status.Dropped,
  'PAUSED' = status.Onhold,
  'REPEATING' = status.Rewatching,
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
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }
      if (response.status === 403) {
        throw new Error(
          `Your IP has been banned on ANILIST, change your IP or wait for it to get unbanned`,
        );
      }

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
    });
}

export function imgCheck(url: string) {
  if (!url || url.endsWith('/default.jpg')) return '';
  return url;
}

import { status, errorCode } from '../definitions';

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
      const res = JSON.parse(response.responseText);
      con.log(res);
      return res.data.Media.idMal;
    });
}

export function getCacheKey(id, kitsuId) {
  if (Number.isNaN(id) || !id) {
    return `anilist:${kitsuId}`;
  }
  return id;
}

export function apiCall(query, variables, authentication = true) {
  const headers: any = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (authentication) headers.Authorization = `Bearer ${api.settings.get('anilistToken')}`;
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
        throw this.errorObj(errorCode.ServerOffline, `Server Offline status: ${response.status}`);
      }

      const res = JSON.parse(response.responseText);

      if (typeof res.errors !== 'undefined' && res.errors.length) {
        this.logger.error('[SINGLE]', 'Error', res.errors);
        const error = res.errors[0];
        switch (error.status) {
          case 400:
            throw this.errorObj(errorCode.NotAutenticated, error.message);
            break;
          case 404:
            throw this.errorObj(errorCode.EntryNotFound, error.message);
            break;
          default:
            throw this.errorObj(error.status, error.message);
        }
      }

      return res;
    });
}

import { errorCode } from '../definitions';

export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    current: 1,
    planned: 6,
    completed: 2,
    dropped: 4,
    on_hold: 3,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
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
  return this.apiCall(
    'GET',
    `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/${type}&filter[externalId]=${malid}&include=item&fields[item]=id`,
    {},
    false,
  );
}

export function kitsuToMal(kitsuId: number, type: 'anime' | 'manga') {
  return api.request
    .xhr('GET', {
      url: `https://kitsu.io/api/edge/${type}/${kitsuId}/mappings?filter[externalSite]=myanimelist/${type}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
    })
    .then(response => {
      const res = JSON.parse(response.responseText);
      con.log('[KtoM]', res);
      if (typeof res.data === 'undefined' || !res.data.length) return null;
      return res.data[0].attributes.externalId;
    });
}

export function apiCall(mode, url, variables = {}, authentication = true) {
  const headers: any = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  };
  if (authentication) headers.Authorization = `Bearer ${api.settings.get('kitsuToken')}`;
  return api.request
    .xhr(mode, {
      url,
      headers,
      data: JSON.stringify(variables),
    })
    .then(response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw this.errorObj(errorCode.ServerOffline, `Server Offline status: ${response.status}`);
      }

      if (response.status === 204) {
        return {};
      }

      const res = JSON.parse(response.responseText);

      if (typeof res.errors !== 'undefined' && res.errors.length) {
        this.logger.error('[SINGLE]', 'Error', res.errors);
        const error = res.errors[0];
        switch (parseInt(error.status)) {
          case 401:
          case 403:
            throw this.errorObj(errorCode.NotAutenticated, error.detail);
            break;
          case 404:
            throw this.errorObj(errorCode.EntryNotFound, error.detail);
            break;
          default:
            throw this.errorObj(error.status, error.detail);
        }
      }

      return res;
    });
}

import { kitsu } from './templates';

export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    current: 1,
    planned: 6,
    completed: 2,
    dropped: 4,
    on_hold: 3,
  };
  if (malStatus != null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export function accessToken() {
  return api.settings.get('kitsuToken');
}

export function errorHandling(res, silent = false) {
  if (typeof res.errors !== 'undefined') {
    res.errors.forEach(error => {
      switch (parseInt(error.status)) {
        case 401:
        case 403:
          if (!silent)
            utils.flashm(kitsu.noLogin, { error: true, type: 'error' });
          throw error.message;
          break;
        case 404:
          if (!silent)
            utils.flashm(`kitsu: ${error.title}`, {
              error: true,
              type: 'error',
            });
          break;
        default:
          if (!silent)
            utils.flashm(`kitsu: ${error.title}`, {
              error: true,
              type: 'error',
            });
          throw error.message;
      }
    });
  }
}

export function malToKitsu(malid: number, type: 'anime' | 'manga') {
  return api.request
    .xhr('GET', {
      url: `https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/${type}&filter[externalId]=${malid}&include=item&fields[item]=id`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
    })
    .then(response => {
      const res = JSON.parse(response.responseText);
      return res;
    });
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

export function kitsuSlugtoKitsu(kitsuSlug: string, type: 'anime' | 'manga') {
  const headers = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  };
  if (accessToken()) headers['Authorization'] = `Bearer ${accessToken()}`;
  return api.request
    .xhr('GET', {
      url: `https://kitsu.io/api/edge/${type}?filter[slug]=${kitsuSlug}&page[limit]=1&include=mappings`,
      headers,
    })
    .then(response => {
      const res = JSON.parse(response.responseText);
      let malId = NaN;
      if (typeof res !== 'undefined' && typeof res.included !== 'undefined') {
        for (let k = 0; k < res.included.length; k++) {
          const mapping = res.included[k];
          if (mapping.type == 'mappings') {
            if (mapping.attributes.externalSite === `myanimelist/${type}`) {
              malId = mapping.attributes.externalId;
              res.included.splice(k, 1);
              break;
            }
          }
        }
      }
      return { res: res, malId: malId };
    });
}

export async function userId() {
  const userId = await api.storage.get('kitsuUserId');
  if (typeof userId !== 'undefined') {
    return userId;
  } else {
    return api.request
      .xhr('GET', {
        url: 'https://kitsu.io/api/edge/users?filter[self]=true',
        headers: {
          Authorization: `Bearer ${accessToken()}`,
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
        },
      })
      .then(response => {
        const res = JSON.parse(response.responseText);
        con.log(res);
        if (
          typeof res.data === 'undefined' ||
          !res.data.length ||
          typeof res.data[0] === 'undefined'
        ) {
          utils.flashm(kitsu.noLogin, { error: true, type: 'error' });
          throw 'Not authentificated';
        }
        api.storage.set('kitsuUserId', res.data[0].id);
        return res.data[0].id;
      });
  }
}

export function getTitle(titles) {
  let title = titles.en;
  if (typeof title === 'undefined' || !title) title = titles.en_jp;
  if (typeof title === 'undefined' || !title) title = titles.ja_jp;
  if (typeof title === 'undefined' || !title) {
    const keys = Object.values(titles).filter(obj => obj);
    if (!keys.length) {
      return 'No Title';
    }
    title = keys[0];
  }
  return title;
}

export function getCacheKey(id, kitsuId) {
  if (isNaN(id) || !id) {
    return `kitsu:${kitsuId}`;
  }
  return id;
}

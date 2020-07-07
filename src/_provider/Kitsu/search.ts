import { searchInterface, errorCode } from '../definitions';
import * as helper from './helper';

export const search: searchInterface = async function(keyword, type: 'anime' | 'manga', options = {}, sync = false) {
  return apiCall(
    'GET',
    `https://kitsu.io/api/edge/${type}?filter[text]=${keyword}&page[limit]=10&page[offset]=0&fields[${type}]=id,slug,titles,averageRating,startDate,posterImage,subtype`,
    {},
  ).then(res => {
    con.log('search', res);

    const resItems: any = [];
    res.data.forEach(function(item) {
      resItems.push({
        id: item.id,
        name: helper.getTitle(item.attributes.titles, item.attributes.canonicalTitle),
        altNames: Object.values(item.attributes.titles),
        url: `https://kitsu.io/${type}/${item.attributes.slug}`,
        malUrl: async () => {
          const malId = await helper.kitsuToMal(item.id, type);
          return malId ? `https://myanimelist.net/${type}/${malId}` : null;
        },
        image:
          item.attributes.posterImage && typeof item.attributes.posterImage.tiny !== 'undefined'
            ? item.attributes.posterImage.tiny
            : '',
        media_type: item.attributes.subtype,
        isNovel: item.attributes.subtype === 'novel',
        score: item.attributes.averageRating,
        year: item.attributes.startDate,
      });
    });
    return resItems;
  });
};

function apiCall(mode, url, variables = {}, authentication = true) {
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
        throw {
          code: errorCode.ServerOffline,
          message: `Server Offline status: ${response.status}`,
        };
      }

      const res = JSON.parse(response.responseText);

      if (typeof res.errors !== 'undefined' && res.errors.length) {
        con.error('[META]', 'Error', res.errors);
        const error = res.errors[0];
        switch (parseInt(error.status)) {
          case 401:
          case 403:
            throw { code: errorCode.NotAutenticated, message: error.detail };
            break;
          case 404:
            throw { code: errorCode.EntryNotFound, message: error.detail };
            break;
          default:
            throw { code: error.status, message: error.detail };
        }
      }

      return res;
    });
}

import { searchInterface } from '../definitions';
import { parseJson } from '../Errors';
import * as helper from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  return call(`https://api.simkl.com/search/${type}`, { q: keyword }, true).then(res => {
    const resItems: any = [];
    con.log('search', res);
    j.$.each(res, function (index, item) {
      resItems.push({
        id: item.ids.simkl_id,
        name: item.title,
        altNames: [],
        url: `https://simkl.com/${type}/${item.ids.simkl_id}/${item.ids.slug}`,
        malUrl: async () => {
          const malId = await simklIdToMal(item.ids.simkl_id);
          return malId ? `https://myanimelist.net/${type}/${malId}` : null;
        },
        image: `https://simkl.in/posters/${item.poster}_ca.jpg`,
        imageLarge: `https://simkl.in/posters/${item.poster}_m.jpg`,
        imageBanner: `https://simkl.in/posters/${item.poster}_w.jpg`,
        media_type: item.type,
        isNovel: false,
        score: null,
        year: item.year,
      });
    });
    return resItems;
  });
};

async function call(
  url,
  sData = {} as any,
  asParameter = false,
  methode: 'GET' | 'POST' = 'GET',
  login = true,
) {
  if (asParameter) {
    url += `?${j.$.param(sData)}`;
  }
  con.log('call', methode, url, sData);

  const headers = {
    Authorization: login ? `Bearer ${api.settings.get('simklToken')}` : undefined,
    'simkl-api-key': helper.client_id,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  if (!login) {
    con.log('No login');
  }

  if (methode === 'GET') {
    sData = undefined;
  }

  return api.request
    .xhr(methode, {
      url,
      headers,
      data: sData,
    })
    .then(async response => {
      switch (response.status) {
        case 200:
        case 201:
        case 204:
        case 302:
          break;
        case 401:
          if (login) {
            return call(url, sData, asParameter, methode, false);
            break;
          }
          utils.flashm(
            `Please Authenticate <a target="_blank" href="${helper.getAuthUrl()}">Here</a>`,
            { error: true, type: 'error' },
          );
          throw getThrowError();
          break;
        default:
          utils.flashm(`Simkl: ${getErrorText()}`, {
            error: true,
            type: 'error',
          });
          throw getThrowError();
      }

      try {
        return parseJson(response.responseText);
      } catch (e) {
        con.error(response);
        throw e;
      }

      function getErrorText() {
        return parseJson(response.responseText).error;
      }

      function getThrowError() {
        return new Error(getErrorText());
      }
    });
}

export function simklIdToMal(simklId) {
  return call(`https://api.simkl.com/anime/${simklId}`, { extended: 'full' }, true).then(res => {
    if (typeof res.ids.mal === 'undefined') return null;
    return res.ids.mal;
  });
}

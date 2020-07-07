import { simkl } from './templates';

export const client_id = '39e8640b6f1a60aaf60f3f3313475e830517badab8048a4e52ff2d10deb2b9b0';

export function simklIdToMal(simklId) {
  return call(`https://api.simkl.com/anime/${simklId}`, { extended: 'full' }, true).then(res => {
    if (typeof res.ids.mal === 'undefined') return null;
    return res.ids.mal;
  });
}

export async function call(url, sData = {}, asParameter = false, methode: 'GET' | 'POST' = 'GET', login = true) {
  if (asParameter) {
    url += `?${j.$.param(sData)}`;
  }
  con.log('call', methode, url, sData);

  const headers = {
    Authorization: login ? `Bearer ${api.settings.get('simklToken')}` : undefined,
    'simkl-api-key': client_id,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  if (!login) {
    con.log('No login');
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
          utils.flashm(simkl.noLogin, { error: true, type: 'error' });
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
        return JSON.parse(response.responseText);
      } catch (e) {
        con.error(response);
        throw e;
      }

      function getErrorText() {
        return JSON.parse(response.responseText).error;
      }

      function getThrowError() {
        return { status: response.status, message: getErrorText() };
      }
    });
}

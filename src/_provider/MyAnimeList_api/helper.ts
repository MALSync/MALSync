/* eslint-disable no-shadow */
import { startFinishDate, status } from '../definitions';
import { clientId } from '../../utils/oauth';
import { NotAuthenticatedError, NotFoundError, parseJson, ServerOfflineError } from '../Errors';

export const apiDomain = 'https://api.myanimelist.net/v2/';

export const authenticationUrl = 'https://malsync.moe/mal/oauth';

export async function apiCall(options: {
  type: 'GET' | 'PUT' | 'DELETE' | 'POST';
  path: string;
  fields?: string[];
  dataObj?: { [key: string]: string };
}) {
  let url = apiDomain + options.path;
  if (options.fields && options.fields.length) {
    url += url.includes('?') ? '&' : '?';
    url += `fields=${options.fields.join(',')}`;
  }
  const headers: any = {
    Authorization: `Bearer ${api.settings.get('malToken')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  let data = '';
  if (options.dataObj) {
    const formBody: string[] = [];
    for (const property in options.dataObj) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(options.dataObj[property]);
      formBody.push(`${encodedKey}=${encodedValue}`);
    }
    data = formBody.join('&');
  }
  return api.request
    .xhr(options.type, {
      url,
      headers,
      data,
    })
    .then(async response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }

      let res;
      try {
        res = JSON.parse(response.responseText);
      } catch (e) {
        if (checkIfBanned(response.responseText)) {
          throw new Error(api.storage.lang('Error_Blocked', ['MyAnimeList']));
        }
        throw e;
      }

      if (res && res.error) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (await refreshToken(this.logger)) {
              return this.apiCall(options);
            }
            throw new NotAuthenticatedError(res.message ?? res.error);
          case 'not_found':
            throw new NotFoundError(res.message ?? res.error);
          case 'invalid_content':
            throw new Error(
              'This Entry is currently pending approval. It can´t be saved to mal for now',
            );
          default:
            throw new Error(res.message ?? res.error);
        }
      }

      switch (response.status) {
        case 400:
          throw new Error('Invalid Parameters');
        case 403:
        default:
      }

      return res;
    });
}

async function refreshToken(logger) {
  const l = logger.m('Refresh');
  l.log('Refresh Access Token');
  const rToken = api.settings.get('malRefresh');
  if (!rToken) return false;
  return api.request
    .xhr('POST', {
      url: 'https://myanimelist.net/v1/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `client_id=${clientId}&grant_type=refresh_token&refresh_token=${rToken}`,
    })
    .then(res => {
      try {
        return parseJson(res.responseText);
      } catch (e) {
        if (checkIfBanned(res.responseText)) {
          throw new Error(api.storage.lang('Error_Blocked', ['MyAnimeList']));
        }
        throw e;
      }
    })
    .then(json => {
      if (json && json.refresh_token && json.access_token) {
        api.settings.set('malToken', json.access_token);
        api.settings.set('malRefresh', json.refresh_token);
        return true;
      }
      if (json && json.error) {
        l.error(json.error, '|', json.message);
        api.settings.set('malRefresh', '');
        return false;
      }
      l.error('Something went wrong');
      return false;
    });
}

function checkIfBanned(text: string) {
  return Boolean(text.includes('Request blocked') || text.includes('your IP has been banned'));
}

export enum animeStatus {
  watching = status.Watching,
  completed = status.Completed,
  on_hold = status.Onhold,
  dropped = status.Dropped,
  plan_to_watch = status.PlanToWatch,
}

export enum mangaStatus {
  reading = status.Watching,
  completed = status.Completed,
  on_hold = status.Onhold,
  dropped = status.Dropped,
  plan_to_read = status.PlanToWatch,
}

export function getRoundedDate(date?: string): startFinishDate {
  if (!date || !/^\d{4}(?:-\d\d){0,2}$/.test(date)) {
    return null;
  }

  const year = date.substring(0, 4);

  let month = date.substring(5, 7);
  if (month.length !== 2) {
    month = '01';
  }

  let day = date.substring(8, 10);
  if (day.length !== 2) {
    day = '01';
  }

  return `${year}-${month}-${day}`;
}

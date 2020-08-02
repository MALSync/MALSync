import { errorCode, status } from '../definitions';
import { clientId } from '../../utils/oauth';

export const apiDomain = 'https://api.myanimelist.net/v2/';

export const authenticationUrl = 'https://malsync.moe/mal/oauth';

export async function apiCall(options: {
  type: 'GET' | 'PUT';
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
        throw this.errorObj(errorCode.ServerOffline, `Server Offline status: ${response.status}`);
      }

      switch (response.status) {
        case 400:
          throw this.errorObj(errorCode.GenericError, 'Invalid Parameters');
          break;
        case 403:
        default:
      }

      const res = JSON.parse(response.responseText);
      if (res && res.error) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (await refreshToken(this.logger)) {
              return this.apiCall(options);
            }
            throw this.errorObj(errorCode.NotAutenticated, res.message ?? res.error);
            break;
          case 'not_found':
            throw this.errorObj(errorCode.EntryNotFound, res.message ?? res.error);
            break;
          case 'invalid_content':
            throw this.errorObj(
              errorCode.GenericError,
              `This ${this.type} is currently pending approval. It can´t be saved to mal for now`,
            );
            break;
          default:
            throw this.errorObj(res.error, res.message ?? res.error);
        }
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
    .then(res => JSON.parse(res.responseText))
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

export enum animeStatus {
  'watching' = status.Watching,
  'completed' = status.Completed,
  'on_hold' = status.Onhold,
  'dropped' = status.Dropped,
  'plan_to_watch' = status.PlanToWatch,
}

export enum mangaStatus {
  'reading' = status.Watching,
  'completed' = status.Completed,
  'on_hold' = status.Onhold,
  'dropped' = status.Dropped,
  'plan_to_read' = status.PlanToWatch,
}

import { errorCode, status } from '../definitions';

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
    .then(response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw this.errorObj(errorCode.ServerOffline, `Server Offline status: ${response.status}`);
      }

      const res = JSON.parse(response.responseText);
      return res;
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

import { status } from '../definitions';
import { NotAutenticatedError, parseJson, ServerOfflineError } from '../Errors';

export const client_id = __MAL_SYNC_KEYS__.simkl.id;

export function getAuthUrl() {
  return `https://simkl.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=https://simkl.com/apps/chrome/mal-sync/connected/`;
}

export function translateList(simklStatus, malStatus: null | number = null) {
  const list = {
    watching: status.Watching,
    plantowatch: status.PlanToWatch,
    completed: status.Completed,
    notinteresting: status.Dropped,
    hold: status.Onhold,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[simklStatus];
}

export function getCacheKey(id, simklId) {
  if (Number.isNaN(id) || !id) {
    return `simkl:${simklId}`;
  }
  return id;
}

export function simklIdToMal(simklId) {
  return this.call(`https://api.simkl.com/anime/${simklId}`, { extended: 'full' }, true).then(
    res => {
      if (typeof res.ids.mal === 'undefined') return null;
      return res.ids.mal;
    },
  );
}

export function getEpisode(episode: string): number {
  if (typeof episode === 'number') return episode;
  if (episode) {
    const temp = episode.match(/e\d+/i);
    if (temp !== null) {
      const episodePart = parseInt(temp[0].replace(/\D/, ''));
      if (Number.isNaN(episodePart)) return 0;
      return episodePart;
    }
  }
  return 0;
}

let cacheList;

export async function syncList(lazy = false) {
  const logger = con.m('Simkl', '#9b7400').m('list');

  if (typeof cacheList === 'undefined') {
    cacheList = await api.storage.get('simklList');
  } else if (lazy) {
    return cacheList;
  }

  const lastCheck = await api.storage.get('simklLastCheck');
  const activity = await this.call('https://api.simkl.com/sync/activities');
  logger.log('Activity', lastCheck, activity.anime);

  // removed_from_list
  if (lastCheck && lastCheck.removed_from_list !== activity.anime.removed_from_list) {
    const checkRemoveList = await this.call('https://api.simkl.com/sync/all-items/anime');
    const newCacheList = {};
    if (checkRemoveList) {
      for (let i = 0; i < checkRemoveList.anime.length; i++) {
        const el = checkRemoveList.anime[i];
        if (cacheList[el.show.ids.simkl] !== undefined) {
          newCacheList[el.show.ids.simkl] = cacheList[el.show.ids.simkl];
        }
      }
    }
    cacheList = newCacheList;
    logger.log('remove', cacheList);
  }

  // Check if update Needed
  let dateFrom = '';
  if (lastCheck && cacheList) {
    dateFrom = `date_from=${lastCheck.all}`;
    if (lastCheck.all === activity.anime.all) {
      logger.log('Up to date');
      return cacheList;
    }
  }

  if (!cacheList) cacheList = {};

  if (lastCheck && lastCheck.rated_at !== activity.anime.rated_at) {
    const rated = await this.call(`https://api.simkl.com/sync/ratings/anime?${dateFrom}`);
    logger.log('ratedUpdate', rated);
    if (rated) {
      for (let i = 0; i < rated.anime.length; i++) {
        const el = rated.anime[i];
        cacheList[el.show.ids.simkl] = el;
      }
    }
  }

  const list = await this.call(`https://api.simkl.com/sync/all-items/anime?${dateFrom}`);
  logger.log('listUpdate', list);
  if (list) {
    for (let i = 0; i < list.anime.length; i++) {
      const el = list.anime[i];
      cacheList[el.show.ids.simkl] = el;
    }
  }
  logger.log('totalList', cacheList);
  await api.storage.set('simklList', cacheList);
  await api.storage.set('simklLastCheck', activity.anime);
  return cacheList;
}

export async function getSingle(
  ids: { simkl?: string | number; mal?: string | number },
  lazy = false,
) {
  const list = await this.syncList(lazy);
  if (ids.simkl) {
    if (list[ids.simkl] !== undefined) {
      return list[ids.simkl];
    }
  } else if (ids.mal) {
    // TODO: Use map for better performance
    const listVal = Object.values(list);
    for (let i = 0; i < listVal.length; i++) {
      const el: any = listVal[i];
      if (typeof el.show.ids.mal !== 'undefined' && Number(el.show.ids.mal) === Number(ids.mal)) {
        return el;
      }
    }
  } else {
    throw 'No id passed';
  }
  return null;
}

export async function call(
  url,
  sData: any = {},
  asParameter = false,
  method: 'GET' | 'POST' = 'GET',
  login = true,
) {
  const logger = con.m('Simkl', '#9b7400').m('call');

  if (asParameter) {
    url += `?${new URLSearchParams(Object.entries(sData))}`;
    sData = undefined;
  }
  logger.log(method, url, sData);

  const headers: any = {
    'simkl-api-key': client_id,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  if (login) headers.Authorization = `Bearer ${api.settings.get('simklToken')}`;
  else logger.log('No login');

  if (method === 'GET') {
    sData = undefined;
  }

  return api.request
    .xhr(method, {
      url,
      headers,
      data: sData,
    })
    .then(async response => {
      const res = parseJson(response.responseText);
      this.errorHandling(res, response.status);
      return res;
    });
}

export function errorHandling(res, code) {
  if ((code > 499 && code < 600) || code === 0) {
    throw new ServerOfflineError(`Server Offline status: ${code}`);
  }

  if (res && typeof res.error !== 'undefined') {
    this.logger.error('[SINGLE]', 'Error', res.error);
    const { error } = res;
    if (error.code) {
      switch (error.code) {
        default:
          throw new Error(error.error);
      }
    } else {
      switch (error) {
        case 'user_token_failed':
          throw new NotAutenticatedError('user_token_failed');
        default:
          throw error;
      }
    }
  }
}

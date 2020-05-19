export var client_id =
  '39e8640b6f1a60aaf60f3f3313475e830517badab8048a4e52ff2d10deb2b9b0';

export function translateList(simklStatus, malStatus: null | number = null) {
  const list = {
    watching: 1,
    plantowatch: 6,
    completed: 2,
    notinteresting: 4,
    hold: 3,
  };
  if (malStatus != null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[simklStatus];
}

export function getCacheKey(id, simklId) {
  if (isNaN(id) || !id) {
    return `simkl:${simklId}`;
  }
  return id;
}

export function getEpisode(episode: string): number {
  if (typeof episode === 'number') return episode;
  if (episode) {
    const temp = episode.match(/e\d+/i);
    if (temp !== null) {
      const episodePart = parseInt(temp[0].replace(/\D/, ''));
      if (isNaN(episodePart)) return 0;
      return episodePart;
    }
  }
  return 0;
}

export function simklIdToMal(simklId) {
  return call(
    `https://api.simkl.com/anime/${simklId}`,
    { extended: 'full' },
    true,
  ).then(res => {
    if (typeof res.ids.mal === 'undefined') return null;
    return res.ids.mal;
  });
}

let cacheList;

export async function syncList(lazy = false) {
  if (typeof cacheList === 'undefined') {
    cacheList = await api.storage.get('simklList');
  } else if (lazy) {
    return cacheList;
  }

  const lastCheck = await api.storage.get('simklLastCheck');
  const activity = await this.call('https://api.simkl.com/sync/activities');
  con.log('Activity', lastCheck, activity.anime);

  //removed_from_list
  if (
    lastCheck &&
    lastCheck.removed_from_list !== activity.anime.removed_from_list
  ) {
    const checkRemoveList = await this.call(
      'https://api.simkl.com/sync/all-items/anime',
    );
    const newCacheList = {};
    if (checkRemoveList) {
      for (var i = 0; i < checkRemoveList.anime.length; i++) {
        const el = checkRemoveList.anime[i];
        if (cacheList[el.show.ids.simkl] != undefined) {
          newCacheList[el.show.ids.simkl] = cacheList[el.show.ids.simkl];
        }
      }
    }
    cacheList = newCacheList;
    con.log('remove', cacheList);
  }

  //Check if update Needed
  let dateFrom = '';
  if (lastCheck && cacheList) {
    dateFrom = `date_from=${lastCheck.all}`;
    if (lastCheck.all === activity.anime.all) {
      con.log('Up to date');
      return cacheList;
    }
  }

  if (!cacheList) cacheList = {};

  if (lastCheck && lastCheck.rated_at !== activity.anime.rated_at) {
    const rated = await this.call(
      `https://api.simkl.com/sync/ratings/anime?${dateFrom}`,
    );
    con.log('ratedUpdate', rated);
    if (rated) {
      for (var i = 0; i < rated.anime.length; i++) {
        const el = rated.anime[i];
        cacheList[el.show.ids.simkl] = el;
      }
    }
  }

  const list = await this.call(
    `https://api.simkl.com/sync/all-items/anime?${dateFrom}`,
  );
  con.log('listUpdate', list);
  if (list) {
    for (var i = 0; i < list.anime.length; i++) {
      const el = list.anime[i];
      cacheList[el.show.ids.simkl] = el;
    }
  }
  con.log('totalList', cacheList);
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
    if (list[ids.simkl] != undefined) {
      return list[ids.simkl];
    }
  } else if (ids.mal) {
    //TODO: Use map for better performance
    const listVal = Object.values(list);
    for (let i = 0; i < listVal.length; i++) {
      const el: any = listVal[i];
      if (
        typeof el.show.ids.mal !== 'undefined' &&
        el.show.ids.mal == ids.mal
      ) {
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
  sData = {},
  asParameter = false,
  method: 'GET' | 'POST' = 'GET',
  login = true,
) {
  if (asParameter) {
    url += `?${new URLSearchParams(Object.entries(sData))}`;
  }
  con.log('call', method, url, sData);

  const headers = {
    'simkl-api-key': client_id,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  if (login)
    headers['Authorization'] = `Bearer ${api.settings.get('simklToken')}`;
  else con.log('No login');

  return api.request
    .xhr(method, {
      url: url,
      headers: headers,
      data: sData,
    })
    .then(async response => {
      const res = this.jsonParse(response);
      this.errorHandling(res, response.status);
      return res;
    });
}

import { Cache } from '../utils/Cache';
import type { listElement } from '../_provider/listAbstract';
import { xhrResponseI } from '../api/messageInterface';

export interface releaseItemInterface {
  timestamp: number;
  value: any;
  finished: boolean;
  mode: string;
}

export async function predictionXhrGET(type: string, apiCacheKey: number | string | null) {
  if (!apiCacheKey) return {};
  const response = await api.request.xhr(
    'GET',
    `https://api.malsync.moe/nc/mal/${type}/${apiCacheKey}/pr`,
  );
  return JSON.parse(response.responseText);
}

export async function predictionXhrPOST(type: string, malDATA: listElement[] | null) {
  if (malDATA === null) return [];
  if (malDATA.length <= 0) return [];
  const malDATAID = malDATA.map(el => el.apiCacheKey);
  const returnArray: xhrResponseI[] = [];
  for (let i = 0; i <= malDATAID.length; ) {
    const tempArray = malDATAID.slice(i, i + 49);
    const Request = {
      url: `https://api.malsync.moe/nc/mal/${type}/POST/pr`,
      data: JSON.stringify({ malids: tempArray }),
      headers: { 'Content-Type': 'application/json' },
    };
    await utils.wait(5000);
    const response = await api.request.xhr('POST', Request);
    returnArray.push(JSON.parse(response.responseText));
    i += 50;
  }

  return returnArray.reduce((acc: xhrResponseI[], val) => acc.concat(val), []);
}

export async function single(
  el: {
    uid: number;
    apiCacheKey: number | string | null;
    title: string;
    cacheKey: string;
    watchedEp: number;
    single: any;
    xhr?: object;
  },
  type,
  mode = 'default',
  logger = con.m('release'),
) {
  if (!mode) mode = 'default';
  logger = logger.m(el.uid.toString());
  logger.log(el.title, el.cacheKey, el.apiCacheKey, `Mode: ${mode}`);
  if (!el.apiCacheKey) {
    logger.log('No Api Cache Id');
    return;
  }
  if (!api.settings.get('epPredictions')) {
    logger.log('epPredictions disabled');
    return;
  }
  const releaseItem: undefined | releaseItemInterface = await api.storage.get(
    `release/${type}/${el.cacheKey}`,
  );

  logger.m('Load').log(releaseItem);

  let force = false;

  if (releaseItem && releaseItem.mode && releaseItem.mode !== mode) force = true;

  if (
    releaseItem &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 2 * 60 * 1000 &&
    !force
  ) {
    logger.log('Up to date');
    return;
  }

  if (
    releaseItem &&
    releaseItem.finished &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 7 * 24 * 60 * 60 * 1000 &&
    !force
  ) {
    logger.log('Finished');
    return;
  }

  if (
    releaseItem &&
    !releaseItem.value &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 1 * 24 * 60 * 60 * 1000 &&
    !force
  ) {
    logger.log('Nulled');
    return;
  }

  if (force) logger.log('Update forced');

  if (mode === 'off') {
    logger.log('Disabled');
    el.xhr = [];
  }

  let xhr;
  if (typeof el.xhr !== 'undefined') {
    xhr = el.xhr;
  } else {
    xhr = await predictionXhrGET(type, el.apiCacheKey);
    await utils.wait(500);
  }
  logger.log(xhr);

  const progressValue = getProgress(xhr, mode, type);

  if (!progressValue) {
    logger.log('No value for the selected mode');
  }

  let finished = false;

  if (progressValue && progressValue.state && progressValue.state === 'complete') finished = true;

  logger.m('Save').log(progressValue);
  if (releaseItem && releaseItem.value) {
    notificationCheck(el, releaseItem.value, progressValue, type);
  }

  await api.storage.set(`release/${type}/${el.cacheKey}`, {
    timestamp: Date.now(),
    value: progressValue,
    mode,
    finished,
  } as releaseItemInterface);
}

export function progressIsOld(releaseItem: releaseItemInterface) {
  if (releaseItem && releaseItem.timestamp) {
    const diff = new Date().getTime() - releaseItem.timestamp;

    if (releaseItem.finished && diff < 7 * 24 * 60 * 60 * 1000) {
      // logger.log('Finished');
      return false;
    }

    if (!releaseItem.value && diff < 1 * 24 * 60 * 60 * 1000) {
      // logger.log('Nulled');
      return false;
    }

    if (diff < 1 * 24 * 60 * 60 * 1000) {
      // logger.log('not old');
      return false;
    }
  }

  return true;
}

export function getProgress(res, mode, type) {
  const config: {
    mainId?: string;
    fallbackPrediction?: string;
    fallback?: string;
  } = {};

  if (!res.length) return null;

  if (mode === 'default') {
    if (type === 'anime') {
      config.mainId = api.settings.get('progressIntervalDefaultAnime');
    } else {
      config.mainId = api.settings.get('progressIntervalDefaultManga');
    }
    config.fallback = 'en/sub';
  } else {
    config.mainId = mode;
  }

  config.fallbackPrediction = 'jp/dub';

  let top;

  if (config.mainId) {
    const mainTemp = res.find(el => el.id === config.mainId);
    if (mainTemp) top = mainTemp;
  }

  if (config.fallback && !top) {
    const mainTemp = res.find(el => el.id === config.fallback);
    if (mainTemp) top = mainTemp;
  }

  if (config.fallbackPrediction && top && !top.predicition && top.lastEp && top.lastEp.timestamp) {
    const predTemp = res.find(el => el.id === config.fallbackPrediction);
    const predTime = top.lastEp.timestamp + 7 * 24 * 60 * 60 * 1000;
    if (predTime && predTemp && predTemp.predicition) {
      if (top.lastEp.total === predTemp.lastEp.total) {
        if (Math.abs(predTime - predTemp.predicition.timestamp) < 30 * 60 * 60 * 1000) {
          top.predicition = {
            timestamp: predTime,
            probability: 'medium',
          };
        }
      } else if (predTemp.lastEp.total && top.lastEp.total === predTemp.lastEp.total - 1) {
        if (
          Math.abs(predTime - (predTemp.predicition.timestamp - 7 * 24 * 60 * 60 * 1000)) <
          30 * 60 * 60 * 1000
        ) {
          top.predicition = {
            timestamp: predTime,
            probability: 'medium',
          };
        }
      }
    }
  }

  // Fallback to jp if no other language found and episode 0 -> Before release
  if (config.fallbackPrediction && !top) {
    const predSoon = res.find(el => el.id === config.fallbackPrediction);
    if (predSoon && predSoon.lastEp && predSoon.predicition && predSoon.lastEp.total === 0) {
      top = predSoon;
      top.predicition.probability = 'medium';
    }
  }

  if (!top) return null;

  return top;
}

export async function getProgressTypeList(
  type: 'anime' | 'manga',
): Promise<{ key: string; label: string }[]> {
  const cacheObj = new Cache(`ProgressTypeList${type}`, 24 * 60 * 60 * 1000, false);
  if (!(await cacheObj.hasValueAndIsNotEmpty())) {
    con.log('Getting new ProgressTypeList Cache');
    const url = `https://api.malsync.moe/general/progress/${type}`;
    const request = await api.request.xhr('GET', url).then(async response => {
      if (response.status === 200 && response.responseText) {
        return JSON.parse(response.responseText);
      }
      return [];
    });
    await cacheObj.setValue(request);
    return request;
  }
  con.log('PageSearch Cached');
  return cacheObj.getValue();
}

export async function notificationCheck(el, cProgress, nProgress, type) {
  try {
    if (
      (type === 'anime' && !api.settings.get('progressNotificationsAnime')) ||
      (type === 'manga' && !api.settings.get('progressNotificationsManga'))
    ) {
      return;
    }
    if (el && nProgress && nProgress) {
      if (
        cProgress.lastEp &&
        typeof cProgress.lastEp.total !== 'undefined' &&
        nProgress.lastEp &&
        nProgress.lastEp.total &&
        cProgress.lang === nProgress.lang &&
        cProgress.type === nProgress.type
      ) {
        if (cProgress.lastEp.total < nProgress.lastEp.total) {
          // Check if new ep is one higher than the watched one
          if (el.watchedEp + 1 === nProgress.lastEp.total) {
            let noti;
            if (el.single) {
              noti = {
                title: el.title,
                text: api.storage.lang(`syncPage_malObj_nextEp_${type}`, [nProgress.lastEp.total]),
                sticky: api.settings.get('notificationsSticky'),
                image: await el.single.getImage(),
                url: el.single.getStreamingUrl() ? el.single.getStreamingUrl() : el.single.getUrl(),
              };
            } else {
              noti = {
                title: el.title,
                text: api.storage.lang(`syncPage_malObj_nextEp_${type}`, [nProgress.lastEp.total]),
                sticky: api.settings.get('notificationsSticky'),
                image: el.image,
                url: el.options && el.options.u ? el.options.u : el.url,
              };
            }
            api.request.notification(noti);
          }
        }
      }
    }
  } catch (e) {
    con.error('Could not check notification Progress', e);
  }
}

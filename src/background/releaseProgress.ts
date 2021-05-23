import { Cache } from '../utils/Cache';
import { getList } from '../_provider/listFactory';
import { listElement } from '../_provider/listAbstract';
import { xhrResponseI } from '../api/messageInterface';

export interface releaseItemInterface {
  timestamp: number;
  value: any;
  finished: boolean;
  mode: string;
}

export function initProgressScheduler() {
  chrome.alarms.get('progressSync', async a => {
    const progressInterval = parseInt(await api.settings.getAsync('progressInterval'));
    const progressSyncLast = await api.storage.get('progressSyncLast');
    if (!progressInterval) {
      con.log('progressSync disabled', progressInterval);
      if (a) chrome.alarms.clear('progressSync');
      return;
    }

    if (typeof a !== 'undefined' && Date.now() - progressSyncLast < progressInterval * 60 * 1000) {
      con.log('progressSync already set and on time', progressSyncLast, a);
      return;
    }

    if (a) chrome.alarms.clear('progressSync');

    con.log('Create progressSync Alarm', progressInterval, progressSyncLast);
    chrome.alarms.create('progressSync', {
      periodInMinutes: progressInterval,
      when: Date.now() + 1000,
    });
  });

  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'progressSync') {
      api.storage.set('progressSyncLast', Date.now());
      api.settings.init().then(async () => {
        console.groupCollapsed('Progress');
        await main();
        console.groupEnd();
      });
    }
  });
}

export async function initUserProgressScheduler() {
  setTimeout(async () => {
    const progressInterval = await api.settings.getAsync('progressInterval');
    const progressSyncLast = await api.storage.get('progressSyncLast');
    if (Date.now() - progressSyncLast < progressInterval * 60 * 1000) {
      con.log('Progress on time');
      return;
    }
    if (await main()) {
      api.storage.set('progressSyncLast', Date.now());
    }
  }, 30 * 1000);
}

export async function main() {
  try {
    setBadgeText('⌛');
    await api.settings.init();
    if (!api.settings.get('epPredictions')) {
      throw 'epPredictions disabled';
    }
    await listUpdateWithPOST(1, 'anime');
    await listUpdateWithPOST(1, 'manga');
    if (api.settings.get('loadPTWForProgress')) {
      await listUpdateWithPOST(6, 'anime');
      await listUpdateWithPOST(6, 'manga');
    }
    con.log('Progress done');
    setBadgeText('');
    return true;
  } catch (e) {
    con.log('Progress Failed', e);
  }
  setBadgeText('');
  return false;
}

/*
export async function listUpdate(state, type) {
  const logger = con.m('release').m(type);
  logger.log('Start', type, state);
  const listProvider = await getList(state, type);
  return listProvider
    .get()
    .then(async list => {
      for (let i = 0; i < list.length; i++) {
        try {
          if (list[i].options) {
            await single(list[i], type, list[i].options!.p, logger);
          }
        } catch (e) {
          logger.error(e);
        }
      }
    })
    .catch(e => {
      logger.error(e);
    });
}
*/

export async function listUpdateWithPOST(state, type) {
  const logger = con.m('release').m(type);
  logger.log('Start', type, state);
  const listProvider = await getList(state, type);
  return listProvider
    .getCompleteList()
    .then(async list => {
      if (list.length > 0) {
        try {
          await multiple(list, type, logger);
        } catch (e) {
          logger.error(e);
        }
      }
    })
    .catch(e => {
      logger.error(e);
    });
}

export async function predictionXhrGET(type: string, apiCacheKey: number | string | null) {
  if (!apiCacheKey) return {};
  const response = await api.request.xhr('GET', `https://api.malsync.moe/nc/mal/${type}/${apiCacheKey}/pr`);
  return JSON.parse(response.responseText);
}

export async function predictionXhrPOST(type: string, malDATA: listElement[] | null) {
  if (malDATA === null) return [{}];
  if (malDATA.length <= 0) return [{}];
  const malDATAID = malDATA.map(el => el.apiCacheKey);
  const waitFor = ms => new Promise(r => setTimeout(r, ms));
  const returnArray: xhrResponseI[] = [];
  for (let i = 0; i <= malDATAID.length; ) {
    const tempArray = malDATAID.slice(i, i + 49);
    const Request = {
      url: `https://api.malsync.moe/nc/mal/${type}/POST/pr`,
      data: JSON.stringify({ malids: tempArray }),
      headers: { 'Content-Type': 'application/json' },
    };
    await waitFor(5000);
    const response = await api.request.xhr('POST', Request);
    returnArray.push(JSON.parse(response.responseText));
    i += 50;
  }

  return returnArray.reduce((acc: xhrResponseI[], val) => acc.concat(val), []);
}

export async function multiple(Array: listElement[], type, logger = con.m('release')) {
  if (!Array) {
    logger.log('No MAL Id List');
  } else {
    Array.forEach(el => {
      let mode = el.options!.p;
      if (!mode) mode = 'default';
      logger.m(el.apiCacheKey).log(el.title, el.cacheKey, el.apiCacheKey, `Mode: ${mode}`);
    });
  }

  if (!api.settings.get('epPredictions')) {
    logger.log('epPredictions disabled');
    return;
  }

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  const remoteUpdateList: listElement[] = [];
  await asyncForEach(Array, async el => {
    if (!el.apiCacheKey) return;

    const releaseItem: undefined | releaseItemInterface = await api.storage.get(`release/${type}/${el.cacheKey}`);

    if (releaseItem && releaseItem.value) {
      el.fn.progress = releaseItem.value;
    }

    let mode = el.options!.p;
    if (!mode) mode = 'default';
    logger
      .m(el.apiCacheKey)
      .m('Load')
      .log(releaseItem);

    if (releaseItem && releaseItem.mode && releaseItem.mode !== mode) {
      remoteUpdateList.push(el);
    } else if (releaseItem && releaseItem.timestamp && Date.now() - releaseItem.timestamp < 2 * 60 * 1000) {
      logger.m(el.apiCacheKey).log('Up to date');
    } else if (
      releaseItem &&
      releaseItem.finished &&
      releaseItem.timestamp &&
      Date.now() - releaseItem.timestamp < 7 * 24 * 60 * 60 * 1000
    ) {
      logger.m(el.apiCacheKey).log('Fininshed');
    } else if (
      releaseItem &&
      !releaseItem.value &&
      releaseItem.timestamp &&
      Date.now() - releaseItem.timestamp < 1 * 24 * 60 * 60 * 1000
    ) {
      logger.m(el.apiCacheKey).log('Nulled');
    } else {
      remoteUpdateList.push(el);
    }
  });

  let xhrArray;
  if (remoteUpdateList.length > 0) {
    xhrArray = await predictionXhrPOST(type, remoteUpdateList);
    await new Promise(resolve => setTimeout(() => resolve(), 500));
  }

  xhrArray.forEach(async xhr => {
    const elRef = remoteUpdateList.find(el => xhr.malid === el.apiCacheKey);
    if (!elRef) {
      return;
    }
    logger.m(elRef.malId).log(xhr.data);
    let mode = elRef.options!.p;
    if (!mode) mode = 'default';
    const progressValue = getProgress(xhr.data, mode, type);

    if (!progressValue) {
      logger.m(elRef.malId).log('No value for the selected mode');
    }
    let finished = false;

    if (progressValue && progressValue.state && progressValue.state === 'complete') finished = true;

    logger
      .m(elRef.malId)
      .m('Save')
      .log(progressValue);
    if (elRef.cacheKey) {
      if (elRef && elRef.fn && elRef.fn.progress) {
        notificationCheck(elRef, elRef.fn.progress, progressValue, type);
      }
      await api.storage.set(`release/${type}/${elRef.cacheKey}`, {
        timestamp: Date.now(),
        value: progressValue,
        mode,
        finished,
      } as releaseItemInterface);
    }
  });
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
  const releaseItem: undefined | releaseItemInterface = await api.storage.get(`release/${type}/${el.cacheKey}`);

  logger.m('Load').log(releaseItem);

  let force = false;

  if (releaseItem && releaseItem.mode && releaseItem.mode !== mode) force = true;

  if (releaseItem && releaseItem.timestamp && Date.now() - releaseItem.timestamp < 2 * 60 * 1000 && !force) {
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
    logger.log('Fininshed');
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
    await new Promise(resolve => setTimeout(() => resolve(), 500));
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
      // logger.log('Fininshed');
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

  if (config.fallbackPrediction && top && !top.predicition && top.lastEp.timestamp) {
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
        if (Math.abs(predTime - (predTemp.predicition.timestamp - 7 * 24 * 60 * 60 * 1000)) < 30 * 60 * 60 * 1000) {
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

export async function getProgressTypeList(type: 'anime' | 'manga'): Promise<{ key: string; label: string }[]> {
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

async function notificationCheck(el, cProgress, nProgress, type) {
  try {
    if (!api.settings.get('progressNotifications')) return;
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
                sticky: true,
                image: await el.single.getImage(),
                url: el.single.getStreamingUrl() ? el.single.getStreamingUrl() : el.single.getUrl(),
              };
            } else {
              noti = {
                title: el.title,
                text: api.storage.lang(`syncPage_malObj_nextEp_${type}`, [nProgress.lastEp.total]),
                sticky: true,
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

function setBadgeText(text: string) {
  // @ts-ignore
  if (api.type === 'userscript') return;
  try {
    chrome.browserAction.setBadgeText({ text });
  } catch (e) {
    con.error(e);
  }
}

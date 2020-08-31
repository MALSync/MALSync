import { getList } from '../_provider/listFactory';

export interface releaseItemInterface {
  timestamp: number;
  value: any;
  finished: boolean;
  mode: string;
}

export function initProgressScheduler() {
  chrome.alarms.get('progressSync', async a => {
    const progressInterval = await api.settings.getAsync('progressInterval');
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
      periodInMinutes: parseInt(progressInterval),
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
    await listUpdate(1, 'anime');
    await listUpdate(1, 'manga');
    con.log('Progress done');
    setBadgeText('');
    return true;
  } catch (e) {
    con.log('Progress Failed', e);
  }
  setBadgeText('');
  return false;
}

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

export async function predictionXhr(type: string, malId: number | null) {
  if (!malId) return {};
  const response = await api.request.xhr('GET', `https://api.malsync.moe/nc/mal/${type}/${malId}/pr`);
  return JSON.parse(response.responseText);
}

export async function single(
  el: { uid: number; malId: number | null; title: string; cacheKey: string; xhr?: object },
  type,
  mode = 'default',
  logger = con.m('release'),
) {
  if (!mode) mode = 'default';
  logger = logger.m(el.uid.toString());
  logger.log(el.title, el.cacheKey, el.malId, `Mode: ${mode}`);
  if (!el.malId) {
    logger.log('No MAL Id');
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
    xhr = await predictionXhr(type, el.malId);
    await new Promise(resolve => setTimeout(() => resolve(), 500));
  }
  logger.log(xhr);

  const progressValue = getProgress(xhr, mode);

  if (!progressValue) {
    logger.log('No value for the selected mode');
  }

  let finished = false;

  if (progressValue && progressValue.state && progressValue.state === 'complete') finished = true;

  logger.m('Save').log(progressValue);

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

export function getProgress(res, mode) {
  const config: {
    mainId?: string;
    fallbackPrediction?: string;
    fallback?: string;
  } = {};

  if (!res.length) return null;

  if (mode === 'default') {
    config.mainId = 'en/sub';
  } else {
    config.mainId = mode;
  }

  config.fallbackPrediction = 'jp/dub';

  let top;

  if (config.mainId) {
    const mainTemp = res.find(el => el.id === config.mainId);
    if (mainTemp) top = mainTemp;
  }

  if (config.fallbackPrediction && top && !top.predicition) {
    const predTemp = res.find(el => el.id === config.fallbackPrediction);
    if (predTemp && predTemp.predicition && top.lastEp.total === predTemp.lastEp.total) {
      top.predicition = predTemp.predicition;
      top.predicition.probability = 'medium';
    }
  }

  if (!top) return null;

  return top;
}

export async function getProgressTypeList(type: 'anime' | 'manga'): Promise<{ key: string; label: string }[]> {
  return [
    {
      key: 'en/sub',
      label: 'English (Sub)',
    },
    {
      key: 'en/dub',
      label: 'English (Dub)',
    },
  ];
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
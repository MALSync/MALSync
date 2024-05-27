import { getList } from '../_provider/listFactory';
import type { listElement } from '../_provider/listAbstract';
import { KeepAlive } from './keepAlive';
import {
  getProgress,
  notificationCheck,
  predictionXhrPOST,
  releaseItemInterface,
} from './releaseProgressUtils';

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

async function main() {
  const alive = new KeepAlive();
  alive.start();

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
    alive.stop();
    return true;
  } catch (e) {
    con.log('Progress Failed', e);
  }
  setBadgeText('');
  alive.stop();
  return false;
}

async function listUpdateWithPOST(state, type) {
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

async function multiple(Array: listElement[], type, logger = con.m('release')) {
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

    const releaseItem: undefined | releaseItemInterface = await api.storage.get(
      `release/${type}/${el.cacheKey}`,
    );

    if (releaseItem && releaseItem.value) {
      el.fn.progress = releaseItem.value;
    }

    let mode = el.options!.p;
    if (!mode) mode = 'default';
    logger.m(el.apiCacheKey).m('Load').log(releaseItem);

    if (releaseItem && releaseItem.mode && releaseItem.mode !== mode) {
      remoteUpdateList.push(el);
    } else if (
      releaseItem &&
      releaseItem.timestamp &&
      Date.now() - releaseItem.timestamp < 2 * 60 * 1000
    ) {
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

  let xhrArray: any = [];
  if (remoteUpdateList.length > 0) {
    xhrArray = await predictionXhrPOST(type, remoteUpdateList);
    await utils.wait(500);
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

    logger.m(elRef.malId).m('Save').log(progressValue);
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

function setBadgeText(text: string) {
  // @ts-ignore
  if (api.type === 'userscript') return;
  try {
    chrome.action.setBadgeText({ text });
  } catch (e) {
    con.error(e);
  }
}

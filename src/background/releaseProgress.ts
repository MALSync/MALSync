import { getList } from '../_provider/listFactory';

export interface releaseItemInterface {
  timestamp: number;
  value: any;
  finished: boolean;
}

export async function main() {
  await listUpdate(1, 'anime');
  await listUpdate(1, 'manga');
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
          await single(list[i], type, logger);
        } catch (e) {
          logger.error(e);
        }
      }
    })
    .catch(e => {
      logger.error(e);
    });
}

export async function single(el, type, logger = con.m('release')) {
  logger = logger.m(el.uid.toString());
  logger.log(el.title, el.cacheKey, el.malId);
  if (!el.malId) {
    logger.log('No MAL Id');
    return;
  }
  const releaseItem: undefined | releaseItemInterface = await api.storage.get(`release/${type}/${el.cacheKey}`);

  logger.m('Load').log(releaseItem);

  if (releaseItem && releaseItem.timestamp && Date.now() - releaseItem.timestamp < 2 * 60 * 1000) {
    logger.log('Up to date');
    return;
  }

  if (
    releaseItem &&
    releaseItem.finished &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 7 * 24 * 60 * 1000
  ) {
    logger.log('Fininshed');
    return;
  }

  if (
    releaseItem &&
    !releaseItem.value &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 1 * 24 * 60 * 1000
  ) {
    logger.log('Nulled');
    return;
  }

  const response = await api.request.xhr('GET', `https://api.malsync.moe/nc/mal/${type}/${el.malId}/progress`);
  await new Promise(resolve => setTimeout(() => resolve(), 500));
  const xhr = JSON.parse(response.responseText);
  logger.log(xhr);

  const progressValue = getProgress(xhr);

  if (!progressValue) {
    logger.log('No value for the selected mode');
  }

  let finished = false;

  if (progressValue && progressValue.state && progressValue.state === 'complete') finished = true;

  logger.m('Save').log(progressValue);

  await api.storage.set(`release/${type}/${el.cacheKey}`, {
    timestamp: Date.now(),
    value: progressValue,
    finished,
  } as releaseItemInterface);
}

export function getProgress(res, mode = 'default') {
  if (mode === 'default') {
    if (res.en && res.en.sub && res.en.sub.top) {
      const top = res.en.sub.top;
      if (res.jp && res.jp.dub && res.jp.dub.top && res.jp.dub.top.predicition) {
        if (!top.predicition && top.lastEp.total === res.jp.dub.top.lastEp.total) {
          top.predicition = res.jp.dub.top.predicition;
          top.predicition.probability = 'medium';
        }
      }
      return top;
    }
  }
  return null;
}

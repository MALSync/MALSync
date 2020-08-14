import { getList } from '../_provider/listFactory';

export interface releaseItemInterface {
  timestamp: number;
  value: any;
  finished: boolean;
  mode: string;
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
          await single(list[i], type, 'default', logger, true);
        } catch (e) {
          logger.error(e);
        }
      }
    })
    .catch(e => {
      logger.error(e);
    });
}

export async function single(
  el: { uid: number; malId: number | null; title: string; cacheKey: string },
  type,
  mode = 'default',
  logger = con.m('release'),
  batch = false,
) {
  logger = logger.m(el.uid.toString());
  logger.log(el.title, el.cacheKey, el.malId);
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
    Date.now() - releaseItem.timestamp < 7 * 24 * 60 * 1000 &&
    !force
  ) {
    logger.log('Fininshed');
    return;
  }

  if (
    releaseItem &&
    !releaseItem.value &&
    releaseItem.timestamp &&
    Date.now() - releaseItem.timestamp < 1 * 24 * 60 * 1000 &&
    !force
  ) {
    logger.log('Nulled');
    return;
  }

  if (force) logger.log('Update forced');

  const response = await api.request.xhr('GET', `https://api.malsync.moe/nc/mal/${type}/${el.malId}/pr`);
  if (batch) await new Promise(resolve => setTimeout(() => resolve(), 500));
  const xhr = JSON.parse(response.responseText);
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

export function getProgress(res, mode) {
  const config: {
    mainId?: string,
    fallbackPrediction?: string,
    fallback?: string,
  } = {};

  if (mode === 'default') {
    config.mainId = 'en/sub';
    config.fallbackPrediction = 'jp/dub';
  }

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

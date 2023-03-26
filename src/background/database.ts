import Dexie from 'dexie';
import { emitter } from '../utils/emitter';
import { getList } from '../_provider/listFactory';

const UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000;

const logger = con.m('Database');
const db = new Dexie('malsync');

async function updateEntry(data) {
  con.log('update', data);
  if (data.id && data.state.onList) {
    addEntry({
      uid: data.id,
      type: data.type,
      title: data.meta.title,
      malId: data.meta.malId,
      cacheKey: data.cacheKey,
      image: data.meta.image,
      score: data.state.score,
      status: data.state.status,
      watchedEp: data.state.episode,
      totalEp: data.meta.totalEp,
      url: data.meta.url,
    });
  }
}

export async function initDatabase() {
  logger.log('Starting');
  db.version(1).stores({
    anime: '&uid, malId, cacheKey, title',
    manga: '&uid, malId, cacheKey, title',
    storage: '&key, value',
  });

  emitter.on('update.*', async data => updateEntry(data), { objectify: true });
  emitter.on('state.*', async data => updateEntry(data), { objectify: true });

  emitter.on(
    'delete.*',
    async data => {
      con.log('delete', data);
      removeEntry(data.type, data.id);
    },
    { objectify: true },
  );

  await indexUpdate();
  logger.log('Ready');
}

export async function indexUpdate() {
  const types = ['anime', 'manga'];
  const globalMode = await api.settings.getAsync('syncMode');
  for (let i = 0; i < types.length; i++) {
    const type = types[i] as 'anime' | 'manga';
    const state = (await getKey(`update_${type}`)) as number;
    const mode = await getKey(`update_mode_${type}`);

    if (!state || state < Date.now() - UPDATE_INTERVAL || mode !== globalMode) {
      await importList(type);
    }
  }
}

export async function getKey(key: string): Promise<string | number | undefined> {
  return db
    .table('storage')
    .get(key)
    .then(res => {
      if (typeof res === 'undefined') return res;
      return res.value;
    });
}

export async function setKey(key: string, value: string | number) {
  return db.table('storage').put({
    key,
    value,
  });
}

const blocked = {
  anime: false,
  manga: false,
};

async function importList(type: 'anime' | 'manga'): Promise<void> {
  if (blocked[type]) {
    logger.log('Import already running');
    return;
  }
  blocked[type] = true;
  logger.log(`Import ${type} database`);
  try {
    await api.settings.init();
    const listProvider = await getList(7, type);
    const list = await listProvider.getCompleteList();
    await importEntries(
      type,
      list.map(el => ({
        uid: el.uid,
        type: el.type,
        title: el.title,
        malId: el.malId,
        cacheKey: el.cacheKey,
        image: el.image,
        score: el.score,
        status: el.status,
        watchedEp: el.watchedEp,
        totalEp: el.totalEp,
        url: el.url,
      })),
    ).then(() => {
      blocked[type] = false;
      setKey(`update_${type}`, Date.now());
      setKey(`update_mode_${type}`, api.settings.get('syncMode'));
    });
  } catch (e) {
    blocked[type] = false;
    throw e;
  }
}

export interface Entry {
  uid: number | string;
  type: 'anime' | 'manga';
  title: string;
  malId: number;
  cacheKey: number | string;
  image: string;
  score: number;
  status: number;
  watchedEp: number;
  totalEp: number;
  url: string;
}

export async function addEntry(entry: Entry) {
  const table = entry.type === 'anime' ? db.table('anime') : db.table('manga');
  return table.put(entry);
}

export async function getEntry(
  type: 'anime' | 'manga',
  uid: number | string,
): Promise<undefined | Entry> {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  return table.get(uid);
}

export async function getEntryByMalId(
  type: 'anime' | 'manga',
  malId: number,
): Promise<undefined | Entry> {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  return table.get({ malId });
}

export async function removeEntry(type: 'anime' | 'manga', uid: number | string) {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  return table.where('uid').equals(uid).delete();
}

async function importEntries(type: 'anime' | 'manga', entries: Entry[]) {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  await table.clear();
  return table.bulkPut(entries);
}

export async function databaseRequest(call: string, param: any) {
  switch (call) {
    case 'entry':
      indexUpdate();
      return getEntry(param.type, param.id);
    case 'entryByMalId':
      indexUpdate();
      return getEntryByMalId(param.type, param.id);
    default:
      throw `Unknown call "${call}"`;
  }
}

import Dexie from 'dexie';
import { emitter } from '../utils/emitter';
import { getList } from '../_provider/listFactory';

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
      watchedEp: data.meta.watchedEp,
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
  });
  if (!(await db.table('anime').count())) {
    await importList('anime');
  }
  if (!(await db.table('manga').count())) {
    await importList('manga');
  }

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
}

async function importList(type: 'anime' | 'manga') {
  logger.log(`Import ${type} database`);
  await api.settings.init();
  const listProvider = await getList(7, type);
  const list = await listProvider.getCompleteList();
  return importEntries(
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
  );
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

export async function getEntry(type: 'anime' | 'manga', uid: number | string): Promise<undefined | Entry> {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  return table.get(uid);
}

export async function removeEntry(type: 'anime' | 'manga', uid: number | string) {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  return table
    .where('uid')
    .equals(uid)
    .delete();
}

async function importEntries(type: 'anime' | 'manga', entries: Entry[]) {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  await table.clear();
  return table.bulkPut(entries);
}

export async function databaseRequest(call: string, param: any) {
  switch (call) {
    case 'entry':
      return getEntry(param.type, param.id);
    default:
      throw `Unknown call "${call}"`;
  }
}

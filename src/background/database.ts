import Dexie from 'dexie';
import { getList } from '../_provider/listFactory';

const logger = con.m('Database');
const db = new Dexie('malsync');

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
}

async function importList(type: 'anime' | 'manga') {
  logger.log(`Import ${type} database`)
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

async function importEntries(type: 'anime' | 'manga', entries: Entry[]) {
  const table = type === 'anime' ? db.table('anime') : db.table('manga');
  await table.clear();
  return table.bulkPut(entries);
}

import * as helper from './helper';
import { listElement } from './listAbstract';
import { UserList as MalList } from './MyAnimeList_hybrid/list';
import { UserList as MalApiList } from './MyAnimeList_api/list';
import { UserList as AnilistList } from './AniList/list';
import { UserList as KitsuList } from './Kitsu/list';
import { UserList as SimklList } from './Simkl/list';
import { UserList as LocalList } from './Local/list';

export async function getList(...args) {
  let tempList: listElement[] = [];
  if (api.settings.get('localSync')) {
    const [status, templist] = args;
    const localListEl = new LocalList(status, templist);
    localListEl.modes.initProgress = true;
    tempList = await localListEl.getCompleteList();
  }

  const list = getListObj(args);
  list.setTemplist(tempList);
  return list;
}

export function getOnlyList(...args) {
  return getListObj(args);
}

export function getListbyType(syncMode: string, args = []) {
  return getListObj(args, syncMode);
}

function getListObj(args, syncMode = '') {
  if (!syncMode) {
    syncMode = helper.getSyncMode(args[1] ? args[1] : 'anime');
  }

  const [status, templist] = args;

  if (syncMode === 'MAL') {
    return new MalList(status, templist);
  }
  if (syncMode === 'MALAPI') {
    return new MalApiList(status, templist);
  }
  if (syncMode === 'ANILIST') {
    return new AnilistList(status, templist);
  }
  if (syncMode === 'KITSU') {
    return new KitsuList(status, templist);
  }
  if (syncMode === 'SIMKL') {
    return new SimklList(status, templist);
  }
  throw 'Unknown sync mode';
}

import * as helper from './helper';
import { listElement } from './listAbstract';
import { UserList as MalList } from './MyAnimeList_legacy/list';
import { UserList as MalApiList } from './MyAnimeList_api/list';
import { UserList as AnilistList } from './AniList/list';
import { UserList as KitsuList } from './Kitsu/list';
import { UserList as SimklList } from './Simkl/list';
import { UserList as LocalList } from './Local/list';

export async function getList(...args) {
  let tempList: listElement[] = [];
  if (api.settings.get('localSync')) {
    const [status, callbacks, templist] = args;
    const localListEl = new LocalList(status, callbacks, templist);
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

  const [status, callbacks, templist] = args;

  if (syncMode === 'MAL') {
    return new MalList(status, callbacks, templist);
  }
  if (syncMode === 'MALAPI') {
    return new MalApiList(status, callbacks, templist);
  }
  if (syncMode === 'ANILIST') {
    return new AnilistList(status, callbacks, templist);
  }
  if (syncMode === 'KITSU') {
    return new KitsuList(status, callbacks, templist);
  }
  if (syncMode === 'SIMKL') {
    return new SimklList(status, callbacks, templist);
  }
  throw 'Unknown sync mode';
}

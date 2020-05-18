import * as helper from "./helper";
import {listElement} from './listAbstract';
import {userlist as malList} from "./MyAnimeList/list";
import {userlist as anilistList} from "./AniList/list";
import {userlist as kitsuList} from "./Kitsu/list";
import {userlist as simklList} from "./Simkl/list";
import {userlist as localList} from "./Local/list";

export async function getList(...args) {
  var tempList: listElement[] = [];
  if(api.settings.get('localSync')){
    const [status, callbacks, username, offset, templist] = args;
    tempList = await new localList(status, callbacks, username, offset, templist).get();
  }

  var list = getListObj(args);
  list.setTemplist(tempList);
  return list;
}

export function getOnlyList(...args) {
  return getListObj(args);
}

export function getListbyType(syncMode: string, args = []) {
  return getListObj(args, syncMode)
}

function getListObj(args, syncMode:string = '') {
  if(!syncMode) {
    syncMode = helper.getSyncMode(args[1] ? args[1]: 'anime');
  }

  const [status, callbacks, username, offset, templist] = args

  if(syncMode == 'MAL'){
    return new malList(status, callbacks, username, offset, templist);
  }else if(syncMode == 'ANILIST'){
    return new anilistList(status, callbacks, username, offset, templist);
  }else if(syncMode == 'KITSU'){
    return new kitsuList(status, callbacks, username, offset, templist);
  }else if(syncMode == 'SIMKL'){
    return new simklList(status, callbacks, username, offset, templist);
  }else{
    throw 'Unknown sync mode';
  }
}

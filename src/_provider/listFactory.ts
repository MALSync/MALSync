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
    tempList = await new localList(...args).get();
  }

  var syncMode = helper.getSyncMode(args[1] ? args[1]: 'anime');
  if(syncMode == 'MAL'){
    return new malList(...args).setTemplist(tempList);
  }else if(syncMode == 'ANILIST'){
    return new anilistList(...args).setTemplist(tempList);
  }else if(syncMode == 'KITSU'){
    return new kitsuList(...args).setTemplist(tempList);
  }else if(syncMode == 'SIMKL'){
    return new simklList(...args).setTemplist(tempList);
  }else{
    throw 'Unknown sync mode';
  }
}

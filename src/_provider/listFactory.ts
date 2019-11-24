import * as helper from "./helper";
import {userlist as malList} from "./MyAnimeList/list";
import {userlist as anilistList} from "./AniList/list";
import {userlist as kitsuList} from "./Kitsu/list";
import {userlist as simklList} from "./Simkl/list";
import {userlist as localList} from "./Local/list";

export function getList(...args) {
var listType = 'anime';

  var syncMode = helper.getSyncMode(listType);
  if(syncMode == 'MAL'){
    return new malList(...args);
  }else if(syncMode == 'ANILIST'){
    return new anilistList(...args);
  }else if(syncMode == 'KITSU'){
    return new kitsuList(...args);
  }else if(syncMode == 'SIMKL'){
    return new simklList(...args);
  }else{
    throw 'Unknown sync mode';
  }
}

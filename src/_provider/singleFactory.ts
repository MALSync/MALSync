import * as helper from "./helper";

import {Single as anilistSingle} from "./AniList/single";
import {Single as localSingle} from "./Local/single";

export function getSingle(url: string) {
  if(/^local:\/\//i.test(url)){
    return new localSingle(url);
  }
  var syncMode = helper.getSyncMode(url);
  if(syncMode == 'MAL'){
    //return new mal.entryClass(url);
  }else if(syncMode == 'ANILIST'){
    return new anilistSingle(url);
  }else if(syncMode == 'KITSU'){
    //return new kitsu.entryClass(url);
  }else if(syncMode == 'SIMKL'){
    //return new simkl.entryClass(url);
  }
  throw 'Unknown sync mode';
}

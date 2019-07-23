import {mal} from "./MyAnimeList/templates";
import {anilist} from "./AniList/templates";
import {kitsu} from "./Kitsu/templates";
import {simkl} from "./Simkl/templates";
import {local} from "./Local/templates";

function getSyncMode(){
  return api.settings.get('syncMode');
}

export function providerTemplates(malUrl?){
  if(/^local:\/\//i.test(malUrl)){
    return local;
  }
  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return mal;
  }else if(syncMode == 'ANILIST'){
    return anilist;
  }else if(syncMode == 'KITSU'){
    return kitsu;
  }else{
    return simkl;
  }
}

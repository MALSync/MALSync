import {mal} from "./MyAnimeList/templates";
import {anilist} from "./AniList/templates";
import {kitsu} from "./Kitsu/templates";

function getSyncMode(){
  return api.settings.get('syncMode');
}

export function providerTemplates(){
  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return mal;
  }else if(syncMode == 'ANILIST'){
    return anilist;
  }else{
    return kitsu;
  }
}

import {mal} from "./MyAnimeList/templates";
import {anilist} from "./AniList/templates";

function getSyncMode(){
  return api.settings.get('syncMode');
}

export function providerTemplates(){
  if(getSyncMode() == 'MAL'){
    return mal;
  }else{
    return anilist;
  }
}

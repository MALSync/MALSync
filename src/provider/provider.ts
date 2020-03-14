import {search as malSearch}  from "./MyAnimeList/metadata";
import {search as aniSearch}  from "./AniList/metadata";
import {search as kitsuSearch}  from "./Kitsu/metadata";
import {search as simklSearch}  from "./Simkl/metadata";
import {listElement} from "./listInterface";

interface entryClass {
  readonly id: number,
  readonly type: "anime"|"manga",

  url: string,
  name: string,
  totalEp: number,
  totalVol?: number,
  addAnime: boolean,
  login: boolean,
  wrong: boolean,
  silent: boolean,

  init(),
  update(),
  delete?(),
  getDisplayUrl(),
  getDetailUrl?: () => string|null,
  getMalUrl():string|null,
  getEpisode(),
  setEpisode(ep:number),
  getVolume(),
  setVolume(ep:number),
  getStatus(),
  setStatus(status:number),
  getScore(),
  setScore(score:number),
  getRewatching(): 1|0,
  setRewatching(rewatching:1|0),
  setCompletionDateToNow(),
  setStartingDateToNow(),
  getStreamingUrl(),
  setStreamingUrl(url:string),
  getRating: () => Promise<any>,
  getCacheKey: () => string|number,
  setResumeWaching: (url:string, ep:number) => Promise<any>,
  getResumeWaching: () => Promise<{url:string, ep:number}>,
  setContinueWaching: (url:string, ep:number) => Promise<any>,
  getContinueWaching:() => Promise<{url:string, ep:number}>,
  getImage: () => Promise<string>,
  clone(),
  sync(),
}

function getSyncMode(type = ''){
  var mode = api.settings.get('syncMode');
  //
  if(mode === 'SIMKL' && (type === 'manga' || type.indexOf('/manga/') !== -1)){
    return api.settings.get('syncModeSimkl');
  }
  //
  return mode;
}

export function search(keyword, type: "anime"|"manga", options = {}, sync = false){
  var syncMode = getSyncMode(type);
  if(syncMode == 'KITSU'){
    return kitsuSearch(keyword, type, options, sync);
  }else if(syncMode == 'ANILIST'){
    return aniSearch(keyword, type, options, sync);
  }else if(syncMode == 'SIMKL'){
    return simklSearch(keyword, type, options, sync);
  }else{
    return malSearch(keyword, type, options, sync);
  }
}

import * as mal from "./MyAnimeList/entryClass";
import * as malUserList from "./MyAnimeList/userList";
import * as anilist from "./AniList/entryClass";
import * as anilistUserList from "./AniList/userList";
import * as kitsu from "./Kitsu/entryClass";
import * as kitsuUserList from "./Kitsu/userList";
import * as simkl from "./Simkl/entryClass";
import * as simklUserList from "./Simkl/userList";
import * as local from "./Local/entryClass";
import * as localUserList from "./Local/userList";
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

function getSyncMode(){
  return api.settings.get('syncMode');
}

export function entryClass(url:string, miniMAL:boolean = false, silent:boolean = false, state:any = null): entryClass{
  if(/^local:\/\//i.test(url)){
    return new local.entryClass(url, miniMAL, silent, state);
  }
  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return new mal.entryClass(url, miniMAL);
  }else if(syncMode == 'ANILIST'){
    return new anilist.entryClass(url, miniMAL, silent);
  }else if(syncMode == 'KITSU'){
    return new kitsu.entryClass(url, miniMAL, silent);
  }else if(syncMode == 'SIMKL'){
    return new simkl.entryClass(url, miniMAL, silent);
  }
  throw 'Unknown sync mode';
}

export async function userList(
  status = 1,
  localListType = 'anime',
  callbacks: {
    singleCallback?: (el: listElement, index: number, total: number) => void,
    finishCallback?,
    fullListCallback?: (list: listElement[]) => void,
    continueCall?,
  },
  username = null,
  offset = 0,
  templist: listElement[] = []
){

  if(api.settings.get('localSync')) templist = templist.concat(await getLocalList());

  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return malUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else if(syncMode == 'ANILIST'){
    return anilistUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else if(syncMode == 'KITSU'){
    return kitsuUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else if(syncMode == 'SIMKL'){
    return simklUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else{
    throw 'Unknown sync mode';
  }

  async function getLocalList():Promise<listElement[]>{
    return new Promise((resolve, reject) => {
      localUserList.userList(status, localListType, {fullListCallback: (list) => {
        resolve(list)
      }});
    })
  }

}

export function search(keyword, type: "anime"|"manga", options = {}, sync = false){
  var syncMode = getSyncMode();
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

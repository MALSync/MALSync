import * as mal from "./MyAnimeList/entryClass";
import * as malUserList from "./MyAnimeList/userList";
import * as anilist from "./AniList/entryClass";
import * as anilistUserList from "./AniList/userList";
import * as kitsu from "./Kitsu/entryClass";
import * as kitsuUserList from "./Kitsu/userList";
import * as local from "./Local/entryClass";
import * as localUserList from "./Local/userList";
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
    return new local.entryClass(url, miniMAL, state);
  }
  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return new mal.entryClass(url, miniMAL);
  }else if(syncMode == 'ANILIST'){
    return new anilist.entryClass(url, miniMAL, silent);
  }else{
    return new kitsu.entryClass(url, miniMAL, silent);
  }
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

  if(api.settings.get('localSyncAlpha')) templist = templist.concat(await getLocalList());

  var syncMode = getSyncMode();
  if(syncMode == 'MAL'){
    return malUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else if(syncMode == 'ANILIST'){
    return anilistUserList.userList(status, localListType, callbacks, username, offset, templist);
  }else{
    return kitsuUserList.userList(status, localListType, callbacks, username, offset, templist);
  }

  async function getLocalList():Promise<listElement[]>{
    return new Promise((resolve, reject) => {
      localUserList.userList(status, localListType, {fullListCallback: (list) => {
        resolve(list)
      }});
    })
  }

}

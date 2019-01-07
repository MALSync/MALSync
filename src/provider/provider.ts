import {mal} from "./MyAnimeList/entryClass";
import * as malUserList from "./MyAnimeList/userList";

interface entryClass {
  readonly id: number,
  readonly type: "anime"|"manga",

  name: string,
  totalEp: number,
  totalVol?: number,
  addAnime: boolean,
  login: boolean,
  wrong: boolean,

  init(),
  update(),
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

export function entryClass(url:string, miniMAL:boolean = false): entryClass{
  return new mal(url, miniMAL);
}

export function userList(
  status = 1,
  localListType = 'anime',
  callbacks: {
    singleCallback?,
    finishCallback?,
    fullListCallback?,
    continueCall?,
  },
  username = null,
  offset = 0,
  templist = []
){
  return malUserList.userList(status, localListType, callbacks, username, offset, templist);
}

import {mal} from "./MyAnimeList/entryClass";

export function entryClass(url:string, miniMAL:boolean = false){
  return new mal(url, miniMAL);
}

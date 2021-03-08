import * as helper from './helper';

import { Single as MalSingle } from './MyAnimeList_legacy/single';
import { Single as MalApiSingle } from './MyAnimeList_api/single';
import { Single as SnilistSingle } from './AniList/single';
import { Single as SitsuSingle } from './Kitsu/single';
import { Single as SimklSingle } from './Simkl/single';
import { Single as LocalSingle } from './Local/single';

export function getSingle(url: string) {
  if (/^local:\/\//i.test(url)) {
    return new LocalSingle(url);
  }
  const syncMode = helper.getSyncMode(url);
  if (syncMode === 'MAL') {
    return new MalSingle(url);
  }
  if (syncMode === 'MALAPI') {
    return new MalApiSingle(url);
  }
  if (syncMode === 'ANILIST') {
    return new SnilistSingle(url);
  }
  if (syncMode === 'KITSU') {
    return new SitsuSingle(url);
  }
  if (syncMode === 'SIMKL') {
    return new SimklSingle(url);
  }
  throw 'Unknown sync mode';
}

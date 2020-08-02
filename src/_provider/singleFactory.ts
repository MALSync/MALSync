import * as helper from './helper';

import { Single as malSingle } from './MyAnimeList_legacy/single';
import { Single as malApiSingle } from './MyAnimeList_api/single';
import { Single as anilistSingle } from './AniList/single';
import { Single as kitsuSingle } from './Kitsu/single';
import { Single as simklSingle } from './Simkl/single';
import { Single as localSingle } from './Local/single';

export function getSingle(url: string) {
  if (/^local:\/\//i.test(url)) {
    return new localSingle(url);
  }
  const syncMode = helper.getSyncMode(url);
  if (syncMode === 'MAL') {
    return new malSingle(url);
  }
  if (syncMode === 'MALAPI') {
    return new malApiSingle(url);
  }
  if (syncMode === 'ANILIST') {
    return new anilistSingle(url);
  }
  if (syncMode === 'KITSU') {
    return new kitsuSingle(url);
  }
  if (syncMode === 'SIMKL') {
    return new simklSingle(url);
  }
  throw 'Unknown sync mode';
}

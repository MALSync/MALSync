import * as helper from './helper';
import { search as malSearch } from './MyAnimeList_hybrid/search';
import { search as malApiSearch } from './MyAnimeList_api/search';
import { search as aniSearch } from './AniList/search';
import { search as kitsuSearch } from './Kitsu/search';
import { search as simklSearch } from './Simkl/search';

export function search(keyword, type: 'anime' | 'manga', options = {}, sync = false, syncMode = '') {
  if (!syncMode) {
    syncMode = helper.getSyncMode(type);
  }

  if (syncMode === 'KITSU') {
    return kitsuSearch(keyword, type, options, sync);
  }
  if (syncMode === 'ANILIST') {
    return aniSearch(keyword, type, options, sync);
  }
  if (syncMode === 'SIMKL') {
    return simklSearch(keyword, type, options, sync);
  }
  if (syncMode === 'MALAPI') {
    return malApiSearch(keyword, type, options, sync);
  }
  return malSearch(keyword, type, options, sync);
}

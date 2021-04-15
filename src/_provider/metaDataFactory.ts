import * as helper from './helper';
import { MetaOverview as LocalMeta } from './Local/metaOverview';
import { MetaOverview as MalMeta } from './MyAnimeList_hybrid/metaOverview';
import { MetaOverview as MalApiMeta } from './MyAnimeList_api/metaOverview';
import { MetaOverview as AniMeta } from './AniList/metaOverview';
import { MetaOverview as KitsuMeta } from './Kitsu/metaOverview';
import { MetaOverview as SimklMeta } from './Simkl/metaOverview';

export function getOverview(url, type, syncMode = '') {
  if (!syncMode) {
    syncMode = helper.getSyncMode(type);
  }

  if (/^local:\/\//i.test(url)) {
    return new LocalMeta(url);
  }
  if (syncMode === 'ANILIST') {
    return new AniMeta(url);
  }
  if (syncMode === 'KITSU') {
    return new KitsuMeta(url);
  }
  if (syncMode === 'SIMKL') {
    return new SimklMeta(url);
  }
  if (syncMode === 'MAL') {
    return new MalMeta(url);
  }
  if (syncMode === 'MALAPI') {
    return new MalApiMeta(url);
  }

  throw 'Unknown sync mode';
}

import * as helper from './helper';
import { MetaOverview as LocalMeta } from './Local/metaOverview';
import { MetaOverview as MalMeta } from './MyAnimeList_hybrid/metaOverview';
import { MetaOverview as MalApiMeta } from './MyAnimeList_api/metaOverview';
import { MetaOverview as AniMeta } from './AniList/metaOverview';
import { MetaOverview as KitsuMeta } from './Kitsu/metaOverview';
import { MetaOverview as SimklMeta } from './Simkl/metaOverview';
import { MetaOverview as ShikiMeta } from './Shikimori/metaOverview';
import { Single as MalSingle } from './MyAnimeList_hybrid/single';
import { Single as SnilistSingle } from './AniList/single';
import { Single as SitsuSingle } from './Kitsu/single';
import { Single as SimklSingle } from './Simkl/single';
import { Single as ShikiSingle } from './Shikimori/single';

export function getOverview(url, type, syncMode = '') {
  if (!syncMode) {
    syncMode = helper.getSyncMode(type);
  }

  if (/^local:\/\//i.test(url)) {
    return new LocalMeta(url);
  }

  if (api.settings.get('syncFallback')) {
    const hostname = new URL(url).hostname;
    if (hostname === 'anilist.co') {
      return new AniMeta(url);
    }
    if (hostname === 'kitsu.app') {
      return new KitsuMeta(url);
    }
    if (hostname === 'simkl.com') {
      return new SimklMeta(url);
    }
    if (hostname === 'shikimori.one') {
      return new ShikiMeta(url);
    }
    if (hostname === 'myanimelist.net') {
      return new MalMeta(url);
    }
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
  if (syncMode === 'SHIKI') {
    return new ShikiMeta(url);
  }
  if (syncMode === 'MAL') {
    return new MalMeta(url);
  }
  if (syncMode === 'MALAPI') {
    return new MalApiMeta(url);
  }

  throw 'Unknown sync mode';
}

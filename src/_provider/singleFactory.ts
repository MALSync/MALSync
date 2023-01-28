import * as helper from './helper';
import { Cache } from '../utils/Cache';

import { Single as MalSingle } from './MyAnimeList_hybrid/single';
import { Single as MalApiSingle } from './MyAnimeList_api/single';
import { Single as SnilistSingle } from './AniList/single';
import { Single as SitsuSingle } from './Kitsu/single';
import { Single as SimklSingle } from './Simkl/single';
import { Single as ShikiSingle } from './Shikimori/single';
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
  if (syncMode === 'SHIKI') {
    return new ShikiSingle(url);
  }
  throw 'Unknown sync mode';
}

export async function getRulesCacheKey(
  url: string,
): Promise<{ rulesCacheKey: string | number; singleObj? }> {
  const cacheObj = new Cache(`rulesCacheKey/${url}`, 7 * 24 * 60 * 60 * 1000);

  if (await cacheObj.hasValue()) {
    return cacheObj.getValue().then(res => {
      return {
        rulesCacheKey: res,
      };
    });
  }

  const singleObj = getSingle(url);
  await singleObj.update();
  cacheObj.setValue(singleObj.getRulesCacheKey());
  return {
    rulesCacheKey: singleObj.getRulesCacheKey(),
    singleObj,
  };
}

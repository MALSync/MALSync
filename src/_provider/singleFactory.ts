import { urlToSlug } from '../utils/slugs';
import * as helper from './helper';
import { SyncTypes } from './helper';
import { Cache } from '../utils/Cache';
import { SingleAbstract } from './singleAbstract';

import { Single as MalSingle } from './MyAnimeList_hybrid/single';
import { Single as MalApiSingle } from './MyAnimeList_api/single';
import { Single as AnilistSingle } from './AniList/single';
import { Single as KitsuSingle } from './Kitsu/single';
import { Single as MangaBakaSingle } from './MangaBaka/single';
import { Single as SimklSingle } from './Simkl/single';
import { Single as ShikiSingle } from './Shikimori/single';
import { Single as LocalSingle } from './Local/single';

export const singleClasses: { [key in SyncTypes]: new (url: string) => SingleAbstract } = {
  MAL: MalSingle,
  MALAPI: MalApiSingle,
  ANILIST: AnilistSingle,
  KITSU: KitsuSingle,
  MANGABAKA: MangaBakaSingle,
  SIMKL: SimklSingle,
  SHIKI: ShikiSingle,
};

export function getSingle(url: string) {
  if (/^local:\/\//i.test(url)) {
    return new LocalSingle(url);
  }

  const slug = urlToSlug(url);
  if (!slug.path) {
    throw new Error(`URL not supported: ${url}`);
  }

  const syncMode = helper.getSyncMode(slug.path.type);
  if (!singleClasses[syncMode]) {
    throw 'Unknown sync mode';
  }
  return new singleClasses[syncMode](url);
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

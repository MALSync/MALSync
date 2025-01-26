import { search as malSearch } from '../MyAnimeList_hybrid/search';
import { search as malApiSearch } from '../MyAnimeList_api/search';
import { search as anilistSearch } from '../AniList/search';
import { search as kitsuSearch } from '../Kitsu/search';
import { search as simklSearch } from '../Simkl/search';
import { search as shikiSearch } from '../Shikimori/search';
import { searchInterface } from '../definitions';
import * as helper from './helper';

const searches: Record<string, searchInterface> = {
  MAL: malSearch,
  MALAPI: malApiSearch,
  ANILIST: anilistSearch,
  KITSU: kitsuSearch,
  SIMKL: simklSearch,
  SHIKI: shikiSearch,
};

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  const syncMode: string = helper.getSyncMode(type);
  const promise = searches[syncMode](keyword, type, options, sync);
  return Promise.all(
    Object.entries(searches).map(([mode, search]) =>
      mode === syncMode
        ? Promise.resolve([])
        : search(keyword, type, options, sync).catch(() => []),
    ),
  ).then(value => promise.then(result => result.concat(value.flat())));
};

import { searchInterface } from '../definitions';
import { buildProviderUrl } from '../../utils/slugs';
import { OshiSearchItem, oshimeterScore, publicCall, urls } from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  if (type !== 'anime') return [];

  const json: OshiSearchItem[] = (await publicCall(urls.search(keyword))) || [];

  return json.map(item => ({
    id: item.id,
    name: item.title,
    altNames: [],
    url: buildProviderUrl('ANIMEOSHI', 'anime', item.id),
    malUrl: () =>
      Promise.resolve(item.mal_id ? buildProviderUrl('MAL', 'anime', item.mal_id) : null),
    image: item.image,
    imageLarge: item.image,
    media_type: item.type || '',
    isNovel: false,
    score: oshimeterScore(item),
    year: item.release_year ? String(item.release_year) : '',
    totalEp: item.episodes || 0,
  }));
};

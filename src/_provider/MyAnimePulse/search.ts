import { searchInterface } from '../definitions';
import * as helper from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga' = 'anime',
  _options = {},
  _sync = false,
) {
  const res = await helper.apiCall(`/anime/filter?q=${encodeURIComponent(keyword)}&limit=10`);

  if (!res || !res.data) return [];

  return res.data.map((item: any) => ({
    id: item.mal_id,
    name: item.title,
    altNames: [item.title_english, item.title_japanese].filter(Boolean),
    url: `https://myanimepulse.com/anime/${item.mal_id}`,
    malUrl: async () => `https://myanimelist.net/anime/${item.mal_id}`,
    image: item.images?.jpg?.image_url || '',
    imageLarge: item.images?.jpg?.large_image_url || '',
    media_type: item.type || 'TV',
    isNovel: false,
    score: item.score || 0,
    year: item.year || 0,
    totalEp: item.episodes || 0,
  }));
};

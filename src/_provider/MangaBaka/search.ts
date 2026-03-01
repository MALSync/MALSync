import { searchInterface } from '../definitions';
import { call, getAlternativeTitles, getImageUrl, urls } from './helper';
import type { SearchResponse } from './types';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  const json = (await call(urls.search(keyword))) as SearchResponse;

  return json.data.map(item => {
    return {
      id: item.id,
      name: item.title,
      altNames: getAlternativeTitles(item),
      url: `https://mangabaka.org/${item.id}`,
      malUrl: () => {
        return Promise.resolve(
          item.source.my_anime_list?.id
            ? `https://myanimelist.net/manga/${item.source.my_anime_list.id}`
            : null,
        );
      },
      image: getImageUrl(item, 'small'),
      imageLarge: getImageUrl(item, 'large'),
      media_type: item.type
        ? (item.type.charAt(0) + item.type.slice(1).toLowerCase()).replace('_', ' ')
        : '',
      isNovel: item.type === 'novel',
      score: item.rating?.toFixed(0) || '',
      year: String(item.year),
      totalEp: Number(item.total_chapters) || 0,
    };
  });
};

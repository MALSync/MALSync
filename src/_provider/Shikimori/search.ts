import * as helper from './helper';
import { searchInterface } from '../definitions';
import { Queries } from './queries';
import type { Animes, Mangas, Anime, Manga } from './types';

export const search: searchInterface = async (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) => {
  if (!keyword) return [];

  const data = type === 'anime' ? await Queries.Animes(keyword) : await Queries.Mangas(keyword);
  if (!data || !data.data) return [];

  const items = type === 'anime' ? (data as Animes).data.animes : (data as Mangas).data.mangas;
  if (!items || !items.length) return [];

  return items.map((item: Anime | Manga) => {
    const getYear = () => {
      if (!item.airedOn) return '';
      if (item.airedOn.date) {
        return String(new Date(item.airedOn.date).getFullYear());
      }
      return String(item.airedOn.year);
    };
    const episodes = type === 'anime' ? (item as Anime).episodes || 0 : 0;
    const chapters = type === 'manga' ? (item as Manga).chapters || 0 : 0;

    return {
      id: Number(item.id),
      name: helper.title(item.russian || '', item.english || item.name),
      altNames: [item.name, item.russian, item.english, item.japanese].filter(Boolean) as string[],
      url: item.url,
      malUrl: () => Promise.resolve(item.id ? `https://myanimelist.net/${type}/${item.id}` : null),
      image: item.poster ? item.poster.mainUrl || item.poster.originalUrl || '' : '',
      imageLarge: item.poster ? item.poster.main2xUrl || item.poster.originalUrl || '' : '',
      media_type: item.kind || '',
      isNovel: !!(type === 'manga' && item.kind && item.kind.toLowerCase().includes('novel')),
      score: `${item.score || 0}`,
      year: getYear(),
      totalEp: type === 'anime' ? episodes : chapters,
    };
  });
};

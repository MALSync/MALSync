import { searchInterface } from '../definitions';
import * as helper from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  return helper
    .apiCall(
      'GET',
      `https://kitsu.io/api/edge/${type}?filter[text]=${keyword}&page[limit]=20&page[offset]=0&fields[${type}]=id,slug,titles,averageRating,startDate,posterImage,coverImage,subtype,${
        type === 'anime' ? 'episodeCount' : 'chapterCount'
      }`,
      {},
    )
    .then(res => {
      con.log('search', res);

      const resItems: any = [];
      res.data.forEach(function (item) {
        resItems.push({
          id: Number(item.id),
          name: helper.getTitle(item.attributes.titles, item.attributes.canonicalTitle),
          altNames: Object.values(item.attributes.titles),
          url: `https://kitsu.io/${type}/${item.attributes.slug}`,
          malUrl: async () => {
            const malId = await helper.kitsuToMal(item.id, type);
            return malId ? `https://myanimelist.net/${type}/${malId}` : null;
          },
          image:
            item.attributes.posterImage && item.attributes.posterImage.small
              ? item.attributes.posterImage.small
              : '',
          imageLarge:
            item.attributes.posterImage && item.attributes.posterImage.original
              ? item.attributes.posterImage.original
              : '',
          imageBanner:
            item.attributes.coverImage && item.attributes.coverImage.large
              ? item.attributes.coverImage.large
              : '',
          media_type: item.attributes.subtype,
          isNovel: item.attributes.subtype === 'novel',
          score: item.attributes.averageRating,
          year: item.attributes.startDate,
          totalEp: item.attributes.episodeCount || item.attributes.chapterCount || 0,
        });
      });
      return resItems;
    });
};

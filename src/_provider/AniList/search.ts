import { searchInterface } from '../definitions';
import * as helper from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  const query = `
    query ($search: String) {
      ${type}: Page (perPage: 25) {
        pageInfo {
          total
        }
        results: media (type: ${type.toUpperCase()}, search: $search) {
          id
          siteUrl
          idMal
          episodes
          chapters
          title {
            userPreferred
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          type
          format
          averageScore
          startDate {
            year
          }
          synonyms
        }
      }
    }
  `;

  const variables = {
    search: keyword,
  };

  const res = await helper.apiCall(query, variables, false);
  con.log(res);

  const resItems: any = [];

  j.$.each(res.data[type].results, function (index, item) {
    resItems.push({
      id: item.id,
      name: item.title.userPreferred,
      altNames: Object.values(item.title).concat(item.synonyms),
      url: item.siteUrl,
      malUrl: () => {
        return item.idMal ? `https://myanimelist.net/${type}/${item.idMal}` : null;
      },
      image: helper.imgCheck(item.coverImage.large),
      imageLarge: helper.imgCheck(item.coverImage.extraLarge),
      imageBanner: helper.imgCheck(item.bannerImage),
      media_type: item.format
        ? (item.format.charAt(0) + item.format.slice(1).toLowerCase()).replace('_', ' ')
        : '',
      isNovel: item.format === 'NOVEL',
      score: item.averageScore,
      year: item.startDate.year,
      totalEp: item.episodes || item.chapters || 0,
    });
  });

  return resItems;
};

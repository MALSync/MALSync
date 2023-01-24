import { searchInterface } from '../definitions';
import * as helper from './helper';

const tempObj = {
  apiCall: helper.apiCall,
  logger: con.m('MAL Search'),
  type: 'anime',
};

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  tempObj.type = type;

  keyword = keyword.trim();
  if (keyword.length > 64) {
    keyword = keyword.substr(0, 64);
  }

  if (!keyword) return [];

  if (keyword.length < 3) {
    throw new Error('Search term must be at least 3 characters long');
  }

  return tempObj
    .apiCall({
      type: 'GET',
      path: `${type}?q=${keyword}&limit=15&nsfw=true`,
      fields: [
        'start_date',
        'mean',
        'alternative_titles',
        'media_type',
        'num_episodes',
        'num_chapters',
      ],
    })
    .then(json => {
      const resItems: any = [];

      json.data.forEach(function (item) {
        let alt = [item.node.title];
        if (item.node.alternative_titles) {
          if (item.node.alternative_titles.en) alt.push(item.node.alternative_titles.en);
          if (item.node.alternative_titles.ja) alt.push(item.node.alternative_titles.ja);
          if (item.node.alternative_titles.synonyms)
            alt = alt.concat(item.node.alternative_titles.synonyms);
        }

        resItems.push({
          id: item.node.id,
          name: item.node.title,
          altNames: alt,
          url: `https://myanimelist.net/${type}/${item.node.id}`,
          malUrl: () => {
            return `https://myanimelist.net/${type}/${item.node.id}`;
          },
          image: item.node.main_picture?.medium ?? '',
          imageLarge: item.node.main_picture?.large || item.node.main_picture?.medium || '',
          media_type: item.node.media_type
            ? (
                item.node.media_type.charAt(0) + item.node.media_type.slice(1).toLowerCase()
              ).replace('_', ' ')
            : '',
          isNovel: item.node.media_type.toLowerCase().includes('novel'),
          score: item.node.mean,
          year: item.node.start_date,
          totalEp: item.node.num_episodes || item.node.num_chapters || 0,
        });
      });

      tempObj.logger.log(resItems);
      return resItems;
    });
};

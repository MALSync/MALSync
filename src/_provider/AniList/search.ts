import { searchInterface } from '../definitions';

export async function search(keyword, type: 'anime' | 'manga', options = {}, sync = false): Promise<searchInterface> {
  const query = `
    query ($search: String) {
      ${type}: Page (perPage: 10) {
        pageInfo {
          total
        }
        results: media (type: ${type.toUpperCase()}, search: $search) {
          id
          siteUrl
          idMal
          title {
            userPreferred
            romaji
            english
            native
          }
          coverImage {
            medium
          }
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

  const response = await api.request.xhr('POST', {
    url: 'https://graphql.anilist.co',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: JSON.stringify({
      query,
      variables,
    }),
  });

  const res = JSON.parse(response.responseText);
  con.log(res);

  const resItems: any = [];

  j.$.each(res.data[type].results, function(index, item) {
    resItems.push({
      id: item.id,
      name: item.title.userPreferred,
      altNames: Object.values(item.title).concat(item.synonyms),
      url: item.siteUrl,
      malUrl: () => {
        return item.idMal ? `https://myanimelist.net/${type}/${item.idMal}` : null;
      },
      image: item.coverImage.medium,
      media_type: item.format ? (item.format.charAt(0) + item.format.slice(1).toLowerCase()).replace('_', ' ') : '',
      isNovel: item.format === 'NOVEL',
      score: item.averageScore,
      year: item.startDate.year,
    });
  });

  return resItems;
}

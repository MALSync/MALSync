/*
import { searchInterface } from '../definitions';

export const search: searchInterface = async function(keyword, type: 'anime' | 'manga', options = {}, sync = false) {
  const response = await api.request.xhr(
    'GET',
    `https://myanimelist.net/search/prefix.json?type=${type}&keyword=${keyword}&v=1`,
  );

  const searchResults = JSON.parse(response.responseText);
  if (searchResults.errors) {
    console.error('Search Failed', searchResults.errors);
    return [];
  }
  const { items } = searchResults.categories[0];

  return items.map(item => ({
    id: item.id,
    name: item.name,
    altNames: [],
    url: item.url,
    malUrl: () => {
      return item.url;
    },
    image: item.image_url,
    media_type: item.payload.media_type,
    isNovel: item.payload.media_type.toLowerCase().includes('novel'),
    score: item.payload.score,
    year: item.payload.start_year,
  }));
};
*/

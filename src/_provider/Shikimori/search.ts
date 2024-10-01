import { searchInterface } from '../definitions';
import * as helper from './helper';

export const search: searchInterface = async function (
  keyword,
  type: 'anime' | 'manga',
  options: {
    novel?: boolean;
  } = { novel: false },
  sync = false,
) {
  const list: helper.MetaRequest[] = await helper.apiCall({
    path: `${options.novel ? 'ranobe' : `${type}s`}`,
    parameter: { limit: 25, search: keyword },
    type: 'GET',
  });

  return list.map(item => {
    return {
      id: item.id,
      name: helper.title(item.russian, item.name),
      altNames: [item.name, item.russian].filter(el => el),
      url: helper.domain + item.url,
      malUrl: () => {
        return Promise.resolve(
          item.id
            ? `https://myanimelist.net/${options.novel ? 'manga' : item.kind}/${item.id}`
            : null,
        );
      },
      image: helper.domain + item.image.preview,
      imageLarge: helper.domain + item.image.original,
      media_type: item.kind,
      isNovel: item.kind === 'light_novel',
      score: Number(item.score) ? item.score : '',
      year: item.aired_on,
      totalEp: item.episodes || item.chapters || 0,
    };
  });
};

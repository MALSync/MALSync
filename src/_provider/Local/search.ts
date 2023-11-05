import Fuse from 'fuse.js';

import { listElement } from '../listAbstract';
import { UserList as LocalList } from './list';
import { searchResult } from '../definitions';
import { normalSearch } from '../../utils/Search';

const searchFuse: {
  anime: null | Fuse<listElement>;
  manga: null | Fuse<listElement>;
} = {
  anime: null,
  manga: null,
};

export async function search(searchterm: string, type: 'anime' | 'manga'): Promise<searchResult[]> {
  if (!searchFuse[type]) {
    const localListEl = new LocalList(7, type);
    const tempList = await localListEl.getCompleteList();
    searchFuse[type] = new Fuse(tempList, {
      minMatchCharLength: 3,
      threshold: 0.4,
      keys: ['title'],
    });
  }

  const results = searchFuse[type]!.search(searchterm);

  return results.map(el => {
    return {
      id: 0,
      name: el.item.title,
      altNames: [],
      url: el.item.url,
      malUrl: () => Promise.resolve(null),
      image: el.item.image,
      imageLarge: el.item.image,
      media_type: el.item.type,
      isNovel: false,
      score: '',
      year: '',
      list: {
        status: el.item.status,
        score: el.item.score,
        episode: el.item.watchedEp,
      },
    };
  });
}

export async function miniMALSearch(searchterm: string, type: 'anime' | 'manga') {
  return [
    ...(await search(searchterm, type)).slice(0, 8),
    ...(await normalSearch(searchterm, type)),
  ];
}

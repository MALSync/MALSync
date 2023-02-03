import { ListAbstract, listElement } from '../listAbstract';

export class UserList extends ListAbstract {
  name = 'MyAnimeList';

  authenticationUrl = 'https://myanimelist.net/login.php';

  async getUserObject() {
    throw 'no';
    return Promise.resolve({ username: '', picture: '', href: '' });
    /*
    const url = 'https://myanimelist.net/panel.php?go=export&hideLayout';
    const response = await api.request.xhr('GET', url);
    const usernameMatches = response.responseText.match(/USER_NAME = "(.*?)"/);
    if (!usernameMatches || usernameMatches.length < 2 || !usernameMatches[1])
      throw {
        code: 400,
        message: 'Not Authenticated',
      };

    return usernameMatches[1];
    */
  }

  _getSortingOptions() {
    return [
      {
        icon: 'sort_by_alpha',
        title: 'Alphabetic',
        value: api.storage.lang('list_sorting_alpha'),
        asc: true,
      },
      {
        icon: 'history',
        title: api.storage.lang('list_sorting_history'),
        value: 'updated',
        asc: true,
      },
      {
        icon: 'score',
        title: api.storage.lang('list_sorting_score'),
        value: 'score',
        asc: true,
      },
    ];
  }

  getOrder(sort) {
    let pre = '';

    if (sort.endsWith('_asc')) pre = '-';

    const sortString = sort.replace('_asc', '');
    switch (sortString) {
      case 'alpha':
        return pre + 1;
      case 'updated':
        return pre + 5;
      case 'score':
        return pre + 4;
      default:
        if (this.status === 1) return this.getOrder('updated');
        if (this.status === 6) return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  async getPart() {
    throw 'no';
    return [];
    /*
    if (!this.username) {
      this.username = await this.getUsername();
    }

    const order = this.getOrder(this.sort);
    let sorting = '';
    if (order) {
      sorting = `&order=${order}`;
    }
    con.log(
      '[UserList][MAL]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
      `sorting: ${sorting}`,
    );
    const url = `https://myanimelist.net/${this.listType}list/${this.username}/load.json?offset=${this.offset}&status=${this.status}${sorting}`;
    return api.request.xhr('GET', url).then(async response => {
      const res = this.jsonParse(response);
      const data = await this.prepareData(res);
      if (data.length > 299) {
        this.offset += 300;
      } else {
        this.done = true;
      }
      return data;
    });
    */
  }

  public async prepareData(data): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      if (this.listType === 'anime') {
        newData.push(
          await this.fn({
            uid: el.anime_id,
            malId: el.anime_id,
            apiCacheKey: el.anime_id,
            cacheKey: el.anime_id,
            type: this.listType,
            title: el.anime_title,
            url: `https://myanimelist.net${el.anime_url}`,
            watchedEp: el.num_watched_episodes,
            totalEp: el.anime_num_episodes,
            status: el.status,
            score: el.score,
            image: el.anime_image_path,
            tags: el.tags,
            airingState: el.anime_airing_status,
          }),
        );
      } else {
        newData.push(
          await this.fn({
            uid: el.manga_id,
            malId: el.manga_id,
            apiCacheKey: el.manga_id,
            cacheKey: el.manga_id,
            type: this.listType,
            title: el.manga_title,
            url: `https://myanimelist.net${el.manga_url}`,
            watchedEp: el.num_read_chapters,
            totalEp: el.manga_num_chapters,
            status: el.status,
            score: el.score,
            image: el.manga_image_path,
            tags: el.tags,
            airingState: el.anime_airing_status,
          }),
        );
      }
    }
    return newData;
  }
}

import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

const pageSize = 25;

export class UserList extends ListAbstract {
  name = 'Shiki';

  public seperateRewatching = true;

  authenticationUrl = helper.authUrl;

  tempList: helper.StatusRequest[] = [];

  getUserObject() {
    return helper.userRequest().then(res => ({
      username: res.nickname,
      picture: res.image.x80,
      href: res.url,
    }));
  }

  deauth() {
    return api.settings.set('shikiToken', '');
  }

  _getSortingOptions() {
    return [
      {
        icon: 'sort_by_alpha',
        title: 'Alphabetic',
        value: 'alpha',
      },
      {
        icon: 'history',
        title: 'Last Updated',
        value: 'updated',
        asc: true,
      },
      {
        icon: 'score',
        title: 'Score',
        value: 'score',
        asc: true,
      },
    ];
  }

  getOrder(sort) {
    switch (sort) {
      case 'alpha':
        return 'MEDIA_TITLE_ENGLISH';
      case 'updated':
        return 'UPDATED_TIME_DESC';
      case 'updated_asc':
        return 'UPDATED_TIME';
      case 'score':
        return 'SCORE_DESC';
      case 'score_asc':
        return 'SCORE';
      default:
        if (this.status === 1) return this.getOrder('updated');
        if (this.status === 6) return this.getOrder('updated');
        // TODO: remove when fixed in anilist
        return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  async getPart(): Promise<any> {
    if (this.offset < 2) this.offset = 0;
    con.log(
      '[UserList][Shiki]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
    );

    if (!this.tempList.length) {
      let curSt = '';
      if (this.status !== 7) {
        curSt = helper.statusTranslate[this.status];
      }

      const userId = await helper.userId();

      this.tempList = await helper.apiCall({
        path: `v2/user_rates`,
        type: 'GET',
        parameter: {
          user_id: userId,
          target_type: this.listType === 'anime' ? 'Anime' : 'Manga',
          status: curSt,
        },
      });
    }

    const list = this.tempList.slice(this.offset, this.offset + pageSize);

    this.offset += pageSize;

    if (this.offset >= this.tempList.length) {
      this.done = true;
    }

    const ids = list.map(el => el.target_id);

    const metadata: helper.MetaRequest[] = await helper.apiCall({
      path: `${this.listType}s`,
      parameter: { ids: ids.join(','), limit: pageSize },
      type: 'GET',
    });

    const keyedMetadata: { [key: string]: helper.MetaRequest } = {};
    for (const key in metadata) {
      const entry = metadata[key];
      keyedMetadata[entry.id] = entry;
    }

    if (this.listType === 'manga') {
      const keyedIds = Object.keys(keyedMetadata);
      const diffArr = ids.filter((o: any) => !keyedIds.includes(o));
      if (diffArr.length) {
        const diffMetadata: helper.MetaRequest[] = await helper.apiCall({
          path: `ranobe`,
          parameter: { ids: diffArr.join(','), limit: pageSize },
          type: 'GET',
        });
        for (const key in diffMetadata) {
          const entry = diffMetadata[key];
          keyedMetadata[entry.id] = entry;
        }
      }
    }

    return this.prepareData(list, keyedMetadata);
  }

  private async prepareData(
    data: helper.StatusRequest[],
    metadata: { [key: string]: helper.MetaRequest },
  ): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (const key in data) {
      const entry = data[key];
      const meta = metadata[entry.target_id];

      // eslint-disable-next-line no-await-in-loop
      const tempData = await this.fn({
        malId: entry.target_id,
        apiCacheKey: entry.target_id,
        uid: entry.target_id,
        cacheKey: entry.target_id,
        type: entry.target_type === 'Anime' ? 'anime' : 'manga',
        title: meta.name,
        url: `${helper.domain}${meta.url}`,
        watchedEp: entry.target_type === 'Anime' ? entry.episodes : entry.chapters,
        totalEp: 12,
        status: helper.statusTranslate[entry.status],
        score: entry.score ? entry.score : 0,
        image: meta.image.original ? `${helper.domain}${meta.image.original}` : '',
        imageLarge: meta.image.original ? `${helper.domain}${meta.image.original}` : '',
        tags: entry.text,
      });
      newData.push(tempData);
    }

    return newData;
  }
}

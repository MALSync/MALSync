/* eslint-disable no-await-in-loop */
import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';
import {
  UserRateStatusEnum,
  UserRate,
  UserRates,
  statusTranslate,
  Anime,
  Manga,
  UserRateOrderInputType,
} from './types';
import { Queries } from './queries';

const limit = 25; // MAX 50
export class UserList extends ListAbstract {
  name = 'Shiki';

  authenticationUrl = helper.authUrl;

  media: UserRates = {
    data: {
      userRates: [],
    },
  };

  public separateRewatching = true;

  async getUserObject() {
    return helper.userRequest().then(res => ({
      username: res.data.currentUser.nickname,
      picture: res.data.currentUser.avatarUrl,
      href: res.data.currentUser.url,
    }));
  }

  deauth() {
    return api.settings.set('shikiToken', '');
  }

  _getSortingOptions() {
    return [
      {
        icon: 'history',
        title: api.storage.lang('list_sorting_history'),
        value: 'updated',
        asc: true,
      },
    ];
  }

  getOrder(sort: string): UserRateOrderInputType {
    switch (sort) {
      case 'updated':
        return {
          field: 'updated_at',
          order: 'desc',
        };
      case 'updated_asc':
        return {
          field: 'updated_at',
          order: 'asc',
        };
      default:
        return {
          field: 'updated_at',
          order: 'desc',
        };
    }
  }

  async getPart(): Promise<listElement[]> {
    this.media.data.userRates = [];
    if (this.offset < 1) this.offset = 1;
    if (!this.username) this.username = await this.getUsername();

    con.log(
      '[UserList][Shiki]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
    );

    let curSt: UserRateStatusEnum | undefined;
    if (this.status !== 7) {
      curSt = statusTranslate[this.status] as UserRateStatusEnum;
    }

    const order = this.getOrder(this.sort);
    const userId = await helper.userId();
    this.media = await Queries.UserRates(
      Number(userId),
      this.listType === 'anime' ? 'Anime' : 'Manga',
      order,
      curSt,
      this.offset,
      limit,
    );

    this.offset += 1;
    if (limit > this.media.data.userRates.length) this.done = true;

    return this.prepareData(this.media.data.userRates);
  }

  private async prepareData(data: UserRate[]): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const item = this.listType === 'anime' ? data[i].anime! : data[i].manga!;
      const tempData = await this.fn({
        malId: item.malId,
        apiCacheKey: item.id,
        uid: item.id,
        cacheKey: item.id,
        type: this.listType,
        title: helper.title(item.russian || '', item.english || item.name),
        url: item.url,
        watchedEp: this.listType === 'anime' ? data[i].episodes : data[i].chapters,
        totalEp:
          this.listType === 'anime' ? (item as Anime).episodes || 0 : (item as Manga).chapters || 0,
        status: statusTranslate[data[i].status],
        score: data[i].score || 0,
        image: item.poster!.mainUrl || '',
        imageLarge: item.poster!.main2xUrl || '',
        tags: data[i].text || '',
        updatedAt: data[i].updatedAt,
      });
      newData.push(tempData);
    }

    return newData;
  }
}

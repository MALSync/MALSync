import * as helper from './helper';
import { ListAbstract } from '../listAbstract';
import { Queries, authUrl } from './queries';
import { statusTranslate } from './types';
import type { listElement } from '../listAbstract';
import type {
  UserRateStatusEnum,
  UserRate,
  UserRates,
  Anime,
  Manga,
  UserRateOrderInputType,
} from './types';

export class UserList extends ListAbstract {
  name = 'Shiki';

  authenticationUrl = authUrl;

  media: UserRates = {
    data: {
      userRates: [],
    },
  };

  userID: string | undefined = undefined;

  limit = 25; // MAX 50

  public separateRewatching = true;

  async getUserObject() {
    return Queries.CurrentUser().then(res => ({
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
    if (!this.userID) this.userID = await helper.userIDRequest();

    con.log(
      '[UserList][Shiki]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
    );

    let currentStatus: UserRateStatusEnum | undefined;
    if (this.status !== 7) {
      currentStatus = statusTranslate[this.status] as UserRateStatusEnum;
    }

    const order = this.getOrder(this.sort);
    this.media = await Queries.UserRates(
      Number(this.userID),
      this.listType === 'anime' ? 'Anime' : 'Manga',
      order,
      currentStatus,
      this.offset,
      this.limit,
    );

    this.offset += 1;
    if (this.limit > this.media.data.userRates.length) this.done = true;

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
        image: item.poster ? item.poster.mainUrl || '' : '',
        imageLarge: item.poster ? item.poster.main2xUrl || '' : '',
        tags: data[i].text || '',
        updatedAt: data[i].updatedAt,
      });
      newData.push(tempData);
    }

    return newData;
  }
}

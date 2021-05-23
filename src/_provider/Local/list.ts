import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  name = 'local';

  authenticationUrl = '';

  async getUsername() {
    return 'local';
  }

  _getSortingOptions() {
    return [];
  }

  async getPart() {
    con.log('[UserList][Local]', `status: ${this.status}`);
    this.done = true;
    const data = await this.prepareData(await this.getSyncList(), this.listType, this.status);
    return data;
  }

  private async prepareData(data, listType, status): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (const key in data) {
      if (this.getRegex(listType).test(key)) {
        const el = data[key];
        con.log(key, el);
        if (status !== 7 && parseInt(el.status) !== status) {
          continue;
        }
        if (listType === 'anime') {
          newData.push(
            await this.fn(
              {
                airingState: 2,
                image: el.image ?? api.storage.assetUrl('questionmark.gif'),
                malId: 0,
                apiCacheKey: 0,
                tags: el.tags,
                title: `[L] ${el.name}`,
                totalEp: 0,
                status: el.status,
                score: el.score,
                type: 'anime',
                uid: key,
                url: key,
                cacheKey: this.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
                watchedEp: el.progress,
              },
              el.sUrl,
            ),
          );
        } else {
          newData.push(
            await this.fn(
              {
                airingState: 2,
                image: el.image ?? api.storage.assetUrl('questionmark.gif'),
                malId: 0,
                apiCacheKey: 0,
                tags: el.tags,
                title: `[L] ${el.name}`,
                totalEp: 0,
                status: el.status,
                score: el.score,
                type: 'manga',
                uid: key,
                url: key,
                cacheKey: this.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
                watchedEp: el.progress,
              },
              el.sUrl,
            ),
          );
        }
      }
    }

    con.log('data', newData);
    return newData;
  }

  private getRegex = helper.getRegex;

  protected getSyncList = helper.getSyncList;

  protected getCacheKey = helper.getCacheKey;
}

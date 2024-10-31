import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';
import * as definitions from '../definitions';

export class UserList extends ListAbstract {
  name = 'local';

  authenticationUrl = '';

  async getUserObject() {
    return Promise.resolve({ username: 'local', picture: '', href: '' });
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
        if (status !== definitions.status.All && parseInt(el.status) !== status) {
          continue;
        }
        if (listType === 'anime') {
          newData.push(
            await this.fn(
              {
                uid: key,
                cacheKey: this.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
                type: 'anime',
                airingState: 2,
                image: el.image ?? '',
                imageLarge: el.image ?? '',
                malId: 0,
                apiCacheKey: 0,
                tags: el.tags,
                title: `[L] ${el.name}`,
                url: key,
                score: el.score,
                watchedEp: el.progress,
                totalEp: 0,
                status: el.status,
              },
              el.sUrl,
            ),
          );
        } else {
          newData.push(
            await this.fn(
              {
                uid: key,
                cacheKey: this.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
                type: 'manga',
                airingState: 2,
                image: el.image ?? '',
                imageLarge: el.image ?? '',
                malId: 0,
                apiCacheKey: 0,
                tags: el.tags,
                title: `[L] ${el.name}`,
                url: key,
                score: el.score,
                watchedEp: el.progress,
                readVol: el.volumeprogress,
                totalEp: 0,
                totalVol: 0,
                status: el.status,
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

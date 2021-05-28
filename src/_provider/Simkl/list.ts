import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  name = 'Simkl';

  authenticationUrl =
    'https://simkl.com/oauth/authorize?response_type=code&client_id=39e8640b6f1a60aaf60f3f3313475e830517badab8048a4e52ff2d10deb2b9b0&redirect_uri=https://simkl.com/apps/chrome/mal-sync/connected/';

  async getUsername() {
    return this.call('https://api.simkl.com/users/settings').then(res => {
      con.log(res);
      if (res && res.user && typeof res.user.name !== 'undefined') {
        return res.user.name;
      }

      throw {
        code: 400,
        message: 'Not Authenticated',
      };
    });
  }

  deauth() {
    return api.settings.set('simklToken', '');
  }

  errorHandling(res, code) {
    if (typeof res.error !== 'undefined') {
      con.error(res.error);
      throw {
        code,
        message: res.error,
      };
    }
    switch (code) {
      case 200:
      case 201:
      case 204:
      case 302:
        break;
      default:
        throw {
          code,
          message: `Code: ${code}`,
        };
    }
  }

  _getSortingOptions() {
    return [];
  }

  async getPart() {
    con.log('[UserList][Simkl]', `status: ${this.status}`);
    if (this.listType === 'manga') throw { code: 415, message: 'Does not support manga' };
    return this.syncList().then(async list => {
      this.done = true;
      const data = await this.prepareData(Object.values(list), this.listType, this.status);
      con.log(data);
      return data;
    });
  }

  private async prepareData(data, listType, status): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      const st = this.translateList(el.status);
      if (status !== 7 && parseInt(st) !== status) {
        continue;
      }

      let curep = this.getEpisode(el.last_watched);
      if (st === 2) curep = el.total_episodes_count;

      if (listType === 'anime') {
        const tempData = await this.fn({
          malId: el.show.ids.mal,
          apiCacheKey: el.show.ids.mal,
          uid: el.show.ids.simkl,
          cacheKey: this.getCacheKey(el.show.ids.mal, el.show.ids.simkl),
          type: listType,
          title: el.show.title,
          url: `https://simkl.com/${listType}/${el.show.ids.simkl}`,
          watchedEp: curep,
          totalEp: el.total_episodes_count,
          status: st,
          score: el.user_rating ? el.user_rating : 0,
          image: `https://simkl.in/posters/${el.show.poster}_ca.jpg`,
          tags: el.private_memo,
          airingState: el.anime_airing_status,
        });
        newData.push(tempData);
      } else {
        // placeholder
      }
    }
    return newData;
  }

  protected syncList = helper.syncList;

  protected translateList = helper.translateList;

  protected getCacheKey = helper.getCacheKey;

  protected getEpisode = helper.getEpisode;

  protected call = helper.call;
}

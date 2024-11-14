import { NotAutenticatedError } from '../Errors';
import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';
import * as definitions from '../definitions';

export class UserList extends ListAbstract {
  name = 'Simkl';

  authenticationUrl = helper.getAuthUrl();

  async getUserObject() {
    return this.call('https://api.simkl.com/users/settings').then(res => {
      if (res && res.user && typeof res.user.name !== 'undefined') {
        return {
          username: res.user.name,
          picture: res.user.avatar || '',
          href: `https://simkl.com/${res.account.id}`,
        };
      }

      throw new NotAutenticatedError('Not Authenticated');
    });
  }

  deauth() {
    return api.settings.set('simklToken', '');
  }

  errorHandling = helper.errorHandling;

  _getSortingOptions() {
    return [];
  }

  async getPart() {
    con.log('[UserList][Simkl]', `status: ${this.status}`);
    if (this.listType === 'manga') throw new Error('Does not support manga');
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
      if (status !== definitions.status.All && parseInt(st) !== status) {
        continue;
      }

      let curep = this.getEpisode(el.last_watched);
      if (st === definitions.status.Completed) {
        curep = el.total_episodes_count;
      }

      if (listType === 'anime') {
        const tempData = await this.fn({
          malId: el.show.ids.mal,
          apiCacheKey: el.show.ids.mal,
          uid: el.show.ids.simkl,
          cacheKey: this.getCacheKey(el.show.ids.mal, el.show.ids.simkl),
          type: listType,
          title: el.show.title,
          url: `https://simkl.com/${listType}/${el.show.ids.simkl}`,
          score: el.user_rating ? el.user_rating : 0,
          watchedEp: curep,
          totalEp: el.total_episodes_count,
          status: st,
          image: `https://simkl.in/posters/${el.show.poster}_ca.jpg`,
          imageLarge: `https://simkl.in/posters/${el.show.poster}_m.jpg`,
          imageBanner: `https://simkl.in/posters/${el.show.poster}_w.jpg`,
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

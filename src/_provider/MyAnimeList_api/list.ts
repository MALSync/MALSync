import { ListAbstract, ListElement } from '../listAbstract';
import * as helper from './helper';
import * as definitions from '../definitions';

export class UserList extends ListAbstract {
  name = 'MyAnimeList';

  authenticationUrl = helper.authenticationUrl;

  async getUserObject() {
    return this.apiCall({
      type: 'GET',
      path: 'users/@me',
    }).then(json => {
      return {
        username: json.name,
        picture: json.picture,
        href: `https://myanimelist.net/profile/${json.name}`,
      };
    });
  }

  deauth() {
    return api.settings.set('malToken', '').then(() => api.settings.set('malRefresh', ''));
  }

  _getSortingOptions() {
    return [
      {
        icon: 'sort_by_alpha',
        title: api.storage.lang('list_sorting_alpha'),
        value: 'alpha',
      },
      {
        icon: 'history',
        title: api.storage.lang('list_sorting_history'),
        value: 'updated',
      },
      {
        icon: 'score',
        title: api.storage.lang('list_sorting_score'),
        value: 'score',
      },
      {
        icon: 'calendar_month',
        title: api.storage.lang('list_sorting_airing_date'),
        value: 'airing_date',
      },
    ];
  }

  getOrder(sort) {
    switch (sort) {
      case 'alpha':
        return `${this.listType}_title`;
      case 'updated':
        return 'list_updated_at';
      case 'score':
        return 'list_score';
      case 'airing_date':
        return `${this.listType}_start_date`;
      default:
        if (this.status === definitions.status.Watching) return this.getOrder('updated');
        if (this.status === definitions.status.PlanToWatch) return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  private limit = 100;

  async getPart() {
    this.limit = 100;
    if (this.modes.frontend) {
      this.limit = 24;
    }

    const order = this.getOrder(this.sort);
    let sorting = '';
    if (order) {
      sorting = `&sort=${order}`;
    }

    con.log(
      '[UserList][MAL]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
      `sorting: ${sorting}`,
    );

    let curSt = '';
    if (this.status !== definitions.status.All) {
      if (this.listType === 'manga') {
        curSt = `&status=${helper.mangaStatus[this.status]}`;
      } else {
        curSt = `&status=${helper.animeStatus[this.status]}`;
      }
    }

    const useAltTitle = api.settings.get('forceEnglishTitles');

    return this.apiCall({
      type: 'GET',
      path: `users/@me/${this.listType}list?nsfw=true&limit=${this.limit}&offset=${this.offset}${curSt}${sorting}`,
      fields: [
        'list_status{tags,is_rewatching,is_rereading,start_date,finish_date,num_times_rewatched,num_times_reread}',
        'num_episodes',
        'num_chapters',
        'num_volumes',
        useAltTitle ? 'alternative_titles' : '',
      ],
    }).then(json => {
      if (json.paging && json.paging.next) {
        this.offset += this.limit;
      } else {
        this.done = true;
      }

      return this.prepareData(json.data);
    });
  }

  public async prepareData(data): Promise<ListElement[]> {
    const newData = [] as ListElement[];
    const useAltTitle = api.settings.get('forceEnglishTitles');
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      if (this.listType === 'anime') {
        newData.push(
          await this.fn({
            uid: el.node.id,
            malId: el.node.id,
            apiCacheKey: el.node.id,
            cacheKey: el.node.id,
            type: this.listType,
            title: useAltTitle ? el.node.alternative_titles.en || el.node.title : el.node.title,
            url: `https://myanimelist.net/${this.listType}/${el.node.id}`,
            score: el.list_status.score,
            watchedEp: el.list_status.num_episodes_watched,
            totalEp: el.node.num_episodes,
            status: parseInt(helper.animeStatus[el.list_status.status]),
            startDate: helper.getRoundedDate(el.list_status.start_date),
            finishDate: helper.getRoundedDate(el.list_status.finish_date),
            rewatchCount: el.list_status.num_times_rewatched,
            image: el.node.main_picture?.medium ?? '',
            imageLarge: el.node.main_picture?.large || el.node.main_picture?.medium || '',
            tags: el.list_status.tags.length ? el.list_status.tags.join(',') : '',
            airingState: el.anime_airing_status,
          }),
        );
      } else {
        newData.push(
          await this.fn({
            uid: el.node.id,
            malId: el.node.id,
            apiCacheKey: el.node.id,
            cacheKey: el.node.id,
            type: this.listType,
            title: useAltTitle ? el.node.alternative_titles.en || el.node.title : el.node.title,
            url: `https://myanimelist.net/${this.listType}/${el.node.id}`,
            score: el.list_status.score,
            watchedEp: el.list_status.num_chapters_read,
            readVol: el.list_status.num_volumes_read,
            totalEp: el.node.num_chapters,
            totalVol: el.node.num_volumes,
            status: parseInt(helper.mangaStatus[el.list_status.status]),
            startDate: helper.getRoundedDate(el.list_status.start_date),
            finishDate: helper.getRoundedDate(el.list_status.finish_date),
            rewatchCount: el.list_status.num_times_reread,
            image: el.node.main_picture?.medium ?? '',
            imageLarge: el.node.main_picture?.large || el.node.main_picture?.medium || '',
            tags: el.list_status.tags.length ? el.list_status.tags.join(',') : '',
            airingState: el.anime_airing_status,
          }),
        );
      }
    }
    return newData;
  }

  apiCall = helper.apiCall;
}

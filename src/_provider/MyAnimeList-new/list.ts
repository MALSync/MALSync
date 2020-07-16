import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class userlist extends ListAbstract {
  name = 'MyAnimeList';

  authenticationUrl = helper.authenticationUrl;

  async getUsername() {
    return this.apiCall({
      type: 'GET',
      path: 'users/@me',
    }).then(json => {
      return json.name;
    });
  }

  errorHandling(res) {
    if (typeof res.errors !== 'undefined') {
      con.error(res.errors);
      throw {
        code: parseInt(res.errors[0].status),
        message: res.errors[0].title,
      };
    }
  }

  private limit = 100;

  async getPart() {
    this.limit = 100;
    if (typeof this.callbacks.continueCall !== 'undefined') {
      this.limit = 24;
    }

    let sorting = '';
    if (this.status === 1) {
      sorting = '&sort=list_updated_at';
    }

    con.log(
      '[UserList][MAL]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
      `sorting: ${sorting}`,
    );

    let curSt = '';
    if (this.status !== 7) {
      if (this.listType === 'manga') {
        curSt = `&status=${helper.mangaStatus[this.status]}`;
      } else {
        curSt = `&status=${helper.animeStatus[this.status]}`;
      }
    }

    return this.apiCall({
      type: 'GET',
      path: `users/@me/${this.listType}list?limit=${this.limit}&offset=${this.offset}${curSt}${sorting}`,
      fields: [
        'list_status{tags,is_rewatching,is_rereading,start_date,finish_date}',
        'num_episodes',
        'num_chapters',
        'num_volumes',
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

  public async prepareData(data): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      if (this.listType === 'anime') {
        newData.push(
          await this.fn({
            uid: el.node.id,
            malId: el.node.id,
            cacheKey: el.node.id,
            type: this.listType,
            title: el.node.title,
            url: `https://myanimelist.net/${this.listType}/${el.node.id}`,
            watchedEp: el.list_status.num_episodes_watched,
            totalEp: el.node.num_episodes,
            status: parseInt(helper.animeStatus[el.list_status.status]),
            score: el.list_status.score,
            image: el.node.main_picture.medium,
            tags: el.list_status.tags.length ? el.list_status.tags.join(',') : '',
            airingState: el.anime_airing_status,
          }),
        );
      } else {
        newData.push(
          await this.fn({
            uid: el.node.id,
            malId: el.node.id,
            cacheKey: el.node.id,
            type: this.listType,
            title: el.node.title,
            url: `https://myanimelist.net/${this.listType}/${el.node.id}`,
            watchedEp: el.list_status.num_chapters_read,
            totalEp: el.node.num_chapters,
            status: parseInt(helper.mangaStatus[el.list_status.status]),
            score: el.list_status.score,
            image: el.node.main_picture.medium,
            tags: el.list_status.tags.length ? el.list_status.tags.join(',') : '',
            airingState: el.anime_airing_status,
          }),
        );
      }
    }
    console.log(newData);
    return newData;
  }

  apiCall = helper.apiCall;
}

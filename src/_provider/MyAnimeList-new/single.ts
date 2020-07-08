import { SingleAbstract } from '../singleAbstract';
import { errorCode } from '../definitions';
import * as helper from './helper';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#2e51a2');
    return this;
  }

  private animeInfo: any;

  private displayUrl = '';

  private pending = false;

  shortName = 'MAL';

  authenticationUrl = helper.authenticationUrl;

  protected handleUrl(url) {
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.mal = Number(utils.urlPart(url, 4));
      return;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  getCacheKey() {
    return this.ids.mal;
  }

  _getStatus() {
    let curSt;
    if (this.type === 'manga') {
      curSt = parseInt(helper.mangaStatus[this.animeInfo.my_list_status.status]);
    } else {
      curSt = parseInt(helper.animeStatus[this.animeInfo.my_list_status.status]);
    }
    if (this.getRewatching() && curSt === 2) return 23;
    return curSt;
  }

  _setStatus(status) {
    return 1;
  }

  _getScore() {
    return this.animeInfo.my_list_status.score;
  }

  _setScore(score) {
    return '1';
  }

  _getEpisode() {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.num_chapters_read;
    }
    return this.animeInfo.my_list_status.num_episodes_watched;
  }

  _setEpisode(episode) {
    return '1';
  }

  _getVolume() {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.num_volumes_read;
    }
    return 0;
  }

  _setVolume(volume) {
    return '1';
  }

  _getTags() {
    return '1';
  }

  _setTags(tags) {
    return '1';
  }

  private getRewatching(): boolean {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.is_rereading;
    }
    return this.animeInfo.my_list_status.is_rewatching;
  }

  private setRewatching(state: boolean) {
    return '1';
  }

  _getTitle() {
    return this.animeInfo.title;
  }

  _getTotalEpisodes() {
    if (this.type === 'manga') {
      return this.animeInfo.num_chapters;
    }
    return this.animeInfo.num_episodes;
  }

  _getTotalVolumes() {
    if (this.type === 'manga') {
      return this.animeInfo.num_volumes;
    }
    return 0;
  }

  _getDisplayUrl() {
    return this.url;
  }

  _getImage() {
    return Promise.resolve(this.animeInfo.main_picture.medium);
  }

  _getRating() {
    return Promise.resolve(this.animeInfo.mean);
  }

  async _update() {
    return this.apiCall({
      type: 'GET',
      path: `${this.type}/${this.ids.mal}`,
      fields: [
        'my_list_status{tags,is_rewatching,is_rereading}',
        'num_episodes',
        'mean',
        // Manga
        'num_chapters',
        'num_volumes',
      ],
    }).then(res => {
      this.logger.m('Api').log(res);
      this._authenticated = true;
      this.animeInfo = res;
      this._onList = true;
      if (!this.animeInfo.my_list_status) this._onList = false;
    });
  }

  async _sync() {
    return Promise.resolve();
  }

  apiCall = helper.apiCall;
}

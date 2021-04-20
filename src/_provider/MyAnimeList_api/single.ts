import { SingleAbstract } from '../singleAbstract';
import { errorCode } from '../definitions';
import * as helper from './helper';
import { malToAnilist } from '../AniList/helper';
import { Cache } from '../../utils/Cache';
import { returnYYYYMMDD } from '../../utils/general';

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
    if (status === 23) {
      status = 2;
      this.setRewatching(true);
    } else {
      this.setRewatching(false);
    }
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.status = helper.mangaStatus[status];
      return;
    }
    this.animeInfo.my_list_status.status = helper.animeStatus[status];
  }

  _getScore() {
    return this.animeInfo.my_list_status.score;
  }

  _setScore(score) {
    this.animeInfo.my_list_status.score = score;
  }

  _getEpisode() {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.num_chapters_read;
    }
    return this.animeInfo.my_list_status.num_watched_episodes;
  }

  _setEpisode(episode) {
    if (!episode) episode = 0;
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.num_chapters_read = episode;
      return;
    }
    this.animeInfo.my_list_status.num_watched_episodes = episode;
  }

  _getVolume() {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.num_volumes_read;
    }
    return 0;
  }

  _setVolume(volume) {
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.num_volumes_read = volume;
    }
  }

  _getTags() {
    if (!this.animeInfo.my_list_status.tags.length) {
      return '';
    }
    return this.animeInfo.my_list_status.tags.join(',');
  }

  _setTags(tags) {
    if (!tags || tags.trim() === ',') {
      this.animeInfo.my_list_status.tags = [];
      return;
    }
    this.animeInfo.my_list_status.tags = tags.split(',');
  }

  private getRewatching(): boolean {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.is_rereading;
    }
    return this.animeInfo.my_list_status.is_rewatching;
  }

  private setRewatching(state: boolean) {
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.is_rereading = state;
      return;
    }
    this.animeInfo.my_list_status.is_rewatching = state;
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
    return Promise.resolve(this.animeInfo.main_picture?.medium ?? '');
  }

  _getRating() {
    return Promise.resolve(this.animeInfo.mean);
  }

  async _update() {
    return this.apiCall({
      type: 'GET',
      path: `${this.type}/${this.ids.mal}`,
      fields: [
        'my_list_status{tags,is_rewatching,is_rereading,start_date,finish_date}',
        'num_episodes',
        'mean',
        // Manga
        'num_chapters',
        'num_volumes',
      ],
    })
      .catch(e => {
        if (e.code === errorCode.NotAutenticated) {
          this._authenticated = false;
        }
        throw e;
      })
      .then(res => {
        this.logger.m('Api').log(res);
        this._authenticated = true;
        this.animeInfo = res;
        this._onList = true;
        if (!this.animeInfo.my_list_status) {
          this._onList = false;
          if (this.type === 'manga') {
            this.animeInfo.my_list_status = {
              is_rereading: false,
              num_chapters_read: 0,
              num_volumes_read: 0,
              score: 0,
              status: 'plan_to_read',
              tags: [],
            };
          } else {
            this.animeInfo.my_list_status = {
              is_rewatching: false,
              num_watched_episodes: 0,
              score: 0,
              status: 'plan_to_watch',
              tags: [],
            };
          }
        }

        // Handle api bug
        if (
          this.animeInfo.my_list_status &&
          typeof this.animeInfo.my_list_status.num_episodes_watched !== 'undefined'
        ) {
          this.animeInfo.my_list_status.num_watched_episodes = this.animeInfo.my_list_status.num_episodes_watched;
          delete this.animeInfo.my_list_status.num_episodes_watched;
        }
      });
  }

  async _sync() {
    if (
      typeof this.animeInfo.my_list_status.start_date === 'undefined' &&
      this._getStatus() === 1 &&
      this._getEpisode() > 0
    ) {
      this.animeInfo.my_list_status.start_date = returnYYYYMMDD();
    }

    if (typeof this.animeInfo.my_list_status.finish_date === 'undefined' && this._getStatus() === 2) {
      this.animeInfo.my_list_status.finish_date = returnYYYYMMDD();

      if (typeof this.animeInfo.my_list_status.start_date === 'undefined') {
        this.animeInfo.my_list_status.start_date = returnYYYYMMDD();
      }
    }

    const sentData = {};
    for (const property in this.animeInfo.my_list_status) {
      switch (property) {
        case 'priority':
        case 'num_watched_episodes':
        case 'num_volumes_read':
        case 'num_chapters_read':
        case 'score':
        case 'is_rewatching':
        case 'is_rereading':
        case 'num_times_rewatched':
        case 'num_times_reread':
        case 'rewatch_value':
        case 'reread_value':
        case 'tags':
        case 'comments':
        case 'status':
        case 'start_date':
        case 'finish_date':
          sentData[property] = this.animeInfo.my_list_status[property];
          break;
        default:
      }
    }
    this.logger.m('Sync').log(this.ids.mal, sentData);
    return this.apiCall({
      type: 'PUT',
      path: `${this.type}/${this.ids.mal}/my_list_status`,
      dataObj: sentData,
    }).then(res => {
      this.logger.m('Sync').log('res', res);
    });
  }

  delete() {
    return this.apiCall({
      type: 'DELETE',
      path: `${this.type}/${this.ids.mal}/my_list_status`,
    });
  }

  public async fillRelations(): Promise<void> {
    const cacheObj = new Cache(`fillRelations/${this.ids.mal}/${this.getType()}`, 7 * 24 * 60 * 60 * 1000);

    return cacheObj.hasValueAndIsNotEmpty().then(exists => {
      if (!exists) {
        return malToAnilist(this.ids.mal, this.getType()!).then(el => {
          if (el && parseInt(el)) {
            this.ids.ani = parseInt(el);
          }
          return cacheObj.setValue({ da: el });
        });
      }
      return cacheObj.getValue().then(res => {
        if (res && res.da && parseInt(res.da)) {
          this.ids.ani = parseInt(res.da);
        }
      });
    });
  }

  apiCall = helper.apiCall;
}

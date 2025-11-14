import { SingleAbstract } from '../singleAbstract';
import { NotAuthenticatedError, UrlNotSupportedError } from '../Errors';
import * as helper from './helper';
import * as definitions from '../definitions';
import { malToAnilist } from '../AniList/helper';
import { Cache } from '../../utils/Cache';

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
    throw new UrlNotSupportedError(url);
  }

  getCacheKey() {
    return this.ids.mal;
  }

  getPageId() {
    return this.ids.mal;
  }

  _getStatus() {
    let curSt;
    if (this.type === 'manga') {
      curSt = parseInt(helper.mangaStatus[this.animeInfo.my_list_status.status]);
    } else {
      curSt = parseInt(helper.animeStatus[this.animeInfo.my_list_status.status]);
    }
    if (this.getRewatching() && curSt === definitions.status.Completed) {
      return definitions.status.Rewatching;
    }
    return curSt;
  }

  _setStatus(status) {
    if (status === definitions.status.Rewatching) {
      status = definitions.status.Completed;
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

  increaseRewatchCount(): void {
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.num_times_reread++;
    } else {
      this.animeInfo.my_list_status.num_times_rewatched++;
    }
  }

  _getStartDate() {
    return helper.getRoundedDate(this.animeInfo.my_list_status.start_date);
  }

  _setStartDate(startDate) {
    this.animeInfo.my_list_status.start_date = startDate;
  }

  _getFinishDate() {
    return helper.getRoundedDate(this.animeInfo.my_list_status.finish_date);
  }

  _setFinishDate(finishDate) {
    this.animeInfo.my_list_status.finish_date = finishDate;
  }

  _getRewatchCount() {
    if (this.type === 'manga') {
      return this.animeInfo.my_list_status.num_times_reread;
    }
    return this.animeInfo.my_list_status.num_times_rewatched;
  }

  _setRewatchCount(rewatchCount) {
    if (this.type === 'manga') {
      this.animeInfo.my_list_status.num_times_reread = rewatchCount;
    } else {
      this.animeInfo.my_list_status.num_times_rewatched = rewatchCount;
    }
  }

  _getScore() {
    return this.animeInfo.my_list_status.score;
  }

  _setScore(score) {
    this.animeInfo.my_list_status.score = score;
  }

  _getAbsoluteScore() {
    return this.getScore() * 10;
  }

  _setAbsoluteScore(score) {
    if (!score) {
      this.setScore(0);
      return;
    }
    if (score < 10) {
      this.setScore(1);
      return;
    }

    this.setScore(Math.round(score / 10));
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
    return this.animeInfo.main_picture?.medium ?? '';
  }

  _getRating() {
    return Promise.resolve(this.animeInfo.mean);
  }

  async _update() {
    return this.apiCall({
      type: 'GET',
      path: `${this.type}/${this.ids.mal}`,
      fields: [
        'my_list_status{tags,is_rewatching,is_rereading,num_times_rewatched,num_times_reread,start_date,finish_date}',
        'num_episodes',
        'mean',
        // Manga
        'num_chapters',
        'num_volumes',
      ],
    })
      .catch(e => {
        if (e instanceof NotAuthenticatedError) {
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
              num_times_reread: 0,
              score: 0,
              status: 'plan_to_read',
              tags: [],
            };
          } else {
            this.animeInfo.my_list_status = {
              is_rewatching: false,
              num_watched_episodes: 0,
              num_times_rewatched: 0,
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
          this.animeInfo.my_list_status.num_watched_episodes =
            this.animeInfo.my_list_status.num_episodes_watched;
          delete this.animeInfo.my_list_status.num_episodes_watched;
        }
      });
  }

  async _sync() {
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
          sentData[property] = this.animeInfo.my_list_status[property];
          break;
        case 'start_date':
        case 'finish_date':
          sentData[property] = this.animeInfo.my_list_status[property] ?? '';
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

  _delete() {
    return this.apiCall({
      type: 'DELETE',
      path: `${this.type}/${this.ids.mal}/my_list_status`,
    });
  }

  public async fillRelations(): Promise<void> {
    const cacheObj = new Cache(
      `fillRelations/${this.ids.mal}/${this.getType()}`,
      7 * 24 * 60 * 60 * 1000,
    );

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

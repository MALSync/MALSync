import { SingleAbstract } from '../singleAbstract';
import { urlToSlug } from '../../utils/slugs';
import * as definitions from '../definitions';
import * as helper from './helper';
import { NotFoundError, UrlNotSupportedError } from '../Errors';
import { point10 } from '../ScoreMode/point10';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#3db4f2');
    return this;
  }

  private animeMeta?: helper.MetaRequest;

  private animeInfo?: helper.StatusRequest;

  shortName = 'Shiki';

  authenticationUrl = helper.authUrl;

  protected datesSupport = false;

  protected handleUrl(url) {
    const { path } = urlToSlug(url);
    if (path?.provider === 'SHIKI' || path?.provider === 'MAL') {
      this.type = path.type;
      this.ids.mal = Number(path.id);
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
    return helper.statusTranslate[this.animeInfo!.status];
  }

  _setStatus(status) {
    if (status === definitions.status.Considering && !this.supportsConsidering()) {
      status = definitions.status.PlanToWatch;
    }
    this.animeInfo!.status = helper.statusTranslate[status] as helper.StatusType;
  }

  _getStartDate(): never {
    throw new Error('Shikimori does not support Start Date');
  }

  _setStartDate(startDate) {
    throw new Error('Shikimori does not support Start Date');
  }

  _getFinishDate(): never {
    throw new Error('Shikimori does not support Finish Date');
  }

  _setFinishDate(finishDate) {
    throw new Error('Shikimori does not support Finish Date');
  }

  _getRewatchCount() {
    return this.animeInfo!.rewatches;
  }

  _setRewatchCount(rewatchCount) {
    this.animeInfo!.rewatches = rewatchCount;
  }

  _getScore() {
    return this.animeInfo!.score;
  }

  _setScore(score) {
    this.animeInfo!.score = score;
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
      return this.animeInfo!.chapters;
    }
    return this.animeInfo!.episodes;
  }

  _setEpisode(episode) {
    if (this.type === 'manga') {
      this.animeInfo!.chapters = parseInt(`${episode}`);
      return;
    }
    this.animeInfo!.episodes = parseInt(`${episode}`);
  }

  _getVolume() {
    return this.animeInfo!.volumes;
  }

  _setVolume(volume) {
    this.animeInfo!.volumes = volume;
  }

  _getTags() {
    let tags = this.animeInfo!.text;
    if (tags === null || tags === 'null') tags = '';
    return tags;
  }

  _setTags(tags) {
    this.animeInfo!.text = tags;
  }

  _getTitle() {
    return helper.title(this.animeMeta!.russian, this.animeMeta!.name);
  }

  _getTotalEpisodes() {
    const eps = this.type === 'anime' ? this.animeMeta!.episodes : this.animeMeta!.chapters;
    if (!eps) return 0;
    return eps;
  }

  _getTotalVolumes() {
    const vol = this.animeMeta!.volumes;
    if (!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return this.animeMeta?.url ? `${helper.domain}${this.animeMeta.url}` : this.url;
  }

  _getImage() {
    return this.animeMeta?.image.preview ? `${helper.domain}${this.animeMeta.image.preview}` : '';
  }

  _getRating() {
    return Promise.resolve(this.animeMeta!.score);
  }

  async _update() {
    const userId = await helper.userId();

    const metadata = await helper.apiCall({
      path: `${this.type}s/${this.ids.mal}`,
      type: 'GET',
    });

    this._authenticated = true;

    if (!metadata.id) {
      throw new NotFoundError(this.url);
    }

    this.animeMeta = metadata;

    const rating = await helper.apiCall({
      path: 'v2/user_rates',
      type: 'GET',
      parameter: {
        target_id: this.ids.mal,
        user_id: userId,
        target_type: this.type === 'anime' ? 'Anime' : 'Manga',
      },
    });

    if (!rating.length) {
      this._onList = false;
      this.animeInfo = {
        user_id: userId,
        target_id: this.ids.mal,
        target_type: this.type === 'anime' ? 'Anime' : 'Manga',
        score: 0,
        status: 'planned',
        rewatches: 0,
        episodes: 0,
        volumes: 0,
        chapters: 0,
        text: '',
      };
    } else {
      this._onList = true;
      [this.animeInfo] = rating;
    }

    return Promise.resolve();
  }

  async _sync() {
    const mode = this._onList ? 'PUT' : 'POST';
    const path = this._onList ? `v2/user_rates/${this.animeInfo!.id}` : 'v2/user_rates';

    return helper.apiCall({
      type: mode,
      path,
      dataObj: {
        user_rate: this.animeInfo,
      },
    });
  }

  public getScoreMode() {
    return point10;
  }

  _delete() {
    return helper.apiCall({
      type: 'DELETE',
      path: `v2/user_rates/${this.animeInfo!.id}`,
    });
  }
}

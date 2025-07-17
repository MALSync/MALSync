import * as helper from './helper';
import * as definitions from '../definitions';
import { SingleAbstract } from '../singleAbstract';
import { NotFoundError, UrlNotSupportedError } from '../Errors';
import { point10 } from '../ScoreMode/point10';
import { Queries, authUrl } from './queries';
import { statusTranslate } from './types';
import type { Anime, Manga, UserRateStatusEnum, UserRateV2 } from './types';

// TODO - Rewrite this when GRAPHQL updates.
export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#3db4f2');
    return this;
  }

  private userRate?: UserRateV2;

  private metaInfo?: Anime | Manga;

  shortName = 'Shiki';

  datesSupport = false;

  authenticationUrl = authUrl;

  protected handleUrl(url: string) {
    if (url.match(/shikimori\.one\/(animes|mangas|ranobe)\/\D?\d+/i)) {
      this.type = utils.urlPart(url, 3) === 'animes' ? 'anime' : 'manga';
      const res = utils.urlPart(url, 4).match(/^\D?(\d+)/);
      if (res && res[1]) {
        this.ids.mal = Number(res[1]);
        return;
      }
    }
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
    return Number(statusTranslate[this.userRate!.status]);
  }

  _setStatus(status: definitions.status) {
    this.userRate!.status = statusTranslate[status] as UserRateStatusEnum;
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
    return this.userRate!.rewatches;
  }

  _setRewatchCount(rewatchCount) {
    this.userRate!.rewatches = rewatchCount;
  }

  _getScore() {
    return this.userRate!.score;
  }

  _setScore(score: number) {
    this.userRate!.score = score;
  }

  _getAbsoluteScore() {
    return this.getScore() * 10;
  }

  _setAbsoluteScore(score: definitions.score100) {
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
      return this.userRate!.chapters;
    }
    return this.userRate!.episodes;
  }

  _setEpisode(episode: number) {
    if (this.type === 'manga') {
      this.userRate!.chapters = episode;
      return;
    }
    this.userRate!.episodes = episode;
  }

  _getVolume() {
    return this.userRate!.volumes;
  }

  _setVolume(volume: number) {
    this.userRate!.volumes = volume;
  }

  _getTags() {
    return this.userRate!.text || '';
  }

  _setTags(tags: string) {
    this.userRate!.text = tags;
  }

  _getTitle() {
    return helper.title(
      this.metaInfo!.russian || '',
      this.metaInfo!.english || this.metaInfo!.name,
    );
  }

  _getTotalEpisodes() {
    return this.type === 'manga'
      ? (this.metaInfo as Manga).chapters || 0
      : (this.metaInfo as Anime).episodes || 0;
  }

  _getTotalVolumes() {
    return (this.metaInfo as Manga).volumes || 0;
  }

  _getDisplayUrl() {
    return this.metaInfo!.url || this.url;
  }

  _getImage() {
    if (!this.metaInfo!.poster) return '';
    return this.metaInfo!.poster.mainUrl || this.metaInfo!.poster.originalUrl || '';
  }

  _getRating() {
    return Promise.resolve(`${this.metaInfo!.score || 0}`);
  }

  async _update() {
    const userId = await helper.userIDRequest();
    const meta =
      this.type === 'anime'
        ? await Queries.Anime(`${this.ids.mal}`)
        : await Queries.Manga(`${this.ids.mal}`);
    if (!meta) throw new NotFoundError(this.url);
    this.metaInfo = meta;

    const currentUserRate = await Queries.UserRateGet(
      Number(userId),
      this.ids.mal,
      this.type === 'anime' ? 'Anime' : 'Manga',
    );

    if (!currentUserRate) {
      this._onList = false;
      this.userRate = {
        id: '',
        user_id: Number(userId),
        target_id: this.ids.mal,
        target_type: this.type === 'anime' ? 'Anime' : 'Manga',
        score: 0,
        status: 'planned',
        episodes: 0,
        chapters: 0,
        rewatches: 0,
        volumes: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };
    } else {
      this._onList = true;
      this.userRate = currentUserRate;
      if (this.type === 'anime') {
        this.metaInfo = meta as Anime;
      } else {
        this.metaInfo = meta as Manga;
      }
    }

    this._authenticated = true;

    return Promise.resolve();
  }

  async _sync() {
    if (!this.userRate) {
      return;
    }
    if (this._onList) {
      await Queries.UserRateUpdate(this.userRate);
    } else {
      await Queries.UserRateAdd(this.userRate);
    }
  }

  public getScoreMode() {
    return point10;
  }

  async _delete() {
    if (!this.userRate) {
      return;
    }
    await Queries.UserRateDelete(this.userRate.id);
  }
}

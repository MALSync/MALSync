import { SingleAbstract } from '../singleAbstract';
import { UrlNotSupportedError } from '../Errors';
import * as definitions from '../definitions';

// local://crunchyroll/anime/nogamenolife

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, 'black');
    return this;
  }

  private animeInfo: any;

  protected key!: string;

  protected id!: string;

  protected page!: string;

  protected title!: string;

  shortName = 'Local';

  authenticationUrl = '';

  protected rewatchingSupport = false;

  protected datesSupport = false;

  protected handleUrl(url) {
    if (url.match(/local:\/\/.*/i)) {
      this.id = utils.urlPart(url, 4);
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.page = utils.urlPart(url, 2);
      this.key = `local://${this.page}/${this.type}/${this.id}`;

      if (utils.urlPart(url, 5)) {
        this.title = decodeURIComponent(utils.urlPart(url, 5));
      } else {
        this.title = 'Unknown';
      }
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  getCacheKey() {
    return `local:${this.id}:${this.page}`;
  }

  getPageId() {
    return this.getCacheKey();
  }

  _getStatus() {
    return this.animeInfo.status;
  }

  _setStatus(status) {
    if (status === definitions.status.Rewatching && !this.supportsRewatching()) {
      status = definitions.status.Watching;
    }
    this.animeInfo.status = status;
  }

  _getStartDate(): never {
    throw new Error('Local sync does not support Start Date');
  }

  _setStartDate(startDate) {
    throw new Error('Local sync does not support Start Date');
  }

  _getFinishDate(): never {
    throw new Error('Local sync does not support Finish Date');
  }

  _setFinishDate(finishDate) {
    throw new Error('Local sync does not support Finish Date');
  }

  _getRewatchCount(): never {
    throw new Error('Local sync does not support Rewatch Count');
  }

  _setRewatchCount(rewatchCount) {
    throw new Error('Local sync does not support Rewatch Count');
  }

  _getScore() {
    return this.animeInfo.score;
  }

  _setScore(score) {
    this.animeInfo.score = score;
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
    return this.animeInfo.progress;
  }

  _setEpisode(episode) {
    this.animeInfo.progress = parseInt(`${episode}`);
  }

  _getVolume() {
    return this.animeInfo.volumeprogress;
  }

  _setVolume(volume) {
    this.animeInfo.volumeprogress = volume;
  }

  _getTags() {
    let { tags } = this.animeInfo;
    if (!tags) tags = '';
    return tags;
  }

  _setTags(tags) {
    this.animeInfo.tags = tags;
  }

  _getTitle(raw = false) {
    if (raw) return this.animeInfo.name;
    return `[L] ${this.animeInfo.name}`;
  }

  _getTotalEpisodes() {
    return 0;
  }

  _getTotalVolumes() {
    return 0;
  }

  _getDisplayUrl() {
    return 'https://github.com/MALSync/MALSync/wiki/Local-Sync';
  }

  _getImage() {
    if (this.animeInfo && this.animeInfo.image) return this.animeInfo.image;
    return '';
  }

  setImage(url: string) {
    const hasImage = Boolean(this.animeInfo.image);
    this.animeInfo.image = url;
    if (this._onList && !hasImage) this.sync();
  }

  _getRating() {
    return Promise.resolve('Local');
  }

  async _update() {
    this._authenticated = true;

    this.animeInfo = await api.storage.get(this.key);

    this._onList = true;

    if (!this.animeInfo) {
      this._onList = false;
      this.animeInfo = {
        name: this.title,
        tags: '',
        sUrl: '',
        image: '',
        progress: 0,
        volumeprogress: 0,
        score: 0,
        status: definitions.status.PlanToWatch,
      };
    }
  }

  async _sync() {
    return api.storage.set(this.key, this.animeInfo);
  }

  _delete() {
    return api.storage.remove(this.key);
  }

  // Overload
  setStreamingUrl(streamingUrl: string): SingleAbstract {
    if (this.animeInfo && streamingUrl) this.animeInfo.sUrl = streamingUrl;
    return super.setStreamingUrl(streamingUrl);
  }

  getStreamingUrl(): string | undefined {
    if (this.animeInfo && this.animeInfo.sUrl) return this.animeInfo.sUrl;
    return super.getStreamingUrl();
  }
}

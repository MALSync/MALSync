import { SingleAbstract } from '../singleAbstract';
import { errorCode } from '../definitions';

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
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  getCacheKey() {
    return `local:${this.id}:${this.page}`;
  }

  _getStatus() {
    return this.animeInfo.status;
  }

  _setStatus(status) {
    this.animeInfo.status = status;
  }

  _getScore() {
    return this.animeInfo.score;
  }

  _setScore(score) {
    this.animeInfo.score = score;
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

  _getTitle() {
    return this.animeInfo.name;
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
    return Promise.resolve(api.storage.assetUrl('questionmark.gif'));
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
        progress: 0,
        volumeprogress: 0,
        score: 0,
        status: 6,
      };
    }
  }

  async _sync() {
    return api.storage.set(this.key, this.animeInfo);
  }

  delete() {
    return api.storage.remove(this.key);
  }
}

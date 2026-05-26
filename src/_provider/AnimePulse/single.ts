import { SingleAbstract } from '../singleAbstract';
import { UrlNotSupportedError } from '../Errors';
import * as helper from './helper';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#CC0000');
    return this;
  }

  private animeInfo: any = {};

  shortName = 'AnimePulse';

  authenticationUrl = 'https://myanimepulse.com/auth/extension';

  protected handleUrl(url: string) {
    if (url.match(/myanimepulse\.com\/anime\/\d+/i)) {
      this.type = 'anime';
      const match = url.match(/\/anime\/(\d+)/);
      if (match) this.ids.mal = Number(match[1]);
      return;
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

  _getDisplayUrl() {
    return `https://myanimepulse.com/anime/${this.ids.mal}`;
  }

  _getStatus() {
    return parseInt(String(helper.translateList(this.animeInfo.status)));
  }

  _setStatus(status: number) {
    this.animeInfo.status = helper.translateList('', status);
  }

  _getScore() {
    return this.animeInfo.score || 0;
  }

  _setScore(score: number) {
    this.animeInfo.score = score;
  }

  _getAbsoluteScore() {
    return this.animeInfo.score ? this.animeInfo.score * 10 : 0;
  }

  _setAbsoluteScore(score: number) {
    this.animeInfo.score = Math.round(score / 10);
  }

  _getEpisode() {
    return this.animeInfo.episode || 0;
  }

  _setEpisode(episode: number) {
    this.animeInfo.episode = episode;
  }

  _getVolume() {
    return 0;
  }

  _setVolume(_volume: number) {
    // AnimePulse is anime-only
  }

  _getTitle() {
    return this.animeInfo.title || '';
  }

  _getTotalEpisodes() {
    return this.animeInfo.totalEpisodes || 0;
  }

  _getTotalVolumes() {
    return 0;
  }

  _getImage() {
    return this.animeInfo.image || '';
  }

  _getRating() {
    return this.animeInfo.communityScore || '';
  }

  _getStartDate(): never {
    throw new Error('AnimePulse does not support start date');
  }

  _setStartDate(_date: any) {
    // not supported
  }

  _getFinishDate(): never {
    throw new Error('AnimePulse does not support finish date');
  }

  _setFinishDate(_date: any) {
    // not supported
  }

  _getRewatchCount() {
    return this.animeInfo.rewatchCount || 0;
  }

  _setRewatchCount(count: number) {
    this.animeInfo.rewatchCount = count;
  }

  _getTags() {
    return '';
  }

  _setTags(_tags: string) {
    // not supported
  }

  async _update(): Promise<void> {
    this.logger.log('Update', this.ids.mal);

    // Path route, not the /anime-list?animeId=... collection route, which
    // ignores the param and returns the whole list instead of one entry.
    const data = await helper.apiCall(`/anime-list/${this.ids.mal}`);

    if (data && data.entry) {
      this._onList = true;
      this.animeInfo.status = data.entry.status;
      this.animeInfo.score = data.entry.rating || 0;
      this.animeInfo.episode = data.entry.episodesWatched || 0;
      this.animeInfo.rewatchCount = data.entry.rewatchCount || 0;
    } else {
      // SingleAbstract only flips _onList true after a successful sync, so
      // the provider must report "not on list" from the read itself.
      this._onList = false;
    }

    try {
      const animeData = await helper.apiCall(`/anime/${this.ids.mal}`);
      if (animeData) {
        this.animeInfo.title = animeData.title || '';
        this.animeInfo.totalEpisodes = animeData.episodes || 0;
        this.animeInfo.image =
          animeData.images?.jpg?.large_image_url || animeData.image_url || '';
        this.animeInfo.communityScore = animeData.score || 0;
      }
    } catch (e) {
      this.logger.log('Metadata fetch failed (non-fatal)', e);
    }
  }

  async _sync(): Promise<void> {
    this.logger.log('Sync', this.ids.mal);

    // POST (not PATCH): PATCH can't create a new entry, so first-time
    // tracking would fail. POST upserts.
    await helper.apiCall(
      '/anime-list',
      {
        animeId: this.ids.mal,
        status: this.animeInfo.status,
        episodesWatched: this.animeInfo.episode,
        ...(this.animeInfo.score ? { rating: this.animeInfo.score } : {}),
      },
      'POST',
    );
  }

  async _delete(): Promise<void> {
    await helper.apiCall(`/anime-list/${this.ids.mal}`, {}, 'DELETE');
  }
}

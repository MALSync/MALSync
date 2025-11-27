import { SingleAbstract } from '../singleAbstract';
import { NotAutenticatedError, UrlNotSupportedError } from '../Errors';
import { point100 } from '../ScoreMode/point100';
import {
  authenticationUrl,
  bakaStateToState,
  call,
  logger,
  stateToBakaState,
  urls,
} from './helper';
import { BakaLibraryEntry, BakaSeries } from './types';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = logger;
    return this;
  }

  private libraryEntry: BakaLibraryEntry = null as unknown as BakaLibraryEntry;

  private displayUrl = '';

  shortName = 'MangaBaka';

  authenticationUrl = authenticationUrl;

  protected handleUrl(url) {
    if (url.match(/mangabaka\.dev\/\d*(\/|$)/i)) {
      this.type = 'manga';
      this.ids.baka = Number(utils.urlPart(url, 3));
      return;
    }
    if (url.match(/anilist\.co\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.ani = Number(utils.urlPart(url, 4));
      if (this.type !== 'manga') {
        throw new Error('MangaBaka only supports manga');
      }
      return;
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.mal = Number(utils.urlPart(url, 4));
      if (this.type !== 'manga') {
        throw new Error('MangaBaka only supports manga');
      }
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  getCacheKey() {
    return this.getKey(['MANGABAKA']);
  }

  getPageId() {
    return this.ids.baka;
  }

  _getStatus() {
    return bakaStateToState(this.libraryEntry.state!);
  }

  _setStatus(status) {
    this.libraryEntry.state = stateToBakaState(status)!;
  }

  _getStartDate() {//TODO:
    return '';
    //return helper.parseFuzzyDate(this.animeInfo.mediaListEntry.startedAt);
  }

  _setStartDate(startDate) {//TODO:
    return '';
    //this.animeInfo.mediaListEntry.startedAt = helper.getFuzzyDate(startDate);
  }

  _getFinishDate() {//TODO:
    return '';
    //return helper.parseFuzzyDate(this.animeInfo.mediaListEntry.completedAt);
  }

  _setFinishDate(finishDate) {//TODO:
    return '';
    //this.animeInfo.mediaListEntry.completedAt = helper.getFuzzyDate(finishDate);
  }

  _getRewatchCount() {
    return this.libraryEntry.number_of_rereads || 0;
  }

  _setRewatchCount(rewatchCount) {
    this.libraryEntry.number_of_rereads = rewatchCount || 0;
  }

  _getScore() {
    if (Number(this.libraryEntry.rating) === 0) return 0;
    const score = Math.round(Number(this.libraryEntry.rating) / 10);
    if (score === 0) return 1;
    return score;
  }

  _setScore(score) {
    this.libraryEntry.rating = score * 10;
  }

  _getAbsoluteScore() {
    return Number(this.libraryEntry.rating) || 0;
  }

  _setAbsoluteScore(score) {
    this.libraryEntry.rating = Number(score);
  }

  _getEpisode() {
    return this.libraryEntry.progress_chapter || 0;
  }

  _setEpisode(episode) {
    this.libraryEntry.progress_chapter = parseInt(`${episode}`);
  }

  _getVolume() {
    return this.libraryEntry.progress_volume || 0;
  }

  _setVolume(volume) {
    this.libraryEntry.progress_volume = parseInt(`${volume}`);
  }

  _getTags() {//TODO:
    return '';
    //let tags = this.animeInfo.mediaListEntry.notes;
    //if (tags === null || tags === 'null') tags = '';
    //return tags;
  }

  _setTags(tags) {//TODO:
    // this.animeInfo.mediaListEntry.notes = tags;
  }

  _getTitle() {
    return this.libraryEntry.Series.title;
  }

  _getTotalEpisodes() {
    return Number(this.libraryEntry.Series.total_chapters) || 0;
  }

  _getTotalVolumes() {
    return Number(this.libraryEntry.Series.final_volume) || 0;
  }

  _getDisplayUrl() {//TODO: Check
    return this.displayUrl !== '' && this.displayUrl !== null ? this.displayUrl : this.url;
  }

  _getImage() {
    return this.libraryEntry.Series.cover.x350.x2 || '';
  }

  _getRating() {
    return Promise.resolve(String(this.libraryEntry.Series.rating));
  }

  async _update() {
    // TODO: not on list handling

    this._authenticated = true;

    // TODO: Implement series caching. Fill cache on list fetch and related fetch?
    let seriesEntry: BakaSeries;
    if (this.ids.baka) {
      seriesEntry = (await call(urls.series(this.ids.baka))).data as BakaSeries;
    } else if (this.ids.ani) {
      seriesEntry = (await call(urls.seriesByAniId(this.ids.ani))).data.series[0] as BakaSeries;
    } else if (this.ids.mal) {
      seriesEntry = (await call(urls.seriesByMalId(this.ids.mal))).data.series[0] as BakaSeries;
    } else {
      throw new Error('No valid ID found');
    }

    this.ids.baka = seriesEntry.id;
    if (seriesEntry && seriesEntry.source) {
      const sources = seriesEntry.source;
      if (Number.isNaN(this.ids.mal) && sources.my_anime_list.id) {
        this.ids.mal = sources.my_anime_list.id;
      }
      if (Number.isNaN(this.ids.ani) && sources.anilist.id) {
        this.ids.ani = sources.anilist.id;
      }
      if (Number.isNaN(this.ids.kitsu.id) && sources.kitsu.id) {
        this.ids.kitsu.id = sources.kitsu.id;
      }
    }

    this.displayUrl = `https://mangabaka.dev/${seriesEntry.id}`;

    let json = (await call(urls.libraryEntry(seriesEntry.id))).data as BakaLibraryEntry;

    this.logger.log('[SINGLE]', 'Data', json);

    this._onList = true;
    if (!json) {
      this._onList = false;

      json = {
        finish_date: undefined,
        id: 128425,
        is_private: false,
        note: undefined,
        number_of_rereads: undefined,
        priority: 20,
        progress_chapter: undefined,
        progress_volume: undefined,
        rating: undefined,
        read_link: undefined,
        series_id: seriesEntry.id,
        start_date: undefined,
        state: 'plan_to_read',
        user_id: undefined!,
        Series: seriesEntry,
      };
    }

    json.Series = seriesEntry;
    this.libraryEntry = json;

    if (!this._authenticated) throw new NotAutenticatedError('Not Authenticated');
  }

  async _sync() {
    throw new Error('Not implemented yet');
  }

  public getScoreMode() {
    return point100;
  }

  _delete() {
    throw new Error('Not implemented yet');
    return Promise.resolve();
  }
}

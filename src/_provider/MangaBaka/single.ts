import { SingleAbstract } from '../singleAbstract';
import { NotAutenticatedError, NotFoundError, UrlNotSupportedError } from '../Errors';
import { point100 } from '../ScoreMode/point100';
import {
  authenticationUrl,
  bakaStateToState,
  call,
  dateToTimestamp,
  getImageUrl,
  logger,
  stateToBakaState,
  timestampToDate,
  urls,
} from './helper';
import { BakaLibraryEntry, BakaLibraryEntryUpdate, BakaSeries } from './types';
import { getSeries } from './seriesService';

export class Single extends SingleAbstract {
  consideringSupport = true;

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
    if (url.match(/mangabaka\.(dev|org)\/\d*(\/|$)/i)) {
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

  _getStartDate() {
    if (!this.libraryEntry.start_date) return null;
    return timestampToDate(this.libraryEntry.start_date);
  }

  _setStartDate(startDate) {
    if (!startDate) {
      this.libraryEntry.start_date = null;
      return;
    }
    this.libraryEntry.start_date = dateToTimestamp(startDate)!;
  }

  _getFinishDate() {
    if (!this.libraryEntry.finish_date) return null;
    return timestampToDate(this.libraryEntry.finish_date);
  }

  _setFinishDate(finishDate) {
    if (!finishDate) {
      this.libraryEntry.finish_date = null;
      return;
    }
    this.libraryEntry.finish_date = dateToTimestamp(finishDate)!;
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

  _getTags() {
    let tags = this.libraryEntry.note;
    if (!tags || tags === 'null') tags = '';
    return tags;
  }

  _setTags(tags) {
    this.libraryEntry.note = tags;
  }

  public getStreamingUrl(): string | undefined {
    if (this.libraryEntry.read_link) {
      return this.libraryEntry.read_link;
    }

    return super.getStreamingUrl();
  }

  public setStreamingUrl(streamingUrl: string): SingleAbstract {
    if (streamingUrl) {
      let isValid;
      try {
        isValid = !!new URL(streamingUrl);
      } catch (e) {
        isValid = false;
      }
      if (isValid) this.libraryEntry.read_link = streamingUrl;
    }

    return super.setStreamingUrl(streamingUrl);
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

  _getDisplayUrl() {
    return this.displayUrl !== '' && this.displayUrl !== null ? this.displayUrl : this.url;
  }

  _getImage() {
    return getImageUrl(this.libraryEntry.Series, 'large');
  }

  _getRating() {
    if (!this.libraryEntry.Series.rating) {
      return Promise.resolve('');
    }
    return Promise.resolve(String(this.libraryEntry.Series.rating.toFixed(0)));
  }

  finishedAiring() {
    return ['cancelled', 'completed'].includes(this.libraryEntry.Series.status);
  }

  public forceSeries: BakaSeries | null = null;

  public forceLibraryEntry: BakaLibraryEntry | null = null;

  async _update() {
    this._authenticated = true;

    let seriesEntry: BakaSeries | null;
    if (this.forceSeries) {
      seriesEntry = this.forceSeries;
    } else {
      seriesEntry = await getSeries(this.ids);
    }

    if (!seriesEntry) {
      throw new NotFoundError('Series not found');
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

    this.displayUrl = `https://mangabaka.org/${seriesEntry.id}`;

    let json: BakaLibraryEntry | null = null;

    if (this.forceLibraryEntry || this.forceSeries) {
      json = this.forceLibraryEntry;
    } else {
      try {
        json = (await call(urls.libraryEntry(seriesEntry.id))).data as BakaLibraryEntry;
      } catch (e) {
        if (e instanceof NotAutenticatedError) {
          this._authenticated = false;
          this.logger.m('Api').info(e.message);
          json = null;
        } else if (e instanceof NotFoundError) {
          this.logger.m('Api').info(e.message);
          json = null;
        } else {
          throw e;
        }
      }
    }

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

    if (!this.libraryEntry.start_date) this.libraryEntry.start_date = undefined;
    if (!this.libraryEntry.finish_date) this.libraryEntry.finish_date = undefined;

    if (!this._authenticated) throw new NotAutenticatedError('Not Authenticated');
  }

  async _sync() {
    const entryToSend: BakaLibraryEntryUpdate = {
      progress_chapter: this.libraryEntry.progress_chapter,
      progress_volume: this.libraryEntry.progress_volume,
      start_date: this.libraryEntry.start_date,
      finish_date: this.libraryEntry.finish_date,
      number_of_rereads: this.libraryEntry.number_of_rereads,
      read_link: this.libraryEntry.read_link,
    };

    if (this.isValueDirty('score')) {
      entryToSend.rating = this.libraryEntry.rating;
    }

    if (this.isValueDirty('status')) {
      entryToSend.state = this.libraryEntry.state;
    }

    if (this.isValueDirty('tags')) {
      entryToSend.note = this.libraryEntry.note;
    }

    let method: 'PATCH' | 'POST' = 'PATCH';
    if (!this._onList) {
      method = 'POST';
    }

    return call(urls.libraryEntry(this.ids.baka), entryToSend, method);
  }

  public getScoreMode() {
    return point100;
  }

  _delete() {
    return call(urls.libraryEntry(this.ids.baka), {}, 'DELETE');
  }
}

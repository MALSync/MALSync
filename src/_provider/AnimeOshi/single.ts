import { SingleAbstract } from '../singleAbstract';
import { buildProviderUrl, urlToSlug } from '../../utils/slugs';
import { NotAutenticatedError, NotFoundError, UrlNotSupportedError } from '../Errors';
import * as definitions from '../definitions';
import {
  authenticationUrl,
  call,
  finishedAiring,
  logger,
  oshiStatusToState,
  oshimeterScore,
  OshiAnime,
  OshiWatchlistEntry,
  publicCall,
  stateToMalStatus,
  titleFromSlug,
  urls,
} from './helper';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = logger();
    return this;
  }

  shortName = 'AnimeOshi';

  authenticationUrl = authenticationUrl;

  protected rewatchingSupport = false;

  protected datesSupport = false;

  private anime: OshiAnime = null as unknown as OshiAnime;

  private entry: OshiWatchlistEntry | null = null;

  private curStatus: definitions.status = definitions.status.PlanToWatch;

  private curEpisode = 0;

  protected handleUrl(url) {
    const { path } = urlToSlug(url);
    if (path?.provider === 'ANIMEOSHI') {
      this.type = 'anime';
      this.ids.oshi = path.id;
      return;
    }
    if (path?.provider === 'MAL' || path?.provider === 'ANILIST') {
      this.type = path.type;
      if (this.type !== 'anime') {
        throw new UrlNotSupportedError('AnimeOshi has no manga support');
      }
      if (path.provider === 'MAL') {
        this.ids.mal = Number(path.id);
      } else {
        this.ids.ani = Number(path.id);
      }
      return;
    }
    throw new UrlNotSupportedError(url);
  }

  getCacheKey() {
    return this.getKey(['ANIMEOSHI']);
  }

  getPageId() {
    return this.ids.oshi;
  }

  _getStatus() {
    return this.curStatus;
  }

  _setStatus(status) {
    this.curStatus = status;
  }

  _getStartDate(): never {
    throw new Error('AnimeOshi does not support Start Date');
  }

  _setStartDate(startDate) {
    throw new Error('AnimeOshi does not support Start Date');
  }

  _getFinishDate(): never {
    throw new Error('AnimeOshi does not support Finish Date');
  }

  _setFinishDate(finishDate) {
    throw new Error('AnimeOshi does not support Finish Date');
  }

  _getRewatchCount(): never {
    throw new Error('AnimeOshi does not support Rewatch Count');
  }

  _setRewatchCount(rewatchCount) {
    throw new Error('AnimeOshi does not support Rewatch Count');
  }

  _getScore() {
    return 0;
  }

  _setScore(score) {
    this.logger.error('AnimeOshi does not support setting a score');
  }

  _getAbsoluteScore() {
    return 0;
  }

  _setAbsoluteScore(score) {
    this.logger.error('AnimeOshi does not support setting a score');
  }

  _getEpisode() {
    return this.curEpisode;
  }

  _setEpisode(episode) {
    this.curEpisode = parseInt(`${episode}`) || 0;
  }

  _getVolume() {
    return 0;
  }

  _setVolume(volume) {
    this.logger.error('You cant set Volumes for animes');
  }

  _getTags() {
    return '';
  }

  _setTags(tags) {
    this.logger.error('AnimeOshi does not support tags');
  }

  _getTitle() {
    return this.entry?.title || titleFromSlug(this.anime.slug);
  }

  _getTotalEpisodes() {
    return this.anime.episode_count || 0;
  }

  _getTotalVolumes() {
    return 0;
  }

  _getDisplayUrl() {
    return this.anime?.url || buildProviderUrl('ANIMEOSHI', 'anime', this.ids.oshi);
  }

  _getImage() {
    return this.anime.image || '';
  }

  _getRating() {
    return Promise.resolve(oshimeterScore(this.anime));
  }

  finishedAiring() {
    return finishedAiring(this.anime.status);
  }

  async _update() {
    this._authenticated = true;

    this.anime = await this.getAnime();

    this.ids.oshi = this.anime.slug;
    if (Number.isNaN(this.ids.mal) && this.anime.mal_id) this.ids.mal = this.anime.mal_id;
    if (Number.isNaN(this.ids.ani) && this.anime.anilist_id) this.ids.ani = this.anime.anilist_id;

    this.entry = null;
    try {
      const list: OshiWatchlistEntry[] = await call(urls.watchlist({ anime_id: this.anime.id }));
      [this.entry = null] = list || [];
    } catch (e) {
      if (e instanceof NotAutenticatedError) {
        this._authenticated = false;
        this.logger.m('Api').info(e.message);
      } else {
        throw e;
      }
    }

    this.logger.log('[SINGLE]', 'Data', this.anime, this.entry);

    this._onList = Boolean(this.entry);
    this.curStatus = this.entry
      ? oshiStatusToState(this.entry.status)
      : definitions.status.PlanToWatch;
    this.curEpisode = this.entry?.episode_count || 0;

    if (!this._authenticated) throw new NotAutenticatedError('Not Authenticated');
  }

  private async getAnime(): Promise<OshiAnime> {
    let anime: OshiAnime | null;
    if (this.ids.oshi) {
      anime = await publicCall(urls.animeByIdentifier(this.ids.oshi));
    } else if (this.ids.mal) {
      anime = await publicCall(urls.animeByExternalId({ mal: this.ids.mal }));
    } else if (this.ids.ani) {
      anime = await publicCall(urls.animeByExternalId({ anilist: this.ids.ani }));
    } else {
      throw new UrlNotSupportedError(this.url);
    }
    if (!anime) throw new NotFoundError('Anime not found');
    return anime;
  }

  async _sync() {
    return call(
      urls.watchlist(),
      {
        anime_id: this.ids.oshi,
        mal_status: stateToMalStatus(this.curStatus),
        episode_number: this.curEpisode,
      },
      'POST',
    );
  }

  async _delete() {
    return call(urls.watchlistEntry(this.ids.oshi), undefined, 'DELETE');
  }
}

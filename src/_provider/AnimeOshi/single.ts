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
  stateToOshiStatus,
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

  private entry: OshiWatchlistEntry = null as unknown as OshiWatchlistEntry;

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
    return oshiStatusToState(this.entry.status);
  }

  _setStatus(status) {
    this.entry.status = stateToOshiStatus(status)!;
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
    return Math.round(this._getAbsoluteScore() / 10);
  }

  _setScore(score) {
    this._setAbsoluteScore(score * 10);
  }

  _getAbsoluteScore() {
    return this.entry.user_rating?.score || 0;
  }

  _setAbsoluteScore(score) {
    const rounded = Math.round(Number(score) / 10) * 10;
    if (this.entry.user_rating) {
      this.entry.user_rating.score = rounded;
      return;
    }
    this.entry.user_rating = { score: rounded, verified: false, rate_date: null };
  }

  _getEpisode() {
    return this.entry.episode_count || 0;
  }

  _setEpisode(episode) {
    this.entry.episode_count = parseInt(`${episode}`) || 0;
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
    return this.entry.title;
  }

  _getTotalEpisodes() {
    return this.entry.total_episodes || 0;
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

    let entry: OshiWatchlistEntry | null = null;
    try {
      const list: OshiWatchlistEntry[] = await call(urls.watchlist({ anime_id: this.anime.id }));
      [entry = null] = list || [];
    } catch (e) {
      if (e instanceof NotAutenticatedError) {
        this._authenticated = false;
        this.logger.m('Api').info(e.message);
      } else {
        throw e;
      }
    }

    this.logger.log('[SINGLE]', 'Data', this.anime, entry);

    this._onList = Boolean(entry);
    if (!entry) {
      entry = {
        anime_id: this.anime.id,
        title: titleFromSlug(this.anime.slug),
        slug: this.anime.slug,
        image: this.anime.image,
        url: this.anime.url,
        mal_id: this.anime.mal_id,
        anilist_id: this.anime.anilist_id,
        status: 'Want to Watch',
        episode_count: 0,
        total_episodes: this.anime.episode_count,
        user_rating: null,
        updated_at: null,
        cursor: '',
      };
    }
    this.entry = entry;

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
    const res = await call(
      urls.watchlist(),
      {
        anime_id: this.entry.anime_id,
        status: this.entry.status,
        episode_number: this.entry.episode_count,
      },
      'POST',
    );

    if (this.isValueDirty('score')) await this.syncRating();

    return res;
  }

  private async syncRating() {
    const score = this.entry.user_rating?.score;
    if (!score) return;

    if (!this.finishedAiring()) {
      this.logger.error('Score not synced, AnimeOshi only rates completed anime');
      return;
    }

    await call(urls.rating(), { anime_id: this.entry.anime_id, score }, 'POST');
  }

  async _delete() {
    return call(urls.watchlistEntry(this.entry.anime_id), undefined, 'DELETE');
  }
}

import { ListAbstract, listElement } from '../listAbstract';
import { NotAutenticatedError } from '../Errors';
import {
  authenticationUrl,
  call,
  oshiStatusToState,
  OshiWatchlistEntry,
  stateToOshiStatus,
  urls,
} from './helper';

export class UserList extends ListAbstract {
  name = 'AnimeOshi';

  authenticationUrl = authenticationUrl;

  supportsTags = false;

  private cursor: string | undefined;

  async getUserObject() {
    const json = (await call(urls.profile())) as {
      username: string | null;
      avatar: string | null;
    };
    if (!json || !json.username) throw new NotAutenticatedError('Not Authenticated');
    return {
      username: json.username,
      picture: json.avatar || '',
      href: `https://www.animeoshi.com/profile/${json.username}`,
    };
  }

  deauth() {
    return api.settings
      .set('animeoshiToken', '')
      .then(() => api.settings.set('animeoshiRefresh', ''));
  }

  _getSortingOptions() {
    return [];
  }

  async getPart() {
    if (this.listType !== 'anime') {
      throw new Error('AnimeOshi only supports anime');
    }

    let limit = 100;
    if (this.modes.frontend && !this.modes.sortAiring) {
      limit = 24;
    }

    const json: OshiWatchlistEntry[] =
      (await call(
        urls.watchlist({
          status: stateToOshiStatus(this.status),
          cursor: this.cursor,
          limit,
        }),
      )) || [];

    if (json.length < limit) {
      this.done = true;
    } else {
      this.cursor = json[json.length - 1].cursor;
    }

    return this.prepareData(json);
  }

  public async prepareData(data: OshiWatchlistEntry[]): Promise<listElement[]> {
    return Promise.all(
      data.map(el =>
        this.fn({
          uid: el.anime_id,
          malId: el.mal_id,
          apiCacheKey: el.mal_id! || el.anilist_id!,
          cacheKey: el.mal_id || `animeoshi:${el.anime_id}`,
          type: 'anime',
          title: el.title,
          url: el.url,
          score: el.user_rating?.score ? Math.round(el.user_rating.score / 10) : 0,
          watchedEp: el.episode_count || 0,
          totalEp: el.total_episodes || 0,
          status: oshiStatusToState(el.status),
          startDate: null,
          finishDate: null,
          rewatchCount: 0,
          image: el.image || '',
          imageLarge: el.image || '',
          tags: '',
        }),
      ),
    );
  }
}

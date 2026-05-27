import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  name = 'MyAnimePulse';

  authenticationUrl = 'https://myanimepulse.com/auth/extension';

  async getPart(): Promise<any> {
    this.logger.log('UserList', 'getPart', this.status, this.offset);

    const statusMap: Record<number, string> = {
      1: 'WATCHING',
      2: 'COMPLETED',
      3: 'ON_HOLD',
      4: 'DROPPED',
      6: 'PLAN_TO_WATCH',
      7: 'ALL',
    };

    const pulseStatus = statusMap[this.status] || 'ALL';
    const statusParam = pulseStatus !== 'ALL' ? `&status=${pulseStatus}` : '';

    const data = await helper.apiCall(`/anime-list?offset=${this.offset}&limit=50${statusParam}`);

    if (!data || !Array.isArray(data) || data.length === 0) {
      this.done = true;
      return [];
    }

    // If we got less than 50, we're done
    if (data.length < 50) {
      this.done = true;
    }

    const retList: listElement[] = data.map((entry: any) => ({
      uid: entry.animeId,
      malId: entry.animeId,
      apiCacheKey: entry.animeId,
      cacheKey: helper.getCacheKey(entry.animeId),
      type: 'anime' as const,
      title: entry.anime?.title || `Anime #${entry.animeId}`,
      url: `https://myanimepulse.com/anime/${entry.animeId}`,
      watchedEp: entry.episodesWatched || 0,
      totalEp: entry.anime?.episodes || 0,
      status: helper.translateList(entry.status) as number,
      score: entry.rating || 0,
      image: entry.anime?.imageUrl || '',
      // Card views render imageLarge (not image); only have one URL, so reuse it.
      imageLarge: entry.anime?.imageUrl || '',
      tags: '',
      startDate: null,
      finishDate: null,
      rewatchCount: entry.rewatchCount || 0,
      fn: {
        continueUrl: () => `https://myanimepulse.com/anime/${entry.animeId}`,
        initProgress: async () => {},
        progress: null,
      },
    }));

    return retList;
  }

  async getUserObject(): Promise<{ username: string; picture: string; href: string }> {
    const data = await helper.apiCall('/user/settings');
    return {
      username: data.displayUsername || data.username || data.name || 'User',
      picture: data.avatarUrl || data.image || '',
      href: `https://myanimepulse.com/profile/${data.displayUsername || data.username}`,
    };
  }

  deauth() {
    return api.settings.set('animepulseToken', '');
  }

  accessToken() {
    return api.settings.get('animepulseToken');
  }

  _getSortingOptions() {
    return [
      { icon: 'sort_by_alpha', title: 'Title', value: 'title' },
      { icon: 'history', title: 'Last Updated', value: 'updated' },
      { icon: 'star', title: 'Score', value: 'score' },
    ];
  }
}

import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  authenticationUrl = 'https://myanimepulse.com/settings#extensions';

  async getPart(): Promise<any> {
    this.logger.log('UserList', 'getPart', this.status, this.offset);

    const statusMap: Record<number, string> = {
      1: 'WATCHING',
      2: 'COMPLETED',
      3: 'ONHOLD',
      4: 'DROPPED',
      6: 'PLAN_TO_WATCH',
      7: 'ALL',
    };

    const pulseStatus = statusMap[this.status] || 'ALL';

    const data = await helper.apiCall('/anime-list');

    if (!data || !Array.isArray(data)) {
      this.done = true;
      return [];
    }

    // Filter by status if not ALL
    const filtered = pulseStatus === 'ALL'
      ? data
      : data.filter((entry: any) => entry.status === pulseStatus);

    const retList: listElement[] = filtered.map((entry: any) => ({
      uid: entry.animeId,
      malId: entry.animeId,
      cacheKey: helper.getCacheKey(entry.animeId),
      type: 'anime' as const,
      title: entry.anime?.title || `Anime #${entry.animeId}`,
      url: `https://myanimepulse.com/anime/${entry.animeId}`,
      watchedEp: entry.episodesWatched || 0,
      totalEp: entry.anime?.episodes || 0,
      status: helper.translateList(entry.status) as number,
      score: entry.rating || 0,
      image: entry.anime?.imageUrl || '',
      tags: '',
      airingState: undefined,
    }));

    this.done = true; // AnimePulse returns all entries at once
    return retList;
  }

  async getUserObject(): Promise<{ username: string; picture: string; href: string }> {
    const data = await helper.apiCall('/user/settings');

    return {
      username: data.displayUsername || data.username || 'User',
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

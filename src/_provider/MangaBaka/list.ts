import { ListAbstract, listElement } from '../listAbstract';
import * as definitions from '../definitions';
import { bakaStateToState, call, stateToBakaState, urls, authenticationUrl } from './helper';
import type { BakaLibraryEntry, LibraryResponse } from './types';

export class UserList extends ListAbstract {
  name = 'MangaBaka';

  authenticationUrl = authenticationUrl;

  async getUserObject() {
    const json = (await call(urls.userInfo())) as { name: string; preferred_username: string };
    console.log(json);
    return {
      username: json.name,
      picture: 'https://mangabaka.dev/images/logo.png',
      href: `https://mangabaka.dev/u/${json.preferred_username}`,
    };
  }

  deauth() {
    return api.settings
      .set('mangabakaToken', '')
      .then(() => api.settings.set('mangabakaIdToken', ''));
  }

  _getSortingOptions() {
    return [
      {
        icon: 'sort_by_alpha',
        title: api.storage.lang('list_sorting_alpha'),
        value: 'alpha',
      },
      {
        icon: 'history',
        title: api.storage.lang('list_sorting_history'),
        value: 'updated',
      },
      {
        icon: 'score',
        title: api.storage.lang('list_sorting_score'),
        value: 'score',
      },
      {
        icon: 'calendar_month',
        title: api.storage.lang('list_sorting_airing_date'),
        value: 'airing_date',
      },
    ];
  }

  getOrder(sort) {
    switch (sort) {
      case 'alpha':
        return `${this.listType}_title`;
      case 'updated':
        return 'list_updated_at';
      case 'score':
        return 'list_score';
      case 'airing_date':
        return `${this.listType}_start_date`;
      default:
        if (this.status === definitions.status.Watching) return this.getOrder('updated');
        if (this.status === definitions.status.PlanToWatch) return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  private limit = 100;

  async getPart() {
    if (this.listType !== 'manga') {
      throw new Error('MangaBaka only supports manga');
    }

    this.limit = 100;
    if (this.offset < 1) this.offset = 1;
    if (this.modes.frontend) {
      this.limit = 24;
    }

    // TODO: Sorting

    const json = (await call(
      urls.library(stateToBakaState(this.status), 'default', this.offset, this.limit),
    )) as LibraryResponse;

    console.log(json);

    if (json.pagination.next) {
      this.offset += 1;
    } else {
      this.done = true;
    }

    return this.prepareData(json.data);
  }

  public async prepareData(data: BakaLibraryEntry[]): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      // TODO: Title handling
      newData.push(
        await this.fn({
          uid: el.series_id,
          malId: el.Series.source.my_anime_list.id || null,
          apiCacheKey:
            el.Series.source.my_anime_list.id ||
            el.Series.source.anilist.id ||
            `mangabaka:${el.series_id}`,
          cacheKey: el.Series.source.my_anime_list.id || `mangabaka:${el.series_id}`,
          type: this.listType,
          title: el.Series.title,
          url: `https://mangabaka.dev/${el.series_id}`,
          score: el.rating,
          watchedEp: el.progress_chapter,
          readVol: el.progress_volume,
          totalEp: Number(el.Series.total_chapters) || 0, // TODO: Should this not be finished chapters?
          totalVol: Number(el.Series.final_volume) || 0,
          status: bakaStateToState(el.state!),
          startDate: el.start_date,
          finishDate: el.finish_date,
          rewatchCount: el.number_of_rereads || 0,
          image: el.Series.cover.x150.x2 || '',
          imageLarge: el.Series.cover.x350.x2 || '',
          tags: '', // TODO:
          airingState: '', // TODO:
        }),
      );
    }

    return newData;
  }
}

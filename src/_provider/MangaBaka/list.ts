import { ListAbstract, listElement } from '../listAbstract';
import { status } from '../definitions';
import { bakaStateToState, call, stateToBakaState, urls, authenticationUrl } from './helper';
import type { BakaLibraryEntry, BakaSorting, LibraryResponse } from './types';

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
        asc: true,
      },
      {
        icon: 'history',
        title: api.storage.lang('list_sorting_history'),
        value: 'updated',
        asc: true,
      },
      {
        icon: 'score',
        title: api.storage.lang('list_sorting_score'),
        value: 'score',
        asc: true,
      },
    ];
  }

  getOrder(sort): BakaSorting {
    switch (sort) {
      case 'alpha_asc':
        return 'series_title_asc';
      case 'alpha':
        return 'series_title_desc';
      case 'updated_asc':
        return 'updated_at_asc';
      case 'updated':
        return 'updated_at_desc';
      case 'score_asc':
        return 'my_rating_asc';
      case 'score':
        return 'my_rating_desc';
      default:
        if (this.status === status.Watching) return this.getOrder('updated');
        if (this.status === status.PlanToWatch) return this.getOrder('updated');
        return 'default';
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

    const json = (await call(
      urls.library(
        stateToBakaState(this.status),
        this.getOrder(this.sort),
        this.offset,
        this.limit,
      ),
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

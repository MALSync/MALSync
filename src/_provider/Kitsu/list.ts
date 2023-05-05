import { NotAutenticatedError } from '../Errors';
import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  name = 'Kitsu';

  authenticationUrl = 'https://kitsu.io/404?mal-sync=authentication';

  async getUserObject() {
    const user = await this.userRequest();

    const opt = api.settings.get('kitsuOptions');
    opt.titleLanguagePreference = user.attributes.titleLanguagePreference;
    opt.sfwFilter = user.attributes.sfwFilter;
    opt.ratingSystem = user.attributes.ratingSystem;
    api.settings.set('kitsuOptions', opt);

    return {
      username: user.attributes.name,
      picture: user.attributes.avatar?.large || '',
      href: `https://kitsu.io/users/${user.attributes.slug}`,
    };
    return user.attributes.name;
  }

  async getUserId() {
    const userId = await api.storage.get('kitsuUserId');
    if (typeof userId !== 'undefined' && userId) {
      return userId;
    }
    const user = await this.userRequest();
    api.storage.set('kitsuUserId', user.id);
    return user.id;
  }

  private userRequest() {
    return helper.apiCall('GET', 'https://kitsu.io/api/edge/users?filter[self]=true').then(res => {
      con.log(res);
      if (typeof res.data[0] === 'undefined') {
        throw new NotAutenticatedError('Not Authenticated');
      }
      return res.data[0];
    });
  }

  deauth() {
    return api.settings.set('kitsuToken', '').then(() => api.storage.set('kitsuUserId', ''));
  }

  accessToken() {
    return api.settings.get('kitsuToken');
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

  getOrder(sort) {
    let pre = '';

    if (!sort.endsWith('_asc')) pre = '-';

    const sortString = sort.replace('_asc', '');
    switch (sortString) {
      case 'alpha':
        pre = pre ? '' : '-';
        return `${pre}${this.listType}.titles.en`;
      case 'updated':
        return `${pre}progressed_at`;
      case 'score':
        return `${pre}rating`;
      default:
        if (this.status === 1) return this.getOrder('updated');
        if (this.status === 6) return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  async getPart() {
    const userid = await this.getUserId();

    let statusPart = '';
    let sorting = '';

    const order = this.getOrder(this.sort);
    if (order) {
      sorting = `&sort=${order}`;
    }

    if (this.status !== 7) {
      const statusTemp = helper.translateList(this.status, this.status);
      statusPart = `&filter[status]=${statusTemp}`;
    }

    con.log(
      '[UserList][Kitsu]',
      `user: ${userid}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
    );

    return helper
      .apiCall(
        'GET',
        `https://kitsu.io/api/edge/library-entries?filter[user_id]=${userid}${statusPart}&filter[kind]=${
          this.listType
        }&page[offset]=${this.offset}&page[limit]=50${sorting}&include=${this.listType},${
          this.listType
        }.mappings,${this.listType}.mappings.item&fields[${
          this.listType
        }]=slug,titles,canonicalTitle,averageRating,posterImage,coverImage,${
          this.listType === 'anime' ? 'episodeCount' : 'chapterCount,volumeCount'
        }`,
      )
      .then(res => {
        con.log(res);

        this.offset += 50;

        if (!(res.meta.count > this.offset)) {
          this.done = true;
        }

        return this.prepareData(res, this.listType);
      });
  }

  private async prepareData(data, listType): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.data.length; i++) {
      const list = data.data[i];
      const el = data.included[i];

      const name = helper.getTitle(el.attributes.titles, el.attributes.canonicalTitle);

      let malId = NaN;
      for (let k = 0; k < data.included.length; k++) {
        const mapping = data.included[k];
        if (mapping.type === 'mappings') {
          if (mapping.attributes.externalSite === `myanimelist/${listType}`) {
            if (mapping.relationships.item.data.id === el.id) {
              malId = Number(mapping.attributes.externalId);
              data.included.splice(k, 1);
              break;
            }
          }
        }
      }
      let tempData;
      if (listType === 'anime') {
        tempData = await this.fn({
          malId,
          apiCacheKey: malId,
          uid: Number(el.id),
          cacheKey: helper.getCacheKey(malId, el.id),
          kitsuSlug: el.attributes.slug,
          type: listType,
          title: name,
          url: `https://kitsu.io/${listType}/${el.attributes.slug}`,
          watchedEp: list.attributes.progress,
          totalEp: el.attributes.episodeCount,
          status: helper.translateList(list.attributes.status),
          score: Math.round(list.attributes.ratingTwenty / 2),
          image:
            el.attributes.posterImage && el.attributes.posterImage.small
              ? el.attributes.posterImage.small
              : '',
          imageLarge:
            el.attributes.posterImage && el.attributes.posterImage.original
              ? el.attributes.posterImage.original
              : '',
          imageBanner:
            el.attributes.coverImage && el.attributes.coverImage.large
              ? el.attributes.coverImage.large
              : '',
          tags: list.attributes.notes,
          airingState: el.anime_airing_status,
        });
      } else {
        tempData = await this.fn({
          malId,
          apiCacheKey: malId,
          uid: Number(el.id),
          cacheKey: helper.getCacheKey(malId, el.id),
          kitsuSlug: el.attributes.slug,
          type: listType,
          title: name,
          url: `https://kitsu.io/${listType}/${el.attributes.slug}`,
          watchedEp: list.attributes.progress,
          totalEp: el.attributes.chapterCount,
          status: helper.translateList(list.attributes.status),
          score: Math.round(list.attributes.ratingTwenty / 2),
          image:
            el.attributes.posterImage && el.attributes.posterImage.small
              ? el.attributes.posterImage.small
              : '',
          imageLarge:
            el.attributes.posterImage && el.attributes.posterImage.original
              ? el.attributes.posterImage.original
              : '',
          imageBanner:
            el.attributes.coverImage && el.attributes.coverImage.large
              ? el.attributes.coverImage.large
              : '',
          tags: list.attributes.notes,
          airingState: el.anime_airing_status,
        });
      }

      if (tempData.totalEp === null) {
        tempData.totalEp = 0;
      }

      newData.push(tempData);
    }
    return newData;
  }
}

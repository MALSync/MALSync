import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class UserList extends ListAbstract {
  name = 'AniList';

  public compact = false;

  public seperateRewatching = true;

  authenticationUrl =
    'https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token';

  getUserObject() {
    const query = `
    query {
      Viewer {
        name
        id
        avatar {
          large
        }
        options {
          displayAdultContent
        }
        mediaListOptions {
          scoreFormat
        }
      }
    }
    `;

    return helper.apiCall(query, [], true).then(res => {
      if (res.data.Viewer.options && res.data.Viewer.mediaListOptions) {
        const opt = api.settings.get('anilistOptions');
        opt.displayAdultContent = res.data.Viewer.options.displayAdultContent;
        opt.scoreFormat = res.data.Viewer.mediaListOptions.scoreFormat;
        api.settings.set('anilistOptions', opt);
      }
      return {
        username: res.data.Viewer.name,
        picture: res.data.Viewer.avatar.large || '',
        href: `https://anilist.co/user/${res.data.Viewer.id}`,
      };
    });
  }

  deauth() {
    return api.settings.set('anilistToken', '');
  }

  accessToken() {
    return this.api.settings.get('anilistToken');
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
    switch (sort) {
      case 'alpha':
        return 'MEDIA_TITLE_ENGLISH';
      case 'updated':
        return 'UPDATED_TIME_DESC';
      case 'updated_asc':
        return 'UPDATED_TIME';
      case 'score':
        return 'SCORE_DESC';
      case 'score_asc':
        return 'SCORE';
      default:
        if (this.status === 1) return this.getOrder('updated');
        if (this.status === 6) return this.getOrder('updated');
        // TODO: remove when fixed in anilist
        return this.getOrder('updated');
        return this.getOrder('alpha');
    }
  }

  async getPart(): Promise<any> {
    if (this.offset < 1) this.offset = 1;
    con.log(
      '[UserList][AniList]',
      `username: ${this.username}`,
      `status: ${this.status}`,
      `offset: ${this.offset}`,
    );

    if (!this.username) {
      this.username = await this.getUsername();
    }

    let query = `
    query ($page: Int, $userName: String, $type: MediaType, $status: MediaListStatus, $sort: [MediaListSort] ) {
      Page (page: $page, perPage: 100) {
        pageInfo {
          hasNextPage
        }
        mediaList (status: $status, type: $type, userName: $userName, sort: $sort) {
          status
          score(format: POINT_100)
          progress
          progressVolumes
          notes
          media {
            siteUrl
            id
            idMal
            episodes
            chapters
            volumes
            status
            averageScore
            coverImage{
              large
              extraLarge
            }
            bannerImage
            title {
              userPreferred
            }
          }
        }
      }
    }
    `;

    if (this.compact) {
      query = `
      query ($page: Int, $userName: String, $type: MediaType, $status: MediaListStatus, $sort: [MediaListSort]) {
        Page (page: $page, perPage: 100) {
          pageInfo {
            hasNextPage
          }
          mediaList (status: $status, type: $type, userName: $userName, sort: $sort) {
            progress
            media {
              id
              idMal
            }
          }
        }
      }
      `;
    }
    const variables = {
      page: this.offset,
      userName: this.username,
      type: this.listType.toUpperCase(),
      status: helper.statusTranslate[parseInt(this.status.toString())],
      sort: null,
    };

    const order = this.getOrder(this.sort);

    if (order) {
      // @ts-ignore
      variables.sort = order;
    }

    return helper.apiCall(query, variables, true).then(res => {
      con.log('res', res);
      const data = res.data.Page.mediaList;
      this.offset += 1;
      if (!res.data.Page.pageInfo.hasNextPage) {
        this.done = true;
      }

      return this.prepareData(data, this.listType);
    });
  }

  private async prepareData(data, listType): Promise<listElement[]> {
    const newData = [] as listElement[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      let tempData;
      if (listType === 'anime') {
        tempData = await this.fn({
          uid: el.media.id,
          malId: el.media.idMal,
          apiCacheKey: el.media.idMal ?? `anilist:${el.media.id}`,
          cacheKey: helper.getCacheKey(el.media.idMal, el.media.id),
          type: listType,
          title: el.media.title.userPreferred,
          url: el.media.siteUrl,
          watchedEp: el.progress,
          totalEp: el.media.episodes,
          status: helper.translateList(el.status),
          score: Math.round(el.score / 10),
          image: el.media.coverImage.large,
          imageLarge: el.media.coverImage.extraLarge,
          imageBanner: el.media.bannerImage,
          tags: el.notes,
          airingState: el.anime_airing_status,
        });
      } else {
        tempData = await this.fn({
          uid: el.media.id,
          malId: el.media.idMal,
          apiCacheKey: el.media.idMal ?? `anilist:${el.media.id}`,
          cacheKey: helper.getCacheKey(el.media.idMal, el.media.id),
          type: listType,
          title: el.media.title.userPreferred,
          url: el.media.siteUrl,
          watchedEp: el.progress,
          totalEp: el.media.chapters,
          status: helper.translateList(el.status),
          score: Math.round(el.score / 10),
          image: el.media.coverImage.large,
          imageLarge: el.media.coverImage.extraLarge,
          imageBanner: el.media.bannerImage,
          tags: el.notes,
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

  private prepareCompact(data, listType) {
    const newData = [] as {
      malid: number;
      id: number;
      watchedEp: number;
      cacheKey: string | number;
    }[];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      newData.push({
        malid: el.media.idMal,
        id: el.media.id,
        watchedEp: el.progress,
        cacheKey: helper.getCacheKey(el.media.idMal, el.media.id),
      });
    }
    return newData;
  }
}

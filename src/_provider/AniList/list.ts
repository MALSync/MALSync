import { ListAbstract, listElement } from '../listAbstract';
import * as helper from './helper';

export class userlist extends ListAbstract {
  name = 'AniList';

  public compact = false;

  authenticationUrl = 'https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token';

  getUsername() {
    const query = `
    query {
      Viewer {
        name
        id
        options {
          displayAdultContent
        }
        mediaListOptions {
          scoreFormat
        }
      }
    }
    `;

    return this.api.request
      .xhr('POST', {
        url: 'https://graphql.anilist.co',
        headers: {
          Authorization: `Bearer ${this.accessToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: JSON.stringify({
          query,
          variables: [],
        }),
      })
      .then(response => {
        const res = this.jsonParse(response);
        con.log(res);
        this.errorHandling(res);
        if (res.data.Viewer.options && res.data.Viewer.mediaListOptions) {
          const opt = api.settings.get('anilistOptions');
          opt.displayAdultContent = res.data.Viewer.options.displayAdultContent;
          opt.scoreFormat = res.data.Viewer.mediaListOptions.scoreFormat;
          api.settings.set('anilistOptions', opt);
        }
        return res.data.Viewer.name;
      });
  }

  deauth() {
    return api.settings.set('anilistToken', '');
  }

  errorHandling(res) {
    if (typeof res.errors !== 'undefined') {
      con.error(res.errors);
      throw {
        code: res.errors[0].status,
        message: res.errors[0].message,
      };
    }
  }

  accessToken() {
    return this.api.settings.get('anilistToken');
  }

  async getPart(): Promise<any> {
    if (this.offset < 1) this.offset = 1;
    con.log('[UserList][AniList]', `username: ${this.username}`, `status: ${this.status}`, `offset: ${this.offset}`);

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
            }
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
      status: helper.translateList(parseInt(this.status.toString()), parseInt(this.status.toString())),
      sort: 'UPDATED_TIME_DESC',
    };

    if (this.status !== 1) {
      // @ts-ignore
      variables.sort = null;
    }

    return this.api.request
      .xhr('POST', {
        url: 'https://graphql.anilist.co',
        headers: {
          Authorization: `Bearer ${this.accessToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        data: JSON.stringify({
          query,
          variables,
        }),
      })
      .then(response => {
        const res = this.jsonParse(response);
        con.log('res', res);
        this.errorHandling(res);
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
          cacheKey: helper.getCacheKey(el.media.idMal, el.media.id),
          type: listType,
          title: el.media.title.userPreferred,
          url: el.media.siteUrl,
          watchedEp: el.progress,
          totalEp: el.media.episodes,
          status: helper.translateList(el.status),
          score: Math.round(el.score / 10),
          image: el.media.coverImage.large,
          tags: el.notes,
          airingState: el.anime_airing_status,
        });
      } else {
        tempData = await this.fn({
          uid: el.media.id,
          malId: el.media.idMal,
          cacheKey: helper.getCacheKey(el.media.idMal, el.media.id),
          type: listType,
          title: el.media.title.userPreferred,
          url: el.media.siteUrl,
          watchedEp: el.progress,
          totalEp: el.media.chapters,
          status: helper.translateList(el.status),
          score: Math.round(el.score / 10),
          image: el.media.coverImage.large,
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

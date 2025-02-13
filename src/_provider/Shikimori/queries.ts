// eslint-disable-next-line import/no-cycle
import { apiCall } from './helper';
import * as Types from './types';

const enum GRAPHQL {
  CurrentUser_ = `
    {
      currentUser {
        avatarUrl
        id
        lastOnlineAt
        nickname
        url
      }
    }`,
  UserRates_ = `
    query($order: UserRateOrderInputType, $page: PositiveInt, $limit: PositiveInt, $userId: ID, $animeTarget: Boolean! = false, $mangaTarget: Boolean! = false, $targetType: UserRateTargetTypeEnum, $status: UserRateStatusEnum){
      userRates(page: $page, limit: $limit, status: $status, userId: $userId, targetType: $targetType, order: $order) {
        id
        updatedAt
        score
        status
        rewatches
        episodes
        volumes
        chapters
        text
        anime @include(if: $animeTarget) 
        { 
          id 
          russian
          english 
          episodes
          malId
          url
          poster
          {
            mainUrl
            main2xUrl
          }
        }
        manga @include(if: $mangaTarget) 
        { 
          id 
          russian
          english 
          malId
          url
          poster
          {
            mainUrl
            main2xUrl
          }
        }
      }
    }
  `,
  Animes_ = `
    query($search: String, $limit: PositiveInt, $order: OrderEnum, $kind: AnimeKindString, $page: PositiveInt, $status: AnimeStatusString, $ids: String) {
      animes(search: $search, limit: $limit, order: $order, kind: $kind, page: $page, status: $status, ids: $ids) {
        id
        malId
        name
        russian
        licenseNameRu
        english
        japanese
        synonyms
        kind
        rating
        score
        status
        episodes
        episodesAired
        duration
        airedOn { year month day date }
        releasedOn { year month day date }
        url
        season
        poster { id originalUrl mainUrl main2xUrl}
        licensors
        createdAt,
        updatedAt,
        nextEpisodeAt,
        isCensored
        genres { id name russian kind }
        studios { id name imageUrl }
        description
        descriptionHtml
      }
    }`,
  Anime_ = `
    query($ids: String!) {
      animes(limit: 1, ids: $ids) {
        id
        name
        russian
        english
        description
        descriptionHtml
        score
        kind
        duration
        status
        episodes
        episodesAired
        airedOn { date }
        statusesStats { count status }
        poster {
          originalUrl
          mainUrl
          main2xUrl
        }
        videos {
          name
          kind
          url
        }
        synonyms
        characterRoles {
          id
          rolesEn
          rolesRu
          character {
            name
            russian
            url
            poster { originalUrl }
          }
        }
        personRoles {
          rolesEn
          rolesRu
          person {
            name
            russian
            url
          }
        }
        studios { name id }
        genres {
          name
          russian
          id
        }
        related {
          relationKind
          relationText
          anime {
            name
            russian
            english
            id
            url
          }
          manga {
            name
            russian
            english
            id
            url
          }
        }
      }
    }`,
  Manga_ = `
    query($ids: String!){
      mangas(limit: 1, ids: $ids) {
        id
        name
        russian
        english
        description
        descriptionHtml
        score
        kind
        status
        volumes
        chapters
        airedOn {
          date
        }
        
        statusesStats {
          count
          status
        }
        poster {
          originalUrl
          mainUrl
          main2xUrl
        }
        synonyms
        characterRoles {
          id
          rolesEn
          rolesRu
          character {
            name
            russian
            url
            poster {
              originalUrl
            }
          }
        }
        personRoles {
          rolesEn
          rolesRu
          person {
            name
            russian
            url
          }
        }
        genres { name russian id }
        publishers { id name }
        related {
          relationKind
          relationText
          anime {
            name
            russian
            english
            id
            url
          }
          manga {
            name
            russian
            english
            id
            url
          }
        }
      }
    }`,
  Mangas_ = `
    query($search: String, $limit: PositiveInt, $order: OrderEnum, $kind: MangaKindString, $page: PositiveInt, $status: MangaStatusString, $ids: String) {
      mangas(search: $search, limit: $limit, order: $order, kind: $kind, page: $page, status: $status, ids: $ids) {
        id
        malId
        name
        russian
        licenseNameRu
        english
        japanese
        synonyms
        kind
        score
        status
        chapters
        airedOn { year month day date }
        releasedOn { year month day date }
        url
        volumes
        poster { id originalUrl mainUrl main2xUrl}
        licensors
        createdAt,
        updatedAt,
        isCensored
        genres { id name russian kind }
        publishers { id name }
        description
        descriptionHtml
      }
    }`,
}

export class Queries {
  static CurrentUser(): Promise<Types.CurrentUser> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.CurrentUser_,
      },
    }).then((res: Types.CurrentUser) => {
      // TODO - Waiting for GRAPHQL update
      // if (res.locale) {
      //   api.settings.set('shikiOptions', {
      //     locale: res.locale,
      //   });
      // }
      return res;
    });
  }

  /**
   * @param limit - default 1, maximum 50
   */
  static UserRates(
    userId: number,
    targetType: 'Anime' | 'Manga',
    order?: Types.UserRateOrderInputType,
    status?: Types.UserRateStatusEnum,
    page: number = 1,
    limit: number = 1,
  ): Promise<Types.UserRates> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.UserRates_,
        variables: {
          userId,
          targetType,
          ...(order ? { order } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
          animeTarget: targetType === 'Anime',
          mangaTarget: targetType !== 'Anime',
        },
      },
    });
  }

  /**
   *
   * @param kind - single kind or separated my commas, can also use '!' to exclude kind.
   * @param limit - default 25, maximum 50
   */
  static Animes(
    search?: string,
    ids?: string,
    kind?: Types.AnimeKindString[],
    order?: Types.OrderEnum[],
    status?: Types.AnimeStatusEnum,
    page: number = 1,
    limit: number = 25,
  ): Promise<Types.Animes> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.Animes_,
        variables: {
          ...(search ? { search } : {}),
          ...(ids ? { ids } : {}),
          ...(kind ? { kind: kind.toString() } : {}),
          ...(order ? { order } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
        },
      },
    });
  }

  /**
   *
   * @param kind - single kind or separated my commas, can also use '!' to exclude kind.
   * @param limit - default 25, maximum 50
   */
  static Mangas(
    search?: string,
    ids?: string,
    kind?: Types.MangaKindEnum[],
    order?: Types.OrderEnum[],
    status?: Types.MangaStatusEnum,
    page: number = 1,
    limit: number = 25,
  ): Promise<Types.Mangas> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.Mangas_,
        variables: {
          ...(search ? { search } : {}),
          ...(ids ? { ids } : {}),
          ...(kind ? { kind: kind.toString() } : {}),
          ...(order ? { order } : {}),
          ...(status ? { status } : {}),
          page,
          limit,
        },
      },
    });
  }

  static Anime(id: string): Promise<Types.Anime | undefined> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.Anime_,
        variables: {
          ids: id,
        },
      },
    }).then((res: Types.Animes) => {
      return res.data.animes.length ? res.data.animes[0] : undefined;
    });
  }

  static Manga(id: string): Promise<Types.Manga | undefined> {
    return apiCall({
      type: 'POST',
      path: 'graphql',
      dataObj: {
        query: GRAPHQL.Manga_,
        variables: {
          ids: id,
        },
      },
    }).then((res: Types.Mangas) => {
      return res.data.mangas.length ? res.data.mangas[0] : undefined;
    });
  }

  // TODO - Rewrite this when GRAPHQL updates.
  static async UserRateGet(
    user_id: number,
    target_id: number,
    target_type: 'Anime' | 'Manga',
  ): Promise<Types.UserRateV2 | undefined> {
    const res = await apiCall({
      path: 'v2/user_rates',
      type: 'GET',
      parameter: {
        user_id,
        target_id,
        target_type,
      },
    });
    return res[0] || undefined;
  }

  // TODO - Rewrite this when GRAPHQL updates.
  static UserRateDelete(id: number | string): Promise<void> {
    return apiCall({
      type: 'DELETE',
      path: `v2/user_rates/${id}`,
    });
  }

  // TODO - Rewrite this when GRAPHQL updates.
  static UserRateUpdate(userRate: Types.UserRateV2): Promise<void> {
    return apiCall({
      type: 'PUT',
      path: `v2/user_rates/${userRate.id}`,
      dataObj: {
        user_rate: userRate,
      },
    });
  }

  // TODO - Rewrite this when GRAPHQL updates.
  static UserRateAdd(userRate: Types.UserRateV2): Promise<void> {
    return apiCall({
      type: 'POST',
      path: 'v2/user_rates',
      dataObj: {
        user_rate: userRate,
      },
    });
  }
}

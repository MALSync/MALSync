import {
  NotAuthenticatedError,
  ServerOfflineError,
  NotFoundError,
  MissingParameterError,
  InvalidParameterError,
} from '../Errors';
import type * as Types from './types';

export const clientId = 'z3NJ84kK9iy5NU6SnhdCDB38rr4-jFIJ67bMIUDzdoo';
export const authUrl = `https://shikimori.one/oauth/authorize?client_id=${clientId}&redirect_uri=https%3A%2F%2Fmalsync.moe%2Fshikimori%2Foauth&response_type=code&scope=user_rates`;
const apiDomain = 'https://shikimori.one/api/';

const enum GRAPHQL {
  CurrentUser = `
    {
      currentUser {
        avatarUrl
        id
        lastOnlineAt
        nickname
        url
      }
    }`,
  UserRates = `
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
          name
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
          name
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
  Animes = `
    query($search: String, $limit: PositiveInt, $order: OrderEnum, $kind: AnimeKindString, $page: PositiveInt, $status: AnimeStatusString, $ids: String) {
      animes(search: $search, limit: $limit, order: $order, kind: $kind, page: $page, status: $status, ids: $ids, censored: false) {
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
  Anime = `
    query($ids: String!) {
      animes(limit: 1, ids: $ids, censored: false) {
        id
        name
        url
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
  Manga = `
    query($ids: String!){
      mangas(limit: 1, ids: $ids, censored: false) {
        id
        name
        url
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
  Mangas = `
    query($search: String, $limit: PositiveInt, $order: OrderEnum, $kind: MangaKindString, $page: PositiveInt, $status: MangaStatusString, $ids: String) {
      mangas(search: $search, limit: $limit, order: $order, kind: $kind, page: $page, status: $status, ids: $ids, censored: false) {
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

type ApiTypes = 'REST' | 'GRAPHQL';
type ApiToType<T> = T extends 'REST' | undefined
  ? Types.CurrentUserV2
  : T extends 'GRAPHQL'
    ? Types.CurrentUser
    : never;

export class Queries {
  // NOTE - We can get user locale only from REST API for now
  static CurrentUser<T extends ApiTypes | undefined = undefined>(
    apiType?: T,
  ): Promise<ApiToType<T>> {
    let options: Parameters<typeof apiCall>[0] = {
      type: 'GET',
      path: 'users/whoami',
    };
    if (apiType === 'GRAPHQL') {
      options = {
        type: 'POST',
        path: 'graphql',
        dataObj: {
          query: GRAPHQL.CurrentUser,
        },
      };
    }

    return apiCall(options).then((res: ApiToType<T>) => {
      if ((res as Types.CurrentUserV2).locale) {
        api.settings
          .set('shikiOptions', {
            locale: (res as Types.CurrentUserV2).locale,
          })
          .then(() => {
            con.info('Shiki user locale updated');
          })
          .catch(e => {
            con.error(e);
          });
      }
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
        query: GRAPHQL.UserRates,
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
        query: GRAPHQL.Animes,
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
        query: GRAPHQL.Mangas,
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
        query: GRAPHQL.Anime,
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
        query: GRAPHQL.Manga,
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

export async function apiCall(options: {
  type: 'GET' | 'PUT' | 'DELETE' | 'POST';
  path: string;
  parameter?: { [key: string]: string | number };
  dataObj?: { [key: string]: unknown };
  auth?: boolean;
}): Promise<any> {
  const { type } = options;
  const token = api.settings.get('shikiToken');

  if (!token && !token.access_token && !options.auth) {
    throw new NotAuthenticatedError('No token set');
  }

  let url = '';
  if (options.auth) {
    url = 'https://shikimori.one/oauth/token';
  } else {
    url = `${apiDomain}${options.path}`;

    if (options.parameter && Object.keys(options.parameter).length) {
      url += url.includes('?') ? '&' : '?';
      const params = [] as string[];
      for (const key in options.parameter) {
        params.push(`${key}=${options.parameter[key]}`);
      }
      url += params.join('&');
    }
  }
  const headers = {
    'User-Agent': 'MAL-Sync',
    'Content-Type': 'application/json',
    ...(!options.auth ? { Authorization: `Bearer ${token.access_token}` } : {}),
  };

  return api.request
    .xhr(type, {
      url,
      headers,
      data: options.dataObj ? JSON.stringify(options.dataObj) : undefined,
    })
    .then(async response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw new ServerOfflineError(`Server Offline status: ${response.status}`);
      }

      let res: any = null;
      if (response.responseText) {
        res = JSON.parse(response.responseText);
      }

      if (response.status === 401) {
        if (options.auth) throw new NotAuthenticatedError(res.message || res.error);
        await refreshToken(token.refresh_token);
        return apiCall(options);
      }

      if (res && res.error) {
        switch (res.error) {
          case 'forbidden':
          case 'invalid_token':
            if (options.auth) throw new NotAuthenticatedError(res.message || res.error);
            await refreshToken(token.refresh_token);
            return apiCall(options);
          case 'not_found':
            throw new NotFoundError(res.message || res.error);
          default:
            throw new Error(res.message || res.error);
        }
      }

      if (res && res.errors && res.errors.length) {
        let error = '';
        if (res.errors[0].message) {
          for (let i = 0; i < res.errors.length; i++) {
            error += `${res.errors[i].message}${res.errors[i].path ? ` - Path: (${res.errors[i].path})` : ''}\n`;
          }
        } else {
          error = res.errors.join('\n');
          if (error.includes('Missing parameter')) {
            throw new MissingParameterError(error);
          } else if (error.includes('Invalid parameter')) {
            throw new InvalidParameterError(error);
          }
        }
        throw new Error(error);
      }

      switch (response.status) {
        case 400:
          throw new Error('Invalid Parameters');
        case 403:
        default:
      }

      return res;
    });
}

async function refreshToken(refresh_token: string) {
  const res = await authRequest({ refresh_token }).catch(async err => {
    if (err.message === 'invalid_request') {
      await api.settings.set('shikiToken', '');
    }
    throw err;
  });
  await api.settings.set('shikiToken', {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
  });
}

export async function authRequest(
  data: { code: string } | { refresh_token: string },
): Promise<Types.Token> {
  const dataObj = {
    client_id: clientId,
    client_secret: '6vkFaJN_wxQHmBoq23ac1z6tZKiAD7xqsXGudkkOqTg',
    redirect_uri: 'https://malsync.moe/shikimori/oauth',
    ...('code' in data
      ? {
          code: data.code,
          grant_type: 'authorization_code',
        }
      : {
          refresh_token: data.refresh_token,
          grant_type: 'refresh_token',
        }),
  };

  return apiCall({
    type: 'POST',
    path: 'oauth/token',
    auth: true,
    dataObj,
  });
}

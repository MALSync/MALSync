import type { SyncTypes } from '../_provider/helper';

export type Path = {
  type: 'anime' | 'manga';
  slug: string;
};

export type ParsedPath = Path & {
  provider: UrlSyncMode | 'LOCAL';
  id: string;
};

type slugObject = {
  path?: ParsedPath;
  url: string;
};

export type UrlSyncMode = Exclude<SyncTypes, 'MALAPI'>;

export const providerUrls = {
  MAL: {
    regex: /^https:\/\/myanimelist\.net\/(anime|manga)\/(\d+)(\/|$)/,
    urlTemplate: 'https://myanimelist.net/<type>/<identifier>',
    identifier: 'mal',
  },
  ANILIST: {
    regex: /^https:\/\/anilist\.co\/(anime|manga)\/(\d+)(\/|$)/,
    urlTemplate: 'https://anilist.co/<type>/<identifier>',
    identifier: 'anilist',
  },
  KITSU: {
    regex: /^https:\/\/kitsu\.app\/(anime|manga)\/([^/]+)(\/|$)/,
    urlTemplate: 'https://kitsu.app/<type>/<identifier>',
    identifier: 'kitsu',
  },
  SIMKL: {
    regex: /^https:\/\/simkl\.com\/(anime|manga)\/(\d+)(\/|$)/,
    urlTemplate: 'https://simkl.com/<type>/<identifier>',
    identifier: 'simkl',
  },
  SHIKI: {
    regex: /^https:\/\/shikimori\.(one|io)\/(animes|mangas|ranobe)\/\D?(\d+)/,
    urlTemplate: 'https://shikimori.io/<type>s/<identifier>',
    identifier: 'shiki',
  },
  MANGABAKA: {
    regex: /^https:\/\/mangabaka\.(?:dev|org)\/(\d+)(\/|$)/,
    urlTemplate: 'https://mangabaka.org/<identifier>',
    identifier: 'mangabaka',
  },
} as const satisfies Record<
  UrlSyncMode,
  { regex: RegExp; urlTemplate: string; identifier: string }
>;

export type ProviderIdentifier = (typeof providerUrls)[UrlSyncMode]['identifier'];

const localRegex = /^local:\/\/([^/]+)\/(anime|manga)\/([^/]+)(\/|$)/;

export function buildProviderUrl(
  syncMode: UrlSyncMode,
  type: 'anime' | 'manga',
  identifier: string | number,
): string {
  return providerUrls[syncMode].urlTemplate
    .replace('<type>', type)
    .replace('<identifier>', String(identifier));
}

export function pageUrl(page: ProviderIdentifier, type: 'anime' | 'manga', id: string | number) {
  const syncMode = page.toUpperCase() as UrlSyncMode;
  if (!providerUrls[syncMode]) throw `${page} not a valid page`;
  return buildProviderUrl(syncMode, type, id);
}

export function urlToSlug(url: string): slugObject {
  const obj: slugObject = {
    url,
  };

  const malMatch = url.match(providerUrls.MAL.regex);
  if (malMatch) {
    obj.path = {
      type: malMatch[1] as 'anime' | 'manga',
      slug: malMatch[2],
      provider: 'MAL',
      id: malMatch[2],
    };
    return obj;
  }

  const anilistMatch = url.match(providerUrls.ANILIST.regex);
  if (anilistMatch) {
    obj.path = {
      type: anilistMatch[1] as 'anime' | 'manga',
      slug: `a:${anilistMatch[2]}`,
      provider: 'ANILIST',
      id: anilistMatch[2],
    };
    return obj;
  }

  const kitsuMatch = url.match(providerUrls.KITSU.regex);
  if (kitsuMatch) {
    obj.path = {
      type: kitsuMatch[1] as 'anime' | 'manga',
      slug: `k:${kitsuMatch[2]}`,
      provider: 'KITSU',
      id: kitsuMatch[2],
    };
    return obj;
  }

  const simklMatch = url.match(providerUrls.SIMKL.regex);
  if (simklMatch) {
    obj.path = {
      type: simklMatch[1] as 'anime' | 'manga',
      slug: `s:${simklMatch[2]}`,
      provider: 'SIMKL',
      id: simklMatch[2],
    };
    return obj;
  }

  const shikiMatch = url.match(providerUrls.SHIKI.regex);
  if (shikiMatch) {
    obj.path = {
      type: shikiMatch[2].toLowerCase() === 'animes' ? 'anime' : 'manga',
      slug: `shi:${shikiMatch[3]}`,
      provider: 'SHIKI',
      id: shikiMatch[3],
    };
    return obj;
  }

  const mangabakaMatch = url.match(providerUrls.MANGABAKA.regex);
  if (mangabakaMatch) {
    obj.path = {
      type: 'manga',
      slug: `baka:${mangabakaMatch[1]}`,
      provider: 'MANGABAKA',
      id: mangabakaMatch[1],
    };
    return obj;
  }

  const localMatch = url.match(localRegex);
  if (localMatch) {
    obj.path = {
      type: localMatch[2] as 'anime' | 'manga',
      slug: `l:${localMatch[1]}::${encodeURIComponent(localMatch[3])}`,
      provider: 'LOCAL',
      id: localMatch[3],
    };
    obj.url = '';
    return obj;
  }

  return obj;
}

export function pathToUrl(path: Path): string {
  if (path.slug.match(/^\d+$/)) {
    return buildProviderUrl('MAL', path.type, path.slug);
  }
  if (path.slug.startsWith('a:')) {
    return buildProviderUrl('ANILIST', path.type, path.slug.substring(2));
  }
  if (path.slug.startsWith('k:')) {
    return buildProviderUrl('KITSU', path.type, path.slug.substring(2));
  }
  if (path.slug.startsWith('s:')) {
    return buildProviderUrl('SIMKL', path.type, path.slug.substring(2));
  }
  if (path.slug.startsWith('shi:')) {
    return buildProviderUrl('SHIKI', path.type, path.slug.substring(4));
  }
  if (path.slug.startsWith('baka:')) {
    return buildProviderUrl('MANGABAKA', path.type, path.slug.substring(5));
  }
  if (path.slug.startsWith('l:')) {
    const match = path.slug.match(/^l:([^:]+)::([^:]+)$/);
    if (match) {
      return `local://${match[1]}/${path.type}/${decodeURIComponent(match[2])}`;
    }
  }

  throw new Error('Unknown Path Object');
}

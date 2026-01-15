export type Path = {
  type: 'anime' | 'manga';
  slug: string;
};

type slugObject = {
  path?: Path;
  url: string;
};

const malRegex = /^https:\/\/myanimelist\.net\/(anime|manga)\/(\d+)(\/|$)/;
const anilistRegex = /^https:\/\/anilist\.co\/(anime|manga)\/(\d+)(\/|$)/;
const kitsuRegex = /^https:\/\/kitsu\.app\/(anime|manga)\/([^/]+)(\/|$)/;
const simklRegex = /^https:\/\/simkl\.com\/(anime|manga)\/(\d+)(\/|$)/;
const shikiRegex = /^https:\/\/shikimori\.one\/(animes|mangas|ranobe)\/\D?(\d+)/;
const localRegex = /^local:\/\/([^/]+)\/(anime|manga)\/([^/]+)(\/|$)/;

export function urlToSlug(url: string): slugObject {
  const obj: slugObject = {
    url,
  };

  const malMatch = url.match(malRegex);
  if (malMatch) {
    obj.path = {
      type: malMatch[1] as 'anime' | 'manga',
      slug: malMatch[2],
    };
    return obj;
  }

  const anilistMatch = url.match(anilistRegex);
  if (anilistMatch) {
    obj.path = {
      type: anilistMatch[1] as 'anime' | 'manga',
      slug: `a:${anilistMatch[2]}`,
    };
    return obj;
  }

  const kitsuMatch = url.match(kitsuRegex);
  if (kitsuMatch) {
    obj.path = {
      type: kitsuMatch[1] as 'anime' | 'manga',
      slug: `k:${kitsuMatch[2]}`,
    };
    return obj;
  }

  const simklMatch = url.match(simklRegex);
  if (simklMatch) {
    obj.path = {
      type: simklMatch[1] as 'anime' | 'manga',
      slug: `s:${simklMatch[2]}`,
    };
    return obj;
  }

  const shikiMatch = url.match(shikiRegex);
  if (shikiMatch) {
    obj.path = {
      type: shikiMatch[1].toLowerCase() === 'animes' ? 'anime' : 'manga',
      slug: `shi:${shikiMatch[2]}`,
    };
    return obj;
  }

  const localMatch = url.match(localRegex);
  if (localMatch) {
    obj.path = {
      type: localMatch[2] as 'anime' | 'manga',
      slug: `l:${localMatch[1]}::${encodeURIComponent(localMatch[3])}`,
    };
    obj.url = '';
    return obj;
  }

  return obj;
}

export function pathToUrl(path: Path): string {
  if (path.slug.match(/^\d+$/)) {
    return `https://myanimelist.net/${path.type}/${path.slug}`;
  }
  if (path.slug.startsWith('a:')) {
    return `https://anilist.co/${path.type}/${path.slug.substring(2)}`;
  }
  if (path.slug.startsWith('k:')) {
    return `https://kitsu.app/${path.type}/${path.slug.substring(2)}`;
  }
  if (path.slug.startsWith('s:')) {
    return `https://simkl.com/${path.type}/${path.slug.substring(2)}`;
  }
  if (path.slug.startsWith('shi:')) {
    return `https://shikimori.one/${path.type}s/${path.slug.substring(4)}`;
  }
  if (path.slug.startsWith('l:')) {
    const match = path.slug.match(/^l:([^:]+)::([^:]+)$/);
    if (match) {
      return `local://${match[1]}/${path.type}/${decodeURIComponent(match[2])}`;
    }
  }

  throw new Error('Unknown Path Object');
}

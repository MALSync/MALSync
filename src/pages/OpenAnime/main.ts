import { pageInterface } from '../pageInterface';
import type { SyncPage } from '../syncPage';

/* cspell:ignore romaji populars anilist */

const OPEN_ANIME_DOMAIN = 'https://openani.me';
const OPEN_ANIME_API = 'https://api.openani.me';

type Season = {
  id?: string;
  name?: string;
  seasonNumber?: number;
  malId?: number;
  episodeCount?: number;
  hasEpisode?: boolean;
};

type AnimeInfo = {
  slug: string;
  english?: string;
  romaji?: string;
  originalName?: string;
  turkish?: string;
  malId?: number;
  malUrl?: string;
  seasons: Season[];
};

type CachedState = {
  slug?: string;
  info?: AnimeInfo;
  season?: Season;
  episode?: number;
  fetching?: boolean;
};

const state: CachedState = {};

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
}

function sanitizeSeason(raw: unknown): Season {
  const season: Season = {};
  if (!raw || typeof raw !== 'object') return season;
  const data = raw as Record<string, unknown>;
  if (typeof data.id === 'string') season.id = data.id;
  if (typeof data.name === 'string') season.name = data.name;
  const seasonNumber = toNumber(data.season_number);
  if (typeof seasonNumber === 'number') season.seasonNumber = seasonNumber;
  const malId = toNumber(data.mal_id);
  if (typeof malId === 'number') season.malId = malId;
  const episodeCount = toNumber(data.episode_count);
  if (typeof episodeCount === 'number') season.episodeCount = episodeCount;
  if (typeof data.hasEpisode === 'boolean') season.hasEpisode = data.hasEpisode;
  return season;
}

function buildInfo(slug: string, data: Record<string, unknown>): AnimeInfo {
  const seasonsRaw = data.seasons;
  const info: AnimeInfo = {
    slug,
    seasons: Array.isArray(seasonsRaw) ? seasonsRaw.map(sanitizeSeason) : [],
  };
  if (typeof data.english === 'string') info.english = data.english as string;
  if (typeof data.romaji === 'string') info.romaji = data.romaji as string;
  if (typeof data.originalName === 'string') info.originalName = data.originalName as string;
  if (typeof data.turkish === 'string') info.turkish = data.turkish as string;
  const malId = toNumber(data.malID);
  if (typeof malId === 'number') info.malId = malId;
  if (typeof data.myAnimeListURL === 'string') info.malUrl = data.myAnimeListURL as string;
  return info;
}

function extractInfo(slug: string): AnimeInfo | undefined {
  let info: AnimeInfo | undefined;
  j.$('script[data-sveltekit-fetched]').each(function () {
    if (info) return;
    const element = j.$(this);
    const dataUrl = element.attr('data-url') || '';
    if (dataUrl.indexOf('/anime/') === -1) return;
    if (dataUrl.indexOf('/anime/populars') !== -1 || dataUrl.indexOf('/anime/random') !== -1)
      return;
    if (dataUrl.indexOf(`/anime/${slug}`) === -1) {
      const match = dataUrl.match(/\/anime\/([^/?]+)/);
      if (!match || match[1] !== slug) return;
    }
    const raw = element.text().trim();
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      const body = typeof payload.body === 'string' ? JSON.parse(payload.body) : payload.body;
      if (!body || typeof body !== 'object') return;
      const data = body as Record<string, unknown>;
      info = buildInfo(slug, data);
    } catch (error) {
      con.error('OpenAnime', error);
    }
  });
  return info;
}

function fetchInfo(slug: string) {
  if (state.fetching) return;
  state.fetching = true;
  api.request
    .xhr('GET', `${OPEN_ANIME_API}/anime/${slug}`)
    .then(response => {
      try {
        if (response && typeof response.responseText === 'string') {
          const parsed = JSON.parse(response.responseText);
          if (parsed && typeof parsed === 'object') {
            state.info = buildInfo(slug, parsed as Record<string, unknown>);
          }
        }
      } catch (error) {
        con.error('OpenAnime', error);
      }
    })
    .catch(error => {
      con.error('OpenAnime', error);
    })
    .then(() => {
      state.fetching = false;
    });
}

function pickSeason(info: AnimeInfo, seasonNumber: number | undefined): Season | undefined {
  if (!info.seasons.length) return undefined;
  if (typeof seasonNumber === 'number') {
    for (let i = 0; i < info.seasons.length; i += 1) {
      const item = info.seasons[i];
      if (item && typeof item.seasonNumber === 'number' && item.seasonNumber === seasonNumber) {
        return item;
      }
    }
  }
  for (let i = 0; i < info.seasons.length; i += 1) {
    const item = info.seasons[i];
    if (item && item.hasEpisode !== false) return item;
  }
  return info.seasons[0];
}

function sortedSeasons(info: AnimeInfo): Season[] {
  const list = info.seasons.slice();
  list.sort((a, b) => {
    const left = typeof a.seasonNumber === 'number' ? a.seasonNumber : 0;
    const right = typeof b.seasonNumber === 'number' ? b.seasonNumber : 0;
    return left - right;
  });
  return list;
}

function updateState(url: string): boolean {
  const slug = utils.urlPart(url, 4);
  if (!slug) return false;
  if (state.slug !== slug) {
    state.slug = slug;
    state.info = undefined;
  }
  if (!state.info) {
    const info = extractInfo(slug);
    if (!info) {
      fetchInfo(slug);
      return false;
    }
    state.info = info;
  }
  state.episode = (() => {
    const value = utils.urlPart(url, 6);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })();
  const seasonNumber = (() => {
    const value = utils.urlPart(url, 5);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  })();
  state.season = pickSeason(state.info!, seasonNumber);
  return true;
}

function resetState() {
  state.slug = undefined;
  state.info = undefined;
  state.season = undefined;
  state.episode = undefined;
}

function schedule(page: SyncPage) {
  utils.waitUntilTrue(
    () => updateState(window.location.href),
    () => {
      page.handlePage();
    },
  );
}

function baseTitle(info: AnimeInfo): string {
  const candidates = [info.english, info.romaji, info.originalName, info.turkish];
  for (let i = 0; i < candidates.length; i += 1) {
    const value = candidates[i];
    if (typeof value === 'string' && value.trim().length) {
      return utils.htmlDecode(value);
    }
  }
  return utils.htmlDecode(info.slug.replace(/[-_]/g, ' '));
}

function buildTitle(info: AnimeInfo, season: Season | undefined): string {
  const mainTitle = baseTitle(info);
  if (!season || typeof season.name !== 'string' || !season.name.trim()) return mainTitle;
  if (typeof season.seasonNumber === 'number' && season.seasonNumber === 1) return mainTitle;
  const seasonTitle = utils.htmlDecode(season.name);
  if (seasonTitle.toLowerCase().indexOf(mainTitle.toLowerCase()) !== -1) return seasonTitle;
  return `${mainTitle} ${seasonTitle}`;
}

function identifier(): string {
  if (!state.info) return '';
  if (state.season && typeof state.season.seasonNumber === 'number') {
    return `${state.info.slug}?s=${state.season.seasonNumber}`;
  }
  return state.info.slug;
}

function overviewUrl(): string {
  if (!state.info) return OPEN_ANIME_DOMAIN;
  return `${OPEN_ANIME_DOMAIN}/anime/${state.info.slug}`;
}

function nextEpisodeUrl(): string | undefined {
  if (!state.info || !state.season || typeof state.season.seasonNumber !== 'number') {
    return undefined;
  }
  const currentEpisode = typeof state.episode === 'number' ? state.episode : 0;
  const totalEpisodes =
    typeof state.season.episodeCount === 'number' ? state.season.episodeCount : 0;
  if (totalEpisodes > 0 && currentEpisode < totalEpisodes) {
    return `${OPEN_ANIME_DOMAIN}/anime/${state.info.slug}/${state.season.seasonNumber}/${currentEpisode + 1}`;
  }
  const ordered = sortedSeasons(state.info);
  for (let i = 0; i < ordered.length; i += 1) {
    const item = ordered[i];
    if (item && item.seasonNumber === state.season.seasonNumber) {
      const candidate = ordered[i + 1];
      if (candidate && typeof candidate.seasonNumber === 'number') {
        if (!candidate.episodeCount || candidate.episodeCount <= 0) {
          return undefined;
        }
        return `${OPEN_ANIME_DOMAIN}/anime/${state.info.slug}/${candidate.seasonNumber}/1`;
      }
      break;
    }
  }
  return undefined;
}

function malLink(provider: string): string | false {
  if (provider !== 'MAL') return false;
  if (state.season && typeof state.season.malId === 'number') {
    return utils.pageUrl('mal', 'anime', state.season.malId);
  }
  if (state.info) {
    if (typeof state.info.malId === 'number') {
      return utils.pageUrl('mal', 'anime', state.info.malId);
    }
    if (state.info.malUrl) return state.info.malUrl;
  }
  return false;
}

export const OpenAnime: pageInterface = {
  name: 'OpenAnime',
  domain: OPEN_ANIME_DOMAIN,
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) !== 'anime') return false;
    const hasSeason = utils.urlPart(url, 5) !== '';
    const hasEpisode = utils.urlPart(url, 6) !== '';
    return hasSeason && hasEpisode;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 3) !== 'anime') return false;
    return utils.urlPart(url, 5) === '';
  },
  sync: {
    getTitle() {
      if (!state.info) return '';
      return buildTitle(state.info, state.season);
    },
    getIdentifier() {
      return identifier();
    },
    getOverviewUrl() {
      return overviewUrl();
    },
    getEpisode() {
      if (typeof state.episode === 'number') return state.episode;
      return 1;
    },
    nextEpUrl() {
      return nextEpisodeUrl();
    },
    getMalUrl(provider) {
      return malLink(provider);
    },
  },
  overview: {
    getTitle() {
      if (!state.info) return '';
      return buildTitle(state.info, state.season);
    },
    getIdentifier() {
      return identifier();
    },
    uiSelector() {},
    getMalUrl(provider) {
      return malLink(provider);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    const run = () => {
      page.reset();
      resetState();
      schedule(page);
    };

    run();

    utils.fullUrlChangeDetect(() => {
      run();
    });
  },
};

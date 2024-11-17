import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';
import { DisneyPlusProxyData, FoundEntry, JikanEntry, JikanEpisode } from './types';

// Settings
const searchFirstXids = 5;
const similarityThreshold = 0.9;
const titleTypePreference = ['English', 'Synonym', 'Default', 'Japanese'];
const rateLimitMs = 750;

const proxy = new ScriptProxy('DisneyPlus');
const logger = con.m('D+', '#0072d2');

let proxyData: DisneyPlusProxyData | undefined;
let foundEntry: FoundEntry | undefined;

export const DisneyPlus: pageInterface = {
  name: 'DisneyPlus',
  domain: 'https://disneyplus.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    return url.includes('/play/');
  },
  isOverviewPage(_) {
    return false;
  },
  sync: {
    getTitle(_) {
      return foundEntry!.title;
    },
    getIdentifier: function (_) {
      if (foundEntry?.mal_id !== -1) return foundEntry!.mal_id.toString();
      return proxyData!.seriesId;
    },
    getOverviewUrl: function (_) {
      return 'https://www.disneyplus.com/browse/entity-' + proxyData!.seriesId;
    },
    getEpisode: function (_) {
      return foundEntry!.episodeNumber;
    },
    nextEpUrl: function (_) {
      return 'https://www.disneyplus.com/play/' + proxyData!.nextEpisodeId;
    },
  },
  // Structure inspired by Miruro page
  init: async function (page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    await proxy.injectScript();

    let interval: NodeJS.Timer;

    j.$(ready);
    utils.urlChangeDetect(() => {
      proxyData = undefined;
      foundEntry = undefined;
      j.$(ready);
    });

    function ready() {
      page.reset();
      if (
        !DisneyPlus.isSyncPage(window.location.href) &&
        !DisneyPlus.isOverviewPage!(window.location.href)
      )
        return;
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        () => {
          if (DisneyPlus.isSyncPage(window.location.href)) {
            proxy.getData().then(data => {
              proxyData = data;
            });

            return $('.title-field span').text() !== '' && proxyData !== undefined;
          } else {
            return DisneyPlus.overview!.getTitle(window.location.href) !== '';
          }
        },
        async () => {
          foundEntry = await findEntryByTitleAndEpisodeTitle(
            $('.title-field span').text(),
            $('.subtitle-field span').text(),
          );

          logger.log(`Found entry: ${foundEntry.title}, episode ${foundEntry.episodeNumber}`);

          page.handlePage();
        },
        500,
      );
    }
  },
};

async function findEntryByTitleAndEpisodeTitle(
  title: string,
  episodeTitle: string,
): Promise<FoundEntry> {
  title = removeRepetition(title);
  const entries = (await getEntriesByTitle(title))?.slice(0, searchFirstXids);

  // Fall back to given title and try to extract episode number from episode title
  const fallback = {
    title: title,
    mal_id: -1,
    episodeNumber: extractEpisodeNumber(episodeTitle),
  };

  if (entries == null) {
    logger.error('Could not get entries from Jikan for title:', title);
    return fallback;
  }

  for (let i = 0; i < entries.length; i++) {
    var entry = entries[i];
    let currentPage = 1;

    while (true) {
      let data = await getEpisodesByMalId(entry.mal_id);
      if (data == null) {
        logger.error(`Could not get episodes for ${getBestTitle(entry)}, id ${entry.mal_id}`);
        return fallback;
      }

      let { episodes, hasNext } = data;

      for (var episode of episodes) {
        // D+ title looks like "Episode X", while MAL title does not, skip this entry
        if (hasEpisodePattern(episodeTitle) && !hasEpisodePattern(episode.title)) {
          break;
        }

        let cleanedEpisodeTitle = cleanTitle(episodeTitle);
        let jikanTitle = cleanTitle(episode.title);
        let jikanTitleRomanji = cleanTitle(episode.title_romanji ?? '');

        if (
          jaroWinkler(cleanedEpisodeTitle, jikanTitle) > similarityThreshold ||
          jaroWinkler(cleanedEpisodeTitle, jikanTitleRomanji) > similarityThreshold
        ) {
          return {
            title: getBestTitle(entry),
            mal_id: entry.mal_id,
            episodeNumber: episode.mal_id,
          };
        }
      }

      if (hasNext) {
        currentPage++;
      } else {
        break;
      }
    }
  }

  logger.error('Did not find matching entry, use fallback instead');
  return fallback;
}

async function getEntriesByTitle(title: string): Promise<JikanEntry[] | null> {
  const res = await fetchWithRateLimit(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}`,
  );

  if (!res.ok) return null;

  let json = await res.json();
  return json['data'];
}

async function getEpisodesByMalId(
  id: number,
): Promise<{ episodes: JikanEpisode[]; hasNext: boolean } | null> {
  const res = await fetchWithRateLimit(`https://api.jikan.moe/v4/anime/${id}/episodes`);
  if (!res.ok) return null;

  let json = await res.json();

  return {
    episodes: json['data'],
    hasNext: json['pagination']['has_next_page'],
  };
}

function cleanTitle(title: string): string {
  title = title.replace(/^S\d+:E\d+\s*/, ''); // Remove leading S1E11
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Calculates Jaro-Winkler similarity between two strings.
 * Higher score indicates greater similarity (range: 0.0 to 1.0).
 */
function jaroWinkler(s1: string, s2: string): number {
  if (s1 == '' || s2 == '') return 0;
  if (s1 == s2) return 1;

  const m = (s1: string, s2: string): number => {
    const s1Len = s1.length;
    const s2Len = s2.length;
    const matchDistance = Math.floor(Math.max(s1Len, s2Len) / 2) - 1;

    const s1Matches = Array(s1Len).fill(false);
    const s2Matches = Array(s2Len).fill(false);

    let matches = 0;
    for (let i = 0; i < s1Len; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, s2Len);

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0;

    let t = 0;
    let k = 0;
    for (let i = 0; i < s1Len; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) t++;
      k++;
    }

    t /= 2;

    return (matches / s1Len + matches / s2Len + (matches - t) / matches) / 3;
  };

  const l = Math.min(4, Math.min(s1.length, s2.length));
  const p = 0.1; // Scaling factor for common prefix
  const j = m(s1, s2);

  const prefix = Array.from({ length: l }).reduce<number>(
    (acc, _, i) => (s1[i] === s2[i] ? acc + 1 : acc),
    0,
  );

  return j + prefix * p * (1 - j);
}

function hasEpisodePattern(title: string): boolean {
  const episodeRegex = /Episode\s\d+/i;
  return episodeRegex.test(title);
}

function extractEpisodeNumber(title: string): number {
  // 1. Episode 1
  const episodeRegex = /^(\d+)\.\s(?:Episode\s(\d+)|.+)$/i;
  const match = title.match(episodeRegex);

  if (match) {
    return match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
  }

  // S1:E11 ...
  const match2 = title.match(/S(\d+):E(\d+)/);

  if (match2) {
    const season = parseInt(match2[1], 10);
    const episode = parseInt(match2[2], 10);
    return episode;
  }

  return 0;
}

function getBestTitle(entry: JikanEntry): string {
  for (const type of titleTypePreference) {
    const title = entry.titles.find(item => item.type === type);
    if (title) return title.title;
  }

  return entry.titles[0].title;
}

let lastRequestTime = 0;

async function fetchWithRateLimit(url: string): Promise<any> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < rateLimitMs) {
    await utils.wait(rateLimitMs - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();

  const res = await fetch(url);

  return res;
}

function removeRepetition(title: string): string {
  const length = title.length;

  for (let i = 1; i <= length / 2; i++) {
    const pattern = title.slice(0, i);
    const repeated = new RegExp(`^(${pattern})+`);

    if (repeated.test(title)) {
      const match = title.match(repeated);
      if (match && match[0] === title) {
        return pattern;
      }
    }
  }

  return title;
}

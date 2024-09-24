/* eslint-disable global-require */
import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';
import { IAnime, IEpisode, IEpisodes } from './api';

let interval: number | NodeJS.Timeout;

const anime: IAnime = {
  data: {
    id: 0,
    name: '',
    rus_name: '',
    eng_name: '',
    slug_url: '',
    cover: {
      default: '',
    },
  },
  player: {
    episode: 0,
    total: 0,
    season: 0,
    next: undefined,
  },
};

export const AnimeLib: pageInterface = {
  domain: 'https://anilib.me',
  languages: ['Russian'],
  name: 'AnimeLib',
  type: 'anime',
  getImage() {
    return anime.data.cover.default;
  },
  isSyncPage(url: string): boolean {
    return utils.urlPart(url, 6) !== '' && utils.urlPart(url, 4) === 'anime';
  },
  isOverviewPage(url: string): boolean {
    return utils.urlPart(url, 6) === '' && utils.urlPart(url, 4) === 'anime';
  },
  sync: {
    getTitle(url: string): string {
      return anime.data.eng_name || anime.data.name || anime.data.rus_name;
    },
    getIdentifier(url: string): string {
      return anime.data.id.toString();
    },
    getOverviewUrl(url: string): string {
      return utils.absoluteLink(`ru/anime/${anime.data.slug_url}`, AnimeLib.domain);
    },
    getEpisode(url: string): number {
      return anime.player.episode;
    },
    nextEpUrl(url: string): string | undefined {
      return anime.player.next;
    },
    getMalUrl(provider) {
      if (anime.data.shikimori_href) {
        const id = anime.data.shikimori_href.match(/\/[a-z]?(\d+)/);
        if (id) {
          return `https://myanimelist.net/anime/${id[1]}`;
        }
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return anime.data.eng_name || anime.data.name || anime.data.rus_name;
    },
    getIdentifier(url) {
      return anime.data.id.toString();
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
    getMalUrl(provider) {
      return AnimeLib.sync.getMalUrl!(provider);
    },
  },

  init(page: SyncPage) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      utils.fullUrlChangeDetect(check, true);
    });

    async function check() {
      page.reset();
      clearInterval(interval);
      con.info('Start checking current page');

      if (
        !AnimeLib.isSyncPage(window.location.href) &&
        !AnimeLib.isOverviewPage!(window.location.href)
      )
        return;

      // NOTE - We are on the SYNC page
      if (AnimeLib.isSyncPage(window.location.href)) {
        await updateSyncPage();

        interval = utils.changeDetect(
          async () => {
            page.reset();
            await updateSyncPage();
            page.handlePage();
          },
          () => window.location.search.split('?')[1],
          true,
        );
      }

      // NOTE - We are on the OVERVIEW page
      if (AnimeLib.isOverviewPage!(window.location.href)) {
        await updateOverviewPage();

        interval = utils.waitUntilTrue(
          () => {
            return j.$('.tabs-item').length;
          },
          () => {
            page.handlePage();
          },
          500,
        );
      }
    }
  },
};

async function updateOverviewPage() {
  const { data: animeData } = await getAnimeData(utils.urlPart(window.location.href, 5));
  anime.data = animeData;
}

async function updateSyncPage() {
  const animeId = utils.urlPart(window.location.href, 5);
  const { data: animeData } = await getAnimeData(animeId);
  anime.data = animeData;

  const { data: episodes } = await getEpisodesData(animeId);
  const episodeID = utils.urlParam(window.location.href, 'episode');
  if (episodeID) {
    const { data: episode } = await getEpisodeData(episodeID);

    anime.player.episode = Number(episode.number || episode.number_secondary);
    anime.player.season = Number(episode.season || 0);

    const currentEpisode = episodes.find(e => e.id === Number(episodeID));
    if (currentEpisode) {
      const currentIndex = episodes.indexOf(currentEpisode);
      if (currentIndex + 1 < episodes.length - 1) {
        const nextId = episodes[currentIndex + 1].id;
        anime.player.next = utils.absoluteLink(
          `ru/anime/${animeId}/watch?episode=${nextId}`,
          AnimeLib.domain,
        );
      }
    }
  }
}

function apiRequest(path: string) {
  return api.request.xhr('GET', `https://api.mangalib.me/api/${path}`);
}

async function getAnimeData(anime_id: string): Promise<IAnime> {
  const data = await apiRequest(`anime/${anime_id}`);
  return JSON.parse(data.responseText);
}

async function getEpisodeData(episode_id: string): Promise<IEpisode> {
  const data = await apiRequest(`episodes/${episode_id}`);
  return JSON.parse(data.responseText);
}

async function getEpisodesData(anime_id: string): Promise<IEpisodes> {
  const data = await apiRequest(`episodes?anime_id=${anime_id}`);
  return JSON.parse(data.responseText);
}
